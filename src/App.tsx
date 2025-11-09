import { useState, useEffect, useRef } from 'react';
import { RaceScene } from './components/RaceScene';
import { RaceControls } from './components/RaceControls';
import { PhysicsMetrics } from './components/PhysicsMetrics';
import { ChartsPanel } from './components/ChartsPanel';
import { Trophy, Target, Play, Pause, RefreshCw } from 'lucide-react';

export type VehicleType = 'car' | 'motorcycle' | 'truck';
export type ScenarioType = 'highway' | 'city' | 'desert' | 'mountain';
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

  const [scenario, setScenario] = useState<ScenarioType>('highway');
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [raceDistance, setRaceDistance] = useState<number | null>(null); // Parametrizable (optional)
  const [raceTime, setRaceTime] = useState<number | null>(null); // Nuevo: tiempo de simulación parametrizable (optional)
  const [raceDistanceCustom, setRaceDistanceCustom] = useState(false);
  const [raceTimeCustom, setRaceTimeCustom] = useState(false);
  // Custom vehicle images (data URLs or external URLs)
  const [vehicle1ImageUrl, setVehicle1ImageUrl] = useState<string | null>(null);
  const [vehicle2ImageUrl, setVehicle2ImageUrl] = useState<string | null>(null);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
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
      
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, vehicle1Mass, vehicle1Force, vehicle1Friction, vehicle1ForceType,
      vehicle2Mass, vehicle2Force, vehicle2Friction, vehicle2ForceType]);

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

    // Check for winner
    if (raceDistance !== null && v1PositionRef.current >= raceDistance && winner === null) {
      setWinner(1);
      setIsRunning(false);
      return;
    }
    if (raceDistance !== null && v2PositionRef.current >= raceDistance && winner === null) {
      setWinner(2);
      setIsRunning(false);
      return;
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
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

      <div className="max-w-[1600px] mx-auto p-4 space-y-4">
        {/* Winner Banner */}
        {winner && (
          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-xl p-6 shadow-2xl animate-pulse border-4 border-yellow-300">
            <div className="flex items-center justify-center gap-4">
              <Trophy className="text-white" size={48} />
              <div className="text-center">
                <div className="text-white text-3xl">
                  🏆 ¡VEHÍCULO {winner} GANÓ LA CARRERA! 🏆
                </div>
                <div className="text-yellow-100 text-lg mt-1">
                  Distancia completada: {raceDistance}m
                </div>
              </div>
              <Trophy className="text-white" size={48} />
            </div>
          </div>
        )}

        {/* Simulation Controls - Horizontal bar at top */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 shadow-xl">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Left: Selectors (distance + time) */}
              <div className="w-full md:flex-1 md:min-w-[280px] md:max-w-[760px]">
                <div className="grid grid-cols-2 gap-4 items-center">
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
              <div className="w-full md:w-auto flex md:justify-end">
                <div className="text-white text-sm mb-1 text-right">Escenario:</div>
                <div className="grid grid-cols-4 gap-2">
                  {(['highway', 'city', 'desert', 'mountain'] as ScenarioType[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => !isRunning && setScenario(s)}
                      disabled={isRunning}
                      className={`p-2 rounded-lg transition-all text-lg ${
                        scenario === s
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } disabled:opacity-50`}
                      title={s === 'highway' ? 'Carretera' : s === 'city' ? 'Ciudad' : s === 'desert' ? 'Desierto' : 'Montaña'}
                    >
                      {s === 'highway' && '🛣️'}
                      {s === 'city' && '🏙️'}
                      {s === 'desert' && '🏜️'}
                      {s === 'mountain' && '⛰️'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Race Scene - FULL WIDTH */}
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
        />

    {/* Vehicle Controls - Side by Side */}
    <div className="grid grid-cols-2 gap-4">
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
    <div className="grid grid-cols-2 gap-4">
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