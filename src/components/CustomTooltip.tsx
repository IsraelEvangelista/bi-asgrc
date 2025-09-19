import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  coordinate?: { x: number; y: number };
  children: React.ReactNode;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  coordinate,
  children 
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Controla visibilidade com base no estado do Recharts
  useEffect(() => {
    const shouldShow = !!active && !!payload && payload.length > 0;
    setVisible(shouldShow);
    if (!shouldShow) setInitialized(false);
  }, [active, payload]);

  // Listener de mouse com inicialização para evitar pulo
  useEffect(() => {
    if (!visible) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX + 10, y: e.clientY - 10 };
      setMousePos(newPos);
      if (!initialized) setInitialized(true);
    };

    // Inicializar posição imediatamente usando coordinate se disponível
    if (coordinate && !initialized) {
      // Converter coordinate relativa do gráfico para posição absoluta na tela
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        const chartRect = chartElement.getBoundingClientRect();
        const absoluteX = chartRect.left + coordinate.x + 10;
        const absoluteY = chartRect.top + coordinate.y - 10;
        setMousePos({ x: absoluteX, y: absoluteY });
      } else {
        setMousePos({ x: coordinate.x + 10, y: coordinate.y - 10 });
      }
      setInitialized(true);
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [visible, coordinate, initialized]);

  if (!visible || !active || !payload || payload.length === 0 || !initialized) {
    return null;
  }

  const tooltipElement = (
    <div
      className="fixed pointer-events-none z-[999999]"
      style={{
        left: mousePos.x,
        top: mousePos.y,
        transform: 'translateZ(0)'
      }}
    >
      {children}
    </div>
  );

  return createPortal(tooltipElement, document.body);
};

export default CustomTooltip;