import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { ReportType, ReportConfig } from '../types/report';

interface ReportPermissions {
  canViewReport: (reportType: ReportType) => boolean;
  canExportReport: (reportType: ReportType) => boolean;
  canViewSensitiveData: () => boolean;
  canViewAllAreas: () => boolean;
  getRestrictedColumns: (reportType: ReportType) => string[];
  filterDataByPermissions: (data: Record<string, unknown>[], reportType: ReportType) => Record<string, unknown>[];
  validateReportAccess: (config: ReportConfig) => { allowed: boolean; reason?: string };
}

// Define which columns contain sensitive data for each report type
const SENSITIVE_COLUMNS: Record<ReportType, string[]> = {
  riscos_matriz: ['responsavel_risco', 'demais_responsaveis'],
  indicadores_performance: ['responsavel_risco', 'justificativa_observacao'],
  acoes_mitigacao: ['area_executora', 'justificativa_observacao'],
  processos_riscos: ['responsavel_processo'],
  dashboard_executivo: [],
  auditoria_completa: ['responsavel', 'justificativa_observacao', 'area_executora']
};

// Define which report types require special permissions
const RESTRICTED_REPORTS: Record<ReportType, string[]> = {
  riscos_matriz: ['gestor_risco', 'auditor_interno'],
  indicadores_performance: ['gestor_risco', 'responsavel_processo', 'auditor_interno'],
  acoes_mitigacao: ['gestor_risco', 'responsavel_processo', 'auditor_interno'],
  processos_riscos: ['gestor_risco', 'auditor_interno'],
  dashboard_executivo: ['gestor_risco', 'auditor_interno'],
  auditoria_completa: ['auditor_interno', 'administrador_sistema']
};

export const useReportPermissions = (): ReportPermissions => {
  const { user, profile } = useAuthStore();

  const userRole = useMemo(() => {
    if (!profile) return null;
    
    // Map profile names to standardized roles
    const profileName = profile.nome.toLowerCase();
    
    if (profileName.includes('gestor') && profileName.includes('risco')) {
      return 'gestor_risco';
    }
    if (profileName.includes('responsavel') && profileName.includes('processo')) {
      return 'responsavel_processo';
    }
    if (profileName.includes('auditor')) {
      return 'auditor_interno';
    }
    if (profileName.includes('administrador')) {
      return 'administrador_sistema';
    }
    
    return 'usuario_basico';
  }, [profile]);

  const userAreaId = useMemo(() => {
    return user?.area_gerencia_id || null;
  }, [user]);

  const canViewReport = (reportType: ReportType): boolean => {
    if (!userRole) return false;
    
    const allowedRoles = RESTRICTED_REPORTS[reportType];
    return allowedRoles.includes(userRole);
  };

  const canExportReport = (reportType: ReportType): boolean => {
    if (!userRole) return false;
    
    // Only certain roles can export sensitive reports
    const sensitiveReports: ReportType[] = ['auditoria_completa', 'dashboard_executivo'];
    
    if (sensitiveReports.includes(reportType)) {
      return ['gestor_risco', 'auditor_interno', 'administrador_sistema'].includes(userRole);
    }
    
    return canViewReport(reportType);
  };

  const canViewSensitiveData = (): boolean => {
    if (!userRole) return false;
    return ['gestor_risco', 'auditor_interno', 'administrador_sistema'].includes(userRole);
  };

  const canViewAllAreas = (): boolean => {
    if (!userRole) return false;
    return ['gestor_risco', 'auditor_interno', 'administrador_sistema'].includes(userRole);
  };

  const getRestrictedColumns = (reportType: ReportType): string[] => {
    if (canViewSensitiveData()) {
      return []; // No restrictions for privileged users
    }
    
    return SENSITIVE_COLUMNS[reportType] || [];
  };

  const filterDataByPermissions = (data: Record<string, unknown>[], reportType: ReportType): Record<string, unknown>[] => {
    if (!data || data.length === 0) return data;
    
    // If user can view all data, return as is
    if (canViewSensitiveData() && canViewAllAreas()) {
      return data;
    }
    
    const restrictedColumns = getRestrictedColumns(reportType);
    
    return data.map(item => {
      const filteredItem = { ...item };
      
      // Remove sensitive columns
      restrictedColumns.forEach(column => {
        if (filteredItem[column]) {
          filteredItem[column] = '[Restrito]';
        }
      });
      
      // Filter by user's area if not privileged
      if (!canViewAllAreas() && userAreaId) {
        // Check if this record belongs to user's area
        const recordAreaFields = ['responsavel_risco', 'responsavel_processo', 'area_executora'];
        const belongsToUserArea = recordAreaFields.some(field => {
          const fieldValue = item[field];
          if (Array.isArray(fieldValue)) {
            return fieldValue.includes(userAreaId);
          }
          return fieldValue === userAreaId;
        });
        
        // If record doesn't belong to user's area, return null (will be filtered out)
        if (!belongsToUserArea) {
          return null;
        }
      }
      
      return filteredItem;
    }).filter(item => item !== null) as Record<string, unknown>[]; // Remove null items and type assertion after filtering
  };

  const validateReportAccess = (config: ReportConfig): { allowed: boolean; reason?: string } => {
    // Check if user can view this report type
    if (!canViewReport(config.type)) {
      return {
        allowed: false,
        reason: 'Você não tem permissão para visualizar este tipo de relatório.'
      };
    }
    
    // Check if user is trying to access data outside their area
    if (!canViewAllAreas() && config.filters.responsaveis?.length) {
      const hasUnauthorizedAreas = config.filters.responsaveis.some(
        areaId => areaId !== userAreaId
      );
      
      if (hasUnauthorizedAreas) {
        return {
          allowed: false,
          reason: 'Você só pode visualizar dados da sua área de responsabilidade.'
        };
      }
    }
    
    // Check if user is trying to include sensitive columns they can't access
    const restrictedColumns = getRestrictedColumns(config.type);
    const hasRestrictedColumns = config.columns.some(
      column => restrictedColumns.includes(column)
    );
    
    if (hasRestrictedColumns && !canViewSensitiveData()) {
      return {
        allowed: false,
        reason: 'Algumas colunas selecionadas contêm dados restritos que você não pode acessar.'
      };
    }
    
    // Check audit report special restrictions
    if (config.type === 'auditoria_completa' && userRole !== 'auditor_interno' && userRole !== 'administrador_sistema') {
      return {
        allowed: false,
        reason: 'Relatórios de auditoria completa são restritos a auditores internos e administradores.'
      };
    }
    
    return { allowed: true };
  };

  return {
    canViewReport,
    canExportReport,
    canViewSensitiveData,
    canViewAllAreas,
    getRestrictedColumns,
    filterDataByPermissions,
    validateReportAccess
  };
};