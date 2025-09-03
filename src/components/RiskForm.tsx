import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CreateRiskInput, UpdateRiskInput } from '../types';

// Schema de validação com Zod
const riskFormSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  classificacao: z.enum(['estrategico', 'operacional', 'financeiro', 'regulatorio', 'reputacional']),
  probabilidade: z.number().min(1, 'Probabilidade deve ser entre 1 e 5').max(5, 'Probabilidade deve ser entre 1 e 5'),
  impacto: z.number().min(1, 'Impacto deve ser entre 1 e 5').max(5, 'Impacto deve ser entre 1 e 5'),
  controles_existentes: z.string().optional(),
  plano_acao: z.string().optional(),
  responsavel: z.string().min(1, 'Responsável é obrigatório'),
  prazo: z.string().min(1, 'Prazo é obrigatório'),
});

type RiskFormData = z.infer<typeof riskFormSchema>;

interface RiskFormProps {
  onSubmit: (data: CreateRiskInput | UpdateRiskInput) => Promise<void>;
  onCancel: () => void;
  risk?: Partial<RiskFormData>;
  isLoading?: boolean;
}

const RiskForm: React.FC<RiskFormProps> = ({
  onSubmit,
  onCancel,
  risk,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RiskFormData>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      titulo: risk?.titulo || '',
      descricao: risk?.descricao || '',
      categoria: risk?.categoria || '',
      classificacao: risk?.classificacao || 'operacional',
      probabilidade: risk?.probabilidade || 1,
      impacto: risk?.impacto || 1,
      responsavel: risk?.responsavel || '',
      prazo: risk?.prazo || '',
      controles_existentes: risk?.controles_existentes || '',
      plano_acao: risk?.plano_acao || ''
    }
  });

  // Observar mudanças em probabilidade e impacto para calcular severidade
  const probabilidade = watch('probabilidade');
  const impacto = watch('impacto');
  const severidade = probabilidade && impacto ? probabilidade * impacto : 0;

  // Função para obter cor da severidade
  const getSeveridadeColor = (value: number) => {
    if (value >= 20) return 'text-red-600 bg-red-50';
    if (value >= 15) return 'text-orange-600 bg-orange-50';
    if (value >= 10) return 'text-yellow-600 bg-yellow-50';
    if (value >= 5) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  // Função para obter texto da severidade
  const getSeveridadeText = (value: number) => {
    if (value >= 20) return 'Crítica';
    if (value >= 15) return 'Alta';
    if (value >= 10) return 'Média';
    if (value >= 5) return 'Baixa';
    return 'Muito Baixa';
  };

  const onFormSubmit: SubmitHandler<RiskFormData> = async (formData) => {
    try {
      // Converter formData para CreateRiskInput | UpdateRiskInput
      const riskData = {
        ...formData,
        prazo: formData.prazo || undefined,
        controles_existentes: formData.controles_existentes || undefined,
        plano_acao: formData.plano_acao || undefined
      };
      
      await onSubmit(riskData);
      toast.success('Risco salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      toast.error('Erro ao salvar risco. Tente novamente.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {risk ? 'Editar Risco' : 'Cadastrar Novo Risco'}
        </h2>
      </div>
      <div className="p-6">


        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
              Título *
            </label>
            <input
              id="titulo"
              type="text"
              {...register('titulo')}
              placeholder="Título do risco"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.titulo ? 'titulo-error' : undefined}
            />
            {errors.titulo && (
              <p id="titulo-error" className="text-sm text-red-600" role="alert">
                {errors.titulo.message}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
              Descrição *
            </label>
            <textarea
              id="descricao"
              {...register('descricao')}
              placeholder="Descreva o risco..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.descricao ? 'descricao-error' : undefined}
            />
            {errors.descricao && (
              <p id="descricao-error" className="text-sm text-red-600" role="alert">
                {errors.descricao.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
              Categoria *
            </label>
            <input
              id="categoria"
              type="text"
              {...register('categoria')}
              placeholder="Categoria do risco"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoria ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.categoria ? 'categoria-error' : undefined}
            />
            {errors.categoria && (
              <p id="categoria-error" className="text-sm text-red-600" role="alert">
                {errors.categoria.message}
              </p>
            )}
          </div>

          {/* Classificação */}
          <div className="space-y-2">
            <label htmlFor="classificacao" className="block text-sm font-medium text-gray-700">
              Classificação *
            </label>
            <select
              id="classificacao"
              {...register('classificacao')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.classificacao ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.classificacao ? 'classificacao-error' : undefined}
            >
              <option value="">Selecione uma classificação</option>
              <option value="estrategico">Estratégico</option>
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
              <option value="regulatorio">Regulatório</option>
              <option value="reputacional">Reputacional</option>
            </select>
            {errors.classificacao && (
              <p className="text-sm text-red-600" role="alert">
                {errors.classificacao.message}
              </p>
            )}
          </div>

          {/* Probabilidade e Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="probabilidade" className="block text-sm font-medium text-gray-700">
                Probabilidade (1-5) *
              </label>
              <input
                id="probabilidade"
                type="number"
                min="1"
                max="5"
                {...register('probabilidade', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center ${
                  errors.probabilidade ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby={errors.probabilidade ? 'probabilidade-error' : undefined}
              />
              {errors.probabilidade && (
                <p id="probabilidade-error" className="text-sm text-red-600" role="alert">
                  {errors.probabilidade.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="impacto" className="block text-sm font-medium text-gray-700">
                Impacto (1-5) *
              </label>
              <input
                id="impacto"
                type="number"
                min="1"
                max="5"
                {...register('impacto', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center ${
                  errors.impacto ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby={errors.impacto ? 'impacto-error' : undefined}
              />
              {errors.impacto && (
                <p id="impacto-error" className="text-sm text-red-600" role="alert">
                  {errors.impacto.message}
                </p>
              )}
            </div>
          </div>

          {/* Severidade Calculada */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Severidade (Calculada Automaticamente)
            </label>
            <div className={`p-4 rounded-lg border-2 ${getSeveridadeColor(severidade)}`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {severidade} - {getSeveridadeText(severidade)}
                </span>
                <span className="text-sm opacity-75">
                  {probabilidade} × {impacto} = {severidade}
                </span>
              </div>
            </div>
          </div>

          {/* Controles Existentes */}
          <div className="space-y-2">
            <label htmlFor="controles_existentes" className="block text-sm font-medium text-gray-700">
              Controles Existentes
            </label>
            <textarea
              id="controles_existentes"
              {...register('controles_existentes')}
              placeholder="Descreva os controles existentes..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.controles_existentes ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.controles_existentes ? 'controles_existentes-error' : undefined}
            />
            {errors.controles_existentes && (
              <p id="controles_existentes-error" className="text-sm text-red-600" role="alert">
                {errors.controles_existentes.message}
              </p>
            )}
          </div>

          {/* Plano de Ação */}
          <div className="space-y-2">
            <label htmlFor="plano_acao" className="block text-sm font-medium text-gray-700">
              Plano de Ação
            </label>
            <textarea
              id="plano_acao"
              {...register('plano_acao')}
              placeholder="Descreva o plano de ação..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.plano_acao ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.plano_acao ? 'plano_acao-error' : undefined}
            />
            {errors.plano_acao && (
              <p id="plano_acao-error" className="text-sm text-red-600" role="alert">
                {errors.plano_acao.message}
              </p>
            )}
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
              Responsável *
            </label>
            <input
              id="responsavel"
              type="text"
              {...register('responsavel')}
              placeholder="Nome do responsável"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.responsavel ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.responsavel ? 'responsavel-error' : undefined}
            />
            {errors.responsavel && (
              <p id="responsavel-error" className="text-sm text-red-600" role="alert">
                {errors.responsavel.message}
              </p>
            )}
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <label htmlFor="prazo" className="block text-sm font-medium text-gray-700">
              Prazo *
            </label>
            <input
              id="prazo"
              type="date"
              {...register('prazo')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.prazo ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={errors.prazo ? 'prazo-error' : undefined}
            />
            {errors.prazo && (
              <p id="prazo-error" className="text-sm text-red-600" role="alert">
                {errors.prazo.message}
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {risk ? 'Atualizar Risco' : 'Cadastrar Risco'}
            </button>
            <button
              type="button"
              onClick={onCancel || (() => window.history.back())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiskForm;