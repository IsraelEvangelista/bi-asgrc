import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Info, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import {
  IndicatorWithHistory,
  CreateIndicatorInput,
  UpdateIndicatorInput,
  CreateIndicatorHistoryInput,
  UpdateIndicatorHistoryInput,
  IndicatorFormData,
  SituacaoIndicador,
  Tolerancia,
  SITUACAO_INDICADOR_OPTIONS,
  TOLERANCIA_OPTIONS,
  TIPO_ACOMPANHAMENTO_OPTIONS,
  getIndicatorStatusColor,
  getToleranceColor
} from '../types';

interface IndicatorFormProps {
  mode: 'create' | 'edit';
}

const IndicatorForm: React.FC<IndicatorFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAlert, setShowAlert] = useState(false);
  
  const [formData, setFormData] = useState<IndicatorFormData>({
    // Dados da tabela dimensão (008)
    id_risco: '',
    responsavel_risco: '',
    indicador_risco: '',
    situacao_indicador: SituacaoIndicador.NAO_INICIADO,
    meta_efetiva: 0,
    tolerancia: Tolerancia.DENTRO_TOLERANCIA,
    limite_tolerancia: '',
    tipo_acompanhamento: 'Percentual',
    apuracao: '',
    // Dados da tabela fato (019)
    justificativa_observacao: '',
    impacto_n_implementacao: '',
    resultado_mes: 0,
    data_apuracao: ''
  });

  // Mock data para edição
  const mockIndicator: IndicatorWithHistory = {
    // Dados da tabela dimensão (008)
    id: '1',
    id_risco: 'RISK-001',
    responsavel_risco: 'João Silva',
    indicador_risco: 'Taxa de Conformidade Regulatória',
    situacao_indicador: SituacaoIndicador.IMPLEMENTADO,
    meta_efetiva: 95,
    tolerancia: Tolerancia.DENTRO_TOLERANCIA,
    limite_tolerancia: '90%',
    tipo_acompanhamento: 'Percentual',
    apuracao: 'Dezembro/2024',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    // Dados da tabela fato (019)
    historico_id: 'hist-1',
    justificativa_observacao: 'Indicador implementado com sucesso após revisão dos processos internos',
    impacto_n_implementacao: 'Baixo impacto - Processos já estão alinhados com as regulamentações',
    resultado_mes: 97.5,
    data_apuracao: '2024-12-01T10:00:00Z',
    historico_created_at: '2024-12-01T10:00:00Z',
    historico_updated_at: '2024-12-01T10:00:00Z'
  };

  const loadIndicator = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    // Aqui será implementada a integração com Supabase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (id === '1') {
      setFormData({
        // Dados da tabela dimensão (008)
        id_risco: mockIndicator.id_risco,
        responsavel_risco: mockIndicator.responsavel_risco,
        indicador_risco: mockIndicator.indicador_risco,
        situacao_indicador: mockIndicator.situacao_indicador,
        meta_efetiva: mockIndicator.meta_efetiva || 0,
        tolerancia: mockIndicator.tolerancia,
        limite_tolerancia: mockIndicator.limite_tolerancia || '',
        tipo_acompanhamento: mockIndicator.tipo_acompanhamento || 'Percentual',
        apuracao: mockIndicator.apuracao || '',
        // Dados da tabela fato (019)
        justificativa_observacao: mockIndicator.justificativa_observacao || '',
        impacto_n_implementacao: mockIndicator.impacto_n_implementacao || '',
        resultado_mes: mockIndicator.resultado_mes || 0,
        data_apuracao: mockIndicator.data_apuracao ? new Date(mockIndicator.data_apuracao).toISOString().split('T')[0] : ''
      });
    }
    
    setLoading(false);
  }, [id, mockIndicator.id_risco, mockIndicator.responsavel_risco, mockIndicator.indicador_risco, mockIndicator.situacao_indicador, mockIndicator.justificativa_observacao, mockIndicator.impacto_n_implementacao, mockIndicator.meta_efetiva, mockIndicator.tolerancia, mockIndicator.limite_tolerancia, mockIndicator.tipo_acompanhamento, mockIndicator.resultado_mes, mockIndicator.data_apuracao, mockIndicator.apuracao]);

  // Fixed: Remove loadIndicator dependency to prevent infinite loops
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadIndicator();
    }
  }, [mode, id]); // Removed loadIndicator dependency to prevent infinite loop

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.id_risco.trim()) {
      newErrors.id_risco = 'ID do Risco é obrigatório';
    }

    if (!formData.responsavel_risco.trim()) {
      newErrors.responsavel_risco = 'Responsável pelo Risco é obrigatório';
    }

    if (!formData.indicador_risco.trim()) {
      newErrors.indicador_risco = 'Nome do Indicador é obrigatório';
    }

    if (!formData.meta_efetiva && formData.meta_efetiva !== 0) {
      newErrors.meta_efetiva = 'Meta Efetiva é obrigatória';
    }

    if (!formData.limite_tolerancia.trim()) {
      newErrors.limite_tolerancia = 'Limite de Tolerância é obrigatório';
    }

    if (!formData.apuracao.trim()) {
      newErrors.apuracao = 'Período de Apuração é obrigatório';
    }

    // Validações específicas
    if (formData.tipo_acompanhamento === 'Percentual') {
      if (formData.resultado_mes < 0 || formData.resultado_mes > 100) {
        newErrors.resultado_mes = 'Para tipo percentual, o resultado deve estar entre 0 e 100';
      }
    }

    // Validação de lógica de negócio
    if (formData.situacao_indicador === SituacaoIndicador.IMPLEMENTADO && formData.resultado_mes === 0) {
      newErrors.resultado_mes = 'Indicadores implementados devem ter um resultado registrado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowAlert(true);
      return;
    }

    setSaving(true);
    setShowAlert(false);

    try {
      // Aqui será implementada a integração com Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === 'create') {
        const newIndicator: CreateIndicatorInput = {
          id_risco: formData.id_risco,
          responsavel_risco: formData.responsavel_risco,
          indicador_risco: formData.indicador_risco,
          situacao_indicador: formData.situacao_indicador,
          meta_efetiva: formData.meta_efetiva,
          tolerancia: formData.tolerancia,
          limite_tolerancia: formData.limite_tolerancia,
          tipo_acompanhamento: formData.tipo_acompanhamento,
          apuracao: formData.apuracao
        };
        console.log('Criando indicador:', newIndicator);
      } else {
        const updateIndicator: UpdateIndicatorInput = {
          id_risco: formData.id_risco,
          responsavel_risco: formData.responsavel_risco,
          indicador_risco: formData.indicador_risco,
          situacao_indicador: formData.situacao_indicador,
          meta_efetiva: formData.meta_efetiva,
          tolerancia: formData.tolerancia,
          limite_tolerancia: formData.limite_tolerancia,
          tipo_acompanhamento: formData.tipo_acompanhamento,
          apuracao: formData.apuracao
        };
        console.log('Atualizando indicador:', updateIndicator);
      }
      
      navigate('/indicadores');
    } catch (error) {
      console.error('Erro ao salvar indicador:', error);
      setErrors({ submit: 'Erro ao salvar indicador. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof IndicatorFormData, value: string | number | SituacaoIndicador | Tolerancia) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getToleranceStatus = () => {
    if (formData.tipo_acompanhamento === 'Percentual' && formData.limite_tolerancia) {
      const limit = parseFloat(formData.limite_tolerancia.replace('%', ''));
      if (!isNaN(limit) && formData.resultado_mes < limit) {
        return Tolerancia.FORA_TOLERANCIA;
      }
    }
    return formData.tolerancia;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/indicadores')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Novo Indicador' : 'Editar Indicador'}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'create' 
                ? 'Cadastre um novo indicador de risco' 
                : 'Atualize as informações do indicador'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {showAlert && Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Corrija os erros abaixo:</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Informações Básicas
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Risco *
                </label>
                <input
                  type="text"
                  value={formData.id_risco}
                  onChange={(e) => handleInputChange('id_risco', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.id_risco ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: RISK-001"
                />
                {errors.id_risco && (
                  <p className="mt-1 text-sm text-red-600">{errors.id_risco}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável pelo Risco *
                </label>
                <input
                  type="text"
                  value={formData.responsavel_risco}
                  onChange={(e) => handleInputChange('responsavel_risco', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.responsavel_risco ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome do responsável"
                />
                {errors.responsavel_risco && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsavel_risco}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Indicador *
                </label>
                <input
                  type="text"
                  value={formData.indicador_risco}
                  onChange={(e) => handleInputChange('indicador_risco', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.indicador_risco ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome do indicador de risco"
                />
                {errors.indicador_risco && (
                  <p className="mt-1 text-sm text-red-600">{errors.indicador_risco}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação do Indicador
                </label>
                <select
                  value={formData.situacao_indicador}
                  onChange={(e) => handleInputChange('situacao_indicador', e.target.value as SituacaoIndicador)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SITUACAO_INDICADOR_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getIndicatorStatusColor(formData.situacao_indicador)
                  }`}>
                    {formData.situacao_indicador}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta e Tolerância */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Meta e Tolerância
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da Meta *
                </label>
                <input
                  type="number"
                  value={formData.meta_efetiva}
                  onChange={(e) => handleInputChange('meta_efetiva', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.meta_efetiva ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 95"
                />
                {errors.meta_efetiva && (
                  <p className="mt-1 text-sm text-red-600">{errors.meta_efetiva}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Acompanhamento
                </label>
                <select
                  value={formData.tipo_acompanhamento}
                  onChange={(e) => handleInputChange('tipo_acompanhamento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TIPO_ACOMPANHAMENTO_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de Tolerância *
                </label>
                <input
                  type="text"
                  value={formData.limite_tolerancia}
                  onChange={(e) => handleInputChange('limite_tolerancia', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.limite_tolerancia ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={formData.tipo_acompanhamento === 'Percentual' ? 'Ex: 90%' : 'Ex: 100'}
                />
                {errors.limite_tolerancia && (
                  <p className="mt-1 text-sm text-red-600">{errors.limite_tolerancia}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status da Tolerância
                </label>
                <select
                  value={formData.tolerancia}
                  onChange={(e) => handleInputChange('tolerancia', e.target.value as Tolerancia)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TOLERANCIA_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    getToleranceColor(getToleranceStatus())
                  }`}>
                    {getToleranceStatus()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultado e Observações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Resultado e Observações
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado do Mês
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.resultado_mes}
                onChange={(e) => handleInputChange('resultado_mes', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.resultado_mes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={formData.tipo_acompanhamento === 'Percentual' ? '0-100' : '0'}
              />
              {errors.resultado_mes && (
                <p className="mt-1 text-sm text-red-600">{errors.resultado_mes}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período de Apuração *
              </label>
              <input
                type="text"
                value={formData.apuracao}
                onChange={(e) => handleInputChange('apuracao', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.apuracao ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Janeiro/2024"
              />
              {errors.apuracao && (
                <p className="mt-1 text-sm text-red-600">{errors.apuracao}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justificativa/Observação
              </label>
              <textarea
                value={formData.justificativa_observacao}
                onChange={(e) => handleInputChange('justificativa_observacao', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observações sobre o indicador"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impacto da Não Implementação
              </label>
              <textarea
                value={formData.impacto_n_implementacao}
                onChange={(e) => handleInputChange('impacto_n_implementacao', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o impacto caso o indicador não seja implementado"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/indicadores"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Criar Indicador' : 'Salvar Alterações'}
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </Layout>
  );
};

export default IndicatorForm;