// Este é um patch/exemplo de como modificar a Actions.tsx existente
// Copie as partes relevantes para o arquivo original

// === IMPORTS MODIFICADOS ===
// Adicionar estes imports no topo do arquivo
import DonutChartFixed from '../components/DonutChartFixed';
import { useActionsChartData } from '../hooks/useActionsChartData';

// === SUBSTITUIR A LÓGICA DE DADOS DOS GRÁFICOS ===
// Substituir as variáveis statusData, prazoData, riscoData e statusCardsData por:

const Actions: React.FC = () => {
  // ... código existente até a linha dos filteredActions ...

  // Detectar se há filtros aplicados
  const hasFiltersApplied = !!(
    searchTerm ||
    selectedStatus ||
    selectedPrazo ||
    Object.values(filters).some(f => f)
  );

  // Usar o hook corrigido para dados dos gráficos
  const { statusData, prazoData, riscoData, statusCardsData } = useActionsChartData(
    filteredActions,
    riskBarData,
    hasFiltersApplied
  );

  // ... resto do código existente ...

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header - manter igual */}

        {/* ... código de filtros e alertas ... */}

        {/* === SUBSTITUIR O GRID DASHBOARD === */}
        <div className="grid grid-cols-7 gap-6">
          {/* Linha 1-3, Coluna 1-2: Gráfico de rosca - Status */}
          <div className="col-span-2 row-span-3">
            <DonutChartFixed
              data={statusData}
              title="Quantitativo Percentual por Status"
              onSegmentClick={(segment) => {
                // Mapear nomes dos segmentos para valores de status
                const statusMap: Record<string, StatusAcao> = {
                  'Não Iniciada': StatusAcao.NAO_INICIADA,
                  'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                  'Implementada': StatusAcao.IMPLEMENTADA
                };
                
                const statusValue = statusMap[segment];
                if (selectedStatus === statusValue) {
                  setSelectedStatus(null);
                } else {
                  setSelectedStatus(statusValue);
                }
              }}
              selectedSegment={selectedStatus ? 
                Object.keys({
                  'Não Iniciada': StatusAcao.NAO_INICIADA,
                  'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                  'Implementada': StatusAcao.IMPLEMENTADA
                }).find(key => ({
                  'Não Iniciada': StatusAcao.NAO_INICIADA,
                  'Em implementação': StatusAcao.EM_IMPLEMENTACAO,
                  'Implementada': StatusAcao.IMPLEMENTADA
                })[key] === selectedStatus) : null
              }
              showEmptyRing={hasFiltersApplied}
            />
          </div>

          {/* Linha 1, Coluna 3-5: Cards de Status - manter igual */}
          <div className="col-span-3 row-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <StatusCards data={statusCardsData} />
            </div>
          </div>

          {/* Linha 1-3, Coluna 6-7: Gráfico de rosca - Prazo */}
          <div className="col-span-2 row-span-3">
            <DonutChartFixed
              data={prazoData}
              title="Quantitativo de Ações não Iniciadas por Prazo"
              onSegmentClick={(segment) => {
                // Mapear nomes dos segmentos para valores de filtro
                const prazoMap: Record<string, string> = {
                  'No Prazo': 'no_prazo',
                  'Atrasado': 'atrasado'
                };
                
                const prazoValue = prazoMap[segment];
                if (selectedPrazo === prazoValue) {
                  setSelectedPrazo(null);
                } else {
                  setSelectedPrazo(prazoValue);
                }
              }}
              selectedSegment={selectedPrazo ? 
                Object.keys({
                  'No Prazo': 'no_prazo',
                  'Atrasado': 'atrasado'
                }).find(key => ({
                  'No Prazo': 'no_prazo',
                  'Atrasado': 'atrasado'
                })[key] === selectedPrazo) : null
              }
              showEmptyRing={hasFiltersApplied}
            />
          </div>

          {/* Linha 2-3, Coluna 3-5: Gráfico de barras horizontais */}
          <div className="col-span-3 row-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
              <HorizontalBarChart
                data={riscoData}
                showTotal={true}
              />
            </div>
          </div>
        </div>

        {/* ... resto do código igual (busca, tabela, paginação) ... */}
      </div>
    </Layout>
  );
};

export default Actions;

// === INSTRUÇÕES DE APLICAÇÃO ===
/*
Para aplicar estas correções:

1. Abrir src/pages/Actions.tsx
2. Adicionar os imports:
   import DonutChartFixed from '../components/DonutChartFixed';
   import { useActionsChartData } from '../hooks/useActionsChartData';

3. Substituir a lógica de dados dos gráficos (linhas ~248-400) pelo código do useActionsChartData

4. Substituir DonutChart por DonutChartFixed nos dois gráficos de rosca

5. Adicionar a propriedade showEmptyRing={hasFiltersApplied} nos DonutChartFixed

6. Definir hasFiltersApplied antes de usar o hook useActionsChartData

Resultado: 
- Gráficos de rosca sempre mostrarão a estrutura, mesmo quando filtrados
- Gráfico de barras refletirá corretamente os filtros aplicados
- Sem animações desnecessárias, transições imediatas
*/