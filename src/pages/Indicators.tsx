import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import DonutChart from '../components/DonutChart';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  PieChart,
  ArrowUpDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList,
  LabelProps
} from 'recharts';

type IndicatorStatus = 'Em Implementação' | 'Não Iniciada' | 'Implementada';
type IndicatorTolerance = 'Dentro da Tolerância' | 'Fora da Tolerância';
type RiskCode = 'R01' | 'R02' | 'R03' | 'R04' | 'R05' | 'R09' | 'R17' | 'R35';

type SortField =
  | 'status'
  | 'projeto'
  | 'area'
  | 'risco'
  | 'dono'
  | 'apuracao'
  | 'prazo'
  | 'situacao'
  | 'percentualAtual'
  | 'percentualAnterior';

interface IndicatorRow {
  id: string;
  status: IndicatorStatus;
  projeto: string;
  area: string;
  riscoCodigo: RiskCode;
  riscoDescricao: string;
  dono: string;
  apuracao: string;
  prazo: string;
  situacao: IndicatorTolerance;
  percentualAtual: number;
  percentualAnterior: number;
}

const INDICATOR_STATUS_COLORS: Record<IndicatorStatus, string> = {
  'Em Implementação': '#2563eb',
  'Não Iniciada': '#f59e0b',
  'Implementada': '#16a34a'
};

const INDICATOR_TOLERANCE_COLORS: Record<IndicatorTolerance, string> = {
  'Dentro da Tolerância': '#1d4ed8',
  'Fora da Tolerância': '#ef4444'
};

const STATUS_BADGE_CLASSES: Record<IndicatorStatus, string> = {
  'Em Implementação': 'bg-blue-100 text-blue-700',
  'Não Iniciada': 'bg-amber-100 text-amber-700',
  'Implementada': 'bg-emerald-100 text-emerald-700'
};

const TOLERANCE_BADGE_CLASSES: Record<IndicatorTolerance, string> = {
  'Dentro da Tolerância': 'bg-blue-100 text-blue-700',
  'Fora da Tolerância': 'bg-red-100 text-red-700'
};

const TABLE_COLUMNS: Array<{ key: SortField; label: string }> = [
  { key: 'status', label: 'Status' },
  { key: 'projeto', label: 'Ações/Projetos Mitigatórios' },
  { key: 'area', label: 'Área Responsável' },
  { key: 'risco', label: 'Risco Descritivo' },
  { key: 'dono', label: 'Dono do Risco' },
  { key: 'apuracao', label: 'Apuração' },
  { key: 'prazo', label: 'Prazo' },
  { key: 'situacao', label: 'Situação' },
  { key: 'percentualAtual', label: '% mês atual' },
  { key: 'percentualAnterior', label: '% mês anterior' }
];

const RISK_CODES: RiskCode[] = ['R01', 'R02', 'R03', 'R04', 'R05', 'R09', 'R17', 'R35'];

const INDICATORS_MOCK: IndicatorRow[] = [
  {
    id: '1',
    status: 'Em Implementação',
    projeto: 'Monitoramento contínuo dos níveis de reservatório',
    area: 'Operações',
    riscoCodigo: 'R01',
    riscoDescricao: 'Risco hídrico - abastecimento contingente',
    dono: 'Ana Barbosa',
    apuracao: 'Agosto/2024',
    prazo: '30/11/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 68,
    percentualAnterior: 55
  },
  {
    id: '2',
    status: 'Em Implementação',
    projeto: 'Automação de alertas para recalque de água',
    area: 'Tecnologia',
    riscoCodigo: 'R02',
    riscoDescricao: 'Interrupção de bombeamento em pontos críticos',
    dono: 'Carlos Lima',
    apuracao: 'Agosto/2024',
    prazo: '15/12/2024',
    situacao: 'Fora da Tolerância',
    percentualAtual: 42,
    percentualAnterior: 51
  },
  {
    id: '3',
    status: 'Não Iniciada',
    projeto: 'Plano emergencial para seca prolongada',
    area: 'Planejamento',
    riscoCodigo: 'R03',
    riscoDescricao: 'Redução severa de disponibilidade hídrica',
    dono: 'Bianca Soares',
    apuracao: 'Julho/2024',
    prazo: '20/02/2025',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 0,
    percentualAnterior: 0
  },
  {
    id: '4',
    status: 'Implementada',
    projeto: 'Programa de auditoria de processos críticos',
    area: 'Governança',
    riscoCodigo: 'R04',
    riscoDescricao: 'Falhas de conformidade regulatória',
    dono: 'Eduardo Freitas',
    apuracao: 'Agosto/2024',
    prazo: '10/07/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 100,
    percentualAnterior: 100
  },
  {
    id: '5',
    status: 'Implementada',
    projeto: 'Integração de dados meteorológicos em tempo real',
    area: 'Operações',
    riscoCodigo: 'R05',
    riscoDescricao: 'Previsão inadequada de eventos extremos',
    dono: 'Marina Arrais',
    apuracao: 'Agosto/2024',
    prazo: '05/06/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 94,
    percentualAnterior: 90
  },
  {
    id: '6',
    status: 'Em Implementação',
    projeto: 'Capacitação de equipes sobre protocolos de crise',
    area: 'Segurança',
    riscoCodigo: 'R09',
    riscoDescricao: 'Resposta inadequada a incidentes operacionais',
    dono: 'Paulo Victor',
    apuracao: 'Agosto/2024',
    prazo: '30/01/2025',
    situacao: 'Fora da Tolerância',
    percentualAtual: 37,
    percentualAnterior: 29
  },
  {
    id: '7',
    status: 'Não Iniciada',
    projeto: 'Revisão de fornecedores estratégicos de insumos',
    area: 'Suprimentos',
    riscoCodigo: 'R17',
    riscoDescricao: 'Dependência elevada de fornecedor único',
    dono: 'Rogério Neves',
    apuracao: 'Julho/2024',
    prazo: '28/03/2025',
    situacao: 'Fora da Tolerância',
    percentualAtual: 0,
    percentualAnterior: 0
  },
  {
    id: '8',
    status: 'Em Implementação',
    projeto: 'Plataforma de indicadores em tempo real',
    area: 'Tecnologia',
    riscoCodigo: 'R35',
    riscoDescricao: 'Visibilidade tardia de desvios críticos',
    dono: 'Larissa Alves',
    apuracao: 'Agosto/2024',
    prazo: '18/01/2025',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 73,
    percentualAnterior: 61
  },
  {
    id: '9',
    status: 'Implementada',
    projeto: 'Sistema de redundância para captação prioritária',
    area: 'Operações',
    riscoCodigo: 'R01',
    riscoDescricao: 'Risco hídrico - abastecimento contingente',
    dono: 'Ana Barbosa',
    apuracao: 'Agosto/2024',
    prazo: '12/05/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 100,
    percentualAnterior: 100
  },
  {
    id: '10',
    status: 'Em Implementação',
    projeto: 'Governança de indicadores estratégicos',
    area: 'Governança',
    riscoCodigo: 'R02',
    riscoDescricao: 'Interrupção de bombeamento em pontos críticos',
    dono: 'Carlos Lima',
    apuracao: 'Agosto/2024',
    prazo: '22/12/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 58,
    percentualAnterior: 47
  },
  {
    id: '11',
    status: 'Não Iniciada',
    projeto: 'Mapeamento de alarmes críticos por bacia',
    area: 'Planejamento',
    riscoCodigo: 'R05',
    riscoDescricao: 'Previsão inadequada de eventos extremos',
    dono: 'Bianca Soares',
    apuracao: 'Julho/2024',
    prazo: '14/02/2025',
    situacao: 'Fora da Tolerância',
    percentualAtual: 0,
    percentualAnterior: 0
  },
  {
    id: '12',
    status: 'Implementada',
    projeto: 'Dashboard de tolerância e severidade consolidada',
    area: 'Segurança',
    riscoCodigo: 'R35',
    riscoDescricao: 'Visibilidade tardia de desvios críticos',
    dono: 'Larissa Alves',
    apuracao: 'Agosto/2024',
    prazo: '30/06/2024',
    situacao: 'Dentro da Tolerância',
    percentualAtual: 96,
    percentualAnterior: 92
  }
];

const AREA_OPTIONS = Array.from(new Set(INDICATORS_MOCK.map((item) => item.area))).sort((a, b) =>
  a.localeCompare(b, 'pt-BR', { sensitivity: 'accent' })
);

type StackLabelProps = LabelProps & {
  payload?: {
    total?: number;
    [key: string]: number | string | undefined;
  };
};

const renderStackedLabels = ({ x, y, width, payload }: StackLabelProps): React.ReactNode => {
  const centerX = Number(x ?? 0) + Number(width ?? 0) / 2;
  const baseY = Number(y ?? 0);

  const safePayload = payload ?? {};
  const total = Number(safePayload.total ?? 0);
  const dentro = Number(safePayload['Dentro da Tolerância'] ?? 0);
  const fora = Number(safePayload['Fora da Tolerância'] ?? 0);

  const segmentLines = [
    { label: 'Dentro', value: dentro, color: '#1d4ed8' },
    { label: 'Fora', value: fora, color: '#ef4444' }
  ];

  const lineHeight = 16;
  const startY = baseY - ((segmentLines.length + 1) * lineHeight + 4);

  return (
    <text
      x={centerX}
      y={startY}
      textAnchor="middle"
      fontSize={12}
    >
      <tspan x={centerX} dy={0} fontWeight={700} fill="#111827">
        {total}
      </tspan>
      {segmentLines.map((line) => (
        <tspan
          key={line.label}
          x={centerX}
          dy={lineHeight}
          fill={line.color}
        >
          {`${line.label}: ${line.value}`}
        </tspan>
      ))}
    </text>
  );
};

const Indicators: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatuses, setActiveStatuses] = useState<IndicatorStatus[]>([]);
  const [activeTolerances, setActiveTolerances] = useState<IndicatorTolerance[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('todos');
  const [statusSelectedSegment, setStatusSelectedSegment] = useState<string | null>(null);
  const [toleranceSelectedSegment, setToleranceSelectedSegment] = useState<string | null>(null);
  const [riskSortAscending, setRiskSortAscending] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: 'asc' | 'desc' } | null>(null);

  const filteredIndicators = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return INDICATORS_MOCK.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.projeto.toLowerCase().includes(normalizedSearch) ||
        item.riscoDescricao.toLowerCase().includes(normalizedSearch) ||
        item.riscoCodigo.toLowerCase().includes(normalizedSearch) ||
        item.dono.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        activeStatuses.length === 0 || activeStatuses.includes(item.status);

      const matchesTolerance =
        activeTolerances.length === 0 || activeTolerances.includes(item.situacao);

      const matchesArea = selectedArea === 'todos' || item.area === selectedArea;

      return matchesSearch && matchesStatus && matchesTolerance && matchesArea;
    });
  }, [searchTerm, activeStatuses, activeTolerances, selectedArea]);

  const sortedIndicators = useMemo(() => {
    if (!sortConfig) {
      return filteredIndicators;
    }

    const getComparableValue = (item: IndicatorRow, field: SortField): string | number => {
      switch (field) {
        case 'status':
          return item.status;
        case 'projeto':
          return item.projeto;
        case 'area':
          return item.area;
        case 'risco':
          return `${item.riscoCodigo} ${item.riscoDescricao}`;
        case 'dono':
          return item.dono;
        case 'apuracao':
          return item.apuracao;
        case 'prazo':
          return item.prazo;
        case 'situacao':
          return item.situacao;
        case 'percentualAtual':
          return item.percentualAtual;
        case 'percentualAnterior':
          return item.percentualAnterior;
        default:
          return '';
      }
    };

    const sorted = [...filteredIndicators].sort((a, b) => {
      const aValue = getComparableValue(a, sortConfig.field);
      const bValue = getComparableValue(b, sortConfig.field);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const diff = aValue - bValue;
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      const compareResult = String(aValue).localeCompare(String(bValue), 'pt-BR', {
        sensitivity: 'accent'
      });

      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });

    return sorted;
  }, [filteredIndicators, sortConfig]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<IndicatorStatus, number> = {
      'Em Implementação': 0,
      'Não Iniciada': 0,
      'Implementada': 0
    };

    filteredIndicators.forEach((item) => {
      counts[item.status] += 1;
    });

    return (Object.keys(counts) as IndicatorStatus[]).map((status) => ({
      name: status,
      value: counts[status],
      color: INDICATOR_STATUS_COLORS[status]
    }));
  }, [filteredIndicators]);

  const toleranceBreakdown = useMemo(() => {
    const counts: Record<IndicatorTolerance, number> = {
      'Dentro da Tolerância': 0,
      'Fora da Tolerância': 0
    };

    filteredIndicators.forEach((item) => {
      counts[item.situacao] += 1;
    });

    return (Object.keys(counts) as IndicatorTolerance[]).map((tolerance) => ({
      name: tolerance,
      value: counts[tolerance],
      color: INDICATOR_TOLERANCE_COLORS[tolerance]
    }));
  }, [filteredIndicators]);

  const riskChartData = useMemo(() => {
    const baseData = RISK_CODES.map((risk) => {
      const dentro = filteredIndicators.filter(
        (item) => item.riscoCodigo === risk && item.situacao === 'Dentro da Tolerância'
      ).length;
      const fora = filteredIndicators.filter(
        (item) => item.riscoCodigo === risk && item.situacao === 'Fora da Tolerância'
      ).length;

      return {
        risk,
        'Dentro da Tolerância': dentro,
        'Fora da Tolerância': fora,
        total: dentro + fora
      };
    });

    return [...baseData].sort((a, b) => {
      if (riskSortAscending) {
        return a.total - b.total || a.risk.localeCompare(b.risk, 'pt-BR', { sensitivity: 'accent' });
      }

      return b.total - a.total || a.risk.localeCompare(b.risk, 'pt-BR', { sensitivity: 'accent' });
    });
  }, [filteredIndicators, riskSortAscending]);

  const isFilterActive =
    searchTerm.trim().length > 0 ||
    activeStatuses.length > 0 ||
    activeTolerances.length > 0 ||
    selectedArea !== 'todos';

  const toggleStatus = (status: IndicatorStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    );
  };

  const toggleTolerance = (tolerance: IndicatorTolerance) => {
    setActiveTolerances((prev) =>
      prev.includes(tolerance)
        ? prev.filter((item) => item !== tolerance)
        : [...prev, tolerance]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveStatuses([]);
    setActiveTolerances([]);
    setSelectedArea('todos');
  };

  const handleStatusSegmentClick = (segment: string) => {
    setStatusSelectedSegment((prev) => (prev === segment ? null : segment));
  };

  const handleToleranceSegmentClick = (segment: string) => {
    setToleranceSelectedSegment((prev) => (prev === segment ? null : segment));
  };

  const handleTableSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        const nextDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        return { field, direction: nextDirection };
      }

      return { field, direction: 'asc' };
    });
  };

  const formatPercentage = (value: number) => `${value.toFixed(0)}%`;

  const renderSortIndicators = (field: SortField) => {
    const isActive = sortConfig?.field === field;
    const direction = isActive ? sortConfig?.direction : null;

    return (
      <span className="flex flex-col leading-none">
        <ChevronUp
          className={`h-3 w-3 ${direction === 'asc' ? 'text-white' : 'text-blue-200'}`}
        />
        <ChevronDown
          className={`h-3 w-3 -mt-1 ${direction === 'desc' ? 'text-white' : 'text-blue-200'}`}
        />
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Indicadores Estratégicos</h1>
                <p className="text-gray-600 mt-1 max-w-2xl">
                  Visualize a evolução dos indicadores-chave de riscos prioritários e acompanhe
                  o andamento das iniciativas mitigatórias relacionadas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm text-sm"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </button>
              )}
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm text-sm ${
                  showFilters ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isFilterActive && (
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="text-sm text-gray-600 font-medium mr-2">Filtros ativos:</span>
              {searchTerm.trim().length > 0 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  <span>Busca: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeStatuses.map((status) => (
                <span
                  key={status}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                >
                  <span>Status: {status}</span>
                  <button
                    onClick={() => toggleStatus(status)}
                    className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeTolerances.map((tolerance) => (
                <span
                  key={tolerance}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm"
                >
                  <span>Situação: {tolerance}</span>
                  <button
                    onClick={() => toggleTolerance(tolerance)}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedArea !== 'todos' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <span>Área: {selectedArea}</span>
                  <button
                    onClick={() => setSelectedArea('todos')}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {showFilters && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Busca rápida
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Procure por risco, indicador ou responsável"
                      className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Status de implementação
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(INDICATOR_STATUS_COLORS) as IndicatorStatus[]).map((status) => (
                      <label key={status} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={activeStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Situação de tolerância
                  </h3>
                  <div className="space-y-2">
                    {(Object.keys(INDICATOR_TOLERANCE_COLORS) as IndicatorTolerance[]).map((tolerance) => (
                      <label key={tolerance} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={activeTolerances.includes(tolerance)}
                          onChange={() => toggleTolerance(tolerance)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{tolerance}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Área responsável
                  </h3>
                  <select
                    value={selectedArea}
                    onChange={(event) => setSelectedArea(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="todos">Todas as áreas</option>
                    {AREA_OPTIONS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DonutChart
            title="Índice de Indicadores por Implementação"
            data={statusBreakdown}
            selectedSegment={statusSelectedSegment}
            onSegmentClick={handleStatusSegmentClick}
          />
          <DonutChart
            title="Quantidade Percentual por Prazo"
            data={toleranceBreakdown}
            selectedSegment={toleranceSelectedSegment}
            onSegmentClick={handleToleranceSegmentClick}
          />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Indicadores por Risco Prioritário</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Barras segmentadas pela tolerância vigente de cada indicador.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRiskSortAscending((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Ordenar: {riskSortAscending ? 'crescente' : 'decrescente'}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 mt-4" style={{ minHeight: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskChartData}
                  margin={{ top: 80, right: 16, left: 0, bottom: 24 }}
                  barCategoryGap="24%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="risk" tickLine={false} axisLine={false} tick={{ fill: '#4B5563' }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} />
                  <Bar
                    dataKey="Dentro da Tolerância"
                    stackId="indicadores"
                    fill="#1d4ed8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Fora da Tolerância"
                    stackId="indicadores"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="total" fill="transparent" legendType="none" isAnimationActive={false}>
                    <LabelList dataKey="total" content={renderStackedLabels} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide"
                    >
                      <button
                        type="button"
                        onClick={() => handleTableSort(column.key)}
                        className="flex items-center justify-between gap-2 w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                      >
                        <span className="whitespace-normal text-left">{column.label}</span>
                        {renderSortIndicators(column.key)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedIndicators.map((indicator) => (
                  <tr key={indicator.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_BADGE_CLASSES[indicator.status]
                        }`}
                      >
                        {indicator.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900 leading-relaxed">
                        {indicator.projeto}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm text-gray-700">{indicator.area}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm text-gray-900 font-medium">{indicator.riscoCodigo}</div>
                      <div className="text-sm text-gray-600">{indicator.riscoDescricao}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm text-gray-700">{indicator.dono}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm text-gray-700">{indicator.apuracao}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm text-gray-700">{indicator.prazo}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          TOLERANCE_BADGE_CLASSES[indicator.situacao]
                        }`}
                      >
                        {indicator.situacao}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPercentage(indicator.percentualAtual)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="text-sm text-gray-700">
                        {formatPercentage(indicator.percentualAnterior)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredIndicators.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">Nenhum indicador encontrado</p>
              <p className="text-gray-400">
                Ajuste os filtros selecionados ou limpe-os para visualizar todos os registros.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Indicators;
