// simWorker.ts - Web Worker (module)
// Uses a double-buffer pattern with transferable ArrayBuffers to send tick data
// to the main thread with minimal copies.

type InitMsg = {
  type: 'init';
  config: any;
  // buffers will be transferred
};

type ControlMsg = { type: 'start' } | { type: 'pause' } | { type: 'reset' } | { type: 'returnBuffer'; buf: ArrayBuffer } | { type: 'setParams'; params: any };

let running = false;
let buffers: ArrayBuffer[] = [];
let cfg: any = null;
let lastTime = 0;
let rafId: number | null = null;
let simTime = 0; // seconds since simulation start

// Simulation state (defaults)
let vehicle1 = { mass: 1000, friction: 100, force: 0, forceType: 'constant', position: 0, velocity: 0, work: 0, netForce: 0 } as any;
let vehicle2 = { mass: 1000, friction: 80, force: 0, forceType: 'constant', position: 0, velocity: 0, work: 0, netForce: 0 } as any;
let raceDistance = 1000;
let raceTime = Infinity;

const PX_PER_M = 1.6; // not used by worker but kept for compatibility if needed

function calculateForce(baseForce: number, forceType: string, time: number) {
  switch (forceType) {
    case 'constant':
      return baseForce;
    case 'increasing':
      return baseForce * (1 + time * 0.1);
    case 'decreasing':
      return baseForce * Math.max(0.3, 1 - time * 0.05);
    case 'impulse':
      return Math.sin(time * 2) > 0.5 ? baseForce * 1.5 : baseForce * 0.5;
    default:
      return baseForce;
  }
}

// Write tick data into Float64Array buffer with layout (13 doubles):
// [t, v1Pos, v1Vel, v1Acc, v1NetForce, v1KE, v1Work, v2Pos, v2Vel, v2Acc, v2NetForce, v2KE, v2Work]
function fillBuffer(buf: ArrayBuffer, t: number) {
  const view = new Float64Array(buf);
  view[0] = t;
  view[1] = vehicle1.position;
  view[2] = vehicle1.velocity;
  view[3] = vehicle1.acceleration ?? 0;
  view[4] = vehicle1.netForce ?? 0;
  view[5] = 0.5 * vehicle1.mass * Math.pow(vehicle1.velocity, 2);
  view[6] = vehicle1.work ?? 0;
  view[7] = vehicle2.position;
  view[8] = vehicle2.velocity;
  view[9] = vehicle2.acceleration ?? 0;
  view[10] = vehicle2.netForce ?? 0;
  view[11] = 0.5 * vehicle2.mass * Math.pow(vehicle2.velocity, 2);
  view[12] = vehicle2.work ?? 0;
}

function startLoop() {
  if (running) return;
  running = true;
  lastTime = performance.now();

  const FIXED_DT_MS = 16; // 16ms -> 0.016s (close to 60Hz)
  let accumulator = 0;

  function step() {
    if (!running) return;
    const now = performance.now();
    let frameTime = now - lastTime;
    if (frameTime > 250) frameTime = 250; // avoid spiral of death
    lastTime = now;
    accumulator += frameTime;

    // Fixed-step integration loop with limited substeps per frame
    const MAX_STEPS = 4;
    let steps = 0;
    while (accumulator >= FIXED_DT_MS && steps < MAX_STEPS) {
      const dt = FIXED_DT_MS / 1000; // seconds

      // Use t0 (start) and t1 (end) for RK2 evaluations
      const t0 = simTime;
      const t1 = simTime + dt;

      // Vehicle 1 - Heun (RK2)
      const v1F1 = calculateForce(vehicle1.force ?? 0, vehicle1.forceType, t0);
      const v1Fnet1 = v1F1 - vehicle1.friction;
      const v1a1 = v1Fnet1 / vehicle1.mass;
      const v1F2 = calculateForce(vehicle1.force ?? 0, vehicle1.forceType, t1);
      const v1Fnet2 = v1F2 - vehicle1.friction;
      const v1a2 = v1Fnet2 / vehicle1.mass;
      let v1NewV = Math.max(0, vehicle1.velocity + 0.5 * (v1a1 + v1a2) * dt);
      let v1Dx = 0.5 * (vehicle1.velocity + v1NewV) * dt;
      // clamp to finish
      if (raceDistance !== undefined && raceDistance !== null) {
        const remaining = raceDistance - vehicle1.position;
        if (v1Dx >= remaining) {
          v1Dx = Math.max(0, remaining);
          const aAvg = 0.5 * (v1a1 + v1a2);
          const v1Sq = Math.max(0, vehicle1.velocity * vehicle1.velocity + 2 * aAvg * v1Dx);
          // update v1NewV based on kinematics (consistent with displacement clamp)
          v1NewV = Math.sqrt(v1Sq);
        }
      }

      // advance simTime after the substep
      simTime = t1;

      vehicle1.position += v1Dx;
      vehicle1.velocity = v1NewV;
      vehicle1.acceleration = 0.5 * (v1a1 + v1a2);
      const v1KE = 0.5 * vehicle1.mass * Math.pow(vehicle1.velocity, 2);
      const v1FnetAvg = 0.5 * (v1Fnet1 + v1Fnet2);
      vehicle1.work = (vehicle1.work ?? 0) + v1FnetAvg * v1Dx;
      // store average net force for UI reporting
      vehicle1.netForce = v1FnetAvg;

      // Vehicle 2 - Heun (RK2)
      const v2F1 = calculateForce(vehicle2.force ?? 0, vehicle2.forceType, t0);
      const v2Fnet1 = v2F1 - vehicle2.friction;
      const v2a1 = v2Fnet1 / vehicle2.mass;
      const v2F2 = calculateForce(vehicle2.force ?? 0, vehicle2.forceType, t1);
      const v2Fnet2 = v2F2 - vehicle2.friction;
      const v2a2 = v2Fnet2 / vehicle2.mass;
      let v2NewV = Math.max(0, vehicle2.velocity + 0.5 * (v2a1 + v2a2) * dt);
      let v2Dx = 0.5 * (vehicle2.velocity + v2NewV) * dt;
      if (raceDistance !== undefined && raceDistance !== null) {
        const remaining2 = raceDistance - vehicle2.position;
        if (v2Dx >= remaining2) {
          v2Dx = Math.max(0, remaining2);
          const aAvg2 = 0.5 * (v2a1 + v2a2);
          const v2Sq = Math.max(0, vehicle2.velocity * vehicle2.velocity + 2 * aAvg2 * v2Dx);
          v2NewV = Math.sqrt(v2Sq);
        }
      }
      vehicle2.position += v2Dx;
      vehicle2.velocity = v2NewV;
      vehicle2.acceleration = 0.5 * (v2a1 + v2a2);
      const v2KE = 0.5 * vehicle2.mass * Math.pow(vehicle2.velocity, 2);
      const v2FnetAvg = 0.5 * (v2Fnet1 + v2Fnet2);
      vehicle2.work = (vehicle2.work ?? 0) + v2FnetAvg * v2Dx;
      vehicle2.netForce = v2FnetAvg;

      accumulator -= FIXED_DT_MS;
      steps += 1;
    }

    // After stepping, write buffer and post (use simTime as tick time)
    let buf: ArrayBuffer | undefined = buffers.pop();
    if (!buf) {
      buf = new ArrayBuffer(Float64Array.BYTES_PER_ELEMENT * 13);
    }
    fillBuffer(buf, simTime);
    // send buffer to main thread (transfer ownership)
    // @ts-ignore
    self.postMessage({ type: 'tick', buf }, [buf]);

    // check finish conditions
    if (raceDistance !== undefined && raceDistance !== null) {
      if (vehicle1.position >= raceDistance) {
        running = false;
        // send finished message
        self.postMessage({ type: 'finished', winner: 1, final: { v1: vehicle1, v2: vehicle2 } });
        return;
      }
      if (vehicle2.position >= raceDistance) {
        running = false;
        self.postMessage({ type: 'finished', winner: 2, final: { v1: vehicle1, v2: vehicle2 } });
        return;
      }
    }

    // schedule next tick
    setTimeout(step, 0);
  }

  step();
}

function stopLoop() {
  running = false;
}

self.addEventListener('message', (ev: MessageEvent) => {
  const msg = ev.data as InitMsg | ControlMsg;
  if (!msg || typeof msg.type !== 'string') return;

  if (msg.type === 'init') {
    // init: set params if present and accept any incoming transferred buffers
    cfg = msg.config || {};
    if (cfg.vehicle1) Object.assign(vehicle1, cfg.vehicle1);
    if (cfg.vehicle2) Object.assign(vehicle2, cfg.vehicle2);
    if (typeof cfg.raceDistance === 'number') raceDistance = cfg.raceDistance;
    if (typeof cfg.raceTime === 'number') raceTime = cfg.raceTime;
    // any transferred ArrayBuffers will appear in ev.data as separate arguments in workers, but
    // with structured cloning they'll be in ev.data.buffers if main posted them as fields.
    // We'll also accept buffers sent via a 'returnBuffer' message when main returns them.
    // Nothing else to do here.
    return;
  }

  if (msg.type === 'start') {
    startLoop();
    return;
  }

  if (msg.type === 'pause') {
    stopLoop();
    return;
  }

  if (msg.type === 'reset') {
    // reset simulation state
    vehicle1.position = cfg?.vehicle1?.initialPosition ?? 0;
    vehicle1.velocity = cfg?.vehicle1?.initialVelocity ?? 0;
    vehicle1.work = 0;
    vehicle1.netForce = 0;
    vehicle2.position = cfg?.vehicle2?.initialPosition ?? 0;
    vehicle2.velocity = cfg?.vehicle2?.initialVelocity ?? 0;
    vehicle2.work = 0;
    vehicle2.netForce = 0;
    simTime = 0;
    return;
  }

  if (msg.type === 'returnBuffer') {
    // main returned a buffer we can reuse
    if ((msg as any).buf) buffers.push((msg as any).buf as ArrayBuffer);
    return;
  }

  if (msg.type === 'setParams') {
    const p = (msg as any).params || {};
    if (p.vehicle1) Object.assign(vehicle1, p.vehicle1);
    if (p.vehicle2) Object.assign(vehicle2, p.vehicle2);
    if (typeof p.raceDistance === 'number') raceDistance = p.raceDistance;
    if (typeof p.raceTime === 'number') raceTime = p.raceTime;
    return;
  }
});

// worker ready
// @ts-ignore
self.postMessage({ type: 'ready' });
