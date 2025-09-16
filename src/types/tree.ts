import { RawNodeDatum, TreeNodeDatum, RenderCustomNodeElementFn } from 'react-d3-tree';

// Extensão para dados de nós da árvore hierárquica com propriedades personalizadas
export interface TreeNodeData extends RawNodeDatum {
  name: string;
  value?: number;
  category?: string;
  severity?: 'baixa' | 'media' | 'alta' | 'critica' | number;
  totalAcoes?: number;
  percentual?: number;
  nivel?: number;
  children?: TreeNodeData[];
  collapsed?: boolean;
  attributes?: {
    [key: string]: string | number;
  };
}

// Configurações para o componente de árvore hierárquica
export interface TreeChartConfig {
  width?: number;
  height?: number;
  nodeSize?: {
    x: number;
    y: number;
  };
  separation?: {
    siblings: number;
    nonSiblings: number;
  };
  translate?: {
    x: number;
    y: number;
  };
  zoom?: number;
  orientation?: 'vertical' | 'horizontal';
  pathFunc?: 'diagonal' | 'elbow' | 'straight' | 'step';
  enableLegacyTransitions?: boolean;
  transitionDuration?: number;
  collapsible?: boolean;
  initialDepth?: number;
  depthFactor?: number;
  zoomable?: boolean;
  draggable?: boolean;
  scaleExtent?: {
    min: number;
    max: number;
  };
  enableResponsiveLayout?: boolean;
  useCardNodes?: boolean;
  cardPadding?: number;
  cardSpacing?: number;
  enableNodeAnimations?: boolean;
  showSeverityIcons?: boolean;
  textDirection?: 'ltr' | 'rtl';
  fontWeight?: number;
  titleFontSize?: number;
  subtitleFontSize?: number;
  infoFontSize?: number;
}

// Interface para dados exibidos no painel de detalhes do nó
export interface NodeDetailsData {
  id?: string;
  name: string;
  level: number;
  severity: 'baixa' | 'media' | 'alta' | 'critica' | number;
  totalAcoes: number;
  percentual: number;
  description?: string;
  parent?: string;
  children?: string[];
  metrics?: {
    [key: string]: number | string;
  };
}

// Opções de filtro para a árvore hierárquica
export interface FilterOptions {
  severidade?: ('baixa' | 'media' | 'alta' | 'critica')[];
  nivel?: number[];
  categoria?: string[];
  minAcoes?: number;
  maxAcoes?: number;
  showOnlyLeaves?: boolean;
  showOnlyParents?: boolean;
  searchTerm?: string;
}

// Interface para nó hierárquico original do projeto (compatibilidade)
// Esta interface corresponde à estrutura usada no PortfolioAcoes.tsx
export interface HierarchyNode {
  id: string;
  nome: string;
  nivel: number;
  severidade: number; // Valor numérico ao invés de categoria string
  totalAcoes: number;
  expandido: boolean;
  children: HierarchyNode[]; // 'children' ao invés de 'filhos'
}

// Alias para manter compatibilidade com código existente
export type PortfolioHierarchyNode = HierarchyNode;

// Mapeamento de severidade numérica para categoria
export interface SeverityMapping {
  'muito-baixo': { min: 0; max: 5; category: 'baixa' };
  'moderado': { min: 5; max: 10; category: 'media' };
  'alto': { min: 10; max: 20; category: 'alta' };
  'muito-alto': { min: 20; max: number; category: 'critica' };
}

// Configurações de interatividade avançada
export interface InteractionConfig {
  enableKeyboardNavigation: boolean;
  enableMouseWheelZoom: boolean;
  enableDragPan: boolean;
  zoomSensitivity: number;
  panSensitivity: number;
}

// Configurações de tooltip avançadas
export interface TooltipConfig {
  showDelay: number;
  hideDelay: number;
  followMouse: boolean;
  showNodePath: boolean;
  maxWidth: number;
}

// Props para o componente HierarchicalTreeChart
export interface HierarchicalTreeChartProps {
  data: TreeNodeData;
  config?: Partial<TreeChartConfig>;
  onNodeClick?: (nodeData: any, evt: React.MouseEvent) => void;
  onNodeMouseOver?: (nodeData: any, evt: React.MouseEvent) => void;
  onNodeMouseOut?: (nodeData: any, evt: React.MouseEvent) => void;
  filters?: FilterOptions;
  showDetails?: boolean;
  className?: string;
  renderCustomNodeElement?: RenderCustomNodeElementFn;
  // Props para controle de expansão
  expandedNodeIds?: string[];
  onNodeExpansionChange?: (expandedIds: string[]) => void;
  onZoomChange?: (zoom: number, translate: { x: number; y: number }) => void;
  interactionConfig?: Partial<InteractionConfig>;
  tooltipConfig?: Partial<TooltipConfig>;
}

// Métricas calculadas para cada nó
export interface NodeMetrics {
  totalDescendants: number;
  maxDepth: number;
  averageSeverity: number;
  totalActions: number;
  severityDistribution: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
}

// Estado interno do componente de árvore
export interface TreeState {
  selectedNode: any | null;
  zoomLevel: number;
  centerPosition: { x: number; y: number };
  showTooltip: boolean;
  tooltipData: NodeDetailsData | null;
  tooltipPosition: { x: number; y: number };
  // Estado de expansão e interatividade
  expandedNodeIds: Set<string>;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragOriginCenter: { x: number; y: number } | null;
  // Estado para tooltip avançado
  pendingTooltipData: NodeDetailsData | null;
  isFollowingMouse: boolean;
}