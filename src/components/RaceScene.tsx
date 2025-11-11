import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { VehicleType, ScenarioType } from '../App';

interface RaceSceneProps {
  vehicle1Type: VehicleType;
  vehicle1Position: number;
  vehicle1Velocity: number;
  vehicle2Type: VehicleType;
  vehicle2Position: number;
  vehicle2Velocity: number;
  scenario: ScenarioType;
  isRunning: boolean;
  raceDistance: number;
  raceTime: number; // tiempo total parametrizable
  vehicle1Image?: string | null;
  vehicle2Image?: string | null;
}

// Vehicle components
const SportsCar = ({ isRunning, color }: { isRunning: boolean; color: 'blue' | 'red' }) => {
  const colorClasses = color === 'blue' 
    ? 'from-blue-500 via-blue-600 to-blue-700' 
    : 'from-red-500 via-red-600 to-red-700';
  
  return (
    <div className="relative w-36 h-18">
      <div className={`absolute bottom-3 left-4 w-28 h-9 bg-gradient-to-br ${colorClasses} rounded-lg shadow-2xl`}>
        <div className="absolute top-2 right-1 w-3 h-2 bg-white rounded-full shadow-lg" />
        <div className="absolute top-2 left-1 w-2 h-1.5 bg-red-400 rounded" />
        <div className="absolute -top-2 left-1 w-8 h-1 bg-gray-900 rounded-sm" />
      </div>
      <div className={`absolute bottom-8 left-11 w-18 h-7 bg-gradient-to-br ${colorClasses} rounded-t-2xl`}
           style={{ clipPath: 'polygon(15% 0%, 100% 0%, 95% 100%, 0% 100%)' }}>
        <div className="absolute top-1 left-2 w-5 h-4 bg-blue-300 rounded-tl-lg opacity-70" />
        <div className="absolute top-1 right-2 w-6 h-4 bg-blue-300 rounded-tr-lg opacity-70" />
      </div>
      <motion.div 
        className="absolute bottom-0 left-7 w-7 h-7 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.3, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute bottom-0 right-7 w-7 h-7 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.3, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
    </div>
  );
};

const SportsMotorcycle = ({ isRunning, color }: { isRunning: boolean; color: 'blue' | 'red' }) => {
  const colorClasses = color === 'blue' 
    ? 'from-blue-500 via-blue-600 to-blue-700' 
    : 'from-orange-500 via-orange-600 to-orange-700';
  
  return (
    <div className="relative w-28 h-16">
      <div className={`absolute bottom-3 left-7 w-16 h-6 bg-gradient-to-br ${colorClasses} rounded-lg shadow-xl`} />
      <div className={`absolute bottom-5 left-9 w-11 h-3 bg-gradient-to-br ${colorClasses} rounded-lg`} />
      <div className={`absolute bottom-3 right-2 w-9 h-7 bg-gradient-to-br ${colorClasses} rounded-r-2xl`}
           style={{ clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 100%)' }}>
        <div className="absolute top-2 right-0.5 w-2 h-2 bg-white rounded-sm" />
      </div>
      <motion.div 
        className="absolute bottom-0 right-3 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.25, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute bottom-0 left-4 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.25, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
    </div>
  );
};

const SportsTruck = ({ isRunning, color }: { isRunning: boolean; color: 'blue' | 'red' }) => {
  const colorClasses = color === 'blue' 
    ? 'from-blue-400 via-blue-500 to-blue-700' 
    : 'from-red-400 via-red-500 to-red-700';
  
  return (
    <div className="relative w-44 h-20">
      <div className={`absolute bottom-3 left-2 w-22 h-11 bg-gradient-to-br ${colorClasses} rounded-md shadow-xl`}>
        <div className="absolute inset-2 border border-white/20 rounded" />
      </div>
      <div className={`absolute bottom-3 right-4 w-20 h-10 bg-gradient-to-br ${colorClasses} rounded-r-xl shadow-2xl`}>
        <div className="absolute -top-3 left-2 w-16 h-5 bg-gradient-to-br from-gray-700 to-gray-900 rounded-t-lg" />
        <div className="absolute -top-2 left-3 w-13 h-4 bg-blue-200 rounded-t-md opacity-75" />
        <div className="absolute top-2 right-2 w-8 h-4 bg-blue-200 rounded-tr-lg opacity-75" />
        <div className="absolute bottom-2 right-1 w-3 h-2 bg-white rounded-sm" />
      </div>
      <motion.div 
        className="absolute bottom-0 right-6 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.4, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute bottom-0 left-16 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.4, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
      <motion.div 
        className="absolute bottom-0 left-20 w-8 h-8 bg-gray-900 rounded-full border-2 border-gray-800"
        animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
        transition={isRunning ? { duration: 0.4, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      >
        <div className="absolute inset-1 bg-gray-600 rounded-full" />
      </motion.div>
    </div>
  );
};

export function RaceScene({
  vehicle1Type,
  vehicle1Position,
  vehicle1Velocity,
  vehicle2Type,
  vehicle2Position,
  vehicle2Velocity,
  scenario,
  isRunning,
  raceDistance,
  raceTime // nuevo parámetro
  , vehicle1Image, vehicle2Image
}: RaceSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleWidth, setVisibleWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1600);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const movingRef = useRef<HTMLDivElement | null>(null);
  // Escala visual uniforme para todos los vehículos (imágenes y vectoriales)
  const vehicleScale = 1.35;
  

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setVisibleWidth(containerRef.current.clientWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  
  const getVehicle = (type: VehicleType, color: 'blue' | 'red') => {
    switch (type) {
      case 'car':
        return (
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom' }}>
            <SportsCar isRunning={isRunning} color={color} />
          </div>
        );
      case 'motorcycle':
        return (
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom' }}>
            <SportsMotorcycle isRunning={isRunning} color={color} />
          </div>
        );
      case 'truck':
        return (
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom' }}>
            <SportsTruck isRunning={isRunning} color={color} />
          </div>
        );
    }
  };

  // helper: map vehicle type to pixel size (matches the div sizes used by the vector components)
  const vehicleSize = (type: VehicleType) => {
    switch (type) {
      case 'car':
        return { width: 144, height: 72 }; // w-36 h-18
      case 'motorcycle':
        return { width: 112, height: 64 }; // w-28 h-16
      case 'truck':
        return { width: 176, height: 80 }; // w-44 h-20
      default:
        return { width: 144, height: 72 };
    }
  };

  // Camera follows the leader, pero el borde izquierdo SIEMPRE es 0m
  const leadPosition = Math.max(vehicle1Position, vehicle2Position);
  // Calculamos el desplazamiento en metros primero, con un umbral de 200m antes de mover la cámara
  const cameraOffsetMeters = leadPosition > 200 ? Math.min(leadPosition - 200, Math.max(0, raceDistance - 200)) : 0;
  // Convertimos a píxeles (la escala usada en el layout es 1.6 px por metro)
  const cameraOffsetPixels = cameraOffsetMeters * 1.6;
  // Límite máximo de desplazamiento en píxeles (usamos el ancho visible medido)
  // Añadimos un padding derecho para que la etiqueta de la META no quede cortada
  const rightPaddingPx = Math.max(180, Math.round(visibleWidth * 0.08)); // margen en píxeles para la etiqueta de meta
  // Left padding: espacio fijo a la izquierda (en px) para que el marcador 0m sea visible.
  // Lo hacemos dinámico según el ancho visible, pero con límites razonables.
  // Increase left padding so 0m aligns with vehicle graphics even on wide viewports.
  // Use a stronger proportion of visibleWidth so long races look better.
  const leftPaddingPx = Math.min(320, Math.max(40, Math.round(visibleWidth * 0.08)));
  // Larger marker offset to move markers more to the right (so 0m sits under cars)
  const markerOffsetPx = Math.max(36, Math.round(visibleWidth * 0.06));
  // ancho lógico (incluye paddings y desplazamiento de marcadores/meta)
  const trackLogicalWidthPx = leftPaddingPx + markerOffsetPx + raceDistance * 1.6 + rightPaddingPx;
  const safetyPx = 240; // margen de seguridad
  const trackTotalWidthPx = trackLogicalWidthPx + safetyPx;
  // tiles de 1600px: asegura un tile extra
  const tileRepeatCount = Math.max(1, Math.ceil(trackTotalWidthPx / 1600) + 1);
  const laneTilesWidthPx = tileRepeatCount * 1600;
  const maxCameraOffsetPixels = Math.max(0, trackTotalWidthPx - visibleWidth);
  // Cámara final en píxeles, nunca negativa y nunca por encima del máximo
  const cameraX = Math.max(0, Math.min(cameraOffsetPixels, maxCameraOffsetPixels));

  // activate smoothing RAF loop to interpolate towards cameraX
  useSmoothCamera(cameraX, movingRef, parallaxRef);
  // Position the lane labels slightly before the starting car position
  const laneLabelLeft = Math.max(8, leftPaddingPx - 140);

  // Repeat scenario background horizontally so it never ends
  const getScenario = () => {
    const repeatCount = tileRepeatCount; // sincronizado con los lanes
    switch (scenario) {
      case 'highway':
        return (
          <>
            {Array.from({ length: repeatCount }).map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-y-0"
                style={{ left: `${idx * 1600}px`, width: '1600px', background: 'linear-gradient(to bottom, #38bdf8, #7dd3fc, #bae6fd)' }}
              />
            ))}
          </>
        );
      case 'city':
        return (
          <>
            {Array.from({ length: repeatCount }).map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-y-0"
                style={{ left: `${idx * 1600}px`, width: '1600px', background: 'linear-gradient(to bottom, #fdba74, #fbcfe8, #c4b5fd)' }}
              />
            ))}
          </>
        );
      case 'desert':
        return (
          <>
            {Array.from({ length: repeatCount }).map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-y-0"
                style={{ left: `${idx * 1600}px`, width: '1600px', background: 'linear-gradient(to bottom, #fef9c3, #fde68a, #fef08a)' }}
              />
            ))}
          </>
        );
      case 'mountain':
        return (
          <>
            {Array.from({ length: repeatCount }).map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-y-0"
                style={{ left: `${idx * 1600}px`, width: '1600px', background: 'linear-gradient(to bottom, #3b82f6, #93c5fd, #bae6fd)' }}
              />
            ))}
          </>
        );
    }
  };

  // Generate distance markers dynamically
  const markers = [];
  const markerInterval = raceDistance <= 500 ? 100 : 200;
  for (let i = 0; i <= raceDistance; i += markerInterval) {
    markers.push(i);
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
  <div ref={containerRef} className="relative h-[600px] overflow-hidden" data-allow-overflow="true">
        {/* Base background (fijo) para evitar áreas vacías si el layer desplazable se mueve) */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient por escenario */}
          {scenario === 'highway' && (
            <div className="absolute inset-0">
              <div style={{ background: 'linear-gradient(to bottom, #38bdf8, #7dd3fc, #bae6fd)' }} className="absolute inset-0" />
              {/* Decorative badges only once (not repeated) */}
              <div className="absolute top-10 right-20 w-24 h-24 bg-yellow-300 rounded-full shadow-xl" />
              <div className="absolute top-16 left-32 w-32 h-16 bg-white/50 rounded-full blur-md" />
              <div className="absolute top-24 right-48 w-28 h-14 bg-white/40 rounded-full blur-md" />
            </div>
          )}
          {scenario === 'city' && (
            <div className="absolute inset-0">
              <div style={{ background: 'linear-gradient(to bottom, #fdba74, #fbcfe8, #c4b5fd)' }} className="absolute inset-0" />
              <div className="absolute bottom-[340px] left-0 right-0 flex gap-4 px-6">
                {/* single skyline decorative block */}
                <div className="flex gap-4">
                  <div className="w-16 h-36 bg-gray-700/40 rounded" />
                  <div className="w-20 h-44 bg-gray-700/40 rounded" />
                  <div className="w-12 h-32 bg-gray-700/40 rounded" />
                  <div className="w-24 h-40 bg-gray-700/40 rounded" />
                </div>
              </div>
            </div>
          )}
          {scenario === 'desert' && (
            <div className="absolute inset-0">
              <div style={{ background: 'linear-gradient(to bottom, #fef9c3, #fde68a, #fef08a)' }} className="absolute inset-0" />
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-28 h-28 bg-yellow-400 rounded-full shadow-2xl" />
            </div>
          )}
          {scenario === 'mountain' && (
            <div className="absolute inset-0">
              <div style={{ background: 'linear-gradient(to bottom, #3b82f6, #93c5fd, #bae6fd)' }} className="absolute inset-0" />
              <div className="absolute top-16 right-24 w-20 h-20 bg-yellow-200 rounded-full" />
            </div>
          )}
        </div>

        {/* Scrolling (parallax) background */}
  <div ref={parallaxRef} className="absolute inset-0 will-change-transform" style={{ transform: `translate3d(${-cameraX * 0.3}px,0,0)` }}>
          {getScenario()}
        </div>
        
  {/* Grass */}
  <div className="absolute bottom-[310px] left-0 right-0 w-full h-6 bg-gradient-to-b from-green-600 to-green-700" />

        {/* Track Container with Camera Movement */}
        <div
          ref={movingRef}
          className="absolute bottom-0 left-0 h-[310px] will-change-transform"
          style={{ width: `${Math.max(visibleWidth, laneTilesWidthPx)}px`, transform: `translate3d(${-cameraX}px,0,0)` }}
        >
          {/* Repeat road lanes horizontally */}
          {Array.from({ length: tileRepeatCount }).map((_, idx) => (
            <>
              {/* Lane 1 (Blue - Top) */}
              <div
                key={`lane1-${idx}`}
                className="absolute top-0 h-[155px] bg-gradient-to-b from-gray-600 via-gray-650 to-gray-700 border-t-2 border-white/20"
                style={{ left: `${idx * 1600}px`, width: '1600px' }}
              >
                <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/40" />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex gap-8">
                  {Array.from({ length: Math.ceil(1600 / 10) }).map((_, i) => (
                    <div key={i} className="w-12 h-1 bg-blue-300" />
                  ))}
                </div>
                {/* Lane label moved out of the repeating tiles to avoid repetition */}
              </div>
              {/* Middle yellow divider */}
              <div
                key={`divider-${idx}`}
                style={{ position: 'absolute', top: 155, left: `${idx * 1600}px`, width: '1600px', height: '6px', background: '#FFD600', zIndex: 100 }}
              />
              {/* Lane 2 (Red - Bottom) */}
              <div
                key={`lane2-${idx}`}
                className="absolute top-[155px] h-[155px] bg-gradient-to-b from-gray-600 via-gray-650 to-gray-700"
                style={{ left: `${idx * 1600}px`, width: '1600px' }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex gap-8">
                  {Array.from({ length: Math.ceil(1600 / 10) }).map((_, i) => (
                    <div key={i} className="w-12 h-1 bg-red-300" />
                  ))}
                </div>
                <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-white/40" />
                {/* Lane label moved out of the repeating tiles to avoid repetition */}
              </div>
            </>
          ))}

          {/* Lane labels (render once, not per-tile) */}
          <div
            className="absolute z-30"
            style={{ left: `${laneLabelLeft}px`, top: `${4}px` }}
          >
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl whitespace-nowrap">Vehículo 1</div>
          </div>
          <div
            className="absolute z-30"
            style={{ left: `${laneLabelLeft}px`, top: `${155 + 4}px` }}
          >
            <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-xl whitespace-nowrap">Vehículo 2</div>
          </div>

          {/* Distance markers along the track */}
          {markers.map((dist) => (
            <div key={dist} className="absolute top-0 bottom-0" style={{ left: `${leftPaddingPx + markerOffsetPx + dist * 1.6}px` }}>
              <div className="relative h-full">
                {/* Green marker line */}
                <div className="absolute top-[-24px] left-0 w-1 h-6 bg-green-400" />
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-green-700 text-white px-2 py-0.5 rounded text-sm whitespace-nowrap">
                  {dist}m
                </div>
              </div>
            </div>
          ))}

          {/* Finish Line */}
          <div 
            className="absolute top-0 bottom-0 w-4 z-20"
            style={{ left: `${leftPaddingPx + markerOffsetPx + raceDistance * 1.6}px` }}
          >
            <div 
              className="h-full w-full"
              style={{ 
                backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 12px, black 12px, black 24px)'
              }}
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-xl whitespace-nowrap z-30">
              🏁 META {raceDistance}m
            </div>
          </div>

          {/* Vehicle 1 (Blue lane - positioned absolutely) */}
          <div
            className="absolute z-30"
            style={{
              left: `${leftPaddingPx + vehicle1Position * 1.6}px`, // margen izquierdo para que se vea el 0m y el carro
              top: 40
            }}
          >
            <motion.div
              animate={{ y: isRunning ? [0, -1, 0] : 0 }}
              transition={{ duration: 0.15, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            >
                  {vehicle1Image ? (
                    (() => {
                      const sz = vehicleSize(vehicle1Type);
                      return (
                        <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom' }}>
                          <img
                            src={vehicle1Image}
                            alt="Vehicle 1"
                            style={{ width: sz.width, height: sz.height, objectFit: 'contain', background: 'transparent' }}
                          />
                        </div>
                      );
                    })()
                  ) : getVehicle(vehicle1Type, 'blue')}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap shadow-xl">
                {vehicle1Velocity.toFixed(1)} m/s
              </div>
            </motion.div>
          </div>

          {/* Vehicle 2 (Red lane - positioned absolutamente) */}
          <div
            className="absolute z-30"
            style={{
              left: `${leftPaddingPx + vehicle2Position * 1.6}px`, // margen izquierdo para que se vea el 0m y el carro
              top: 185
            }}
          >
            <motion.div
              animate={{ y: isRunning ? [0, -1, 0] : 0 }}
              transition={{ duration: 0.15, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            >
              {vehicle2Image ? (
                (() => {
                  const sz = vehicleSize(vehicle2Type);
                  return (
                    <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom' }}>
                      <img
                        src={vehicle2Image}
                        alt="Vehicle 2"
                        style={{ width: sz.width, height: sz.height, objectFit: 'contain', background: 'transparent' }}
                      />
                    </div>
                  );
                })()
              ) : getVehicle(vehicle2Type, 'red')}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap shadow-xl">
                {vehicle2Velocity.toFixed(1)} m/s
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="bg-gray-950 p-3">
        <div className="flex items-center gap-4">
          <span className="text-white text-sm whitespace-nowrap">Progreso:</span>
          <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min((vehicle1Position / raceDistance) * 100, 100)}%` }}
            />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 rounded-full opacity-50"
              style={{ width: `${Math.min((vehicle2Position / raceDistance) * 100, 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-4 text-xs">
              <span className="text-blue-200">V1: {vehicle1Position.toFixed(0)}m</span>
              <span className="text-red-200">V2: {vehicle2Position.toFixed(0)}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Smooth camera interpolation effect: keep using the computed `cameraX` as the target
// but update the DOM transform at RAF pace with interpolation to reduce jitter.
// This avoids animating with a spring every render which can jitter at very large offsets.
// We set up the RAF loop when the component mounts and clean up on unmount.
// The effect depends on `cameraX` so whenever the computed target changes, the loop will
// interpolate towards the new target smoothly.
// Note: we intentionally keep the loop internal and mutate DOM transforms directly to
// avoid forcing React re-renders at 60fps.
function useSmoothCamera(cameraX: number, movingRef: React.RefObject<HTMLDivElement | null>, parallaxRef: React.RefObject<HTMLDivElement | null>) {
  const cameraRef = useRef<number>(cameraX);
  useEffect(() => {
    let raf = 0;
    const step = () => {
      // interpolate (lerp) towards target
      cameraRef.current += (cameraX - cameraRef.current) * 0.12;
      if (movingRef.current) movingRef.current.style.transform = `translate3d(${-cameraRef.current}px,0,0)`;
      if (parallaxRef.current) parallaxRef.current.style.transform = `translate3d(${-cameraRef.current * 0.3}px,0,0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cameraX, movingRef, parallaxRef]);
}