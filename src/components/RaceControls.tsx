import React, { useEffect, useState } from 'react';
import { Car, Bike, Truck } from 'lucide-react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import type { VehicleType, ForceType } from '../App';

interface RaceControlsProps {
  vehicleNumber: number;
  vehicleType: VehicleType;
  setVehicleType: (type: VehicleType) => void;
  mass: number;
  setMass: (mass: number) => void;
  appliedForce: number | null;
  setAppliedForce: (force: number | null) => void;
  friction: number;
  setFriction: (friction: number) => void;
  forceType: ForceType;
  setForceType: (type: ForceType) => void;
  isRunning: boolean;
  color: 'blue' | 'red';
  initialVelocity: number;
  setInitialVelocity: (v: number) => void;
  initialPosition: number;
  setInitialPosition: (p: number) => void;
  imageUrl?: string | null;
  setImageUrl?: (url: string | null) => void;
}

interface ImageUploaderProps {
  vehicleNumber: number;
  isRunning: boolean;
  imageUrl?: string | null;
  setImageUrl?: (url: string | null) => void;
}

function ImageUploader({ vehicleNumber, isRunning, imageUrl, setImageUrl }: ImageUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) setFileName(null);
  }, [imageUrl]);

  const inputId = `file-${vehicleNumber}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      if (setImageUrl) {
        const reader = new FileReader();
        reader.onload = () => setImageUrl(String(reader.result));
        reader.readAsDataURL(f);
      }
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        disabled={isRunning}
        onChange={handleChange}
        className="sr-only"
        // force-hide the native chooser regardless of CSS (some browsers/show builds may still render it)
        style={{ display: 'none' }}
      />
      <label
        htmlFor={isRunning ? undefined : inputId}
        aria-disabled={isRunning}
        className={`px-3 py-2 rounded text-sm ${isRunning ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer'}`}
      >
        Haz clic aquí
      </label>
      <div className="flex items-center gap-2">
        {fileName ? (
          <span className="text-white">{fileName}</span>
        ) : (
          <span className="text-gray-300">Ningún archivo</span>
        )}
        {setImageUrl && imageUrl && (
          <button
            onClick={() => { setImageUrl(null); setFileName(null); }}
            disabled={isRunning}
            className="px-3 py-2 rounded bg-gray-700 text-white text-sm"
          >
            Borrar
          </button>
        )}
      </div>
    </div>
  );
}

export function RaceControls({
  vehicleNumber,
  vehicleType,
  setVehicleType,
  mass,
  setMass,
  appliedForce,
  setAppliedForce,
  friction,
  setFriction,
  forceType,
  setForceType,
  isRunning,
  color,
  initialVelocity,
  setInitialVelocity,
  initialPosition,
  setInitialPosition
  , imageUrl, setImageUrl
}: RaceControlsProps) {
  
  const headerColor = color === 'blue' 
    ? 'from-blue-600 to-blue-800' 
    : 'from-red-600 to-red-800';

  const buttonColor = color === 'blue'
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-red-600 hover:bg-red-700';

  const handleVehicleChange = (type: VehicleType) => {
    if (!isRunning) {
      setVehicleType(type);
      switch (type) {
        case 'car':
          setMass(1000);
          break;
        case 'motorcycle':
          setMass(250);
          break;
        case 'truck':
          setMass(3000);
          break;
      }
    }
  };

  // Mass input validation
  const MIN_MASS = 50;
  const MAX_MASS = 10000;
  const [massInput, setMassInput] = useState<string>(String(mass));
  const [massError, setMassError] = useState<string | null>(null);

  // Keep local input synced when parent mass changes (e.g., slider or external)
  useEffect(() => {
    setMassInput(String(mass));
    setMassError(null);
  }, [mass]);

  const handleMassChange = (raw: string) => {
    if (isRunning) return;
    setMassInput(raw);
    const trimmed = raw.trim();
    if (trimmed === '') {
      setMassError('Introduce un valor');
      return;
    }
    const n = Number(trimmed);
    if (Number.isNaN(n)) {
      setMassError('Valor no válido');
      return;
    }
    if (n < MIN_MASS) {
      setMassError(`Mínimo ${MIN_MASS} kg`);
      return;
    }
    if (n > MAX_MASS) {
      setMassError(`Máximo ${MAX_MASS} kg`);
      return;
    }
    setMassError(null);
  };

  const commitMass = () => {
    if (isRunning) return;
    const trimmed = massInput.trim();
    if (trimmed === '') {
      setMass(MIN_MASS);
      setMassInput(String(MIN_MASS));
      setMassError(null);
      return;
    }
    let n = Number(trimmed);
    if (Number.isNaN(n)) {
      setMass(MIN_MASS);
      setMassInput(String(MIN_MASS));
      setMassError(null);
      return;
    }
    // clamp and round
    n = Math.round(Math.max(MIN_MASS, Math.min(MAX_MASS, n)));
    setMass(n);
    setMassInput(String(n));
    setMassError(null);
  };

  // Friction input validation
  const MIN_FRICTION = 0;
  const MAX_FRICTION = 500;
  const [frictionInputState, setFrictionInputState] = useState<string>(String(friction));
  const [frictionError, setFrictionError] = useState<string | null>(null);

  useEffect(() => {
    setFrictionInputState(String(friction));
    setFrictionError(null);
  }, [friction]);

  const handleFrictionInput = (raw: string) => {
    if (isRunning) return;
    setFrictionInputState(raw);
    const trimmed = raw.trim();
    if (trimmed === '') {
      setFrictionError('Introduce un valor');
      return;
    }
    const n = Number(trimmed);
    if (Number.isNaN(n)) {
      setFrictionError('Valor no válido');
      return;
    }
    if (n < MIN_FRICTION) {
      setFrictionError(`Mínimo ${MIN_FRICTION} N`);
      return;
    }
    if (n > MAX_FRICTION) {
      setFrictionError(`Máximo ${MAX_FRICTION} N`);
      return;
    }
    setFrictionError(null);
  };

  const commitFriction = () => {
    if (isRunning) return;
    const trimmed = frictionInputState.trim();
    if (trimmed === '') {
      setFriction(MIN_FRICTION);
      setFrictionInputState(String(MIN_FRICTION));
      setFrictionError(null);
      return;
    }
    let n = Number(trimmed);
    if (Number.isNaN(n)) {
      setFriction(MIN_FRICTION);
      setFrictionInputState(String(MIN_FRICTION));
      setFrictionError(null);
      return;
    }
    n = Math.round(Math.max(MIN_FRICTION, Math.min(MAX_FRICTION, n)));
    setFriction(n);
    setFrictionInputState(String(n));
    setFrictionError(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${headerColor} p-4`}>
        <h3 className="text-white">
          🏎️ Vehículo {vehicleNumber}
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Initial Velocity & Position */}
        <div className="space-y-2">
          <Label className="text-gray-300">Velocidad Inicial (m/s)</Label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={initialVelocity}
            onChange={e => !isRunning && setInitialVelocity(Number(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Posición Inicial (m)</Label>
          <input
            type="number"
            min={0}
            max={1000}
            step={0.1}
            value={initialPosition}
            onChange={e => !isRunning && setInitialPosition(Number(e.target.value))}
            disabled={isRunning}
            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-50"
          />
        </div>
        {/* Vehicle Type (single option) */}
        <div className="space-y-2">
          <Label className="text-gray-300">Tipo de Vehículo</Label>
          <div>
            <button
              onClick={() => handleVehicleChange('car')}
              disabled={isRunning}
              className={`w-full p-3 rounded-lg transition-all ${
                vehicleType === 'car'
                  ? buttonColor + ' text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              <Car size={18} />
              Vehículo
            </button>
          </div>
        </div>

        {/* Custom Image Upload */}
        <div className="space-y-2">
          <Label className="text-gray-300">Imagen Personalizada (opcional)</Label>
          <ImageUploader
            vehicleNumber={vehicleNumber}
            isRunning={isRunning}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
          />
          {imageUrl && (
            <div className="mt-2">
              {/* Larger, responsive preview: small on very small screens, bigger on desktop */}
              <img
                src={imageUrl}
                alt="preview"
                className="w-56 h-32 sm:w-72 sm:h-40 md:w-96 md:h-56 object-contain rounded shadow-md"
              />
            </div>
          )}
        </div>

        {/* Force Type */}
        <div className="space-y-2">
          <Label className="text-gray-300">Tipo de Fuerza</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => !isRunning && setForceType('constant')}
              disabled={isRunning}
              className={`px-2 py-2 rounded text-xs transition-all ${
                forceType === 'constant' 
                  ? buttonColor + ' text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              ⚡ Constante
            </button>
            <button
              onClick={() => !isRunning && setForceType('increasing')}
              disabled={isRunning}
              className={`px-2 py-2 rounded text-xs transition-all ${
                forceType === 'increasing' 
                  ? buttonColor + ' text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              📈 Creciente
            </button>
            <button
              onClick={() => !isRunning && setForceType('decreasing')}
              disabled={isRunning}
              className={`px-2 py-2 rounded text-xs transition-all ${
                forceType === 'decreasing' 
                  ? buttonColor + ' text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              📉 Decreciente
            </button>
            <button
              onClick={() => !isRunning && setForceType('impulse')}
              disabled={isRunning}
              className={`px-2 py-2 rounded text-xs transition-all ${
                forceType === 'impulse' 
                  ? buttonColor + ' text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              ⚡ Impulsos
            </button>
          </div>
        </div>

        {/* Mass */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-gray-300">Masa (m)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={10000}
                  step={1}
                  value={massInput}
                  onChange={e => handleMassChange(e.target.value)}
                  onBlur={commitMass}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitMass(); }}
                  disabled={isRunning}
                  className="w-28 bg-gray-700 text-white px-2 py-1 rounded-lg text-sm"
                />
                <span className="text-white">kg</span>
              </div>
          </div>
          <Slider
            value={[mass]}
            onValueChange={(value: number[]) => { setMass(value[0]); setMassInput(String(value[0])); }}
            min={50}
            max={10000}
            step={10}
            disabled={isRunning}
            className="cursor-pointer"
          />
          {massError && <p className="text-xs text-rose-400 mt-1">{massError}</p>}
        </div>

        {/* Applied Force */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-gray-300">Fuerza Aplicada (F)</Label>
            <div className="flex items-center gap-2">
              <span className="text-white">{appliedForce !== null ? `${appliedForce} N` : '—'}</span>
              <input
                type="number"
                min={0}
                max={10000}
                step={1}
                value={appliedForce ?? ''}
                onChange={(e) => !isRunning && setAppliedForce(e.target.value === '' ? null : Number(e.target.value))}
                disabled={isRunning}
                className="w-28 bg-gray-700 text-white px-2 py-1 rounded-lg text-sm"
                placeholder="N"
              />
            </div>
          </div>
          <Slider
            value={[appliedForce ?? 0]}
            onValueChange={(value: number[]) => setAppliedForce(Number(value[0]))}
            min={0}
            max={3000}
            step={50}
            disabled={isRunning}
            className="cursor-pointer"
          />
        </div>

        {/* Friction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-gray-300">Fricción (f)</Label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={500}
                step={1}
                value={frictionInputState}
                onChange={e => handleFrictionInput(e.target.value)}
                onBlur={commitFriction}
                onKeyDown={(e) => { if (e.key === 'Enter') commitFriction(); }}
                disabled={isRunning}
                className="w-28 bg-gray-700 text-white px-2 py-1 rounded-lg text-sm"
              />
              <span className="text-white">N</span>
            </div>
          </div>
          <Slider
            value={[friction]}
            onValueChange={(value: number[]) => { setFriction(value[0]); setFrictionInputState(String(value[0])); }}
            min={0}
            max={500}
            step={10}
            disabled={isRunning}
            className="cursor-pointer"
          />
          {frictionError && <p className="text-xs text-rose-400 mt-1">{frictionError}</p>}
        </div>

        {/* Net Force Display */}
        <div className="bg-gray-950/50 p-3 rounded-lg border border-gray-700">
          <Label className="text-gray-400 text-xs">Fuerza Neta</Label>
          <div className="text-xl text-white mt-1">
            {appliedForce !== null ? `${appliedForce - friction} N` : '—'}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            F_neta = {appliedForce !== null ? appliedForce : '—'} - {friction}
          </p>
        </div>
      </div>
    </div>
  );
}
