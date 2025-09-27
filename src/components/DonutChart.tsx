import React from 'react';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
  size?: number;
  onSegmentClick?: (segment: string) => void;
  selectedSegment?: string | null;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 280,
  onSegmentClick,
  selectedSegment
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const viewBoxSize = size;
  const centerX = viewBoxSize / 2;
  const centerY = viewBoxSize / 2;
  const outerRadius = viewBoxSize * 0.35;
  const innerRadius = viewBoxSize * 0.22;
  const labelRadius = viewBoxSize * 0.42;

  const activeSegment = selectedSegment ?? null;
  const isInteractive = typeof onSegmentClick === 'function';
  const showEmptyState = total === 0;

  const generatePath = (startAngle: number, endAngle: number) => {
    // Caso especial: arco completo (360 graus ou 100%)
    const angleDiff = endAngle - startAngle;
    if (angleDiff >= 360 || angleDiff >= 359.99) {
      // Para arco completo, usar dois semi-círculos para evitar problemas de renderização
      const midAngle = startAngle + 180;
      const startAngleRad = (startAngle - 90) * (Math.PI / 180);
      const midAngleRad = (midAngle - 90) * (Math.PI / 180);
      const endAngleRad = (endAngle - 90) * (Math.PI / 180);

      const x1Outer = centerX + outerRadius * Math.cos(startAngleRad);
      const y1Outer = centerY + outerRadius * Math.sin(startAngleRad);
      const xMidOuter = centerX + outerRadius * Math.cos(midAngleRad);
      const yMidOuter = centerY + outerRadius * Math.sin(midAngleRad);
      const x2Outer = centerX + outerRadius * Math.cos(endAngleRad);
      const y2Outer = centerY + outerRadius * Math.sin(endAngleRad);
      
      const x1Inner = centerX + innerRadius * Math.cos(startAngleRad);
      const y1Inner = centerY + innerRadius * Math.sin(startAngleRad);
      const xMidInner = centerX + innerRadius * Math.cos(midAngleRad);
      const yMidInner = centerY + innerRadius * Math.sin(midAngleRad);
      const x2Inner = centerX + innerRadius * Math.cos(endAngleRad);
      const y2Inner = centerY + innerRadius * Math.sin(endAngleRad);

      return [
        `M ${x1Inner} ${y1Inner}`,
        `L ${x1Outer} ${y1Outer}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${xMidOuter} ${yMidOuter}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${x2Outer} ${y2Outer}`,
        `L ${x2Inner} ${y2Inner}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${xMidInner} ${yMidInner}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${x1Inner} ${y1Inner}`,
        'Z'
      ].join(' ');
    }

    // Caso normal: arco parcial
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    const x1Outer = centerX + outerRadius * Math.cos(startAngleRad);
    const y1Outer = centerY + outerRadius * Math.sin(startAngleRad);
    const x2Outer = centerX + outerRadius * Math.cos(endAngleRad);
    const y2Outer = centerY + outerRadius * Math.sin(endAngleRad);
    const x1Inner = centerX + innerRadius * Math.cos(startAngleRad);
    const y1Inner = centerY + innerRadius * Math.sin(startAngleRad);
    const x2Inner = centerX + innerRadius * Math.cos(endAngleRad);
    const y2Inner = centerY + innerRadius * Math.sin(endAngleRad);

    return [
      `M ${x1Inner} ${y1Inner}`,
      `L ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
      'Z'
    ].join(' ');
  };

  let accumulatedAngle = 0;
  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const startAngle = accumulatedAngle;
    const endAngle = startAngle + percentage * 360;
    accumulatedAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center flex-shrink-0">{title}</h3>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '200px' }}>
          <div
            className="relative flex items-center justify-center"
            style={{ width: Math.min(viewBoxSize, 260), height: Math.min(viewBoxSize, 260) }}
          >
            <svg className="w-full h-full" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
            {showEmptyState ? (
              <>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={outerRadius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth={2}
                  className="drop-shadow-sm"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius}
                  fill="white"
                  stroke="#E5E7EB"
                  strokeWidth={2}
                />
              </>
            ) : (
              segments.map((segment) => {
                if (segment.percentage <= 0) {
                  return null;
                }

                const pathData = generatePath(segment.startAngle, segment.endAngle);
                const isOtherFiltered = activeSegment !== null && activeSegment !== segment.name;
                const opacity = isOtherFiltered ? 0.5 : 1;

                return (
                  <path
                    key={segment.name}
                    d={pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth={2}
                    className={`drop-shadow-lg transition-all duration-200 ${
                      isInteractive ? 'cursor-pointer hover:opacity-80' : ''
                    }`}
                    style={{ opacity }}
                    onClick={() => onSegmentClick?.(segment.name)}
                  />
                );
              })
            )}

            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fontWeight="bold"
              fill="#1f2937"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fill="#6b7280"
            >
              Total
            </text>

            {!showEmptyState &&
              segments.map((segment) => {
                if (segment.percentage <= 0) {
                  return null;
                }

                const segmentAngle = segment.endAngle - segment.startAngle;
                const midAngle = segment.startAngle + segmentAngle / 2;
                const midAngleRad = (midAngle - 90) * (Math.PI / 180);

                const labelX = centerX + labelRadius * Math.cos(midAngleRad);
                const labelY = centerY + labelRadius * Math.sin(midAngleRad);

                return (
                  <text
                    key={`label-${segment.name}`}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="500"
                    fill="#374151"
                  >
                    {(segment.percentage * 100).toFixed(1)}%
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {!showEmptyState && (
          <div className="w-full flex-shrink-0 mt-3">
            <div className="px-2">
              <div className="space-y-2">
                {segments.map((segment) => {
                  const percentage = segment.percentage > 0 ? (segment.percentage * 100).toFixed(1) : '0.0';

                  return (
                    <div
                      key={`legend-${segment.name}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-gray-700 truncate">{segment.name}</span>
                      </div>
                      <span className="font-medium text-gray-900 flex-shrink-0 ml-2">
                        {segment.value} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonutChart;
