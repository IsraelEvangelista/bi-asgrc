import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Tree, { TreeNodeDatum, RenderCustomNodeElementFn } from 'react-d3-tree';
import type { HierarchyPointNode } from 'd3-hierarchy';
import { 
  HierarchicalTreeChartProps, 
  TreeChartConfig, 
  NodeDetailsData, 
  TreeState,
  InteractionConfig,
  TooltipConfig 
} from '../types/tree';
import { updateNodeExpansionState } from '../utils/treeDataTransform';
import { 
  getSeverityColor, 
  getNodeSize, 
  normalizeSeverity,
  getNodeDimensions,
  getTextColor,
  getSeverityIcon,
  formatSeverityDisplay,
  getNodeBorderStyle,
  calculateNodeSpacing,
  getHierarchyLevelStyle,
  getGradientId,
  getNodeGradients
} from '../utils/severityUtils';
import styles from './HierarchicalTreeChart.module.css';

// Configuração padrão para o componente de árvore
const defaultConfig: TreeChartConfig = {
  nodeSize: { x: 220, y: 140 },
  separation: { siblings: 1.2, nonSiblings: 2.5 },
  translate: { x: 400, y: 80 },
  zoom: 0.8,
  orientation: 'vertical',
  pathFunc: 'elbow',
  enableLegacyTransitions: true,
  transitionDuration: 600,
  collapsible: true,
  initialDepth: 2,
  zoomable: true,
  scaleExtent: { min: 0.1, max: 3 },
  enableResponsiveLayout: true,
  useCardNodes: true,
  cardPadding: 12,
  cardSpacing: 8,
  enableNodeAnimations: true,
  showSeverityIcons: true,
  textDirection: 'ltr'
};

// Configuração padrão para interatividade
const defaultInteractionConfig: InteractionConfig = {
  enableKeyboardNavigation: true,
  enableMouseWheelZoom: true,
  enableDragPan: true,
  zoomSensitivity: 0.1,
  panSensitivity: 1.0
};

// Configuração padrão para tooltips
const defaultTooltipConfig: TooltipConfig = {
  showDelay: 200,
  hideDelay: 100,
  followMouse: false,
  showNodePath: true,
  maxWidth: 300
};

// As funções getSeverityColor e getNodeSize agora são importadas de severityUtils

const HierarchicalTreeChart: React.FC<HierarchicalTreeChartProps> = ({
  data,
  config = {},
  onNodeClick,
  onNodeMouseOver,
  onNodeMouseOut,
  filters,
  showDetails = true,
  className = '',
  renderCustomNodeElement,
  expandedNodeIds,
  onNodeExpansionChange,
  onZoomChange,
  interactionConfig = {},
  tooltipConfig = {}
}) => {
  const treeContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Refs para gerenciamento de timeouts
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estado interno do componente
  const [treeState, setTreeState] = useState<TreeState>({
    selectedNode: null,
    zoomLevel: config.zoom || defaultConfig.zoom || 0.8,
    centerPosition: config.translate || defaultConfig.translate || { x: 400, y: 100 },
    showTooltip: false,
    tooltipData: null,
    tooltipPosition: { x: 0, y: 0 },
    expandedNodeIds: new Set(expandedNodeIds || []),
    isDragging: false,
    dragStart: null,
    dragOriginCenter: null,
    // Estado para followMouse
    pendingTooltipData: null,
    isFollowingMouse: false
  });

  // Configuração mesclada com padrões
  const mergedConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
    translate: treeState.centerPosition,
    zoom: treeState.zoomLevel
  }), [config, treeState.centerPosition, treeState.zoomLevel]);

  // Configurações de interatividade mescladas
  const mergedInteractionConfig = useMemo(() => ({
    ...defaultInteractionConfig,
    ...interactionConfig
  }), [interactionConfig]);

  // Configurações de tooltip mescladas
  const mergedTooltipConfig = useMemo(() => ({
    ...defaultTooltipConfig,
    ...tooltipConfig
  }), [tooltipConfig]);

  // Sincronizar estado de expansão externo com estado interno
  useEffect(() => {
    if (expandedNodeIds) {
      setTreeState(prev => ({
        ...prev,
        expandedNodeIds: new Set(expandedNodeIds)
      }));
    }
  }, [expandedNodeIds]);

  // Função para renderizar nó customizado
  const renderCustomNode: RenderCustomNodeElementFn = useCallback((rd3tProps) => {
    if (renderCustomNodeElement) {
      return renderCustomNodeElement(rd3tProps);
    }

    const { nodeDatum, toggleNode } = rd3tProps;
    const nodeData = nodeDatum as TreeNodeDatum & { 
      severity?: string | number; 
      totalAcoes?: number;
      percentual?: number;
      nivel?: number;
    };
    
    // Priorizar propriedades diretas, depois attributes
    const severity = nodeData.severity || nodeData.attributes?.severity as (string | number);
    const totalAcoes = nodeData.totalAcoes || (nodeData.attributes?.totalAcoes ? Number(nodeData.attributes.totalAcoes) : 0);
    const percentual = nodeData.percentual || (nodeData.attributes?.percentual ? Number(nodeData.attributes.percentual) : 0);
    const level = nodeData.nivel || (nodeData.attributes?.nivel ? Number(nodeData.attributes.nivel) : 0);
    
    // Cálculos compartilhados para ambos os tipos de nós
    const levelStyle = getHierarchyLevelStyle(level);
    const textColor = getTextColor(severity);
    const nodeBorderStyle = getNodeBorderStyle(severity);
    const isSelected = treeState.selectedNode?.__rd3t?.id === nodeDatum.__rd3t?.id;
    const hasChildren = nodeData.children && nodeData.children.length > 0;
    
    // Escolher entre nós card ou círculos simples
    if (!mergedConfig.useCardNodes) {
      // Renderizar nó simples (círculo)
      const nodeSize = getNodeSize(severity);
      const nodeColor = getSeverityColor(severity);
      
      return (
        <g 
          className={`${styles.customNode} ${!mergedConfig.enableNodeAnimations ? styles['no-animation'] : ''}`}
          style={{
            opacity: levelStyle.opacity
          }}
        >
          <circle
            r={nodeSize}
            fill={nodeColor}
            stroke={nodeBorderStyle.color}
            strokeWidth={nodeBorderStyle.width}
            className={styles.nodeCircle}
          />
          <text
            y={nodeSize + 15}
            className={styles.nodeLabel}
            fill={textColor}
            fontSize={12}
            fontWeight="600"
            textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
          >
            {nodeData.name.length > 12 ? nodeData.name.substring(0, 10) + '...' : nodeData.name}
          </text>
          {hasChildren && (
            <circle
              cx={nodeSize}
              cy={-nodeSize}
              r={4}
              fill={textColor}
              opacity={0.3}
              className={styles.childrenIndicator}
              onClick={(e) => {
                e.stopPropagation();
                if (toggleNode) toggleNode();
              }}
              style={{ cursor: 'pointer' }}
            />
          )}
        </g>
      );
    }

    // Configurações baseadas na severidade e nível (para nós card)
    const nodeDimensions = getNodeDimensions(severity, level);
    const baseSpacing = calculateNodeSpacing(nodeDimensions.width, nodeDimensions.height);
    const spacing = {
      padding: mergedConfig.cardPadding || baseSpacing.padding,
      margin: mergedConfig.cardSpacing || baseSpacing.margin,
      titleFontSize: baseSpacing.titleFontSize,
      infoFontSize: baseSpacing.infoFontSize
    };
    const severityIcon = getSeverityIcon(severity);
    const severityDisplay = formatSeverityDisplay(severity);
    const category = normalizeSeverity(severity);
    
    // IDs únicos para gradientes para prevenir colisões
    const nodeId = nodeDatum.attributes?.nodeId ?? nodeDatum.attributes?.id ?? nodeDatum.__rd3t?.id;
    const gradientId = getGradientId(severity, false, String(nodeId || ''));
    const gradientLightId = getGradientId(severity, true, String(nodeId || ''));
    
    // Posicionamento dos elementos dentro do nó
    const headerHeight = nodeDimensions.height * 0.3;
    const contentHeight = nodeDimensions.height * 0.7;
    
    return (
      <g 
        className={`${styles.customNode} ${styles.nodeCard} ${styles[`nodeCard--${category}`]} ${styles[`nodeCard--level-${level <= 2 ? level : '3plus'}`]} ${isSelected ? styles['nodeCard--selected'] : ''} ${!mergedConfig.enableNodeAnimations ? styles['no-animation'] : ''}`}
        style={{
          opacity: levelStyle.opacity
        }}
      >
        {/* Definições de gradientes para este nó com IDs únicos */}
        <defs dangerouslySetInnerHTML={{ __html: getNodeGradients(severity, String(nodeId || '')) }} />
        {/* Background do nó card */}
        <rect
          x={-nodeDimensions.width / 2}
          y={-nodeDimensions.height / 2}
          width={nodeDimensions.width}
          height={nodeDimensions.height}
          rx={8}
          ry={8}
          className={styles.nodeCardBackground}
          fill={`url(#${gradientId})`}
        />
        
        {/* Container principal do nó card */}
        <rect
          x={-nodeDimensions.width / 2}
          y={-nodeDimensions.height / 2}
          width={nodeDimensions.width}
          height={nodeDimensions.height}
          rx={8}
          ry={8}
          className={styles.nodeCardContainer}
          stroke={nodeBorderStyle.color}
          strokeWidth={isSelected ? nodeBorderStyle.width + 1 : nodeBorderStyle.width}
          strokeDasharray={levelStyle.borderStyle === 'dashed' ? '5,3' : undefined}
          fill={`url(#${gradientId})`}
          style={{
            filter: `drop-shadow(0 ${2 + levelStyle.shadowIntensity * 6}px ${4 + levelStyle.shadowIntensity * 8}px rgba(0, 0, 0, ${0.15 + levelStyle.shadowIntensity * 0.1}))`
          }}
        />
        
        {/* Header do nó */}
        <rect
          x={-nodeDimensions.width / 2}
          y={-nodeDimensions.height / 2}
          width={nodeDimensions.width}
          height={headerHeight}
          rx={8}
          ry={8}
          className={styles.nodeCardHeader}
          fill={`url(#${gradientLightId})`}
        />
        
        {/* Ícone de severidade */}
        {mergedConfig.showSeverityIcons && (
          <g
            className={styles.nodeSeverityIcon}
            transform={`translate(${-nodeDimensions.width / 2 + spacing.padding + 8}, ${-nodeDimensions.height / 2 + headerHeight / 2}) scale(0.8)`}
            style={{
              stroke: textColor
            }}
          >
            {severityIcon}
          </g>
        )}
        
        {/* Título do nó */}
        <text
          x={0}
          y={-nodeDimensions.height / 2 + headerHeight / 2}
          className={styles.nodeCardTitle}
          fill={textColor}
          fontSize={spacing.titleFontSize}
          fontWeight={levelStyle.fontWeight}
          textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
          dominantBaseline="middle"
        >
          {nodeData.name.length > 18 ? nodeData.name.substring(0, 16) + '...' : nodeData.name}
        </text>
        
        {/* Severidade */}
        <text
          x={0}
          y={-nodeDimensions.height / 2 + headerHeight + spacing.padding + spacing.titleFontSize * 0.8}
          className={styles.nodeCardSubtitle}
          fill={textColor}
          fontSize={spacing.infoFontSize}
          fontWeight="600"
          textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
          dominantBaseline="middle"
        >
          {severityDisplay}
        </text>
        
        {/* Total de ações */}
        <text
          x={0}
          y={-nodeDimensions.height / 2 + headerHeight + spacing.padding + spacing.titleFontSize * 1.8}
          className={styles.nodeCardInfo}
          fill={textColor}
          fontSize={spacing.infoFontSize}
          textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
          dominantBaseline="middle"
        >
          {totalAcoes} {totalAcoes === 1 ? 'ação' : 'ações'}
        </text>
        
        {/* Percentual */}
        {percentual > 0 && (
          <text
            x={0}
            y={-nodeDimensions.height / 2 + headerHeight + spacing.padding + spacing.titleFontSize * 2.6}
            className={styles.nodeCardInfo}
            fill={textColor}
            fontSize={spacing.infoFontSize * 0.9}
            textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
            dominantBaseline="middle"
            opacity={0.9}
          >
            {percentual.toFixed(1)}%
          </text>
        )}
        
        {/* Indicador de filhos */}
        {hasChildren && (
          <g
            className={styles.nodeChildrenIndicator}
            transform={`translate(${nodeDimensions.width / 2 - spacing.padding - 6}, ${-nodeDimensions.height / 2 + headerHeight / 2})`}
            onClick={(e) => {
              e.stopPropagation();
              if (toggleNode) toggleNode();
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={6}
              fill={textColor}
              opacity={0.3}
            />
            <text
              x={0}
              y={0}
              textAnchor={mergedConfig.textDirection === 'rtl' ? 'end' : 'middle'}
              dominantBaseline="middle"
              fill={textColor}
              fontSize={10}
              fontWeight="bold"
            >
              {nodeData.children?.length}
            </text>
          </g>
        )}
        
        {/* Badge de seleção */}
        {isSelected && (
          <circle
            cx={nodeDimensions.width / 2 - 8}
            cy={-nodeDimensions.height / 2 + 8}
            r={4}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
        )}
      </g>
    );
  }, [renderCustomNodeElement, treeState.selectedNode, mergedConfig]);

  // Handlers para eventos dos nós
  const handleNodeClick = useCallback((nodeData: HierarchyPointNode<TreeNodeDatum>, evt: React.MouseEvent<SVGGElement>) => {
    setTreeState(prev => ({
      ...prev,
      selectedNode: nodeData.data
    }));

    // Gerenciar estado de expansão
    const nodeId = nodeData.data.attributes?.nodeId ?? nodeData.data.attributes?.id ?? nodeData.data.__rd3t?.id;
    if (nodeId) {
      setTreeState(prev => {
        const newExpandedIds = new Set(prev.expandedNodeIds);
        if (newExpandedIds.has(String(nodeId))) {
          newExpandedIds.delete(String(nodeId));
        } else {
          newExpandedIds.add(String(nodeId));
        }

        // Notificar componente pai sobre mudança de expansão
        if (onNodeExpansionChange) {
          onNodeExpansionChange(Array.from(newExpandedIds));
        }

        return {
          ...prev,
          expandedNodeIds: newExpandedIds
        };
      });
    }
    
    if (onNodeClick) {
      onNodeClick(nodeData.data, evt);
    }
  }, [onNodeClick, onNodeExpansionChange]);

  const handleNodeMouseOver = useCallback((nodeDataPoint: HierarchyPointNode<TreeNodeDatum>, evt: React.MouseEvent<SVGGElement>) => {
    const nodeData = nodeDataPoint.data as TreeNodeDatum & { 
      severity?: string | number; 
      totalAcoes?: number;
      percentual?: number;
    };
    
    // Extrair dados do nó com fallbacks para attributes
    const rawSeverity = nodeData.severity || nodeData.attributes?.severity as (string | number) || 'baixa';
    const totalAcoes = nodeData.totalAcoes || (nodeData.attributes?.totalAcoes ? Number(nodeData.attributes.totalAcoes) : 0);
    const percentual = nodeData.percentual || (nodeData.attributes?.percentual ? Number(nodeData.attributes.percentual) : 0);
    
    // Type guard para severidade
    const isValidSeverity = (value: any): value is ('baixa' | 'media' | 'alta' | 'critica' | number) => {
      return typeof value === 'number' || ['baixa', 'media', 'alta', 'critica'].includes(value);
    };
    
    const tooltipData: NodeDetailsData = {
      name: nodeData.name,
      level: (nodeData as TreeNodeDatum & { depth?: number }).depth || 0,
      severity: isValidSeverity(rawSeverity) ? rawSeverity : 'baixa',
      totalAcoes: totalAcoes,
      percentual: percentual,
      parent: (nodeData as TreeNodeDatum & { parent?: { name: string } }).parent?.name,
      children: nodeData.children?.map((child: TreeNodeDatum) => child.name)
    };

    // Limpar timeouts existentes
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Se followMouse estiver ativado, configurar para seguir mouse
    if (mergedTooltipConfig.followMouse) {
      setTreeState(prev => ({
        ...prev,
        pendingTooltipData: tooltipData,
        isFollowingMouse: true
      }));
    }

    // Configurar timeout para mostrar tooltip com delay
    showTimeoutRef.current = setTimeout(() => {
      let tooltipX = evt.clientX;
      let tooltipY = evt.clientY;

      if (treeContainer.current) {
        const containerRect = treeContainer.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = Math.min(mergedTooltipConfig.maxWidth, 300);
        const tooltipHeight = 200; // Altura estimada
        const margin = 20;
        
        // Ajustar posição X para evitar overflow da viewport
        if (evt.clientX + tooltipWidth + margin > viewportWidth) {
          tooltipX = Math.max(margin, evt.clientX - tooltipWidth - margin);
        } else {
          tooltipX = Math.min(viewportWidth - tooltipWidth - margin, evt.clientX + margin);
        }
        
        // Ajustar posição Y para evitar overflow da viewport
        if (evt.clientY + tooltipHeight + margin > viewportHeight) {
          tooltipY = Math.max(margin, evt.clientY - tooltipHeight - margin);
        } else {
          tooltipY = Math.min(viewportHeight - tooltipHeight - margin, evt.clientY + margin);
        }
        
        // Garantir que o tooltip não saia da área visível
        tooltipX = Math.max(margin, Math.min(tooltipX, viewportWidth - tooltipWidth - margin));
        tooltipY = Math.max(margin, Math.min(tooltipY, viewportHeight - tooltipHeight - margin));
      }
      
      setTreeState(prev => ({
        ...prev,
        showTooltip: showDetails,
        tooltipData,
        tooltipPosition: { x: tooltipX, y: tooltipY },
        isFollowingMouse: mergedTooltipConfig.followMouse
      }));
    }, mergedTooltipConfig.showDelay);

    if (onNodeMouseOver) {
      onNodeMouseOver(nodeDataPoint.data, evt);
    }
  }, [onNodeMouseOver, showDetails, mergedTooltipConfig.maxWidth, mergedTooltipConfig.followMouse, mergedTooltipConfig.showDelay]);

  const handleNodeMouseOut = useCallback((nodeData: HierarchyPointNode<TreeNodeDatum>, evt: React.MouseEvent<SVGGElement>) => {
    // Limpar timeout de show se existir
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Configurar timeout para esconder tooltip com delay
    hideTimeoutRef.current = setTimeout(() => {
      setTreeState(prev => ({
        ...prev,
        showTooltip: false,
        tooltipData: null,
        pendingTooltipData: null,
        isFollowingMouse: false
      }));
    }, mergedTooltipConfig.hideDelay);

    if (onNodeMouseOut) {
      onNodeMouseOut(nodeData.data, evt);
    }
  }, [onNodeMouseOut, mergedTooltipConfig.hideDelay]);

  // Handler para movimento do mouse (followMouse)
  const handleMouseMove = useCallback((evt: React.MouseEvent<HTMLDivElement>) => {
    if (!treeState.isFollowingMouse || !treeState.tooltipData) return;

    let tooltipX = evt.clientX;
    let tooltipY = evt.clientY;

    if (treeContainer.current) {
      const containerRect = treeContainer.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = Math.min(mergedTooltipConfig.maxWidth, 300);
      const tooltipHeight = 200; // Altura estimada
      const margin = 20;
      
      // Ajustar posição X para evitar overflow da viewport
      if (evt.clientX + tooltipWidth + margin > viewportWidth) {
        tooltipX = Math.max(margin, evt.clientX - tooltipWidth - margin);
      } else {
        tooltipX = Math.min(viewportWidth - tooltipWidth - margin, evt.clientX + margin);
      }
      
      // Ajustar posição Y para evitar overflow da viewport
      if (evt.clientY + tooltipHeight + margin > viewportHeight) {
        tooltipY = Math.max(margin, evt.clientY - tooltipHeight - margin);
      } else {
        tooltipY = Math.min(viewportHeight - tooltipHeight - margin, evt.clientY + margin);
      }
      
      // Garantir que o tooltip não saia da área visível
      tooltipX = Math.max(margin, Math.min(tooltipX, viewportWidth - tooltipWidth - margin));
      tooltipY = Math.max(margin, Math.min(tooltipY, viewportHeight - tooltipHeight - margin));
    }

    setTreeState(prev => ({
      ...prev,
      tooltipPosition: { x: tooltipX, y: tooltipY }
    }));
  }, [treeState.isFollowingMouse, treeState.tooltipData, mergedTooltipConfig.maxWidth]);

  // Handler para zoom com mouse wheel
  const handleWheelZoom = useCallback((evt: React.WheelEvent) => {
    if (!mergedInteractionConfig.enableMouseWheelZoom) return;

    evt.preventDefault();
    
    const delta = evt.deltaY > 0 ? -1 : 1;
    const zoomChange = delta * mergedInteractionConfig.zoomSensitivity;
    
    setTreeState(prev => {
      const newZoom = Math.max(
        mergedConfig.scaleExtent?.min || 0.1,
        Math.min(
          mergedConfig.scaleExtent?.max || 3,
          prev.zoomLevel + zoomChange
        )
      );
      
      // Notificar componente pai sobre mudança de zoom
      if (onZoomChange) {
        onZoomChange(newZoom, prev.centerPosition);
      }
      
      return {
        ...prev,
        zoomLevel: newZoom
      };
    });
  }, [mergedInteractionConfig.enableMouseWheelZoom, mergedInteractionConfig.zoomSensitivity, mergedConfig.scaleExtent, onZoomChange]);

  // Handlers para drag pan
  const handlePointerDown = useCallback((evt: React.PointerEvent) => {
    if (!mergedInteractionConfig.enableDragPan) return;
    
    evt.preventDefault();
    setTreeState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: evt.clientX, y: evt.clientY },
      dragOriginCenter: { ...prev.centerPosition }
    }));
  }, [mergedInteractionConfig.enableDragPan]);

  const handlePointerMove = useCallback((evt: React.PointerEvent) => {
    if (!treeState.isDragging || !treeState.dragStart || !treeState.dragOriginCenter) return;

    const deltaX = (evt.clientX - treeState.dragStart.x) * mergedInteractionConfig.panSensitivity;
    const deltaY = (evt.clientY - treeState.dragStart.y) * mergedInteractionConfig.panSensitivity;

    setTreeState(prev => {
      const newPosition = {
        x: prev.dragOriginCenter.x + deltaX,
        y: prev.dragOriginCenter.y + deltaY
      };

      // Notificar componente pai sobre mudança de posição
      if (onZoomChange) {
        onZoomChange(prev.zoomLevel, newPosition);
      }

      return {
        ...prev,
        centerPosition: newPosition,
        dragStart: { x: evt.clientX, y: evt.clientY } // Update dragStart to prevent accumulation
      };
    });
  }, [treeState.isDragging, treeState.dragStart, treeState.dragOriginCenter, mergedInteractionConfig.panSensitivity, onZoomChange]);

  const handlePointerUp = useCallback(() => {
    setTreeState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
      dragOriginCenter: null
    }));
  }, []);

  // Handler para navegação por teclado
  const handleKeyDown = useCallback((evt: React.KeyboardEvent) => {
    if (!mergedInteractionConfig.enableKeyboardNavigation) return;

    const handleZoom = (delta: number) => {
      setTreeState(prev => {
        const newZoom = Math.max(
          mergedConfig.scaleExtent?.min || 0.1,
          Math.min(
            mergedConfig.scaleExtent?.max || 3,
            prev.zoomLevel + delta
          )
        );
        
        if (onZoomChange) {
          onZoomChange(newZoom, prev.centerPosition);
        }
        
        return { ...prev, zoomLevel: newZoom };
      });
    };

    const handlePan = (deltaX: number, deltaY: number) => {
      setTreeState(prev => {
        const newPosition = {
          x: prev.centerPosition.x + deltaX,
          y: prev.centerPosition.y + deltaY
        };

        if (onZoomChange) {
          onZoomChange(prev.zoomLevel, newPosition);
        }

        return {
          ...prev,
          centerPosition: newPosition
        };
      });
    };

    switch (evt.key) {
      case '+':
      case '=':
        handleZoom(0.1);
        break;
      case '-':
      case '_':
        handleZoom(-0.1);
        break;
      case 'r':
      case 'R':
        setTreeState(prev => {
          const resetPosition = defaultConfig.translate || { x: 400, y: 100 };
          const resetZoom = defaultConfig.zoom || 0.8;
          
          if (onZoomChange) {
            onZoomChange(resetZoom, resetPosition);
          }
          
          return {
            ...prev,
            zoomLevel: resetZoom,
            centerPosition: resetPosition
          };
        });
        break;
      case 'ArrowLeft':
        handlePan(-20, 0);
        break;
      case 'ArrowRight':
        handlePan(20, 0);
        break;
      case 'ArrowUp':
        handlePan(0, -20);
        break;
      case 'ArrowDown':
        handlePan(0, 20);
        break;
      default:
        break;
    }
  }, [mergedInteractionConfig.enableKeyboardNavigation, mergedConfig.scaleExtent, onZoomChange]);

  // Atualizar dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (treeContainer.current) {
        const { width, height } = treeContainer.current.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Cleanup de timeouts ao desmontar componente
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Aplicar filtros aos dados (implementação básica) - removido filteredData não usado

  return (
    <div 
      className={`${styles.treeContainer} ${className} ${treeState.isDragging ? styles.dragging : ''}`}
      ref={treeContainer}
      onWheel={handleWheelZoom}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      tabIndex={mergedInteractionConfig.enableKeyboardNavigation ? 0 : undefined}
    >
      {/* Componente Tree principal */}
      <Tree
        data={data}
        dimensions={{ width: dimensions.width, height: dimensions.height }}
        translate={treeState.centerPosition}
        zoom={treeState.zoomLevel}
        nodeSize={mergedConfig.nodeSize}
        separation={mergedConfig.separation}
        orientation={mergedConfig.orientation}
        pathFunc={mergedConfig.pathFunc}
        enableLegacyTransitions={mergedConfig.enableLegacyTransitions}
        transitionDuration={mergedConfig.transitionDuration}
        collapsible={mergedConfig.collapsible}
        initialDepth={mergedConfig.initialDepth}
        zoomable={false} // External control - we handle zoom/pan ourselves
        scaleExtent={mergedConfig.scaleExtent}
        renderCustomNodeElement={renderCustomNode}
        onNodeClick={handleNodeClick}
        onNodeMouseOver={handleNodeMouseOver}
        onNodeMouseOut={handleNodeMouseOut}
      />
      
      {/* Tooltip de detalhes */}
      {treeState.showTooltip && treeState.tooltipData && (
        <div
          className={styles.tooltip}
          style={{
            left: treeState.tooltipPosition.x + 10,
            top: treeState.tooltipPosition.y - 10
          }}
        >
          <div className={styles.tooltipHeader}>
            <h4 className={styles.tooltipTitle}>{treeState.tooltipData.name}</h4>
            <span 
              className={styles.severityBadge}
              style={{ backgroundColor: getSeverityColor(treeState.tooltipData.severity) }}
            >
              {typeof treeState.tooltipData.severity === 'number' 
                ? normalizeSeverity(treeState.tooltipData.severity).toUpperCase()
                : treeState.tooltipData.severity.toString().toUpperCase()}
            </span>
          </div>
          
          <div className={styles.tooltipContent}>
            <p><strong>Nível:</strong> {treeState.tooltipData.level}</p>
            <p><strong>Total de Ações:</strong> {treeState.tooltipData.totalAcoes}</p>
            <p><strong>Percentual:</strong> {treeState.tooltipData.percentual.toFixed(1)}%</p>
            
            {treeState.tooltipData.parent && (
              <p><strong>Pai:</strong> {treeState.tooltipData.parent}</p>
            )}
            
            {treeState.tooltipData.children && treeState.tooltipData.children.length > 0 && (
              <p><strong>Filhos:</strong> {treeState.tooltipData.children.length}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Controles de zoom (opcionais) */}
      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={() => {
            const newZoomLevel = Math.min(treeState.zoomLevel * 1.2, mergedConfig.scaleExtent?.max || 3);
            setTreeState(prev => ({
              ...prev,
              zoomLevel: newZoomLevel
            }));
            onZoomChange?.(newZoomLevel, treeState.centerPosition);
          }}
          title="Zoom In"
        >
          +
        </button>
        
        <button
          className={styles.controlButton}
          onClick={() => {
            const newZoomLevel = Math.max(treeState.zoomLevel * 0.8, mergedConfig.scaleExtent?.min || 0.1);
            setTreeState(prev => ({
              ...prev,
              zoomLevel: newZoomLevel
            }));
            onZoomChange?.(newZoomLevel, treeState.centerPosition);
          }}
          title="Zoom Out"
        >
          -
        </button>
        
        <button
          className={styles.controlButton}
          onClick={() => {
            const newZoomLevel = defaultConfig.zoom || 0.8;
            const newCenterPosition = defaultConfig.translate || { x: 400, y: 100 };
            setTreeState(prev => ({
              ...prev,
              zoomLevel: newZoomLevel,
              centerPosition: newCenterPosition
            }));
            onZoomChange?.(newZoomLevel, newCenterPosition);
          }}
          title="Reset View"
        >
          ↻
        </button>
      </div>
      
      {/* Legenda de severidade */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Severidade:</div>
        <div className={styles.legendItems}>
          {[
            { level: 'baixa', color: getSeverityColor('baixa') },
            { level: 'media', color: getSeverityColor('media') },
            { level: 'alta', color: getSeverityColor('alta') },
            { level: 'critica', color: getSeverityColor('critica') }
          ].map(item => (
            <div key={item.level} className={styles.legendItem}>
              <div 
                className={styles.legendColor} 
                style={{ backgroundColor: item.color }}
              />
              <span className={styles.legendLabel}>
                {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HierarchicalTreeChart;