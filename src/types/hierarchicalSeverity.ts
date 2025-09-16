export enum SeverityLevel {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO'
}

export enum HierarchicalLevel {
  ROOT = 'root',
  ACAO = 'acao',
  NATUREZA = 'natureza',
  CATEGORIA = 'categoria',
  SUBCATEGORIA = 'subcategoria'
}

export interface HierarchicalSeverityNode {
  id: string;
  label: string;
  level: HierarchicalLevel;
  avg_severity: number;
  risk_count: number;
  parent_id?: string;
  children: HierarchicalSeverityNode[];
  // Additional metadata for rich display
  original_id?: string; // Original database ID
  color?: string; // Color based on severity level
}

export interface HierarchicalSeverityData {
  root: HierarchicalSeverityNode;
  allNodes: HierarchicalSeverityNode[];
  totalRisks: number;
  overallAverageSeverity: number;
}

export interface HierarchicalSeverityStats {
  data: HierarchicalSeverityData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export type SeverityBreakdownAttribute = 'acao' | 'natureza' | 'categoria' | 'subcategoria';