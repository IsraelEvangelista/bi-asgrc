import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Target,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';
import {
  Action,
  CreateActionInput,
  UpdateActionInput,
  ActionFormData,
  ActionEvidence,
  ActionEvidenceUpload,
  TipoAcao,
  StatusAcao,
  SituacaoAcao,
  TIPO_ACAO_OPTIONS,
  STATUS_ACAO_OPTIONS,
  SITUACAO_ACAO_OPTIONS,
  isActionOverdue
} from '../types/action';

interface ActionFormProps {
  mode: 'create' | 'edit';
}

// Mock data para demonstração
const mockAction: Action = {
  id: '1',
  id_ref: 'R001',
  desc_acao: 'Implementar controles de acesso ao sistema financeiro',
  area_executora: ['João Silva'],
  acao_transversal: false,
  tipo_acao: TipoAcao.ORIGINAL,
  prazo_implementacao: '2024-03-15',
  status: StatusAcao.EM_IMPLEMENTACAO,
  situacao: SituacaoAcao.NO_PRAZO,
  perc_implementacao: 65,
  justificativa_observacao: 'Aguardando aprovação da diretoria para próxima fase.',
  created_at: '2024-01-10T10:00:00Z',
  updated_at: '2024-01-20T15:30:00Z'
};

const mockEvidences: ActionEvidence[] = [
  {
    id: '1',
    action_id: '1',
    file_name: 'politica_acesso_v1.pdf',
    file_type: 'application/pdf',
    file_size: 2048576,
    file_url: '/uploads/politica_acesso_v1.pdf',
    description: 'Documento com as políticas de acesso definidas',
    uploaded_at: '2024-01-20T10:30:00Z',
    uploaded_by: 'João Silva'
  }
];

const ActionForm: React.FC<ActionFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidences, setEvidences] = useState<ActionEvidence[]>(mode === 'edit' ? mockEvidences : []);
  const [pendingUploads, setPendingUploads] = useState<ActionEvidenceUpload[]>([]);
  
  const [formData, setFormData] = useState<ActionFormData>({
    id_ref: '',
    desc_acao: '',
    area_executora: [],
    acao_transversal: false,
    tipo_acao: TipoAcao.ORIGINAL,
    prazo_implementacao: '',
    novo_prazo: '',
    status: StatusAcao.NAO_INICIADA,
    justificativa_observacao: '',
    impacto_atraso_nao_implementacao: '',
    desc_evidencia: '',
    situacao: SituacaoAcao.NO_PRAZO,
    mitiga_fatores_risco: '',
    url: '',
    perc_implementacao: '0',
    apuracao: ''
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      // Simular carregamento dos dados da ação
      setIsLoading(true);
      setTimeout(() => {
        setFormData({
          id_ref: mockAction.id_ref || '',
          desc_acao: mockAction.desc_acao || '',
          area_executora: mockAction.area_executora || [],
          acao_transversal: mockAction.acao_transversal || false,
          tipo_acao: mockAction.tipo_acao || TipoAcao.ORIGINAL,
          prazo_implementacao: mockAction.prazo_implementacao || '',
          novo_prazo: mockAction.novo_prazo || '',
          status: mockAction.status || StatusAcao.NAO_INICIADA,
          justificativa_observacao: mockAction.justificativa_observacao || '',
          impacto_atraso_nao_implementacao: mockAction.impacto_atraso_nao_implementacao || '',
          desc_evidencia: mockAction.desc_evidencia || '',
          situacao: mockAction.situacao || SituacaoAcao.NO_PRAZO,
          mitiga_fatores_risco: mockAction.mitiga_fatores_risco || '',
          url: mockAction.url || '',
          perc_implementacao: (mockAction.perc_implementacao || 0).toString(),
          apuracao: mockAction.apuracao || ''
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [mode, id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id_ref.trim()) {
      newErrors.id_ref = 'ID do risco é obrigatório';
    }

    if (!formData.desc_acao.trim()) {
      newErrors.desc_acao = 'Descrição da ação é obrigatória';
    } else if (formData.desc_acao.length < 10) {
      newErrors.desc_acao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (formData.area_executora.length === 0) {
      newErrors.area_executora = 'Pelo menos um responsável deve ser selecionado';
    }

    if (!formData.prazo_implementacao) {
      newErrors.prazo_implementacao = 'Prazo de implementação é obrigatório';
    } else {
      const prazoDate = new Date(formData.prazo_implementacao);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (prazoDate < today && mode === 'create') {
        newErrors.prazo_implementacao = 'Prazo não pode ser anterior à data atual';
      }
    }

    const percImplementacao = parseInt(formData.perc_implementacao);
    if (isNaN(percImplementacao) || percImplementacao < 0 || percImplementacao > 100) {
      newErrors.perc_implementacao = 'Percentual deve estar entre 0 e 100';
    }

    // Validação de lógica de negócio
    if (formData.status === StatusAcao.ACOES_IMPLEMENTADAS && percImplementacao < 100) {
      newErrors.perc_implementacao = 'Ação concluída deve ter 100% de implementação';
    }

    if (formData.status === StatusAcao.NAO_INICIADA && percImplementacao > 0) {
      newErrors.perc_implementacao = 'Ação não iniciada deve ter 0% de implementação';
    }

    // Atualizar situação automaticamente baseada no prazo
    const prazoDate = new Date(formData.prazo_implementacao);
    const today = new Date();
    if (prazoDate < today && formData.status !== StatusAcao.ACOES_IMPLEMENTADAS) {
      setFormData(prev => ({ ...prev, situacao: SituacaoAcao.ATRASADO }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === 'create') {
        console.log('Criando nova ação:', formData);
        console.log('Evidências para upload:', pendingUploads);
      } else {
        console.log('Atualizando ação:', { id, ...formData });
        console.log('Evidências para upload:', pendingUploads);
      }
      
      navigate('/acoes');
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ActionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validar tipo e tamanho do arquivo
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`Arquivo ${file.name} é muito grande. Tamanho máximo: 10MB`);
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de arquivo ${file.name} não permitido`);
        return;
      }

      const newUpload: ActionEvidenceUpload = {
        action_id: id || '',
        file,
        description: ''
      };

      setPendingUploads(prev => [...prev, newUpload]);
    });

    // Limpar o input
    e.target.value = '';
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads(prev => {
      const newUploads = [...prev];
      // Remove preview URL if it exists (not part of the interface but may be added dynamically)
      const upload = newUploads[index] as any;
      if (upload.preview_url) {
        URL.revokeObjectURL(upload.preview_url);
      }
      newUploads.splice(index, 1);
      return newUploads;
    });
  };

  const updateUploadDescription = (index: number, description: string) => {
    setPendingUploads(prev => {
      const newUploads = [...prev];
      newUploads[index].description = description;
      return newUploads;
    });
  };

  const removeExistingEvidence = (evidenceId: string) => {
    setEvidences(prev => prev.filter(e => e.id !== evidenceId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/acoes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nova Ação' : 'Editar Ação'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Cadastre uma nova ação de mitigação de risco'
              : 'Atualize as informações da ação de mitigação'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Risco *
              </label>
              <input
                type="text"
                value={formData.id_ref}
                onChange={(e) => handleInputChange('id_ref', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.id_ref ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: R001"
              />
              {errors.id_ref && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.id_ref}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ação *
              </label>
              <select
                value={formData.tipo_acao}
                onChange={(e) => handleInputChange('tipo_acao', e.target.value as TipoAcao)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIPO_ACAO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Ação *
            </label>
            <textarea
              value={formData.desc_acao}
              onChange={(e) => handleInputChange('desc_acao', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.desc_acao ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva detalhadamente a ação a ser implementada..."
            />
            {errors.desc_acao && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.desc_acao}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área Executora *
              </label>
              <input
                type="text"
                value={formData.area_executora.join(', ')}
                onChange={(e) => handleInputChange('area_executora', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.area_executora ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nome dos responsáveis (separados por vírgula)"
              />
              {errors.area_executora && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.area_executora}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Implementação *
              </label>
              <input
                type="date"
                value={formData.prazo_implementacao}
                onChange={(e) => handleInputChange('prazo_implementacao', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.prazo_implementacao ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.prazo_implementacao && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.prazo_implementacao}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status e Progresso */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status e Progresso
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da Ação
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as StatusAcao)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_ACAO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situação da Ação
              </label>
              <select
                value={formData.situacao}
                onChange={(e) => handleInputChange('situacao', e.target.value as SituacaoAcao)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SITUACAO_ACAO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentual de Implementação (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.perc_implementacao}
                onChange={(e) => handleInputChange('perc_implementacao', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.perc_implementacao ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.perc_implementacao && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.perc_implementacao}
                </p>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso</span>
              <span className="text-sm text-gray-600">{formData.perc_implementacao}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${formData.perc_implementacao}%` }}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Observações
          </h2>
          
          <textarea
            value={formData.justificativa_observacao}
            onChange={(e) => handleInputChange('justificativa_observacao', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Adicione observações, comentários ou informações adicionais sobre a ação..."
          />
        </div>

        {/* Evidências */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Evidências e Documentos
            </h2>
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Adicionar Arquivos
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
            </label>
          </div>

          {/* Evidências Existentes */}
          {mode === 'edit' && evidences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Evidências Existentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidences.map((evidence) => (
                  <div key={evidence.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {evidence.file_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(evidence.file_size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingEvidence(evidence.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {evidence.description && (
                      <p className="text-sm text-gray-700">{evidence.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Novos Uploads */}
          {pendingUploads.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Novos Arquivos</h3>
              <div className="space-y-4">
                {pendingUploads.map((upload, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{upload.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(upload.file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingUpload(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={upload.description || ''}
                        onChange={(e) => updateUploadDescription(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva o conteúdo do arquivo..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {evidences.length === 0 && pendingUploads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma evidência anexada</p>
              <p className="text-sm">Clique em "Adicionar Arquivos" para anexar documentos</p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/acoes"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Criar Ação' : 'Salvar Alterações'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActionForm;