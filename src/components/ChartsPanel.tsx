import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { VehicleData } from '../App';

interface ChartsPanelProps {
  vehicle1Data: VehicleData[];
  vehicle2Data: VehicleData[];
}

export function ChartsPanel({ vehicle1Data, vehicle2Data }: ChartsPanelProps) {
  // Combine data for comparison
  const combinedData = vehicle1Data.map((v1, index) => {
    const v2 = vehicle2Data[index] || { 
      velocity: 0, 
      position: 0, 
      kineticEnergy: 0, 
      work: 0,
      acceleration: 0
    };
    return {
      time: v1.time,
      v1Velocity: v1.velocity,
      v2Velocity: v2.velocity,
      v1Position: v1.position,
      v2Position: v2.position,
      v1Energy: v1.kineticEnergy,
      v2Energy: v2.kineticEnergy,
      v1Work: v1.work,
      v2Work: v2.work,
      v1Acceleration: v1.acceleration,
      v2Acceleration: v2.acceleration
    };
  });

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 shadow-2xl p-6">
      <h3 className="text-white text-xl mb-6">📈 Gráficas Comparativas en Tiempo Real</h3>
      
      <Tabs defaultValue="energy" className="w-full">
        <TabsList className="flex gap-2 overflow-x-auto no-scrollbar bg-gray-950/50 mb-6 p-1 rounded">
          <TabsTrigger value="energy" className="flex-shrink-0 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 px-3 py-2 text-sm sm:text-base rounded-md">
            Energía/Trabajo
          </TabsTrigger>
          <TabsTrigger value="velocity" className="flex-shrink-0 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 px-3 py-2 text-sm sm:text-base rounded-md">
            Velocidad
          </TabsTrigger>
          <TabsTrigger value="position" className="flex-shrink-0 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 px-3 py-2 text-sm sm:text-base rounded-md">
            Posición
          </TabsTrigger>
          <TabsTrigger value="acceleration" className="flex-shrink-0 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 px-3 py-2 text-sm sm:text-base rounded-md">
            Aceleración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="mt-6">
          <div className="bg-gray-950/30 p-6 rounded-lg">
            <p className="text-base text-blue-200 mb-6">
              Comparación de Energía Cinética y Trabajo: W = ΔKE
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Energía (J)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.85)' }} />
                <Line
                  type="monotone"
                  dataKey="v1Energy"
                  stroke="#1f77b4"
                  strokeWidth={3}
                  name="V1 - Energía Cinética"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v1Work"
                  stroke="#7fb3e6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="V1 - Trabajo"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2Energy"
                  stroke="#d62728"
                  strokeWidth={3}
                  name="V2 - Energía Cinética"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2Work"
                  stroke="#f59b9a"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="V2 - Trabajo"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="mt-6">
          <div className="bg-gray-950/30 p-6 rounded-lg">
            <p className="text-base text-blue-200 mb-6">
              Comparación de Velocidad: v = v₀ + at
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Velocidad (m/s)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.85)' }} />
                <Line
                  type="monotone"
                  dataKey="v1Velocity"
                  stroke="#1f77b4"
                  strokeWidth={4}
                  name="Vehículo 1"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2Velocity"
                  stroke="#d62728"
                  strokeWidth={4}
                  name="Vehículo 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="position" className="mt-6">
          <div className="bg-gray-950/30 p-6 rounded-lg">
            <p className="text-base text-blue-200 mb-6">
              Comparación de Posición: Carrera en tiempo real
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Posición (m)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.85)' }} />
                <Line
                  type="monotone"
                  dataKey="v1Position"
                  stroke="#1f77b4"
                  strokeWidth={4}
                  name="Vehículo 1"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2Position"
                  stroke="#d62728"
                  strokeWidth={4}
                  name="Vehículo 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="acceleration" className="mt-6">
          <div className="bg-gray-950/30 p-6 rounded-lg">
            <p className="text-base text-blue-200 mb-6">
              Comparación de Aceleración: a = F/m
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  label={{ value: 'Aceleración (m/s²)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#fff', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.85)' }} />
                <Line
                  type="monotone"
                  dataKey="v1Acceleration"
                  stroke="#1f77b4"
                  strokeWidth={3}
                  name="Vehículo 1"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="v2Acceleration"
                  stroke="#d62728"
                  strokeWidth={3}
                  name="Vehículo 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}