import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import DonutChart from './DonutChart';
import StatusCards from './StatusCards';
import HorizontalBarChart from './HorizontalBarChart';

interface ActionsResponsiveLayoutProps {
  statusData: Array<{ name: string; value: number; color: string }>;
  prazoData: Array<{ name: string; value: number; color: string }>;
  riscoData: Array<{ riskId: string; statusData: any }>;
  statusCardsData: { emImplementacao: number; implementada: number; naoIniciada: number };
  selectedStatus: string | null;
  selectedPrazo: string | null;
  onStatusClick: (segment: string) => void;
  onPrazoClick: (segment: string) => void;
}

const ActionsResponsiveLayout: React.FC<ActionsResponsiveLayoutProps> = ({
  statusData,
  prazoData,
  riscoData,
  statusCardsData,
  selectedStatus,
  selectedPrazo,
  onStatusClick,
  onPrazoClick
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  if (isMobile) {
    // Layout mobile: tudo empilhado verticalmente
    return (
      <div className="space-y-6">
        {/* Status Cards - Layout compacto para mobile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <StatusCards data={statusCardsData} />
        </div>

        {/* Gráficos em stack para mobile */}
        <div className="grid grid-cols-1 gap-6">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <DonutChart
              data={statusData}
              title="Status das Ações"
              size={240}
              onSegmentClick={onStatusClick}
              selectedSegment={selectedStatus}
            />
          </div>

          {/* Gráfico de Prazo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <DonutChart
              data={prazoData}
              title="Situação de Prazo"
              size={240}
              onSegmentClick={onPrazoClick}
              selectedSegment={selectedPrazo}
            />
          </div>

          {/* Gráfico de Barras */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <HorizontalBarChart
              data={riscoData}
              title="Ações por Risco"
              showTotal={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isTablet) {
    // Layout tablet: 2x2 grid mais responsivo
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Row 1 - Status Charts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <DonutChart
            data={statusData}
            title="Status das Ações"
            size={260}
            onSegmentClick={onStatusClick}
            selectedSegment={selectedStatus}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <DonutChart
            data={prazoData}
            title="Situação de Prazo"
            size={260}
            onSegmentClick={onPrazoClick}
            selectedSegment={selectedPrazo}
          />
        </div>

        {/* Row 2 - Status Cards spanning both columns */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <StatusCards data={statusCardsData} />
        </div>

        {/* Row 3 - Bar Chart spanning both columns */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <HorizontalBarChart
            data={riscoData}
            title="Ações por Risco"
            showTotal={true}
          />
        </div>
      </div>
    );
  }

  // Layout desktop: grid 7 colunas original mas otimizado
  return (
    <div className="grid grid-cols-7 gap-6">
      {/* Linha 1-3, Coluna 1-2: Gráfico de Status */}
      <div className="col-span-2 row-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
          <DonutChart
            data={statusData}
            title="Quantitativo Percentual por Status"
            onSegmentClick={onStatusClick}
            selectedSegment={selectedStatus ? 
              Object.keys({
                'Não Iniciada': 'Não iniciada',
                'Em implementação': 'Em implementação', 
                'Implementada': 'Implementada'
              }).find(key => ({
                'Não Iniciada': 'Não iniciada',
                'Em implementação': 'Em implementação',
                'Implementada': 'Implementada'
              })[key] === selectedStatus) : null
            }
          />
        </div>
      </div>

      {/* Linha 1, Coluna 3-5: Cards de Status */}
      <div className="col-span-3 row-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
          <StatusCards data={statusCardsData} />
        </div>
      </div>

      {/* Linha 1-3, Coluna 6-7: Gráfico de Prazo */}
      <div className="col-span-2 row-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
          <DonutChart
            data={prazoData}
            title="Quantitativo de Ações não Iniciadas por Prazo"
            onSegmentClick={onPrazoClick}
            selectedSegment={selectedPrazo ? 
              Object.keys({
                'No Prazo': 'no_prazo',
                'Atrasado': 'atrasado'
              }).find(key => ({
                'No Prazo': 'no_prazo',
                'Atrasado': 'atrasado'
              })[key] === selectedPrazo) : null
            }
          />
        </div>
      </div>

      {/* Linha 2-3, Coluna 3-5: Gráfico de Barras */}
      <div className="col-span-3 row-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
          <HorizontalBarChart
            data={riscoData}
            showTotal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionsResponsiveLayout;