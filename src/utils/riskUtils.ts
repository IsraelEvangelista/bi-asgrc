import { RiskClassification } from '@/types';

/**
 * Converte o valor de classificação para exibição com acentos
 */
export const formatRiskClassification = (classification: RiskClassification): string => {
  const classificationMap: Record<RiskClassification, string> = {
    'estrategico': 'Estratégico',
    'operacional': 'Operacional',
    'financeiro': 'Financeiro',
    'regulatorio': 'Regulatório',
    'reputacional': 'Reputacional'
  };
  
  return classificationMap[classification] || classification;
};

/**
 * Obtém a cor CSS para uma classificação de risco
 */
export const getClassificationColor = (classification: RiskClassification): string => {
  switch (classification) {
    case 'estrategico':
      return 'bg-purple-100 text-purple-800';
    case 'operacional':
      return 'bg-blue-100 text-blue-800';
    case 'financeiro':
      return 'bg-green-100 text-green-800';
    case 'regulatorio':
      return 'bg-yellow-100 text-yellow-800';
    case 'reputacional':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Calcula a severidade do risco
 */
export const calculateSeverity = (probability: number, impact: number): number => {
  return probability * impact;
};

/**
 * Obtém a cor CSS para o nível de severidade
 */
export const getSeverityColor = (severity: number): string => {
  if (severity >= 20) return 'text-red-600 bg-red-50';
  if (severity >= 15) return 'text-orange-600 bg-orange-50';
  if (severity >= 10) return 'text-yellow-600 bg-yellow-50';
  if (severity >= 5) return 'text-blue-600 bg-blue-50';
  return 'text-green-600 bg-green-50';
};

/**
 * Obtém o texto descritivo para o nível de severidade
 */
export const getSeverityText = (severity: number): string => {
  if (severity >= 20) return 'Crítica';
  if (severity >= 15) return 'Alta';
  if (severity >= 10) return 'Média';
  if (severity >= 5) return 'Baixa';
  return 'Muito Baixa';
};