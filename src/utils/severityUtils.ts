import React from 'react';

// Constantes de severidade baseadas no PortfolioAcoes.tsx
export const SEVERITY_RANGES = {
  'muito-alto': { min: 20, max: Infinity, category: 'critica' as const },
  'alto': { min: 10, max: 20, category: 'alta' as const },
  'moderado': { min: 5, max: 10, category: 'media' as const },
  'baixo': { min: 0, max: 5, category: 'baixa' as const }
} as const;

export const SEVERITY_COLORS = {
  'critica': '#dc2626', // red-600
  'alta': '#ea580c',    // orange-600
  'media': '#f59e0b',   // yellow-500 (changed from amber)
  'baixa': '#16a34a'    // green-600
} as const;

export const SEVERITY_WEIGHTS = {
  'baixa': 1,
  'media': 2,
  'alta': 3,
  'critica': 4
} as const;

export type SeverityCategory = 'baixa' | 'media' | 'alta' | 'critica';

/**
 * Converte valor numérico de severidade para categoria string
 * Baseado na função calcularSeveridadePorValor do PortfolioAcoes.tsx
 * @param severidade - Valor numérico da severidade
 * @returns Categoria de severidade como string
 */
export function mapSeverityToCategory(severidade: number): SeverityCategory {
  if (severidade >= 20) return 'critica';
  if (severidade >= 10 && severidade < 20) return 'alta';
  if (severidade >= 5 && severidade < 10) return 'media';
  return 'baixa';
}

/**
 * Obtém cor baseada na severidade (numérica ou categórica)
 * Compatível com getSeveridadeColor do PortfolioAcoes.tsx
 * @param severity - Severidade como número ou string categórica
 * @returns Código de cor hexadecimal
 */
export function getSeverityColor(severity?: string | number): string {
  if (typeof severity === 'number') {
    const category = mapSeverityToCategory(severity);
    return SEVERITY_COLORS[category];
  }
  
  if (typeof severity === 'string' && severity in SEVERITY_COLORS) {
    return SEVERITY_COLORS[severity as SeverityCategory];
  }
  
  return '#6b7280'; // gray-500 como padrão
}

/**
 * Obtém peso numérico da severidade para cálculos
 * @param severity - Severidade como número ou string categórica
 * @returns Peso numérico da severidade
 */
export function getSeverityWeight(severity?: string | number): number {
  if (typeof severity === 'number') {
    const category = mapSeverityToCategory(severity);
    return SEVERITY_WEIGHTS[category];
  }
  
  if (typeof severity === 'string' && severity in SEVERITY_WEIGHTS) {
    return SEVERITY_WEIGHTS[severity as SeverityCategory];
  }
  
  return 1; // Peso padrão
}

/**
 * Valida se um valor de severidade é válido
 * @param severity - Valor a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateSeverityValue(severity: any): severity is (number | SeverityCategory) {
  if (typeof severity === 'number') {
    return severity >= 0 && severity <= 100; // Assume faixa 0-100 para valores numéricos
  }
  
  if (typeof severity === 'string') {
    return ['baixa', 'media', 'alta', 'critica'].includes(severity);
  }
  
  return false;
}

/**
 * Normaliza severidade para formato consistente (sempre string categórica)
 * @param severity - Severidade em qualquer formato aceito
 * @returns Categoria de severidade normalizada
 */
export function normalizeSeverity(severity?: string | number): SeverityCategory {
  if (typeof severity === 'number') {
    return mapSeverityToCategory(severity);
  }
  
  if (typeof severity === 'string' && validateSeverityValue(severity)) {
    return severity as SeverityCategory;
  }
  
  return 'baixa'; // Padrão seguro
}

/**
 * Obtém tamanho do nó baseado na severidade
 * @param severity - Severidade como número ou string categórica
 * @returns Tamanho do nó em pixels
 */
export function getNodeSize(severity?: string | number): number {
  const category = normalizeSeverity(severity);
  
  switch (category) {
    case 'critica': return 16;
    case 'alta': return 14;
    case 'media': return 12;
    case 'baixa': return 10;
    default: return 10;
  }
}

/**
 * Obtém classes CSS do Tailwind para severidade
 * Baseado na função getSeveridadeColor do PortfolioAcoes.tsx
 * @param severity - Severidade como número ou string categórica
 * @returns Classes CSS do Tailwind
 */
export function getSeverityTailwindClasses(severity?: string | number): string {
  if (typeof severity === 'number') {
    if (severity >= 20) return 'text-red-600 bg-red-50 border-red-200';
    if (severity >= 10) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (severity >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  }
  
  const category = normalizeSeverity(severity);
  switch (category) {
    case 'critica': return 'text-red-600 bg-red-50 border-red-200';
    case 'alta': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'baixa': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

/**
 * Calcula dimensões do nó baseado na severidade e nível hierárquico
 * @param severity - Severidade como número ou string categórica
 * @param level - Nível hierárquico do nó
 * @returns Dimensões do nó { width, height }
 */
export function getNodeDimensions(severity?: string | number, level?: number): { width: number; height: number } {
  const category = normalizeSeverity(severity);
  
  // Base dimensions based on severity
  const baseDimensions = {
    'critica': { width: 180, height: 90 },
    'alta': { width: 160, height: 80 },
    'media': { width: 140, height: 70 },
    'baixa': { width: 120, height: 60 }
  };
  
  const dimensions = baseDimensions[category];
  
  // Adjust based on hierarchy level (higher levels = larger)
  const levelMultiplier = level && level > 0 ? Math.max(1, 1.2 - (level * 0.1)) : 1;
  
  return {
    width: Math.round(dimensions.width * levelMultiplier),
    height: Math.round(dimensions.height * levelMultiplier)
  };
}

/**
 * Retorna o ID do gradiente baseado na categoria de severidade
 * @param severity - Severidade como número ou string categórica
 * @param isLight - Se é o gradiente light (para header)
 * @param nodeId - ID único do nó para prevenir colisões
 * @returns String com o ID do gradiente
 */
export function getGradientId(severity?: string | number, isLight = false, nodeId?: string): string {
  const category = normalizeSeverity(severity);
  const uniqueId = nodeId ? `-${nodeId}` : `-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return `gradient-${category}${isLight ? '-light' : ''}${uniqueId}`;
}

/**
 * Valida se um nodeId é string e retorna string vazia se não for
 */
function ensureStringNodeId(nodeId?: string | number): string {
  return nodeId ? String(nodeId) : '';
}

/**
 * Retorna todas as definições de gradientes para o SVG (legado - usar getNodeGradients)
 * @returns String SVG com todas as definições de gradientes
 * @deprecated Usar getNodeGradients para evitar colisões de ID
 */
export function getAllGradients(): string {
  const gradients = {
    'critica': {
      start: '#ef4444', // red-500
      end: '#dc2626',   // red-600
      light: '#fef2f2'  // red-50
    },
    'alta': {
      start: '#f97316', // orange-500
      end: '#ea580c',   // orange-600
      light: '#fff7ed'  // orange-50
    },
    'media': {
      start: '#fde047', // yellow-400
      end: '#f59e0b',   // yellow-500
      light: '#fefce8'  // yellow-50
    },
    'baixa': {
      start: '#22c55e', // green-500
      end: '#16a34a',   // green-600
      light: '#f0fdf4'  // green-50
    }
  };
  
  let gradientsHtml = '';
  
  Object.entries(gradients).forEach(([category, colors]) => {
    gradientsHtml += `
      <linearGradient id="gradient-${category}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="gradient-${category}-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.light};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:${colors.light};stop-opacity:0.1" />
      </linearGradient>
    `;
  });
  
  return gradientsHtml;
}

/**
 * Retorna definições de gradientes para um nó específico com IDs únicos
 * @param severity - Severidade como número ou string categórica
 * @param nodeId - ID único do nó
 * @returns String SVG com definições de gradientes para o nó
 */
export function getNodeGradients(severity?: string | number, nodeId?: string | number): string {
  const category = normalizeSeverity(severity);
  const gradientId = getGradientId(severity, false, ensureStringNodeId(nodeId));
  const gradientLightId = getGradientId(severity, true, ensureStringNodeId(nodeId));
  
  const gradients = {
    'critica': {
      start: '#ef4444', // red-500
      end: '#dc2626',   // red-600
      light: '#fef2f2'  // red-50
    },
    'alta': {
      start: '#f97316', // orange-500
      end: '#ea580c',   // orange-600
      light: '#fff7ed'  // orange-50
    },
    'media': {
      start: '#fde047', // yellow-400
      end: '#f59e0b',   // yellow-500
      light: '#fefce8'  // yellow-50
    },
    'baixa': {
      start: '#22c55e', // green-500
      end: '#16a34a',   // green-600
      light: '#f0fdf4'  // green-50
    }
  };
  
  const colors = gradients[category] || gradients['baixa'];
  
  return `
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="${gradientLightId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.light};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${colors.light};stop-opacity:0.1" />
    </linearGradient>
  `;
}

/**
 * Determina cor do texto baseada no background para garantir contraste adequado
 * @param severity - Severidade como número ou string categórica
 * @returns Cor do texto em hexadecimal
 */
export function getTextColor(severity?: string | number): string {
  const category = normalizeSeverity(severity);
  
  // Use dark text for light backgrounds, white for dark backgrounds
  const darkTextCategories: SeverityCategory[] = ['baixa', 'media'];
  return darkTextCategories.includes(category) ? '#1f2937' : '#ffffff';
}

/**
 * Retorna símbolo SVG baseado na categoria de severidade
 * @param severity - Severidade como número ou string categórica
 * @returns React element com o símbolo
 */
export function getSeverityIcon(severity?: string | number): React.ReactElement {
  const category = normalizeSeverity(severity);
  
  const icons = {
    'critica': React.createElement('path', { 
      d: "M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z", 
      stroke: "inherit", 
      fill: "none" 
    }),
    'alta': React.createElement('path', { 
      d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", 
      stroke: "inherit", 
      fill: "none" 
    }),
    'media': React.createElement('path', { 
      d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", 
      stroke: "inherit", 
      fill: "none" 
    }),
    'baixa': React.createElement(React.Fragment, null,
      React.createElement('circle', { 
        cx: "12", 
        cy: "12", 
        r: "10", 
        stroke: "inherit", 
        fill: "none" 
      }),
      React.createElement('path', { 
        d: "M12 8v4l3 3", 
        stroke: "inherit", 
        fill: "none", 
        strokeLinecap: "round" 
      })
    )
  };
  
  return icons[category];
}

/**
 * Formata exibição da severidade para labels
 * @param severity - Severidade como número ou string categórica
 * @returns String formatada (ex: "18.4 - Alto")
 */
export function formatSeverityDisplay(severity?: string | number): string {
  if (typeof severity === 'number') {
    const category = mapSeverityToCategory(severity);
    const categoryName = {
      'critica': 'Crítica',
      'alta': 'Alta',
      'media': 'Média',
      'baixa': 'Baixa'
    };
    return `${severity.toFixed(1)} - ${categoryName[category]}`;
  }
  
  if (typeof severity === 'string') {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  }
  
  return 'N/A';
}

/**
 * Determina estilo da borda baseado na severidade
 * @param severity - Severidade como número ou string categórica
 * @returns Estilo da borda { color, width, style }
 */
export function getNodeBorderStyle(severity?: string | number): { color: string; width: number; style: string } {
  const category = normalizeSeverity(severity);
  
  const borderStyles = {
    'critica': { color: '#991b1b', width: 3, style: 'solid' },    // red-800
    'alta': { color: '#c2410c', width: 2.5, style: 'solid' },      // orange-700
    'media': { color: '#b45309', width: 2, style: 'solid' },       // amber-600
    'baixa': { color: '#15803d', width: 1.5, style: 'solid' }      // green-700
  };
  
  return borderStyles[category];
}

/**
 * Calcula espaçamentos adequados entre elementos do nó
 * @param width - Largura do nó
 * @param height - Altura do nó
 * @returns Espaçamentos { padding, margin, fontSize }
 */
export function calculateNodeSpacing(width: number, height: number): { 
  padding: number; 
  margin: number; 
  titleFontSize: number;
  infoFontSize: number;
} {
  const padding = Math.round(Math.min(width, height) * 0.1);
  const margin = Math.round(padding * 0.5);
  const titleFontSize = Math.round(Math.min(width, height) * 0.15);
  const infoFontSize = Math.round(titleFontSize * 0.7);
  
  return {
    padding,
    margin,
    titleFontSize,
    infoFontSize
  };
}

/**
 * Retorna estilos específicos baseados no nível hierárquico
 * @param level - Nível hierárquico
 * @returns Estilos do nível { fontWeight, opacity, borderStyle }
 */
export function getHierarchyLevelStyle(level?: number): { 
  fontWeight: string; 
  opacity: number; 
  borderStyle: string;
  shadowIntensity: number;
} {
  if (!level || level <= 1) {
    return {
      fontWeight: 'bold',
      opacity: 1,
      borderStyle: 'solid',
      shadowIntensity: 0.3
    };
  }
  
  if (level === 2) {
    return {
      fontWeight: '600',
      opacity: 0.9,
      borderStyle: 'solid',
      shadowIntensity: 0.2
    };
  }
  
  return {
    fontWeight: '500',
    opacity: 0.8,
    borderStyle: 'dashed',
    shadowIntensity: 0.1
  };
}