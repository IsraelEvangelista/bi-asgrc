import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useIndicatorsByStatus, IndicatorStatusData } from '../hooks/useIndicatorsByStatus';
import { Loader2, AlertCircle } from 'lucide-react';

// Cores específicas para cada status (mantendo as cores atuais do Power BI)
const STATUS_COLORS = {
  'Não iniciada': '#FF6B6B',        // Vermelho para não iniciada
  'Em Implementação': '#FFD93D',    // Amarelo para em implementação  
  'Implementada': '#6BCF7F'         // Verde para implementada
} as const;

interface IndicatorsByStatusChartProps {
  className?: string;
  height?: number;
}

const IndicatorsByStatusChart: React.FC<IndicatorsByStatusChartProps> = ({ 
  className = '', 
  height = 300 
}) => {
  const { data, loading, error, total } = useIndicatorsByStatus();

  // Preparar dados para o gráfico
  const chartData = data.map((item: IndicatorStatusData) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage
  }));

  // Renderizar rótulo customizado
  interface PieChartLabelProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percentage?: number;
    value?: number;
    [key: string]: unknown;
  }

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, outerRadius, percentage, value 
  }: PieChartLabelProps) => {
    if (!cx || !cy || !midAngle || !outerRadius || !percentage || !value) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; // Posicionar rótulos externos
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#374151" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${value} (${percentage}%)`}
      </text>
    );
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Indicadores: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentual: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Índice de Indicadores por Implementação
        </h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Índice de Indicadores por Implementação
        </h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Índice de Indicadores por Implementação
        </h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500 text-sm">Nenhum indicador encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Índice de Indicadores por Implementação
        </h3>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{total}</span> indicadores
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.map((item) => (
          <div key={item.status} className="text-center p-3 bg-gray-50 rounded-lg">
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] }}
            >
              {item.count}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {item.status}
            </div>
            <div className="text-xs text-gray-500">
              ({item.percentage}%)
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Rosca */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndicatorsByStatusChart;