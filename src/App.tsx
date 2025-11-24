import { useState, useEffect, useRef } from 'react';
import { RaceScene } from './components/RaceScene';
import { RaceControls } from './components/RaceControls';
import { PhysicsMetrics } from './components/PhysicsMetrics';
import { ChartsPanel } from './components/ChartsPanel';
import { Trophy, Target, Play, Pause, RefreshCw } from 'lucide-react';

export type VehicleType = 'car' | 'motorcycle' | 'truck';
export type ScenarioType = 'highway' | 'city' | 'desert' | 'mountain' | 'stadium';
export type ForceType = 'constant' | 'increasing' | 'decreasing' | 'impulse';

export interface VehicleData {
  time: number;
  position: number;
  velocity: number;
  acceleration: number;
  kineticEnergy: number;
  work: number;
  force: number;
  maxVelocity: number;
}

export default function App() {
  // Vehicle 1 (User)
  const [vehicle1Type, setVehicle1Type] = useState<VehicleType>('car');
  const [vehicle1Mass, setVehicle1Mass] = useState(1000);
  const [vehicle1Force, setVehicle1Force] = useState<number | null>(null);
  const [vehicle1Friction, setVehicle1Friction] = useState(100);
  const [vehicle1ForceType, setVehicle1ForceType] = useState<ForceType>('constant');
  const [vehicle1Data, setVehicle1Data] = useState<VehicleData[]>([]);
  const [vehicle1Current, setVehicle1Current] = useState<VehicleData>({
    time: 0, position: 0, velocity: 0, acceleration: 0,
    kineticEnergy: 0, work: 0, force: 0, maxVelocity: 0
  });
  // Parametrizable iniciales
  const [vehicle1InitialVelocity, setVehicle1InitialVelocity] = useState(0);
  const [vehicle1InitialPosition, setVehicle1InitialPosition] = useState(0);

  // Vehicle 2 (Opponent)
  const [vehicle2Type, setVehicle2Type] = useState<VehicleType>('car');
  const [vehicle2Mass, setVehicle2Mass] = useState(1000);
  const [vehicle2Force, setVehicle2Force] = useState<number | null>(null);
  const [vehicle2Friction, setVehicle2Friction] = useState(80);
  const [vehicle2ForceType, setVehicle2ForceType] = useState<ForceType>('constant');
  const [vehicle2Data, setVehicle2Data] = useState<VehicleData[]>([]);
  const [vehicle2Current, setVehicle2Current] = useState<VehicleData>({
    time: 0, position: 0, velocity: 0, acceleration: 0,
    kineticEnergy: 0, work: 0, force: 0, maxVelocity: 0
  });
  // Parametrizable iniciales
  const [vehicle2InitialVelocity, setVehicle2InitialVelocity] = useState(0);
  const [vehicle2InitialPosition, setVehicle2InitialPosition] = useState(0);

  const [scenario, setScenario] = useState<ScenarioType>('stadium');
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<number | 'tie' | null>(null);
  const [raceDistance, setRaceDistance] = useState<number | null>(null); // Parametrizable (optional)
  const [raceTime, setRaceTime] = useState<number | null>(null); // Nuevo: tiempo de simulación parametrizable (optional)
  const [raceDistanceCustom, setRaceDistanceCustom] = useState(false);
  const [raceTimeCustom, setRaceTimeCustom] = useState(false);
  // Custom vehicle images (data URLs or external URLs)
  const [vehicle1ImageUrl, setVehicle1ImageUrl] = useState<string | null>(null);
  const [vehicle2ImageUrl, setVehicle2ImageUrl] = useState<string | null>(null);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  // Worker + buffers for high-performance simulation
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);
  const bufferPoolRef = useRef<ArrayBuffer[]>([]);
  const lastFlushRef = useRef<number>(0);
  const FLUSH_INTERVAL = 100; // ms between React state updates from worker ticks
  // Responsive helper to force two-column layout client-side when width >= 600px
  const [isWide, setIsWide] = useState<boolean>(false);
  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 600);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  
  
  // Vehicle 1 refs
  const v1VelocityRef = useRef<number>(0);
  const v1PositionRef = useRef<number>(0);
  const v1WorkRef = useRef<number>(0);
  const v1MaxVelocityRef = useRef<number>(0);
  
  // Vehicle 2 refs
  const v2VelocityRef = useRef<number>(0);
  const v2PositionRef = useRef<number>(0);
  const v2WorkRef = useRef<number>(0);
  const v2MaxVelocityRef = useRef<number>(0);
  const lastWorkerTickRef = useRef<number>(performance.now());
  const [workerHealthy, setWorkerHealthy] = useState<boolean>(true);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();

      v1VelocityRef.current = vehicle1InitialVelocity;
      v1PositionRef.current = vehicle1InitialPosition;
      v1WorkRef.current = 0;
      v1MaxVelocityRef.current = 0;

      v2VelocityRef.current = vehicle2InitialVelocity;
      v2PositionRef.current = vehicle2InitialPosition;
      v2WorkRef.current = 0;
      v2MaxVelocityRef.current = 0;

      setVehicle1Data([]);
      setVehicle2Data([]);
      setWinner(null);

      // If worker is available and ready, let it run the sim; otherwise fall back to animate()
      if (workerRef.current && workerReadyRef.current) {
        try {
          workerRef.current.postMessage({ type: 'setParams', params: {
            vehicle1: { mass: vehicle1Mass, friction: vehicle1Friction, force: vehicle1Force, forceType: vehicle1ForceType, initialPosition: vehicle1InitialPosition, initialVelocity: vehicle1InitialVelocity },
            vehicle2: { mass: vehicle2Mass, friction: vehicle2Friction, force: vehicle2Force, forceType: vehicle2ForceType, initialPosition: vehicle2InitialPosition, initialVelocity: vehicle2InitialVelocity },
            raceDistance: raceDistance ?? 0,
            raceTime: raceTime ?? Infinity
          } });
          workerRef.current.postMessage({ type: 'start' });
        } catch (e) {
          // fallback
          animate();
        }
      } else {
        animate();
      }
    } else {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'pause' });
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (workerRef.current) workerRef.current.postMessage({ type: 'pause' });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, vehicle1Mass, vehicle1Force, vehicle1Friction, vehicle1ForceType,
      vehicle2Mass, vehicle2Force, vehicle2Friction, vehicle2ForceType]);

  // Update worker with new params when they change
  useEffect(() => {
    if (workerRef.current && workerReadyRef.current) {
      try {
        workerRef.current.postMessage({ type: 'setParams', params: {
          vehicle1: { mass: vehicle1Mass, friction: vehicle1Friction, force: vehicle1Force, forceType: vehicle1ForceType, initialPosition: vehicle1InitialPosition, initialVelocity: vehicle1InitialVelocity },
          vehicle2: { mass: vehicle2Mass, friction: vehicle2Friction, force: vehicle2Force, forceType: vehicle2ForceType, initialPosition: vehicle2InitialPosition, initialVelocity: vehicle2InitialVelocity },
          raceDistance: raceDistance ?? 0,
          raceTime: raceTime ?? Infinity
        } });
      } catch (e) { /* ignore */ }
    }
  }, [vehicle1Mass, vehicle1Force, vehicle1Friction, vehicle1ForceType, vehicle1InitialPosition, vehicle1InitialVelocity, vehicle2Mass, vehicle2Force, vehicle2Friction, vehicle2ForceType, vehicle2InitialPosition, vehicle2InitialVelocity, raceDistance, raceTime]);

  const calculateForce = (baseForce: number, forceType: ForceType, time: number) => {
    switch (forceType) {
      case 'constant':
        return baseForce;
      case 'increasing':
        return baseForce * (1 + time * 0.1); // Aumenta 10% por segundo
      case 'decreasing':
        return baseForce * Math.max(0.3, 1 - time * 0.05); // Disminuye hasta 30%
      case 'impulse':
        return Math.sin(time * 2) > 0.5 ? baseForce * 1.5 : baseForce * 0.5; // Impulsos
      default:
        return baseForce;
    }
  };

  const animate = () => {
    // Guard: if required params are missing, stop the simulation loop
    if (raceDistance === null || raceTime === null || vehicle1Force === null || vehicle2Force === null) {
      setIsRunning(false);
      return;
    }

    const currentTime = (Date.now() - startTimeRef.current) / 1000;
    const dt = 0.016;

    // Vehicle 1 physics - RK2 (Heun) for velocity, trapezoidal for position, average force for work
    const v1F1 = calculateForce(vehicle1Force ?? 0, vehicle1ForceType, currentTime);
    const v1F2 = calculateForce(vehicle1Force ?? 0, vehicle1ForceType, currentTime + dt);
    const v1Fnet1 = v1F1 - vehicle1Friction;
    const v1Fnet2 = v1F2 - vehicle1Friction;
    const v1a1 = v1Fnet1 / vehicle1Mass;
    const v1a2 = v1Fnet2 / vehicle1Mass;

    const v1OldV = v1VelocityRef.current;
    // Heun's method (RK2) for velocity: v_new = v_old + 0.5*(a1 + a2)*dt
    let v1NewV = Math.max(0, v1OldV + 0.5 * (v1a1 + v1a2) * dt);
    // displacement using trapezoidal rule dx = (v_old + v_new)/2 * dt
    let v1Dx = 0.5 * (v1OldV + v1NewV) * dt;
    // average net force over the step for work estimation
    const v1FnetAvg = 0.5 * (v1Fnet1 + v1Fnet2);
    // clamp if overshooting finish line
    if (raceDistance !== null) {
      const remaining = raceDistance - v1PositionRef.current;
      if (v1Dx >= remaining) {
        v1Dx = Math.max(0, remaining);
        // approximate average acceleration and recompute v_new from v^2 = v0^2 + 2*a_avg*dx
        const aAvg = 0.5 * (v1a1 + v1a2);
        const v1Sq = Math.max(0, v1OldV * v1OldV + 2 * aAvg * v1Dx);
        v1NewV = Math.sqrt(v1Sq);
      }
    }
    v1PositionRef.current += v1Dx;
    v1VelocityRef.current = v1NewV;
    if (v1VelocityRef.current > v1MaxVelocityRef.current) {
      v1MaxVelocityRef.current = v1VelocityRef.current;
    }
    const v1KineticEnergy = 0.5 * vehicle1Mass * Math.pow(v1VelocityRef.current, 2);
    // incremental work approximated as average net force * displacement
    v1WorkRef.current += v1FnetAvg * v1Dx;

    // Vehicle 2 physics - RK2 / Heun
    const v2F1 = calculateForce(vehicle2Force ?? 0, vehicle2ForceType, currentTime);
    const v2F2 = calculateForce(vehicle2Force ?? 0, vehicle2ForceType, currentTime + dt);
    const v2Fnet1 = v2F1 - vehicle2Friction;
    const v2Fnet2 = v2F2 - vehicle2Friction;
    const v2a1 = v2Fnet1 / vehicle2Mass;
    const v2a2 = v2Fnet2 / vehicle2Mass;

    const v2OldV = v2VelocityRef.current;
    let v2NewV = Math.max(0, v2OldV + 0.5 * (v2a1 + v2a2) * dt);
    let v2Dx = 0.5 * (v2OldV + v2NewV) * dt;
    const v2FnetAvg = 0.5 * (v2Fnet1 + v2Fnet2);
    if (raceDistance !== null) {
      const remaining2 = raceDistance - v2PositionRef.current;
      if (v2Dx >= remaining2) {
        v2Dx = Math.max(0, remaining2);
        const aAvg2 = 0.5 * (v2a1 + v2a2);
        const v2Sq = Math.max(0, v2OldV * v2OldV + 2 * aAvg2 * v2Dx);
        v2NewV = Math.sqrt(v2Sq);
      }
    }
    v2PositionRef.current += v2Dx;
    v2VelocityRef.current = v2NewV;
    if (v2VelocityRef.current > v2MaxVelocityRef.current) {
      v2MaxVelocityRef.current = v2VelocityRef.current;
    }
    const v2KineticEnergy = 0.5 * vehicle2Mass * Math.pow(v2VelocityRef.current, 2);
    v2WorkRef.current += v2FnetAvg * v2Dx;

    // Update vehicle 1 data
    const newV1Data: VehicleData = {
      time: currentTime,
      position: v1PositionRef.current,
      velocity: v1VelocityRef.current,
      acceleration: 0.5 * ((v1Fnet1 / vehicle1Mass) + (v1Fnet2 / vehicle1Mass)),
      kineticEnergy: v1KineticEnergy,
      work: v1WorkRef.current,
      force: 0.5 * (v1Fnet1 + v1Fnet2),
      maxVelocity: v1MaxVelocityRef.current
    };
    setVehicle1Current(newV1Data);
    setVehicle1Data(prev => [...prev, newV1Data].slice(-100));

    // Update vehicle 2 data
    const newV2Data: VehicleData = {
      time: currentTime,
      position: v2PositionRef.current,
      velocity: v2VelocityRef.current,
      acceleration: 0.5 * ((v2Fnet1 / vehicle2Mass) + (v2Fnet2 / vehicle2Mass)),
      kineticEnergy: v2KineticEnergy,
      work: v2WorkRef.current,
      force: 0.5 * (v2Fnet1 + v2Fnet2),
      maxVelocity: v2MaxVelocityRef.current
    };
    setVehicle2Current(newV2Data);
    setVehicle2Data(prev => [...prev, newV2Data].slice(-100));

    // Check for winner (handle tie when both reach in same frame)
    if (raceDistance !== null && winner === null) {
      const v1Done = v1PositionRef.current >= raceDistance;
      const v2Done = v2PositionRef.current >= raceDistance;
      if (v1Done && v2Done) {
        setWinner('tie');
        setIsRunning(false);
        return;
      }
      if (v1Done) {
        setWinner(1);
        setIsRunning(false);
        return;
      }
      if (v2Done) {
        setWinner(2);
        setIsRunning(false);
        return;
      }
    }
    if (raceTime !== null && currentTime < raceTime && isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (raceTime !== null && currentTime >= raceTime) {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setVehicle1Data([]);
    setVehicle2Data([]);
    setVehicle1Current({
      time: 0, position: 0, velocity: 0, acceleration: 0,
      kineticEnergy: 0, work: 0, force: 0, maxVelocity: 0
    });
    setVehicle2Current({
      time: 0, position: 0, velocity: 0, acceleration: 0,
      kineticEnergy: 0, work: 0, force: 0, maxVelocity: 0
    });
    v1VelocityRef.current = 0;
    v1PositionRef.current = 0;
    v1WorkRef.current = 0;
    v1MaxVelocityRef.current = 0;
    v2VelocityRef.current = 0;
    v2PositionRef.current = 0;
    v2WorkRef.current = 0;
    v2MaxVelocityRef.current = 0;
    setWinner(null);
    if (workerRef.current) {
      try { workerRef.current.postMessage({ type: 'reset' }); } catch (e) { /* ignore */ }
    }
  };

  // Initialize worker on mount
  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    const w = new Worker(new URL('./worker/simWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = w;

    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'ready') {
        workerReadyRef.current = true;
        return;
      }
      if (msg.type === 'tick' && msg.buf) {
        const arr = new Float64Array(msg.buf);
        // layout: [t, v1Pos, v1Vel, v1Acc, v1NetForce, v1KE, v1Work, v2Pos, v2Vel, v2Acc, v2NetForce, v2KE, v2Work]
        v1PositionRef.current = arr[1];
        v1VelocityRef.current = arr[2];
        v2PositionRef.current = arr[7];
        v2VelocityRef.current = arr[8];
        v1WorkRef.current = arr[6] ?? v1WorkRef.current;
        v2WorkRef.current = arr[12] ?? v2WorkRef.current;
  // mark last tick time
  lastWorkerTickRef.current = performance.now();
  if (!workerHealthy) setWorkerHealthy(true);

        // Throttle React state updates to avoid 60Hz setState
        const now = performance.now();
        if (now - lastFlushRef.current >= FLUSH_INTERVAL) {
          lastFlushRef.current = now;
          const newV1: VehicleData = {
            time: now / 1000,
            position: v1PositionRef.current,
            velocity: v1VelocityRef.current,
            acceleration: arr[3] ?? 0,
            kineticEnergy: arr[5] ?? 0,
            work: v1WorkRef.current,
            force: arr[4] ?? 0,
            maxVelocity: Math.max(v1MaxVelocityRef.current, v1VelocityRef.current)
          };
          const newV2: VehicleData = {
            time: now / 1000,
            position: v2PositionRef.current,
            velocity: v2VelocityRef.current,
            acceleration: arr[9] ?? 0,
            kineticEnergy: arr[11] ?? 0,
            work: v2WorkRef.current,
            force: arr[10] ?? 0,
            maxVelocity: Math.max(v2MaxVelocityRef.current, v2VelocityRef.current)
          };
          setVehicle1Current(newV1);
          setVehicle1Data(prev => [...prev, newV1].slice(-100));
          setVehicle2Current(newV2);
          setVehicle2Data(prev => [...prev, newV2].slice(-100));
          if (newV1.velocity > v1MaxVelocityRef.current) v1MaxVelocityRef.current = newV1.velocity;
          if (newV2.velocity > v2MaxVelocityRef.current) v2MaxVelocityRef.current = newV2.velocity;
        }

        // return buffer to worker for reuse
        try { w.postMessage({ type: 'returnBuffer', buf: msg.buf }, [msg.buf]); } catch (err) { /* ignore */ }
      }

      if (msg.type === 'finished') {
        setWinner(msg.winner);
        setIsRunning(false);
        // final state snapshot if provided
        if (msg.final && msg.final.v1 && msg.final.v2) {
          const now = performance.now();
          const f1: VehicleData = {
            time: now / 1000,
            position: msg.final.v1.position,
            velocity: msg.final.v1.velocity,
            acceleration: msg.final.v1.acceleration ?? 0,
            kineticEnergy: 0.5 * msg.final.v1.mass * Math.pow(msg.final.v1.velocity, 2),
            work: msg.final.v1.work ?? 0,
            force: (msg.final.v1.netForce ?? 0),
            maxVelocity: v1MaxVelocityRef.current
          };
          const f2: VehicleData = {
            time: now / 1000,
            position: msg.final.v2.position,
            velocity: msg.final.v2.velocity,
            acceleration: msg.final.v2.acceleration ?? 0,
            kineticEnergy: 0.5 * msg.final.v2.mass * Math.pow(msg.final.v2.velocity, 2),
            work: msg.final.v2.work ?? 0,
            force: (msg.final.v2.netForce ?? 0),
            maxVelocity: v2MaxVelocityRef.current
          };
          setVehicle1Current(f1);
          setVehicle2Current(f2);
          setVehicle1Data(prev => [...prev, f1].slice(-100));
          setVehicle2Data(prev => [...prev, f2].slice(-100));
        }
      }
      if (msg.type === 'finished') {
        // handled earlier in flush logic; also mark healthy
        lastWorkerTickRef.current = performance.now();
        if (!workerHealthy) setWorkerHealthy(true);
      }
    };

    // create two small buffers and send them to the worker so it can reuse them
    const len = Float64Array.BYTES_PER_ELEMENT * 13;
    const b0 = new ArrayBuffer(len);
    const b1 = new ArrayBuffer(len);
    // send initial config
    w.postMessage({ type: 'init', config: { vehicle1: { mass: vehicle1Mass, friction: vehicle1Friction, force: vehicle1Force, forceType: vehicle1ForceType, initialPosition: vehicle1InitialPosition, initialVelocity: vehicle1InitialVelocity }, vehicle2: { mass: vehicle2Mass, friction: vehicle2Friction, force: vehicle2Force, forceType: vehicle2ForceType, initialPosition: vehicle2InitialPosition, initialVelocity: vehicle2InitialVelocity }, raceDistance: raceDistance ?? 0, raceTime: raceTime ?? Infinity } });
    // immediately transfer buffers for reuse
    try { w.postMessage({ type: 'returnBuffer', buf: b0 }, [b0]); w.postMessage({ type: 'returnBuffer', buf: b1 }, [b1]); } catch (e) { /* ignore */ }

    return () => {
      try { w.terminate(); } catch (e) {}
      workerRef.current = null;
      workerReadyRef.current = false;
    };
  }, []);

  // Watchdog: if worker stops sending ticks, mark unhealthy and fallback to animate()
  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      const last = lastWorkerTickRef.current || 0;
      if (workerRef.current && workerReadyRef.current && isRunning) {
        if (now - last > 600) {
          // worker likely stalled
          if (workerHealthy) setWorkerHealthy(false);
          // fallback to main-thread animate loop
          try { animate(); } catch (e) { /* ignore */ }
        } else {
          if (!workerHealthy) setWorkerHealthy(true);
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, [isRunning, workerHealthy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-0.5">
        <div className="bg-gray-900/95 backdrop-blur-lg">
          <div className="max-w-[1600px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={28} />
                  Teorema del Trabajo y Energía Cinética - Simulador de Carreras
                </h1>
                <p className="text-blue-300 text-sm mt-0.5">
                  W = ΔKE = ½m(v² - v₀²) | Carreras Físicas en Tiempo Real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

  <div className="max-w-[1600px] mx-auto p-4 space-y-4 w-full">
        {/* Winner Banner is rendered above the RaceScene to avoid taking the top of the full template */}

        {/* Simulation Controls - Horizontal bar at top */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-xl">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Left: Selectors (distance + time) */}
              <div className="w-full md:flex-1 md:min-w-[280px] md:max-w-[760px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 h-5">
                      <Target className="text-yellow-400" size={20} />
                      <span className="text-white text-sm">Distancia de Carrera:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={raceDistanceCustom ? 'custom' : (raceDistance ?? '')}
                        onChange={(e) => {
                          if (isRunning) return;
                          const v = e.target.value;
                          if (v === 'custom') {
                            setRaceDistanceCustom(true);
                          } else if (v === '') {
                            setRaceDistanceCustom(false);
                            setRaceDistance(null);
                          } else {
                            setRaceDistanceCustom(false);
                            setRaceDistance(Number(v));
                          }
                        }}
                        disabled={isRunning}
                        className="w-full md:w-auto bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 text-sm"
                      >
                        <option value="">— Seleccionar —</option>
                        <option value={200}>200 metros</option>
                        <option value={300}>300 metros</option>
                        <option value={400}>400 metros</option>
                        <option value={500}>500 metros</option>
                        <option value={800}>800 metros</option>
                        <option value={1000}>1000 metros (1 km)</option>
                        <option value="custom">Personalizado...</option>
                      </select>
                      {raceDistanceCustom && (
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={raceDistance ?? ''}
                          onChange={(e) => setRaceDistance(e.target.value === '' ? null : Number(e.target.value))}
                          disabled={isRunning}
                          className="w-full md:w-28 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                          placeholder="metros"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 h-5">
                      <span className="text-yellow-400 text-lg">⏱️</span>
                      <span className="text-white text-sm">Tiempo Simulación:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={raceTimeCustom ? 'custom' : (raceTime === Infinity ? 'infinite' : (raceTime ?? ''))}
                        onChange={(e) => {
                          if (isRunning) return;
                          const v = e.target.value;
                          if (v === 'custom') {
                            setRaceTimeCustom(true);
                          } else if (v === 'infinite') {
                            setRaceTimeCustom(false);
                            setRaceTime(Infinity);
                          } else if (v === '') {
                            setRaceTimeCustom(false);
                            setRaceTime(null);
                          } else {
                            setRaceTimeCustom(false);
                            setRaceTime(Number(v));
                          }
                        }}
                        disabled={isRunning}
                        className="w-full md:w-auto bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 text-sm"
                      >
                        <option value="">— Seleccionar —</option>
                        <option value={10}>10 segundos</option>
                        <option value={30}>30 segundos</option>
                        <option value={60}>60 segundos</option>
                        <option value={90}>90 segundos</option>
                        <option value={120}>120 segundos</option>
                        <option value="infinite">Infinito</option>
                        <option value="custom">Personalizado...</option>
                      </select>
                      {raceTimeCustom && (
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={raceTime ?? ''}
                          onChange={(e) => setRaceTime(e.target.value === '' ? null : Number(e.target.value))}
                          disabled={isRunning}
                          className="w-full md:w-28 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                          placeholder="s"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Control Buttons */}
              <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3 justify-center md:min-w-[260px]">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={
                    winner !== null ||
                    raceDistance === null ||
                    raceTime === null ||
                    vehicle1Force === null ||
                    vehicle2Force === null
                  }
                  aria-pressed={isRunning}
                  className={`w-full md:w-auto md:min-w-[160px] py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${
                    isRunning
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-white/10`}
                >
                  <span className="inline-flex items-center justify-center p-2 rounded-md bg-white/10">
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  </span>
                  <span className="font-semibold tracking-wide">
                    {isRunning ? 'PAUSAR' : 'INICIAR'}
                  </span>
                </button>
                {/* Hint when start is disabled due to missing required inputs */}
                {(
                  raceDistance === null ||
                  raceTime === null ||
                  vehicle1Force === null ||
                  vehicle2Force === null
                ) && (
                  <div className="text-xs text-yellow-300 ml-0 md:ml-2 mt-2 md:mt-0">Seleccione distancia, tiempo y fuerzas para iniciar</div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full md:w-auto md:min-w-[140px] px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg ring-1 ring-white/10"
                >
                  <span className="inline-flex items-center justify-center p-2 rounded-md bg-white/10">
                    <RefreshCw size={18} />
                  </span>
                  <span className="font-semibold tracking-wide">REINICIAR</span>
                </button>
              </div>

              {/* Right: Scenario Selector */}
              <div className="w-full md:w-auto flex items-center md:justify-end gap-3">
                <div className="text-white text-sm mr-2">Escenario:</div>
                <div className="flex items-center gap-2">
                  {(['highway', 'city', 'desert', 'mountain', 'stadium'] as ScenarioType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => !isRunning && setScenario(s)}
                      disabled={isRunning}
                      className={`w-10 h-10 flex items-center justify-center rounded-md transition-all text-lg ${
                        scenario === s
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } disabled:opacity-50`}
                      title={
                        s === 'highway' ? 'Carretera' :
                        s === 'city' ? 'Ciudad' :
                        s === 'desert' ? 'Desierto' :
                        s === 'mountain' ? 'Montaña' :
                        'Estadio'
                      }
                    >
                      <span className="text-[16px] leading-none">{s === 'highway' ? '🛣️' : s === 'city' ? '🏙️' : s === 'desert' ? '🏜️' : s === 'mountain' ? '⛰️' : '🏟️'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Race Scene - FULL WIDTH */}
        {/* Winner Banner (now placed above the RaceScene so it doesn't occupy the top of the full template) */}
        {winner !== null && (
          <div className="max-w-full mx-auto px-0">
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-xl p-4 shadow-2xl border-4 border-yellow-300">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="text-white" size={36} />
                <div className="text-center">
                  <div className="text-white text-2xl font-semibold">
                    {winner === 'tie' ? '🤝 ¡EMPATE! Ambos vehículos llegaron al final' : `🏆 ¡VEHÍCULO ${winner} GANÓ LA CARRERA! 🏆`}
                  </div>
                  <div className="text-yellow-100 text-sm mt-1">
                    Distancia completada: {raceDistance}m
                  </div>
                </div>
                <Trophy className="text-white" size={36} />
              </div>
            </div>
          </div>
        )}
        <RaceScene
          vehicle1Type={vehicle1Type}
          vehicle1Position={vehicle1Current.position}
          vehicle1Velocity={vehicle1Current.velocity}
          vehicle2Type={vehicle2Type}
          vehicle2Position={vehicle2Current.position}
          vehicle2Velocity={vehicle2Current.velocity}
          scenario={scenario}
          isRunning={isRunning}
          raceDistance={raceDistance ?? 0}
          raceTime={raceTime ?? 0}
          vehicle1Image={vehicle1ImageUrl}
          vehicle2Image={vehicle2ImageUrl}
          vehicle1PositionRef={v1PositionRef}
          vehicle2PositionRef={v2PositionRef}
        />

    {/* Vehicle Controls - Side by Side */}
  {/* Vehicle Controls: side-by-side from small tablet (sm) upwards */}
  <div
    className="grid grid-cols-1 sm:grid-cols-2 gap-4 two-column-fallback"
    style={isWide ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } : { gridTemplateColumns: '1fr' }}
  >
          <RaceControls
            vehicleNumber={1}
            vehicleType={vehicle1Type}
            setVehicleType={setVehicle1Type}
            mass={vehicle1Mass}
            setMass={setVehicle1Mass}
            appliedForce={vehicle1Force}
            setAppliedForce={setVehicle1Force}
            friction={vehicle1Friction}
            setFriction={setVehicle1Friction}
            forceType={vehicle1ForceType}
            setForceType={setVehicle1ForceType}
            isRunning={isRunning}
            color="blue"
            initialVelocity={vehicle1InitialVelocity}
            setInitialVelocity={setVehicle1InitialVelocity}
            initialPosition={vehicle1InitialPosition}
            setInitialPosition={setVehicle1InitialPosition}
            imageUrl={vehicle1ImageUrl}
            setImageUrl={setVehicle1ImageUrl}
          />
          
          <RaceControls
            vehicleNumber={2}
            vehicleType={vehicle2Type}
            setVehicleType={setVehicle2Type}
            mass={vehicle2Mass}
            setMass={setVehicle2Mass}
            appliedForce={vehicle2Force}
            setAppliedForce={setVehicle2Force}
            friction={vehicle2Friction}
            setFriction={setVehicle2Friction}
            forceType={vehicle2ForceType}
            setForceType={setVehicle2ForceType}
            isRunning={isRunning}
            color="red"
            initialVelocity={vehicle2InitialVelocity}
            setInitialVelocity={setVehicle2InitialVelocity}
            initialPosition={vehicle2InitialPosition}
            setInitialPosition={setVehicle2InitialPosition}
            imageUrl={vehicle2ImageUrl}
            setImageUrl={setVehicle2ImageUrl}
          />
        </div>

    {/* Physics Metrics - Side by Side with more spacing */}
  {/* Physics Metrics: side-by-side from small tablet (sm) upwards */}
  <div
    className="grid grid-cols-1 sm:grid-cols-2 gap-4 two-column-fallback"
    style={isWide ? { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } : { gridTemplateColumns: '1fr' }}
  >
          <PhysicsMetrics
            vehicleNumber={1}
            currentData={vehicle1Current}
            allData={vehicle1Data}
            mass={vehicle1Mass}
            color="blue"
          />
          <PhysicsMetrics
            vehicleNumber={2}
            currentData={vehicle2Current}
            allData={vehicle2Data}
            mass={vehicle2Mass}
            color="red"
          />
        </div>

        {/* Charts Panel - LARGER */}
        <ChartsPanel
          vehicle1Data={vehicle1Data}
          vehicle2Data={vehicle2Data}
        />
      </div>
    </div>
  );
}