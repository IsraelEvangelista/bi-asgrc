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
  const centerX = 140;
  const centerY = 140;
  const outerRadius = 80;
  const innerRadius = 50;

  const generatePath = (startAngle: number, endAngle: number) => {
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

  let cumulativePercentage = 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="flex flex-col items-center">
      <div className="relative w-72 h-72">
        <svg className="w-full h-full" viewBox="0 0 280 280">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            const pathData = generatePath(startAngle, endAngle);
            cumulativePercentage += percentage;

            const isOtherFiltered = selectedSegment !== null && selectedSegment !== item.name;
            const opacity = isOtherFiltered ? 0.5 : 1;

            return (
              <path
                key={item.name}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth={2}
                className={`drop-shadow-lg cursor-pointer transition-all duration-200 hover:opacity-80`}
                style={{ opacity }}
                onClick={() => onSegmentClick?.(item.name)}
              />
            );
          })}

          {/* Centro com total */}
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

          {/* Rótulos externos */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
            const midAngle = startAngle + (percentage / 2) / 100 * 360;
            const midAngleRad = (midAngle - 90) * (Math.PI / 180);

            const labelRadius = 125;
            const labelX = centerX + labelRadius * Math.cos(midAngleRad);
            const labelY = centerY + labelRadius * Math.sin(midAngleRad);

            return (
              <text
                key={`label-${item.name}`}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="500"
                fill="#374151"
              >
                {percentage.toFixed(1)}%
              </text>
            );
          })}
        </svg>
      </div>

        {/* Legenda Vertical */}
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
            return (
              <div
                key={`legend-${item.name}`}
                className="flex justify-between items-center w-full"
              >
                <div className="flex items-center gap-2 text-left">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 text-right ml-4">
                  {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;