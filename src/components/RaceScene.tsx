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
  // optional high-frequency refs from main thread worker
  vehicle1PositionRef?: React.RefObject<number>;
  vehicle2PositionRef?: React.RefObject<number>;
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
  raceTime, // nuevo parámetro
  vehicle1Image,
  vehicle2Image,
  vehicle1PositionRef,
  vehicle2PositionRef
}: RaceSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleWidth, setVisibleWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1600);
  const parallaxRef = useRef<HTMLDivElement | null>(null);
  const movingRef = useRef<HTMLDivElement | null>(null);
  const vehicle1ElRef = useRef<HTMLDivElement | null>(null);
  const vehicle2ElRef = useRef<HTMLDivElement | null>(null);
  // Escala visual uniforme para todos los vehículos (imágenes y vectoriales)
  const vehicleScale = 1.35;
  const PX_PER_M = 1.6; // factor único de conversión m -> px
  

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
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom', position: 'relative', zIndex: 2 }}>
            <SportsCar isRunning={isRunning} color={color} />
          </div>
        );
      case 'motorcycle':
        return (
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom', position: 'relative', zIndex: 2 }}>
            <SportsMotorcycle isRunning={isRunning} color={color} />
          </div>
        );
      case 'truck':
        return (
          <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom', position: 'relative', zIndex: 2 }}>
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
  const cameraOffsetPixels = cameraOffsetMeters * PX_PER_M;
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
  const trackLogicalWidthPx = leftPaddingPx + markerOffsetPx + raceDistance * PX_PER_M + rightPaddingPx;
  const safetyPx = 240; // margen de seguridad
  const trackTotalWidthPx = trackLogicalWidthPx + safetyPx;
  // Ancho por tile para lanes/escenario (1600px)
  const TILE_W = 1600;
  // slight overlap in pixels to avoid visible seams when tiles are translated with
  // fractional pixels by the camera (subpixel antialiasing can create 1px gaps)
  const TILE_OVERLAP = 1; 
  // Cantidad de tiles visibles + buffer (virtualización)
  const startTile = Math.max(0, Math.floor(cameraOffsetPixels / TILE_W) - 1);
  const tilesToRender = Math.max(3, Math.ceil(visibleWidth / TILE_W) + 2);
  const maxCameraOffsetPixels = Math.max(0, trackTotalWidthPx - visibleWidth);
  // Cámara final en píxeles, nunca negativa y nunca por encima del máximo
  const cameraX = Math.max(0, Math.min(cameraOffsetPixels, maxCameraOffsetPixels));

  // cameraTargetRef will be updated at RAF pace from high-frequency refs (if provided)
  const cameraTargetRef = useRef<number>(cameraX);
  useEffect(() => {
    let raf = 0;
    const step = () => {
      // Prefer high-frequency refs when available (they're updated by the worker)
      const v1m = (vehicle1PositionRef && vehicle1PositionRef.current !== undefined) ? vehicle1PositionRef.current : vehicle1Position;
      const v2m = (vehicle2PositionRef && vehicle2PositionRef.current !== undefined) ? vehicle2PositionRef.current : vehicle2Position;
      const lead = Math.max(v1m, v2m);
      const cameraOffsetMetersLocal = lead > 200 ? Math.min(lead - 200, Math.max(0, raceDistance - 200)) : 0;
      const camPx = Math.max(0, Math.min(cameraOffsetMetersLocal * PX_PER_M, maxCameraOffsetPixels));
      cameraTargetRef.current = camPx;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle1Position, vehicle2Position, raceDistance, PX_PER_M, maxCameraOffsetPixels]);

  // activate smoothing RAF loop to interpolate towards cameraTargetRef
  useSmoothCamera(cameraTargetRef, movingRef, parallaxRef);
  // Position the lane labels slightly before the starting car position
  const laneLabelLeft = Math.max(8, leftPaddingPx - 140);

  // Repeat scenario background around the camera (virtualized tiles)
  const getScenario = () => {
    switch (scenario) {
      case 'stadium':
        return (
          <>
            {Array.from({ length: tilesToRender }).map((_, i) => {
              const idx = startTile + i;
              return (
                <div
                  key={`stadium-${idx}`}
                  className="absolute inset-y-0"
                  style={{ left: `${idx * TILE_W - TILE_OVERLAP}px`, width: `${TILE_W + TILE_OVERLAP}px` }}
                >
                  {/* Base green (outfield) */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #166534, #14532d)' }} />

                {/* Track area centered with curbs and markings */}
                <div
                  className="absolute left-48 right-48 top-40 bottom-40 rounded-sm"
                  style={{ background: 'linear-gradient(to bottom, #111827, #0b1220)', boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.6)' }}
                >
                  {/* Left and right curbs (striped) */}
                  <div className="absolute left-0 top-0 bottom-0" style={{ width: 12, background: 'repeating-linear-gradient(90deg, #fff 0 8px, #d32 8px 16px)' }} />
                  <div className="absolute right-0 top-0 bottom-0" style={{ width: 12, background: 'repeating-linear-gradient(90deg, #fff 0 8px, #d32 8px 16px)' }} />

                  {/* Lane divider lines */}
                  <div className="absolute left-0 right-0 top-1/3 h-0.5 bg-white/80" />
                  <div className="absolute left-0 right-0 top-2/3 h-0.5 bg-white/80" />

                  {/* Center dashed marking */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2">
                    <div style={{ height: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.95) 0 18px, transparent 18px 36px)' }} />
                  </div>
                </div>

                {/* Stands / decorations at top */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                  <div className="w-24 h-16 bg-gray-700/60 rounded-sm" />
                  <div className="w-24 h-16 bg-gray-700/60 rounded-sm" />
                </div>
                </div>
              );
            })}
          </>
        );
      case 'highway':
        return (
          <>
            {Array.from({ length: tilesToRender }).map((_, i) => {
              const idx = startTile + i;
              return (
                <div
                  key={idx}
                  className="absolute inset-y-0"
                  style={{ left: `${idx * TILE_W - TILE_OVERLAP}px`, width: `${TILE_W + TILE_OVERLAP}px`, background: 'linear-gradient(to bottom, #38bdf8, #7dd3fc, #bae6fd)' }}
                />
              );
            })}
          </>
        );
      case 'city':
        return (
          <>
            {Array.from({ length: tilesToRender }).map((_, i) => {
              const idx = startTile + i;
              return (
                <div
                  key={idx}
                  className="absolute inset-y-0"
                  style={{ left: `${idx * TILE_W - TILE_OVERLAP}px`, width: `${TILE_W + TILE_OVERLAP}px`, background: 'linear-gradient(to bottom, #fdba74, #fbcfe8, #c4b5fd)' }}
                />
              );
            })}
          </>
        );
      case 'desert':
        return (
          <>
            {Array.from({ length: tilesToRender }).map((_, i) => {
              const idx = startTile + i;
              return (
                <div
                  key={idx}
                  className="absolute inset-y-0"
                  style={{ left: `${idx * TILE_W - TILE_OVERLAP}px`, width: `${TILE_W + TILE_OVERLAP}px`, background: 'linear-gradient(to bottom, #fef9c3, #fde68a, #fef08a)' }}
                />
              );
            })}
          </>
        );
      case 'mountain':
        return (
          <>
            {Array.from({ length: tilesToRender }).map((_, i) => {
              const idx = startTile + i;
              return (
                <div
                  key={idx}
                  className="absolute inset-y-0"
                  style={{ left: `${idx * TILE_W - TILE_OVERLAP}px`, width: `${TILE_W + TILE_OVERLAP}px`, background: 'linear-gradient(to bottom, #3b82f6, #93c5fd, #bae6fd)' }}
                />
              );
            })}
          </>
        );
    }
  };

  // Generate distance markers only for the visible window (virtualized)
  const markerInterval = raceDistance <= 500 ? 100 : 200;
  const visibleStartPx = Math.max(0, cameraX - TILE_W); // buffer 1 tile a la izquierda
  const visibleEndPx = cameraX + visibleWidth + TILE_W;  // buffer 1 tile a la derecha
  const firstMarkerM = Math.max(0, Math.ceil(((visibleStartPx - leftPaddingPx - markerOffsetPx) / PX_PER_M) / markerInterval) * markerInterval);
  const lastMarkerM = Math.min(raceDistance, Math.floor(((visibleEndPx - leftPaddingPx - markerOffsetPx) / PX_PER_M) / markerInterval) * markerInterval);
  const markers: number[] = [];
  for (let m = firstMarkerM; m <= lastMarkerM; m += markerInterval) markers.push(m);

  // Smoothly update vehicle DOM positions at RAF using high-frequency refs when available
  useEffect(() => {
    let raf = 0;
    if (!vehicle1ElRef.current && !vehicle2ElRef.current) return;

    // hint to browser for smoother transforms
    if (vehicle1ElRef.current) vehicle1ElRef.current.style.willChange = 'transform';
    if (vehicle2ElRef.current) vehicle2ElRef.current.style.willChange = 'transform';

    // displayed positions (px) are smoothed locally to avoid jumps when refs update
    let dispV1 = (vehicle1PositionRef && vehicle1PositionRef.current !== undefined ? vehicle1PositionRef.current : vehicle1Position) * PX_PER_M;
    let dispV2 = (vehicle2PositionRef && vehicle2PositionRef.current !== undefined ? vehicle2PositionRef.current : vehicle2Position) * PX_PER_M;
    let lastT = performance.now();
    const SMOOTH_TAU_VEH = 0.06; // seconds

    const step = (t?: number) => {
      const now = typeof t === 'number' ? t : performance.now();
      const dt = Math.max(0.001, (now - lastT) / 1000);
      lastT = now;

      const v1m = (vehicle1PositionRef && vehicle1PositionRef.current !== undefined) ? vehicle1PositionRef.current : vehicle1Position;
      const v2m = (vehicle2PositionRef && vehicle2PositionRef.current !== undefined) ? vehicle2PositionRef.current : vehicle2Position;
      const targetV1 = v1m * PX_PER_M;
      const targetV2 = v2m * PX_PER_M;

      const alpha = 1 - Math.exp(-dt / SMOOTH_TAU_VEH);
      dispV1 += (targetV1 - dispV1) * alpha;
      dispV2 += (targetV2 - dispV2) * alpha;

      if (vehicle1ElRef.current) vehicle1ElRef.current.style.transform = `translate3d(${dispV1}px,0,0)`;
      if (vehicle2ElRef.current) vehicle2ElRef.current.style.transform = `translate3d(${dispV2}px,0,0)`;

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (vehicle1ElRef.current) vehicle1ElRef.current.style.willChange = '';
      if (vehicle2ElRef.current) vehicle2ElRef.current.style.willChange = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle1ElRef.current, vehicle2ElRef.current, vehicle1PositionRef, vehicle2PositionRef, PX_PER_M]);

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
          {scenario === 'stadium' && (
            <div className="absolute inset-0">
              {/* Sky gradient for stadium */}
              <div style={{ background: 'linear-gradient(to bottom, #7dd3fc, #60a5fa)' }} className="absolute inset-0" />

              {/* SVG clouds (crisper shapes) - left cluster */}
              <svg className="absolute top-8 left-8 w-64 h-24 pointer-events-none" viewBox="0 0 200 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <defs>
                  <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feBlend in="SourceGraphic" in2="b" />
                  </filter>
                </defs>
                <g fill="#ffffff" fillOpacity="0.95" filter="url(#cloudBlur)">
                  <ellipse cx="34" cy="28" rx="28" ry="14" />
                  <ellipse cx="64" cy="22" rx="22" ry="12" />
                  <ellipse cx="96" cy="26" rx="30" ry="16" />
                  <ellipse cx="140" cy="24" rx="20" ry="12" />
                </g>
              </svg>

              {/* right-side clouds */}
              <svg className="absolute top-10 right-20 w-56 h-22 pointer-events-none" viewBox="0 0 180 56" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g fill="#ffffff" fillOpacity="0.9">
                  <ellipse cx="50" cy="24" rx="26" ry="12" />
                  <ellipse cx="90" cy="20" rx="22" ry="11" />
                  <ellipse cx="130" cy="22" rx="24" ry="12" />
                </g>
              </svg>

              <svg className="absolute top-20 right-12 w-48 h-18 pointer-events-none" viewBox="0 0 160 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g fill="#ffffff" fillOpacity="0.9">
                  <ellipse cx="28" cy="20" rx="22" ry="10" />
                  <ellipse cx="58" cy="16" rx="18" ry="9" />
                  <ellipse cx="92" cy="20" rx="24" ry="11" />
                </g>
              </svg>

              {/* Fireworks canvas overlay: always rendered but the overlay itself adapts quality and pauses when the tab is hidden to avoid lag */}
              <FireworksOverlay height={220} active={true} />

              {/* Center sponsor banner with flanking checkered flags (anchored to banner) */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {/* left checkered flag - positioned relative to banner */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -72,
                      top: 2,
                      width: 36,
                      height: 36,
                      transform: 'rotate(-10deg)',
                      borderRadius: 4,
                      background: 'linear-gradient(45deg,#000 25%, transparent 25%), linear-gradient(-45deg,#000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0'
                    }}
                  />
                  {/* banner */}
                  <div className="px-6 py-2 rounded-full text-white font-semibold shadow-lg"
                       style={{ background: 'linear-gradient(90deg,#ef4444,#f97316)' }}>
                    RACING CUP
                  </div>
                  {/* right checkered flag - positioned relative to banner */}
                  <div
                    style={{
                      position: 'absolute',
                      right: -72,
                      top: 2,
                      width: 36,
                      height: 36,
                      transform: 'rotate(10deg)',
                      borderRadius: 4,
                      background: 'linear-gradient(45deg,#000 25%, transparent 25%), linear-gradient(-45deg,#000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0'
                    }}
                  />
                </div>
              </div>

              {/* Simple stands with crowd blocks */}
              <div className="absolute top-12 left-6 right-6 flex justify-between items-start pointer-events-none">
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-800/50 rounded-sm" />
                  ))}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-800/50 rounded-sm" />
                  ))}
                </div>
              </div>

              {/* extra cloud clusters for fuller sky (not centered) */}
              <svg className="absolute top-24 left-44 w-44 h-18 pointer-events-none" viewBox="0 0 150 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g fill="#ffffff" fillOpacity="0.92">
                  <ellipse cx="38" cy="22" rx="20" ry="10" />
                  <ellipse cx="66" cy="18" rx="18" ry="9" />
                  <ellipse cx="96" cy="20" rx="22" ry="10" />
                </g>
              </svg>
              <svg className="absolute top-26 right-44 w-40 h-16 pointer-events-none" viewBox="0 0 140 44" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <g fill="#ffffff" fillOpacity="0.9">
                  <ellipse cx="30" cy="18" rx="18" ry="8" />
                  <ellipse cx="58" cy="16" rx="16" ry="8" />
                  <ellipse cx="86" cy="18" rx="18" ry="8" />
                </g>
              </svg>
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
  <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
          {getScenario()}
        </div>
        
  {/* Grass */}
  <div className="absolute bottom-[310px] left-0 right-0 w-full h-6 bg-gradient-to-b from-green-600 to-green-700" />

        {/* Track Container with Camera Movement */}
        <div
          ref={movingRef}
          className="absolute bottom-0 left-0 h-[310px] will-change-transform"
          style={{ width: `${Math.max(visibleWidth, trackTotalWidthPx)}px` }}
        >
          {/* Repeat road lanes horizontally (virtualized around camera) */}
          {Array.from({ length: tilesToRender }).map((_, i) => {
            const isStadium = scenario === 'stadium';
            const idx = startTile + i;
            const leftPos = `${idx * TILE_W}px`;
            return (
              <React.Fragment key={idx}>
                {/* Lane 1 (Top) */}
                <div
                  key={`lane1-${idx}`}
                  className="absolute top-0 h-[155px] bg-gradient-to-b from-gray-600 via-gray-500 to-gray-700 border-t-2 border-white/20"
                  style={{ left: leftPos, width: `${TILE_W}px`, background: isStadium ? 'linear-gradient(180deg,#2f3438,#23272b)' : undefined }}
                >
                  {isStadium ? (
                    <>
                      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex items-center justify-start">
                        {/* subtle skid texture repeating small dashes */}
                        <div style={{ height: '4px', width: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 6px, transparent 6px 12px)' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/40" />
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex gap-8">
                        {/* sustituir múltiples dashes por un fondo repetitivo para bajar el DOM */}
                        <div style={{ height: '4px', width: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(59,130,246,0.9) 0 18px, transparent 18px 36px)' }} />
                      </div>
                    </>
                  )}
                </div>

                {/* Center divider: stadium uses white thin line, otherwise yellow bar */}
                {isStadium ? (
                  <div key={`divider-${idx}`} style={{ position: 'absolute', top: 155, left: leftPos, width: '1600px', height: '2px', background: 'rgba(255,255,255,0.85)', zIndex: 100 }} />
                ) : (
                  <div key={`divider-${idx}`} style={{ position: 'absolute', top: 155, left: leftPos, width: `${TILE_W}px`, height: '6px', background: '#FFD600', zIndex: 100 }} />
                )}

                {/* Lane 2 (Bottom) */}
                <div
                  key={`lane2-${idx}`}
                  className="absolute top-[155px] h-[155px] bg-gradient-to-b from-gray-600 via-gray-500 to-gray-700"
                  style={{ left: leftPos, width: `${TILE_W}px`, background: isStadium ? 'linear-gradient(180deg,#2b2f33,#1f2326)' : undefined }}
                >
                  {isStadium ? (
                    <>
                      <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex items-center justify-start">
                        <div style={{ height: '4px', width: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 6px, transparent 6px 12px)' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 flex gap-8">
                        <div style={{ height: '4px', width: '100%', backgroundImage: 'repeating-linear-gradient(90deg, rgba(248,113,113,0.9) 0 18px, transparent 18px 36px)' }} />
                      </div>
                      <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-white/40" />
                    </>
                  )}
                </div>
              </React.Fragment>
            );
          })}

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
            <div key={dist} className="absolute top-0 bottom-0" style={{ left: `${leftPaddingPx + markerOffsetPx + dist * PX_PER_M}px` }}>
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
            style={{ left: `${leftPaddingPx + markerOffsetPx + raceDistance * PX_PER_M}px` }}
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
            ref={vehicle1ElRef}
            className="absolute z-30"
            style={{
              left: `${leftPaddingPx}px`, // base left; x offset applied via transform for smooth updates
              top: 40
            }}
          >
            <motion.div
              className="relative"
              animate={{ y: isRunning ? [0, -1, 0] : 0 }}
              transition={{ duration: 0.15, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            >
              {/* Smoke behind vehicle 1 when moving */}
              <CarSmoke show={isRunning && vehicle1Velocity > 0.5} />
                  {vehicle1Image ? (
                    (() => {
                      const sz = vehicleSize(vehicle1Type);
                      return (
                        <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom', position: 'relative', zIndex: 2 }}>
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
            ref={vehicle2ElRef}
            className="absolute z-30"
            style={{
              left: `${leftPaddingPx}px`, // base left; x offset applied via transform for smooth updates
              top: 185
            }}
          >
            <motion.div
              className="relative"
              animate={{ y: isRunning ? [0, -1, 0] : 0 }}
              transition={{ duration: 0.15, repeat: isRunning ? Infinity : 0, ease: "linear" }}
            >
              {/* Smoke behind vehicle 2 when moving */}
              <CarSmoke show={isRunning && vehicle2Velocity > 0.5} />
              {vehicle2Image ? (
                (() => {
                  const sz = vehicleSize(vehicle2Type);
                  return (
                    <div style={{ transform: `scale(${vehicleScale})`, transformOrigin: 'left bottom', position: 'relative', zIndex: 2 }}>
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
function useSmoothCamera(cameraTargetRef: React.RefObject<number>, movingRef: React.RefObject<HTMLDivElement | null>, parallaxRef: React.RefObject<HTMLDivElement | null>) {
  // Use an internal mutable ref for the animated camera position.
  const cameraRef = useRef<number>(cameraTargetRef.current ?? 0);

  useEffect(() => {
    let raf = 0;

    // Promote these elements to their own layer for smoother transform animations.
    if (movingRef.current) movingRef.current.style.willChange = 'transform';
    if (parallaxRef.current) parallaxRef.current.style.willChange = 'transform';

    let lastT = performance.now();
    const SMOOTH_TAU = 0.08; // seconds, time constant for exponential smoothing
    const step = (t?: number) => {
      const now = typeof t === 'number' ? t : performance.now();
      const dt = Math.max(0.001, (now - lastT) / 1000); // seconds
      lastT = now;
      const target = cameraTargetRef.current ?? cameraRef.current;
      // alpha for exponential smoothing: 1 - exp(-dt/tau)
      const alpha = 1 - Math.exp(-dt / SMOOTH_TAU);
      cameraRef.current += (target - cameraRef.current) * alpha;

      // snap-to-target when very close to avoid tiny subpixel jitter
      if (Math.abs(target - cameraRef.current) < 0.25) cameraRef.current = target;

      const cam = cameraRef.current;
      if (movingRef.current) movingRef.current.style.transform = `translate3d(${-cam}px,0,0)`;
      if (parallaxRef.current) parallaxRef.current.style.transform = `translate3d(${-cam * 0.3}px,0,0)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      if (movingRef.current) movingRef.current.style.willChange = '';
      if (parallaxRef.current) parallaxRef.current.style.willChange = '';
    };
  }, [cameraTargetRef, movingRef, parallaxRef]);
}

// Lightweight canvas fireworks overlay used only in 'stadium' sky.
// Includes a small adaptive quality scaler and an 'active' flag to pause when not needed.
function FireworksOverlay({ height = 220, active = true }: { height?: number; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) {
      // Clear canvas if present and skip starting the loop
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let anim = 0;
    // Cap DPR to reduce fill-rate cost
    const MAX_DPR = 1.5;
    const DPR = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect ? rect.width : window.innerWidth;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(height * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };
    const particles: Particle[] = [];
    let lastSpawn = 0;

    const colors = ['#fbbf24', '#22d3ee', '#f472b6', '#60a5fa', '#34d399', '#f87171', '#fde047'];

    // simple moving-average FPS estimator for adaptive quality
    let lastT = 0;
    let fps = 60;
    const smoothing = 0.05;

  const spawnFirework = (qualityScale: number) => {
      const w = canvas.width / DPR;
      const cx = Math.random() * (w * 0.6) + w * 0.2; // avoid edges
      const cy = Math.random() * (height * 0.4) + 40;
      const count = Math.round(30 * qualityScale);
      const speed = (1.2 + Math.random() * 0.7) * (0.9 + 0.2 * qualityScale);
      const color = colors[(Math.random() * colors.length) | 0];
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const sp = speed * (0.6 + Math.random() * 1.0);
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 0.2, // slight upward bias
          life: 0,
          max: (70 + (Math.random() * 35)) | 0,
          color,
        });
      }
    };

    // Pause heavy processing when the tab is not visible to save CPU/GPU
    let tabVisible = typeof document !== 'undefined' ? !document.hidden : true;
    const onVis = () => { tabVisible = !document.hidden; };
    document.addEventListener && document.addEventListener('visibilitychange', onVis);

    const step = (t: number) => {
      anim = requestAnimationFrame(step);
      if (!tabVisible) {
        // Skip expensive draws/spawns while hidden
        return;
      }
      if (!lastT) lastT = t;
      const dt = t - lastT;
      lastT = t;
      // update fps EMA
      const instFps = dt > 0 ? 1000 / dt : 60;
      fps = fps + (instFps - fps) * smoothing;
      const q = Math.max(0.35, Math.min(1, fps / 60)); // quality scale 0.35..1
      
      // clear with slight alpha to create trails
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // gravity
      const gy = 0.03;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gy;
        const alpha = Math.max(0, 1 - p.life / p.max);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = 1.8 + Math.random() * 0.9;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life >= p.max) particles.splice(i, 1);
      }

      // spawn interval and particle cap scale with quality
      const spawnInterval = 650 + (1 - q) * 600; // slower on low fps
      const cap = Math.round(420 * q);
      if (t - lastSpawn > spawnInterval && particles.length < cap) {
        spawnFirework(q);
        lastSpawn = t;
      }
    };
    anim = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('resize', resize);
      document.removeEventListener && document.removeEventListener('visibilitychange', onVis);
    };
  }, [height, active]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, height: `${height}px`, pointerEvents: 'none' }}
    />
  );
}

// Simple CSS-based smoke for vehicles when moving
function CarSmoke({ show }: { show: boolean }) {
  if (!show) return null;
  const bubbles = Array.from({ length: 6 });
  return (
    <div style={{ position: 'absolute', left: -18, bottom: 8, width: 60, height: 36, zIndex: 1, pointerEvents: 'none' }}>
      <style>{`
        @keyframes carSmokeUp {
          0% { transform: translate(0,0) scale(0.6); opacity: 0; filter: blur(0px); }
          15% { opacity: 0.45; }
          100% { transform: translate(-40px,-22px) scale(1.15); opacity: 0; filter: blur(1px); }
        }
      `}</style>
      {bubbles.map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: 12 + (i % 2) * 6,
            bottom: 8 + (i % 3) * 3,
            width: 8 + (i % 3) * 3,
            height: 8 + (i % 3) * 3,
            borderRadius: '9999px',
            background: 'rgba(200,200,200,0.35)',
            animation: 'carSmokeUp 1.2s linear infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}