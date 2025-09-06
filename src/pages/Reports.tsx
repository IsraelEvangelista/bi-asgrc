import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Settings,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';
import {
  ReportConfig,
  ReportType,
  ReportFilters,
  ReportWizardState,
  ExportOptions,
  ReportFormat,
  FilterPeriod,
  DEFAULT_TEMPLATES
} from '../types/report';
import { useReports } from '../hooks/useReports';
import Layout from '../components/Layout';

const REPORT_TYPES: { value: ReportType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'dashboard_executivo',
    label: 'Dashboard Executivo',
    description: 'Resumo executivo com principais KPIs e métricas de risco',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    value: 'riscos_matriz',
    label: 'Matriz de Riscos',
    description: 'Relatório detalhado da matriz de riscos organizacionais',
    icon: <FileText className="w-5 h-5" />
  },
  {
    value: 'indicadores_performance',
    label: 'Indicadores de Performance',
    description: 'Análise de performance dos indicadores de risco',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    value: 'acoes_mitigacao',
    label: 'Ações de Mitigação',
    description: 'Status e progresso das ações de mitigação de riscos',
    icon: <CheckCircle className="w-5 h-5" />
  },
  {
    value: 'processos_riscos',
    label: 'Processos e Riscos',
    description: 'Mapeamento de riscos por processos organizacionais',
    icon: <Settings className="w-5 h-5" />
  },
  {
    value: 'auditoria_completa',
    label: 'Auditoria Completa',
    description: 'Relatório completo para auditoria interna e externa',
    icon: <FileSpreadsheet className="w-5 h-5" />
  }
];

const EXPORT_FORMATS: { value: ReportFormat; label: string; icon: React.ReactNode }[] = [
  { value: 'pdf', label: 'PDF', icon: <FileImage className="w-4 h-4" /> },
  { value: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { value: 'csv', label: 'CSV', icon: <FileText className="w-4 h-4" /> }
];

const Reports: React.FC = () => {
  const {
    isLoading,
    error,
    reportData,
    generateReport,
    exportReport,
    getAvailableColumns,
    clearError
  } = useReports();

  const [wizardState, setWizardState] = useState<ReportWizardState>({
    currentStep: 1,
    steps: [
      { id: 1, title: 'Tipo de Relatório', description: 'Selecione o tipo de relatório', component: 'type', isValid: false, isCompleted: false },
      { id: 2, title: 'Configurações', description: 'Configure filtros e parâmetros', component: 'config', isValid: false, isCompleted: false },
      { id: 3, title: 'Colunas', description: 'Selecione as colunas a incluir', component: 'columns', isValid: false, isCompleted: false },
      { id: 4, title: 'Preview', description: 'Visualize o relatório', component: 'preview', isValid: false, isCompleted: false },
      { id: 5, title: 'Exportar', description: 'Exporte o relatório', component: 'export', isValid: false, isCompleted: false }
    ],
    config: {
      name: '',
      type: undefined,
      filters: {
        period: {
          startDate: '',
          endDate: '',
          preset: 'last_month'
        }
      },
      columns: []
    },
    isGenerating: false,
    errors: {}
  });


  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    pageOrientation: 'portrait',
    pageSize: 'A4'
  });

  // Update step validation - Fixed to prevent infinite loops
  useEffect(() => {
    const updatedSteps = wizardState.steps.map(step => {
      switch (step.id) {
        case 1: // Type selection
          return { ...step, isValid: !!wizardState.config.type, isCompleted: !!wizardState.config.type };
        case 2: // Configuration
          return {
            ...step,
            isValid: !!(wizardState.config.name && wizardState.config.filters?.period?.startDate && wizardState.config.filters?.period?.endDate),
            isCompleted: !!(wizardState.config.name && wizardState.config.filters?.period?.startDate && wizardState.config.filters?.period?.endDate)
          };
        case 3: // Columns
          return { ...step, isValid: (wizardState.config.columns?.length || 0) > 0, isCompleted: (wizardState.config.columns?.length || 0) > 0 };
        case 4: // Preview
          return { ...step, isValid: !!reportData, isCompleted: !!reportData };
        case 5: // Export
          return { ...step, isValid: true, isCompleted: false };
        default:
          return step;
      }
    });

    setWizardState(prev => ({ ...prev, steps: updatedSteps }));
  }, [
    wizardState.config.type,
    wizardState.config.name,
    wizardState.config.filters?.period?.startDate,
    wizardState.config.filters?.period?.endDate,
    wizardState.config.columns?.length,
    reportData
  ]);

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setWizardState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const nextStep = () => {
    if (wizardState.currentStep < wizardState.steps.length) {
      setWizardState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (wizardState.currentStep > 1) {
      setWizardState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const goToStep = (stepId: number) => {
    setWizardState(prev => ({ ...prev, currentStep: stepId }));
  };

  const handleGenerateReport = async () => {
    if (!wizardState.config.type || !wizardState.config.name) return;

    const fullConfig: ReportConfig = {
      ...wizardState.config as ReportConfig,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setWizardState(prev => ({ ...prev, isGenerating: true }));
    await generateReport(fullConfig);
    setWizardState(prev => ({ ...prev, isGenerating: false }));
    nextStep();
  };

  const handleExport = async () => {
    if (!reportData) return;
    await exportReport(reportData, exportOptions);
  };

  const applyTemplate = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    updateConfig({
      name: template.name,
      type: template.type,
      filters: template.defaultFilters as ReportFilters,
      columns: template.defaultColumns
    });
  };

  const renderStepContent = () => {
    const currentStepData = wizardState.steps.find(s => s.id === wizardState.currentStep);
    if (!currentStepData) return null;

    switch (currentStepData.component) {
      case 'type':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione o Tipo de Relatório</h3>
              <p className="text-gray-600 mb-6">Escolha o tipo de relatório que melhor atende às suas necessidades.</p>
            </div>

            {/* Templates */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 mb-4">Templates Pré-definidos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEFAULT_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Report Types */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Ou Crie um Relatório Personalizado</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map(type => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      wizardState.config.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => updateConfig({ type: type.value })}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        wizardState.config.type === type.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.icon}
                      </div>
                      <h4 className="font-medium text-gray-900">{type.label}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurações do Relatório</h3>
              <p className="text-gray-600 mb-6">Configure os parâmetros e filtros para o seu relatório.</p>
            </div>

            {/* Report Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Relatório</label>
              <input
                type="text"
                value={wizardState.config.name || ''}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o nome do relatório"
              />
            </div>

            {/* Period Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
                <input
                  type="date"
                  value={wizardState.config.filters?.period?.startDate || ''}
                  onChange={(e) => updateConfig({
                    filters: {
                      ...wizardState.config.filters,
                      period: {
                        ...wizardState.config.filters?.period,
                        startDate: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
                <input
                  type="date"
                  value={wizardState.config.filters?.period?.endDate || ''}
                  onChange={(e) => updateConfig({
                    filters: {
                      ...wizardState.config.filters,
                      period: {
                        ...wizardState.config.filters?.period,
                        endDate: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Period Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Períodos Pré-definidos</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'last_month', label: 'Último Mês' },
                  { value: 'last_quarter', label: 'Último Trimestre' },
                  { value: 'last_year', label: 'Último Ano' },
                  { value: 'ytd', label: 'Ano Atual' }
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      const today = new Date();
                      let startDate = new Date();
                      
                      switch (preset.value) {
                        case 'last_month':
                          startDate.setMonth(today.getMonth() - 1);
                          break;
                        case 'last_quarter':
                          startDate.setMonth(today.getMonth() - 3);
                          break;
                        case 'last_year':
                          startDate.setFullYear(today.getFullYear() - 1);
                          break;
                        case 'ytd':
                          startDate = new Date(today.getFullYear(), 0, 1);
                          break;
                      }
                      
                      updateConfig({
                        filters: {
                          ...wizardState.config.filters,
                          period: {
                            startDate: startDate.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0],
                            preset: preset.value as FilterPeriod['preset']
                          }
                        }
                      });
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      wizardState.config.filters?.period?.preset === preset.value
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'columns': {
        const availableColumns = wizardState.config.type ? getAvailableColumns(wizardState.config.type) : [];
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecionar Colunas</h3>
              <p className="text-gray-600 mb-6">Escolha as colunas que deseja incluir no relatório.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableColumns.map(column => (
                <label key={column.key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={wizardState.config.columns?.includes(column.key) || false}
                    onChange={(e) => {
                      const currentColumns = wizardState.config.columns || [];
                      const newColumns = e.target.checked
                        ? [...currentColumns, column.key]
                        : currentColumns.filter(col => col !== column.key);
                      updateConfig({ columns: newColumns });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{column.label}</div>
                    <div className="text-sm text-gray-500">Tipo: {column.type}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Quick Select Options */}
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig({ columns: availableColumns.map(col => col.key) })}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Selecionar Todas
              </button>
              <button
                onClick={() => updateConfig({ columns: [] })}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
        );
      }

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview do Relatório</h3>
              <p className="text-gray-600 mb-6">Visualize como ficará o seu relatório antes de exportar.</p>
            </div>

            {wizardState.isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Gerando relatório...</span>
              </div>
            ) : reportData ? (
              <div className="space-y-4">
                {/* Report Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resumo do Relatório</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total de Registros:</span>
                      <div className="font-medium">{reportData.summary.totalRecords}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gerado em:</span>
                      <div className="font-medium">{new Date(reportData.summary.generatedAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo:</span>
                      <div className="font-medium">{REPORT_TYPES.find(t => t.value === reportData.config.type)?.label}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Colunas:</span>
                      <div className="font-medium">{reportData.config.columns.length}</div>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Dados (Primeiros 5 registros)</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {reportData.config.columns.map(column => (
                            <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {getAvailableColumns(reportData.config.type).find(col => col.key === column)?.label || column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.data.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {reportData.config.columns.map(column => (
                              <td key={column} className="px-4 py-2 text-sm text-gray-900">
                                {Array.isArray(row[column]) ? row[column].join(', ') : String(row[column] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Regenerar Relatório
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Clique no botão abaixo para gerar o preview do relatório</p>
                <button
                  onClick={handleGenerateReport}
                  disabled={!wizardState.steps.find(s => s.id === 3)?.isValid}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Gerar Preview
                </button>
              </div>
            )}
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Relatório</h3>
              <p className="text-gray-600 mb-6">Escolha o formato de exportação e configure as opções.</p>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Formato de Exportação</label>
              <div className="grid grid-cols-3 gap-4">
                {EXPORT_FORMATS.map(format => (
                  <div
                    key={format.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      exportOptions.format === format.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        exportOptions.format === format.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {format.icon}
                      </div>
                      <span className="font-medium text-gray-900">{format.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Arquivo</label>
                <input
                  type="text"
                  value={exportOptions.filename || ''}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`relatorio_${wizardState.config.type}_${new Date().toISOString().split('T')[0]}`}
                />
              </div>

              {exportOptions.format === 'pdf' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Orientação</label>
                    <select
                      value={exportOptions.pageOrientation}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, pageOrientation: e.target.value as 'portrait' | 'landscape' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="portrait">Retrato</option>
                      <option value="landscape">Paisagem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho da Página</label>
                    <select
                      value={exportOptions.pageSize}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, pageSize: e.target.value as 'A4' | 'A3' | 'Letter' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Letter">Carta</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={exportOptions.includeCharts || false}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeCharts" className="text-sm font-medium text-gray-700">
                  Incluir gráficos (quando disponível)
                </label>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={!reportData || isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {isLoading ? 'Exportando...' : 'Exportar Relatório'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerador de Relatórios</h1>
            <p className="text-gray-600 mt-1">Crie relatórios personalizados para análise e apresentação</p>
          </div>
          <Link
            to="/riscos"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Erro</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">Etapas</h3>
              <div className="space-y-2">
                {wizardState.steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      wizardState.currentStep === step.id
                        ? 'bg-blue-50 border border-blue-200'
                        : step.isCompleted
                        ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => goToStep(step.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      wizardState.currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : step.isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.isCompleted ? <CheckCircle className="w-4 h-4" /> : step.id}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        wizardState.currentStep === step.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={wizardState.currentStep === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <button
                  onClick={nextStep}
                  disabled={wizardState.currentStep === wizardState.steps.length || !wizardState.steps.find(s => s.id === wizardState.currentStep)?.isValid}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;