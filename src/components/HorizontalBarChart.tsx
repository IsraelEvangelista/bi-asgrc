import React from 'react';

interface StatusData {
  emImplementacao: number;
  implementada: number;
  naoIniciada: number;
}

interface RiskData {
  riskId: string;
  statusData: StatusData;
}

interface HorizontalBarChartProps {
  data: RiskData[];
  title?: string;
  showTotal?: boolean;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  showTotal = true
}) => {
  // Calcular o valor máximo para scaling das barras
  const maxValue = Math.max(...data.map(risk => {
    const { statusData } = risk;
    return statusData.emImplementacao + statusData.implementada + statusData.naoIniciada;
  }));

  return (
    <div className="h-full flex flex-col">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      )}
      <div className="flex-1 space-y-4">
        {data.map((risk) => {
          const { riskId, statusData } = risk;
          const total = statusData.emImplementacao + statusData.implementada + statusData.naoIniciada;
          const maxBarWidth = maxValue > 0 ? 100 : 0;

          return (
            <div key={riskId} className="flex items-center space-x-3">
              {/* Label - ID do Risco */}
              <div className="w-16 text-sm font-bold text-gray-700 text-center">
                {riskId}
              </div>

              {/* Barra Segmentada */}
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div className="flex h-full rounded-full">
                  {/* Segmento: Em implementação (Azul) */}
                  {statusData.emImplementacao > 0 && (
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-1"
                      style={{
                        width: `${(statusData.emImplementacao / maxValue) * maxBarWidth}%`,
                        backgroundColor: '#3B82F6',
                        minWidth: statusData.emImplementacao > 0 ? '20px' : '0'
                      }}
                    >
                      {statusData.emImplementacao > 0 && (
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {statusData.emImplementacao}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Segmento: Implementada (Verde) */}
                  {statusData.implementada > 0 && (
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-1"
                      style={{
                        width: `${(statusData.implementada / maxValue) * maxBarWidth}%`,
                        backgroundColor: '#10B981',
                        minWidth: statusData.implementada > 0 ? '20px' : '0'
                      }}
                    >
                      {statusData.implementada > 0 && (
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {statusData.implementada}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Segmento: Não Iniciada (Amarelo) */}
                  {statusData.naoIniciada > 0 && (
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-1"
                      style={{
                        width: `${(statusData.naoIniciada / maxValue) * maxBarWidth}%`,
                        backgroundColor: '#F59E0B',
                        minWidth: statusData.naoIniciada > 0 ? '20px' : '0'
                      }}
                    >
                      {statusData.naoIniciada > 0 && (
                        <span className="text-xs font-medium text-white drop-shadow-sm">
                          {statusData.naoIniciada}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              {showTotal && (
                <div className="w-12 text-sm font-bold text-gray-900 text-right">
                  {total}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalBarChart;