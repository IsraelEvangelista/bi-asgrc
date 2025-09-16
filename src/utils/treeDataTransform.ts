import { HierarchyNode, TreeNodeData, NodeMetrics } from '../types/tree';
import { mapSeverityToCategory, normalizeSeverity } from './severityUtils';

/**
 * Transforma dados hierárquicos do formato HierarchyNode para TreeNodeData compatível com react-d3-tree
 * @param hierarchyData - Dados hierárquicos no formato original do projeto
 * @returns Dados transformados no formato TreeNodeData
 */
export function transformHierarchyToTreeData(hierarchyData: HierarchyNode): TreeNodeData {
  return mapNodeRecursively(hierarchyData, 0);
}

/**
 * Transforma dados do PortfolioAcoes.tsx para TreeNodeData compatível com react-d3-tree
 * @param portfolioData - Array de dados hierárquicos do PortfolioAcoes.tsx
 * @param rootName - Nome do nó raiz (padrão: "Portfólio de Ações")
 * @param expandedNodeIds - Opcional: Lista de IDs de nós expandidos para aplicar estado específico
 * @returns Dados transformados no formato TreeNodeData com nó raiz único
 */
export function transformPortfolioHierarchyData(
  portfolioData: HierarchyNode[], 
  rootName: string = "Portfólio de Ações",
  expandedNodeIds?: string[]
): TreeNodeData {
  const transformedChildren = portfolioData.map(node => mapPortfolioNodeRecursively(node, 1));
  
  // Calcular métricas agregadas para o nó raiz
  const totalActions = transformedChildren.reduce((sum, child) => sum + (child.totalAcoes || 0), 0);
  const averageSeverity = transformedChildren.length > 0 
    ? transformedChildren.reduce((sum, child) => {
        const severity = typeof child.severity === 'number' 
          ? child.severity 
          : getSeverityNumericValue(child.severity as string);
        return sum + severity;
      }, 0) / transformedChildren.length
    : 0;

  let finalChildren = transformedChildren;
  
  // Aplicar estado de expansão específico se fornecido
  if (expandedNodeIds) {
    finalChildren = updateNodeExpansionState({ 
      name: rootName, 
      children: transformedChildren 
    } as TreeNodeData, new Set(expandedNodeIds)).children || transformedChildren;
  }

  return {
    name: rootName,
    value: totalActions,
    totalAcoes: totalActions,
    percentual: 100,
    nivel: 0,
    severity: mapSeverityToCategory(averageSeverity),
    children: finalChildren,
    attributes: {
      severity: mapSeverityToCategory(averageSeverity),
      totalAcoes: totalActions.toString(),
      percentual: '100.0',
      nivel: '0',
      isRoot: 'true'
    }
  };
}

/**
 * Função auxiliar para obter valor numérico de severidade categórica
 */
function getSeverityNumericValue(severity: string): number {
  switch (severity) {
    case 'critica': return 25;
    case 'alta': return 15;
    case 'media': return 7.5;
    case 'baixa': return 2.5;
    default: return 0;
  }
}

/**
 * Mapeia um nó do Portfolio recursivamente para o formato TreeNodeData
 * @param node - Nó hierárquico do PortfolioAcoes.tsx
 * @param depth - Profundidade atual na árvore (começando em 0)
 * @returns Nó transformado no formato TreeNodeData
 */
function mapPortfolioNodeRecursively(node: HierarchyNode, depth: number): TreeNodeData {
  const severityCategory = mapSeverityToCategory(node.severidade);
  const percentual = calculatePercentual(node.totalAcoes, node.severidade);

  const transformedNode: TreeNodeData = {
    name: node.nome,
    value: node.totalAcoes,
    severity: severityCategory,
    totalAcoes: node.totalAcoes,
    percentual: percentual,
    nivel: depth,
    collapsed: !node.expandido, // Mapear expandido para collapsed do react-d3-tree
    attributes: {
      nodeId: node.id, // Adicionar nodeId para rastreamento
      severity: severityCategory,
      severidadeNumerica: node.severidade.toString(),
      totalAcoes: node.totalAcoes.toString(),
      percentual: percentual.toString(),
      nivel: depth.toString(),
      originalNivel: node.nivel.toString(),
      expandido: node.expandido.toString()
    }
  };

  // Transformar filhos recursivamente se existirem
  if (node.children && node.children.length > 0) {
    transformedNode.children = node.children.map(child => 
      mapPortfolioNodeRecursively(child, depth + 1)
    );
  }

  return transformedNode;
}

/**
 * Calcula percentual baseado em total de ações e severidade
 * @param totalAcoes - Total de ações do nó
 * @param severidade - Severidade numérica do nó
 * @returns Percentual calculado
 */
function calculatePercentual(totalAcoes: number, severidade: number): number {
  // Fórmula simples baseada no peso da severidade
  const severityWeight = severidade / 25; // Normaliza para 0-1
  return Math.min(100, (totalAcoes * severityWeight * 10));
}

/**
 * Mapeia um nó hierárquico recursivamente para o formato TreeNodeData
 * @param node - Nó hierárquico original
 * @param depth - Profundidade atual na árvore (começando em 0)
 * @returns Nó transformado no formato TreeNodeData
 */
function mapNodeRecursively(node: HierarchyNode, depth: number): TreeNodeData {
  const severityCategory = mapSeverityToCategory(node.severidade);
  const percentual = calculatePercentual(node.totalAcoes, node.severidade);

  const transformedNode: TreeNodeData = {
    name: node.nome,
    value: node.totalAcoes,
    severity: severityCategory,
    totalAcoes: node.totalAcoes,
    percentual: percentual,
    nivel: depth,
    attributes: {
      id: node.id,
      nodeId: node.id, // Adicionar nodeId para consistência
      severity: severityCategory,
      severidadeNumerica: node.severidade.toString(),
      totalAcoes: node.totalAcoes.toString(),
      percentual: percentual.toString(),
      nivel: depth.toString(),
      originalNivel: node.nivel.toString(),
      expandido: node.expandido.toString()
    }
  };

  // Transformar filhos recursivamente se existirem
  if (node.children && node.children.length > 0) {
    transformedNode.children = node.children.map(child => 
      mapNodeRecursively(child, depth + 1)
    );
  }

  return transformedNode;
}

/**
 * Mapeia propriedades específicas do nó para compatibilidade com react-d3-tree
 * @param node - Nó original
 * @param additionalAttributes - Atributos adicionais para incluir
 * @returns Nó com propriedades mapeadas
 */
export function mapNodeProperties(
  node: HierarchyNode, 
  additionalAttributes: Record<string, string | number> = {}
): TreeNodeData {
  const severityCategory = mapSeverityToCategory(node.severidade);
  const percentual = calculatePercentual(node.totalAcoes, node.severidade);

  return {
    name: node.nome,
    value: node.totalAcoes,
    severity: severityCategory,
    totalAcoes: node.totalAcoes,
    percentual: percentual,
    nivel: node.nivel,
    attributes: {
      id: node.id,
      nodeId: node.id, // Adicionar nodeId para consistência
      severity: severityCategory,
      severidadeNumerica: node.severidade.toString(),
      totalAcoes: node.totalAcoes.toString(),
      percentual: percentual.toString(),
      nivel: node.nivel.toString(),
      expandido: node.expandido.toString(),
      ...Object.entries(additionalAttributes).reduce((acc, [key, value]) => {
        acc[key] = value.toString();
        return acc;
      }, {} as Record<string, string>)
    }
  };
}

/**
 * Calcula métricas agregadas para um nó e seus descendentes
 * @param node - Nó para calcular métricas
 * @returns Métricas calculadas
 */
export function calculateNodeMetrics(node: TreeNodeData): NodeMetrics {
  const metrics: NodeMetrics = {
    totalDescendants: 0,
    maxDepth: 0,
    averageSeverity: 0,
    totalActions: node.totalAcoes || 0,
    severityDistribution: {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0
    }
  };

  // Contar severidade do nó atual
  if (node.severity) {
    const normalizedSeverity = normalizeSeverity(node.severity);
    metrics.severityDistribution[normalizedSeverity]++;
  }

  // Calcular métricas recursivamente para filhos
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      const childMetrics = calculateNodeMetrics(child);
      
      metrics.totalDescendants += 1 + childMetrics.totalDescendants;
      metrics.maxDepth = Math.max(metrics.maxDepth, 1 + childMetrics.maxDepth);
      metrics.totalActions += childMetrics.totalActions;
      
      // Agregar distribuição de severidade
      Object.keys(metrics.severityDistribution).forEach(severity => {
        const key = severity as keyof typeof metrics.severityDistribution;
        metrics.severityDistribution[key] += childMetrics.severityDistribution[key];
      });
    });
  }

  // Calcular severidade média
  const totalSeverityNodes = Object.values(metrics.severityDistribution).reduce((a, b) => a + b, 0);
  if (totalSeverityNodes > 0) {
    const severityWeights = { baixa: 1, media: 2, alta: 3, critica: 4 };
    const weightedSum = Object.entries(metrics.severityDistribution).reduce((sum, [severity, count]) => {
      const weight = severityWeights[severity as keyof typeof severityWeights];
      return sum + (weight * count);
    }, 0);
    
    metrics.averageSeverity = weightedSum / totalSeverityNodes;
  }

  return metrics;
}

/**
 * Valida a estrutura de dados transformada
 * @param node - Nó raiz da árvore transformada
 * @returns Object com resultado da validação e lista de erros
 */
export function validateTreeStructure(node: TreeNodeData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  function validateNodeRecursively(currentNode: TreeNodeData, path: string = ''): void {
    const nodePath = path ? `${path} -> ${currentNode.name}` : currentNode.name;

    // Validações obrigatórias
    if (!currentNode.name || currentNode.name.trim() === '') {
      errors.push(`Nó em "${nodePath}" não possui nome válido`);
    }

    // Validar severidade (aceitar tanto string categórica quanto numérica)
    if (currentNode.severity !== undefined) {
      if (typeof currentNode.severity === 'string' && 
          !['baixa', 'media', 'alta', 'critica'].includes(currentNode.severity)) {
        errors.push(`Nó "${nodePath}" possui severidade inválida: ${currentNode.severity}`);
      } else if (typeof currentNode.severity === 'number' && 
                 (currentNode.severity < 0 || currentNode.severity > 100)) {
        warnings.push(`Nó "${nodePath}" possui severidade numérica fora do intervalo 0-100: ${currentNode.severity}`);
      }
    }

    if (currentNode.totalAcoes !== undefined && currentNode.totalAcoes < 0) {
      errors.push(`Nó "${nodePath}" possui total de ações negativo: ${currentNode.totalAcoes}`);
    }

    if (currentNode.percentual !== undefined && (currentNode.percentual < 0 || currentNode.percentual > 100)) {
      warnings.push(`Nó "${nodePath}" possui percentual fora do intervalo 0-100: ${currentNode.percentual}`);
    }

    // Validar atributos
    if (currentNode.attributes) {
      if (currentNode.attributes.severity && 
          !['baixa', 'media', 'alta', 'critica'].includes(currentNode.attributes.severity as string)) {
        warnings.push(`Nó "${nodePath}" possui atributo severity inválido: ${currentNode.attributes.severity}`);
      }
    }

    // Validar filhos recursivamente
    if (currentNode.children && currentNode.children.length > 0) {
      currentNode.children.forEach(child => {
        validateNodeRecursively(child, nodePath);
      });
    }
  }

  validateNodeRecursively(node);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Converte array de nós hierárquicos em formato de árvore com nó raiz único
 * @param nodes - Array de nós hierárquicos
 * @param rootName - Nome do nó raiz (padrão: "Hierarquia")
 * @returns Árvore com nó raiz único contendo todos os nós como filhos
 */
export function createRootedTree(nodes: HierarchyNode[], rootName: string = "Hierarquia"): TreeNodeData {
  const transformedChildren = nodes.map(node => transformHierarchyToTreeData(node));
  
  // Calcular métricas agregadas para o nó raiz
  const totalActions = transformedChildren.reduce((sum, child) => sum + (child.totalAcoes || 0), 0);
  const averagePercentual = transformedChildren.length > 0 
    ? transformedChildren.reduce((sum, child) => sum + (child.percentual || 0), 0) / transformedChildren.length
    : 0;

  return {
    name: rootName,
    value: totalActions,
    totalAcoes: totalActions,
    percentual: averagePercentual,
    nivel: 0,
    severity: 'media', // Severidade padrão para o nó raiz
    children: transformedChildren,
    attributes: {
      severity: 'media',
      totalAcoes: totalActions.toString(),
      percentual: averagePercentual.toFixed(1),
      nivel: '0',
      isRoot: 'true'
    }
  };
}

/**
 * Filtra a árvore baseado em critérios específicos
 * @param node - Nó raiz da árvore
 * @param filterFn - Função de filtro que recebe um nó e retorna boolean
 * @returns Nova árvore filtrada
 */
export function filterTreeData(
  node: TreeNodeData, 
  filterFn: (node: TreeNodeData) => boolean
): TreeNodeData | null {
  // Se o nó atual não passa no filtro, verificar se algum descendente passa
  const filteredChildren = node.children
    ?.map(child => filterTreeData(child, filterFn))
    .filter(child => child !== null) as TreeNodeData[] || [];

  // Se o nó passa no filtro ou tem filhos que passam, incluir na árvore filtrada
  if (filterFn(node) || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren.length > 0 ? filteredChildren : undefined
    };
  }

  return null;
}

/**
 * Encontra um nó na árvore pelo nome
 * @param tree - Árvore para buscar
 * @param nodeName - Nome do nó a ser encontrado
 * @returns Nó encontrado ou null se não encontrado
 */
export function findNodeByName(tree: TreeNodeData, nodeName: string): TreeNodeData | null {
  if (tree.name === nodeName) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeByName(child, nodeName);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Converte a árvore para formato plano (lista) para facilitar pesquisas
 * @param tree - Árvore para converter
 * @returns Array com todos os nós em formato plano
 */
export function flattenTree(tree: TreeNodeData): TreeNodeData[] {
  const result: TreeNodeData[] = [tree];

  if (tree.children) {
    tree.children.forEach(child => {
      result.push(...flattenTree(child));
    });
  }

  return result;
}

/**
 * Função principal para criar árvore a partir dos dados do PortfolioAcoes.tsx
 * Combina transformação e validação em uma única chamada
 * @param portfolioData - Array de dados hierárquicos do PortfolioAcoes.tsx
 * @param rootName - Nome do nó raiz (padrão: "Portfólio de Ações")
 * @returns Objeto com árvore transformada e resultado da validação
 */
export function createTreeFromPortfolioData(
  portfolioData: HierarchyNode[], 
  rootName: string = "Portfólio de Ações"
): {
  tree: TreeNodeData;
  validation: { isValid: boolean; errors: string[]; warnings: string[] };
} {
  // Transformar dados
  const tree = transformPortfolioHierarchyData(portfolioData, rootName);
  
  // Validar estrutura
  const validation = validateTreeStructure(tree);
  
  return { tree, validation };
}

/**
 * Função auxiliar para obter informações resumidas da árvore
 * @param tree - Árvore para analisar
 * @returns Informações resumidas da árvore
 */
export function getTreeSummary(tree: TreeNodeData): {
  totalNodes: number;
  totalActions: number;
  maxDepth: number;
  severityDistribution: Record<string, number>;
} {
  const flattened = flattenTree(tree);
  
  const severityDistribution: Record<string, number> = {};
  let totalActions = 0;
  let maxDepth = 0;

  flattened.forEach(node => {
    // Contar ações
    if (node.totalAcoes) {
      totalActions += node.totalAcoes;
    }
    
    // Calcular profundidade máxima
    if (node.nivel !== undefined) {
      maxDepth = Math.max(maxDepth, node.nivel);
    }
    
    // Distribuição de severidade
    const severity = normalizeSeverity(node.severity);
    severityDistribution[severity] = (severityDistribution[severity] || 0) + 1;
  });

  return {
    totalNodes: flattened.length,
    totalActions,
    maxDepth,
    severityDistribution
  };
}

/**
 * Atualiza o estado de expansão de uma árvore TreeNodeData baseado em um Set de IDs expandidos
 * @param tree - Árvore TreeNodeData para atualizar
 * @param expandedNodeIds - Set de IDs de nós que devem estar expandidos
 * @returns Nova árvore com estados de expansão atualizados
 */
export function updateNodeExpansionState(tree: TreeNodeData, expandedNodeIds: Set<string>): TreeNodeData {
  const updateNode = (node: TreeNodeData): TreeNodeData => {
    const nodeId = node.attributes?.nodeId;
    const isExpanded = nodeId ? expandedNodeIds.has(String(nodeId)) : true; // Padrão: expandido se não tiver ID
    
    const updatedNode: TreeNodeData = {
      ...node,
      collapsed: !isExpanded
    };

    // Atualizar filhos recursivamente
    if (node.children && node.children.length > 0) {
      updatedNode.children = node.children.map(child => updateNode(child));
    }

    return updatedNode;
  };

  return updateNode(tree);
}

/**
 * Extrai lista de IDs de nós expandidos de uma árvore TreeNodeData
 * @param tree - Árvore TreeNodeData para analisar
 * @returns Array com IDs de nós expandidos
 */
export function extractExpandedNodeIds(tree: TreeNodeData): string[] {
  const expandedIds: string[] = [];

  const traverseNode = (node: TreeNodeData) => {
    const nodeId = node.attributes?.nodeId;
    if (nodeId && !node.collapsed) {
      expandedIds.push(String(nodeId));
    }

    // Continuar travessia nos filhos
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverseNode(child));
    }
  };

  traverseNode(tree);
  return expandedIds;
}