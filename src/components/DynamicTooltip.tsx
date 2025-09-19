import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DynamicTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  coordinate?: { x: number; y: number };
  children: React.ReactNode;
  offset?: { x: number; y: number };
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  coordinate,
  children,
  offset = { x: 10, y: 10 }
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Controlar visibilidade e posicionamento baseado no Recharts
  useEffect(() => {
    setIsVisible(!!active);
    
    if (active && coordinate) {
      // Usar coordenadas diretas do Recharts com ajuste simples
      const chartContainer = document.querySelector('.recharts-wrapper');
      
      if (chartContainer) {
        const containerRect = chartContainer.getBoundingClientRect();
        // Coordenadas absolutas baseadas no container do gráfico
        const absoluteX = containerRect.left + coordinate.x + offset.x;
        const absoluteY = containerRect.top + coordinate.y + offset.y;
        
        setTooltipPosition({ x: absoluteX, y: absoluteY });
      } else {
        // Fallback usando coordenadas relativas simples
        setTooltipPosition({ 
          x: coordinate.x + offset.x, 
          y: coordinate.y + offset.y 
        });
      }
    }
  }, [active, coordinate, offset]);

  if (!active || !payload || !payload.length || !isVisible) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed pointer-events-none z-[10000]"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        transform: 'translateZ(0)',
      }}
    >
      {children}
    </div>
  );
};

export default DynamicTooltip;