import React from 'react';
import { X, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProcessChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  publishedCount: number;
  unpublishedCount: number;
}

const ProcessChartModal: React.FC<ProcessChartModalProps> = ({
  isOpen,
  onClose,
  publishedCount,
  unpublishedCount
}) => {
  if (!isOpen) return null;

  const total = publishedCount + unpublishedCount;
  const publishedPercentage = total > 0 ? ((publishedCount / total) * 100).toFixed(1) : '0';
  const unpublishedPercentage = total > 0 ? ((unpublishedCount / total) * 100).toFixed(1) : '0';

  const data = [
    {
      name: 'Publicados',
      value: publishedCount,
      percentage: publishedPercentage
    },
    {
      name: 'Não Publicados',
      value: unpublishedCount,
      percentage: unpublishedPercentage
    }
  ];

  const COLORS = {
    'Publicados': '#10B981', // green-500
    'Não Publicados': '#EF4444' // red-500
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30; // Posicionar rótulos externos ao gráfico
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} processos ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Estatísticas de Publicação de Processos
              </h2>
              <p className="text-sm text-gray-600">
                Distribuição de processos publicados e não publicados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {total > 0 ? (
            <>
              {/* Estatísticas Resumidas */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{total}</div>
                  <div className="text-sm text-gray-600">Total de Processos</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
                  <div className="text-sm text-gray-600">Publicados ({publishedPercentage}%)</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{unpublishedCount}</div>
                  <div className="text-sm text-gray-600">Não Publicados ({unpublishedPercentage}%)</div>
                </div>
              </div>

              {/* Gráfico de Rosca */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name as keyof typeof COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>
                          {value}: {entry.payload?.value} ({((entry.payload?.value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
                        </span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum processo encontrado
              </h3>
              <p className="text-gray-600">
                Não há dados de processos disponíveis para exibir o gráfico.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessChartModal;