import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { VehicleData } from '../App';

interface PhysicsMetricsProps {
  vehicleNumber: number;
  currentData: VehicleData;
  allData: VehicleData[];
  mass: number;
  color: 'blue' | 'red';
}

export function PhysicsMetrics({ vehicleNumber, currentData, allData, mass, color }: PhysicsMetricsProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const headerColor = color === 'blue' 
    ? 'from-blue-600 to-blue-800' 
    : 'from-red-600 to-red-800';

  const cardColor = color === 'blue'
    ? 'from-blue-900/40 to-blue-950/40 border-blue-700/30'
    : 'from-red-900/40 to-red-950/40 border-red-700/30';

  // Calculate metrics
  const posicionFinal = currentData.position;
  const velocidadFinal = currentData.velocity;
  
  const aceleracionPromedio = allData.length > 0
    ? allData.reduce((sum, d) => sum + d.acceleration, 0) / allData.length
    : 0;
  
  const desplazamiento = currentData.position;
  const velocidadMaxima = currentData.maxVelocity;
  
  const fuerzaPromedio = allData.length > 0
    ? allData.reduce((sum, d) => sum + d.force, 0) / allData.length
    : 0;

  const metrics = [
    {
      id: 'position',
      label: 'Posición Final',
      value: posicionFinal.toFixed(2),
      unit: 'm',
      formula: 'x = x₀ + v₀t + ½at²',
      procedure: `Posición inicial (x₀) = 0 m
Velocidad inicial (v₀) = 0 m/s
Tiempo (t) = ${currentData.time.toFixed(2)} s
Aceleración (a) = ${aceleracionPromedio.toFixed(2)} m/s²

x = 0 + 0(${currentData.time.toFixed(2)}) + ½(${aceleracionPromedio.toFixed(2)})(${currentData.time.toFixed(2)})²
x = ${posicionFinal.toFixed(2)} m`
    },
    {
      id: 'velocity',
      label: 'Velocidad Final',
      value: velocidadFinal.toFixed(2),
      unit: 'm/s',
      formula: 'v = v₀ + at',
      procedure: `Velocidad inicial (v₀) = 0 m/s
Aceleración promedio (a) = ${aceleracionPromedio.toFixed(2)} m/s²
Tiempo (t) = ${currentData.time.toFixed(2)} s

v = 0 + (${aceleracionPromedio.toFixed(2)})(${currentData.time.toFixed(2)})
v = ${velocidadFinal.toFixed(2)} m/s`
    },
    {
      id: 'acceleration',
      label: 'Aceleración Promedio',
      value: aceleracionPromedio.toFixed(2),
      unit: 'm/s²',
      formula: 'a = F_neta / m',
      procedure: `Fuerza neta promedio (F) = ${fuerzaPromedio.toFixed(2)} N
Masa (m) = ${mass} kg

a = ${fuerzaPromedio.toFixed(2)} / ${mass}
a = ${aceleracionPromedio.toFixed(2)} m/s²`
    },
    {
      id: 'displacement',
      label: 'Desplazamiento',
      value: desplazamiento.toFixed(2),
      unit: 'm',
      formula: 'd = x_final - x_inicial',
      procedure: `Posición inicial (x₀) = 0 m
Posición final (x) = ${posicionFinal.toFixed(2)} m

d = ${posicionFinal.toFixed(2)} - 0
d = ${desplazamiento.toFixed(2)} m`
    },
    {
      id: 'maxVelocity',
      label: 'Velocidad Máxima',
      value: velocidadMaxima.toFixed(2),
      unit: 'm/s',
      formula: 'v_max = max(v(t))',
      procedure: `Durante toda la simulación, se registró la velocidad en cada instante.

Velocidad máxima alcanzada:
v_max = ${velocidadMaxima.toFixed(2)} m/s

Esto ocurrió en t ≈ ${allData.find(d => Math.abs(d.velocity - velocidadMaxima) < 0.01)?.time.toFixed(2) || currentData.time.toFixed(2)} s`
    },
    {
      id: 'avgForce',
      label: 'Fuerza Promedio',
      value: fuerzaPromedio.toFixed(2),
      unit: 'N',
      formula: 'F_prom = ΣF / n',
      procedure: `Se calculó el promedio de todas las fuerzas netas aplicadas durante el movimiento.

Número de mediciones (n) = ${allData.length}
Suma de fuerzas (ΣF) = ${(fuerzaPromedio * allData.length).toFixed(2)} N

F_prom = ${(fuerzaPromedio * allData.length).toFixed(2)} / ${allData.length}
F_prom = ${fuerzaPromedio.toFixed(2)} N`
    }
  ];

  const toggleMetric = (id: string) => {
    setExpandedMetric(expandedMetric === id ? null : id);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${headerColor} p-4`}>
        <h3 className="text-white">
          📊 Métricas Físicas - Vehículo {vehicleNumber}
        </h3>
        <p className="text-xs text-gray-200 mt-1">
          Tiempo: {currentData.time.toFixed(2)} s
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.id} className="col-span-1">
              <div className={`bg-gradient-to-br ${cardColor} rounded-lg border p-3 hover:shadow-lg transition-all`}>
                <div className="text-xs sm:text-xs text-gray-400 mb-1">{metric.label}</div>
                <div className="text-xl sm:text-2xl text-white mb-1">
                  {metric.value} <span className="text-sm text-gray-400">{metric.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{metric.formula}</div>
                
                <button
                  onClick={() => toggleMetric(metric.id)}
                  className="w-full flex items-center justify-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {expandedMetric === metric.id ? (
                    <>
                      <ChevronUp size={14} />
                      Ocultar procedimiento
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Ver procedimiento
                    </>
                  )}
                </button>

                {expandedMetric === metric.id && (
                  <div className="mt-2 p-2 bg-black/30 rounded text-xs text-gray-300 whitespace-pre-line border border-gray-700">
                    {metric.procedure}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Energy and Work Display */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 border border-green-700/30 rounded-lg p-3">
            <div className="text-xs text-green-400 mb-1">Energía Cinética (KE)</div>
            <div className="text-xl text-white">
              {currentData.kineticEnergy.toFixed(2)} <span className="text-sm text-gray-400">J</span>
            </div>
            <div className="text-xs text-green-300 mt-1">
              KE = ½mv² = ½({mass})({velocidadFinal.toFixed(2)})²
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 border border-purple-700/30 rounded-lg p-3">
            <div className="text-xs text-purple-400 mb-1">Trabajo Realizado (W)</div>
            <div className="text-xl text-white">
              {currentData.work.toFixed(2)} <span className="text-sm text-gray-400">J</span>
            </div>
            <div className="text-xs text-purple-300 mt-1">
              W = F·d = ({currentData.force.toFixed(2)})({posicionFinal.toFixed(2)})
            </div>
          </div>
        </div>

        {/* Theorem Verification */}
        {currentData.time > 0.5 && (
          <div className="mt-3 bg-gradient-to-br from-yellow-900/40 to-yellow-950/40 border border-yellow-700/30 rounded-lg p-3">
            <div className="text-xs text-yellow-400 mb-2">Verificación del Teorema W = ΔKE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-yellow-100">
              <div>W = {currentData.work.toFixed(2)} J</div>
              <div>ΔKE = {currentData.kineticEnergy.toFixed(2)} J</div>
            </div>
            <div className="text-xs text-yellow-200 mt-2">
              Diferencia: {Math.abs(currentData.work - currentData.kineticEnergy).toFixed(2)} J
            </div>
            {Math.abs(currentData.work - currentData.kineticEnergy) < 10 && (
              <div className="text-xs text-green-400 mt-1">
                ✓ El teorema se verifica: W ≈ ΔKE
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
