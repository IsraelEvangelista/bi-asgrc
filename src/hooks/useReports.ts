import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  ReportConfig,
  ReportData,
  ReportType,
  ExportOptions,
  REPORT_COLUMNS
} from '../types/report';
import { useReportPermissions } from './useReportPermissions';

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const {
    canViewReport,
    canExportReport,
    validateReportAccess,
    filterDataByPermissions,
    getRestrictedColumns
  } = useReportPermissions();

  // Generate report data based on configuration
  const generateReport = useCallback(async (config: ReportConfig): Promise<ReportData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate permissions first
      const accessValidation = validateReportAccess(config);
      if (!accessValidation.allowed) {
        throw new Error(accessValidation.reason || 'Acesso negado');
      }
      let data: Record<string, unknown>[] = [];
      let query;

      // Build query based on report type
      switch (config.type) {
        case 'riscos_matriz':
          query = supabase
            .from('006_matriz_riscos')
            .select(`
              id,
              eventos_riscos,
              probabilidade,
              impacto,
              severidade,
              classificacao,
              responsavel_risco,
              created_at,
              updated_at,
              deleted_at
            `);
          break;

        case 'indicadores_performance':
          query = supabase
            .from('008_indicadores')
            .select(`
              id,
              indicador_risco,
              situacao_indicador,
              meta_efetiva,
              tolerancia,
              limite_tolerancia,
              responsavel_risco,
              tipo_acompanhamento,
              apuracao,
              created_at,
              updated_at,
              historico_indicadores(
                id,
                justificativa_observacao,
                impacto_n_implementacao,
                resultado_mes,
                data_apuracao,
                created_at,
                updated_at
              )
            `);
          break;

        case 'acoes_mitigacao':
          query = supabase
            .from('009_acoes')
            .select(`
              id,
              desc_acao,
              area_executora,
              tipo_acao,
              status,
              prazo_implementacao,
              perc_implementacao,
              situacao,
              created_at,
              updated_at
            `);
          break;

        case 'processos_riscos':
          query = supabase
            .from('005_processos')
            .select(`
              id,
              processo,
              macroprocessos:id_macroprocesso(macroprocesso),
              responsavel_processo,
              situacao,
              created_at,
              updated_at
            `);
          break;

        case 'dashboard_executivo': {
          // For dashboard, we need to aggregate data from multiple tables
          const [riscos, indicadores, acoes] = await Promise.all([
            supabase.from('006_matriz_riscos').select('id, severidade').is('deleted_at', null),
            supabase.from('008_indicadores').select('id, tolerancia, meta_efetiva, limite_tolerancia'),
            supabase.from('009_acoes').select('id, status, prazo_implementacao, perc_implementacao')
          ]);

          const totalRiscos = riscos.data?.length || 0;
          const riscosAltos = riscos.data?.filter(r => r.severidade >= 15).length || 0;
          const indicadoresForaTolerancia = indicadores.data?.filter(i => i.tolerancia === 'Fora da Tolerância').length || 0;
          const acoesAtrasadas = acoes.data?.filter(a => {
            const prazo = new Date(a.prazo_implementacao);
            const hoje = new Date();
            return prazo < hoje && a.status !== 'Ações implementadas';
          }).length || 0;
          const percentualImplementacao = acoes.data?.reduce((acc, a) => acc + (a.perc_implementacao || 0), 0) / (acoes.data?.length || 1);

          data = [{
            total_riscos: totalRiscos,
            riscos_altos: riscosAltos,
            indicadores_fora_tolerancia: indicadoresForaTolerancia,
            acoes_atrasadas: acoesAtrasadas,
            percentual_implementacao: Math.round(percentualImplementacao)
          }];
          break;
        }

        case 'auditoria_completa': {
          // Combine data from all tables for audit report
          const [riscosAudit, indicadoresAudit, acoesAudit] = await Promise.all([
            supabase.from('006_matriz_riscos').select('*').is('deleted_at', null),
            supabase.from('008_indicadores').select(`
              id,
              id_risco,
              responsavel_risco,
              indicador_risco,
              situacao_indicador,
              meta_efetiva,
              tolerancia,
              limite_tolerancia,
              tipo_acompanhamento,
              apuracao,
              created_at,
              updated_at
            `),
            supabase.from('009_acoes').select('*')
          ]);

          data = [
            ...(riscosAudit.data?.map(r => ({ ...r, entidade: 'Risco', tipo: 'Matriz de Riscos' })) || []),
            ...(indicadoresAudit.data?.map(i => ({ ...i, entidade: 'Indicador', tipo: 'Indicador de Risco' })) || []),
            ...(acoesAudit.data?.map(a => ({ ...a, entidade: 'Ação', tipo: 'Ação de Mitigação' })) || [])
          ];
          break;
        }

        default:
          throw new Error('Tipo de relatório não suportado');
      }

      // Execute query if not dashboard or audit type
      if (config.type !== 'dashboard_executivo' && config.type !== 'auditoria_completa') {
        if (!query) throw new Error('Query não definida');

        // Apply filters
        if (config.filters.period) {
          const { startDate, endDate } = config.filters.period;
          if (startDate && endDate) {
            query = query.gte('created_at', startDate).lte('created_at', endDate);
          }
        }

        if (config.filters.responsaveis?.length) {
          query = query.in('responsavel_risco', config.filters.responsaveis);
        }

        if (config.filters.severidadeMin !== undefined) {
          query = query.gte('severidade', config.filters.severidadeMin);
        }

        if (config.filters.severidadeMax !== undefined) {
          query = query.lte('severidade', config.filters.severidadeMax);
        }

        // Apply sorting
        if (config.sortBy?.length) {
          config.sortBy.forEach(sort => {
            query = query.order(sort.field, { ascending: sort.direction === 'asc' });
          });
        }

        const { data: queryData, error: queryError } = await query;
        if (queryError) throw queryError;
        data = queryData || [];
      }

      // Apply permission-based data filtering
      data = filterDataByPermissions(data, config.type);

      // Filter columns based on config and permissions
      if (config.columns?.length) {
        const restrictedColumns = getRestrictedColumns(config.type);
        const allowedColumns = config.columns.filter(col => !restrictedColumns.includes(col));
        
        data = data.map(item => {
          const filteredItem: Record<string, unknown> = {};
          allowedColumns.forEach(col => {
            if (Object.prototype.hasOwnProperty.call(item, col)) {
              filteredItem[col] = item[col];
            }
          });
          return filteredItem;
        });
      }

      const reportData: ReportData = {
        config,
        data,
        summary: {
          totalRecords: data.length,
          filteredRecords: data.length,
          generatedAt: new Date().toISOString(),
          generatedBy: 'Sistema' // TODO: Get from auth context
        }
      };

      setReportData(reportData);
      return reportData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      console.error('Report generation error:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [validateReportAccess, filterDataByPermissions, getRestrictedColumns]);

  // Export to CSV
  const exportToCSV = useCallback(async (reportData: ReportData, filename: string) => {
    const { data } = reportData;
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  // Export to Excel (simplified - using CSV format with .xlsx extension)
  const exportToExcel = useCallback(async (reportData: ReportData, filename: string) => {
    // For now, we'll use CSV format but with Excel extension
    // In a real implementation, you'd use a library like xlsx or exceljs
    await exportToCSV(reportData, filename);
    
    // TODO: Implement proper Excel export with formatting
    console.log('Excel export - using CSV format for now');
  }, [exportToCSV]);

  // Export to PDF (simplified - would need a PDF library like jsPDF)
  const exportToPDF = useCallback(async (reportData: ReportData, filename: string) => {
    // This is a simplified implementation
    // In a real app, you'd use jsPDF or similar library
    
    const content = [
      `Relatório: ${reportData.config.name}`,
      `Gerado em: ${new Date(reportData.summary.generatedAt).toLocaleString('pt-BR')}`,
      `Total de registros: ${reportData.summary.totalRecords}`,
      '',
      'Dados:',
      JSON.stringify(reportData.data, null, 2)
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`; // Using .txt for now instead of .pdf
    link.click();
    URL.revokeObjectURL(link.href);

    console.log('PDF export - using text format for now. Implement jsPDF for proper PDF generation.');
  }, []);

  // Export report to different formats
  const exportReport = useCallback(async (reportData: ReportData, options: ExportOptions): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check export permissions
      if (!canExportReport(reportData.config.type)) {
        throw new Error('Você não tem permissão para exportar este tipo de relatório.');
      }
      const filename = options.filename || `relatorio_${reportData.config.type}_${new Date().toISOString().split('T')[0]}`;

      switch (options.format) {
        case 'csv':
          await exportToCSV(reportData, filename);
          break;
        case 'excel':
          await exportToExcel(reportData, filename);
          break;
        case 'pdf':
          await exportToPDF(reportData, filename);
          break;
        default:
          throw new Error('Formato de exportação não suportado');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar relatório';
      console.error('Report export error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [canExportReport, exportToCSV, exportToExcel, exportToPDF]);

  // Get available columns for a report type
  const getAvailableColumns = useCallback((reportType: ReportType) => {
    return REPORT_COLUMNS[reportType] || [];
  }, []);

  // Validate report configuration
  const validateConfig = useCallback((config: Partial<ReportConfig>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!config.name?.trim()) {
      errors.name = 'Nome do relatório é obrigatório';
    }

    if (!config.type) {
      errors.type = 'Tipo de relatório é obrigatório';
    } else {
      // Check if user can view this report type
      if (!canViewReport(config.type)) {
        errors.type = 'Você não tem permissão para este tipo de relatório';
      }
    }

    if (!config.filters?.period?.startDate || !config.filters?.period?.endDate) {
      errors.period = 'Período é obrigatório';
    } else {
      // Validate date range
      const startDate = new Date(config.filters.period.startDate);
      const endDate = new Date(config.filters.period.endDate);
      
      if (startDate > endDate) {
        errors.period = 'Data inicial deve ser anterior à data final';
      }
      
      // Check if date range is not too large (max 2 years)
      const maxRange = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
      if (endDate.getTime() - startDate.getTime() > maxRange) {
        errors.period = 'Período máximo permitido é de 2 anos';
      }
    }

    if (!config.columns?.length) {
      errors.columns = 'Pelo menos uma coluna deve ser selecionada';
    } else if (config.type) {
      // Check if user can access selected columns
      const restrictedColumns = getRestrictedColumns(config.type);
      const hasRestrictedColumns = config.columns.some(col => restrictedColumns.includes(col));
      
      if (hasRestrictedColumns) {
        errors.columns = 'Algumas colunas selecionadas são restritas para seu perfil';
      }
    }

    // Additional validation for full config
    if (config.name && config.type && config.filters && config.columns) {
      const fullConfig = config as ReportConfig;
      const accessValidation = validateReportAccess(fullConfig);
      
      if (!accessValidation.allowed) {
        errors.general = accessValidation.reason || 'Configuração não permitida';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [canViewReport, getRestrictedColumns, validateReportAccess]);

  // Get sample data for preview
  const getSampleData = useCallback(async (reportType: ReportType, limit: number = 5) => {
    try {
      let query;
      
      switch (reportType) {
        case 'riscos_matriz':
          query = supabase
            .from('006_matriz_riscos')
            .select('eventos_riscos, probabilidade, impacto, severidade, classificacao')
            .is('deleted_at', null)
            .limit(limit);
          break;
        case 'indicadores_performance':
          query = supabase
            .from('008_indicadores')
            .select(`
              indicador_risco,
              situacao_indicador,
              meta_efetiva,
              tolerancia,
              limite_tolerancia,
              historico_indicadores(
                resultado_mes,
                data_apuracao
              )
            `)
            .limit(limit);
          break;
        case 'acoes_mitigacao':
          query = supabase
            .from('009_acoes')
            .select('desc_acao, status, prazo_implementacao, perc_implementacao')
            .limit(limit);
          break;
        default:
          return [];
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting sample data:', err);
      return [];
    }
  }, []);

  return {
    isLoading,
    error,
    reportData,
    generateReport,
    exportReport,
    getAvailableColumns,
    validateConfig,
    getSampleData,
    clearError: () => setError(null)
  };
};