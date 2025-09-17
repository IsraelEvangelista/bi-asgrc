import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RiscoDetalhado } from '../hooks/useRiscosDetalhados';

interface TableRiscosTooltipProps {
  children: React.ReactNode;
  riscosDetalhados?: RiscoDetalhado[];
  itemName?: string;
  itemMediaSeveridade?: number;
}

const TableRiscosTooltip: React.FC<TableRiscosTooltipProps> = ({
  children,
  riscosDetalhados,
  itemName,
  itemMediaSeveridade
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 400; // max-w-[400px]
    const tooltipHeight = 300; // estimativa da altura máxima
    const margin = 20; // margem de segurança

    let x = e.clientX + 10;
    let y = e.clientY + 10;

    // Ajustar posição X para evitar overflow horizontal
    if (x + tooltipWidth > viewportWidth - margin) {
      x = e.clientX - tooltipWidth - 10;
    }

    // Ajustar posição Y para evitar overflow vertical
    if (y + tooltipHeight > viewportHeight - margin) {
      y = e.clientY - tooltipHeight - 10;
    }

    // Garantir que não saia da tela pela esquerda ou topo
    x = Math.max(margin, x);
    y = Math.max(margin, y);

    setPosition({ x, y });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    handleMouseMove(e);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (riscosDetalhados && riscosDetalhados.length > 0) && createPortal(
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 9999,
            transform: 'translateZ(0)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Cabeçalho com informações do item */}
          <div className="border-b border-gray-200 pb-3 mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">{itemName}</h4>
            {itemMediaSeveridade && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-600">Conformidade:</span>
                <span className="text-sm font-medium text-gray-900">
                  {((Math.max(1, Math.min(25, itemMediaSeveridade)) - 1) / 24 * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Lista de riscos */}
          <div>
            <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              Riscos ({riscosDetalhados.length})
            </h5>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {riscosDetalhados.map((risco, index) => (
                <div
                  key={risco.id || index}
                  className="bg-gray-50 rounded-lg p-2 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h6 className="text-xs font-medium text-gray-900 flex-1 pr-2">
                      {risco.desc_risco}
                    </h6>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-700">
                        {risco.severidade.toFixed(1)}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-xs font-medium text-gray-700">
                        {risco.conformidade.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de conformidade */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        risco.conformidade >= 80 ? 'bg-green-500' :
                        risco.conformidade >= 60 ? 'bg-yellow-500' :
                        risco.conformidade >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${risco.conformidade}%` }}
                    ></div>
                  </div>

                  {/* Informações adicionais */}
                  {(risco.desc_natureza || risco.desc_categoria || risco.desc_subcategoria) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risco.desc_natureza && (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                          {risco.desc_natureza}
                        </span>
                      )}
                      {risco.desc_categoria && (
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                          {risco.desc_categoria}
                        </span>
                      )}
                      {risco.desc_subcategoria && (
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
                          {risco.desc_subcategoria}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TableRiscosTooltip;