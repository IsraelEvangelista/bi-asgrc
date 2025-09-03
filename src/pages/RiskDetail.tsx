import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRisk, useUpdateRisk, useDeleteRisk } from '@/hooks/useRisks';
import { UpdateRiskInput } from '@/types';
import RiskForm from '@/components/RiskForm';
import { toast } from 'sonner';
import { formatRiskClassification, getClassificationColor, getSeverityColor, getSeverityText } from '@/utils/riskUtils';

const RiskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    risk,
    loading: isLoading,
    error
  } = useRisk(id!);

  const updateRiskMutation = useUpdateRisk();
  const deleteRiskMutation = useDeleteRisk();

  // Função para atualizar risco
  const handleUpdate = async (data: UpdateRiskInput) => {
    try {
      const updatedRisk = await updateRiskMutation.updateRisk(risk!.id, data);
      if (!updatedRisk) {
        throw new Error(updateRiskMutation.error || 'Erro ao atualizar risco');
      }
      setIsEditing(false);
      toast.success("Risco atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar risco:", error);
      toast.error("Erro ao atualizar risco. Tente novamente.");
    }
  };

  // Função para excluir risco (soft delete)
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este risco?")) {
      return;
    }

    try {
      const success = await deleteRiskMutation.deleteRisk(risk!.id);
      if (!success) {
        throw new Error(deleteRiskMutation.error || 'Erro ao excluir risco');
      }
      toast.success("Risco excluído com sucesso!");
      navigate("/riscos");
    } catch (error) {
      console.error("Erro ao excluir risco:", error);
      toast.error("Erro ao excluir risco. Tente novamente.");
    }
  };



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Carregando risco...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                Erro ao carregar o risco: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Risco não encontrado.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/riscos')}
          className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes do Risco</h1>
      </div>

      {isEditing ? (
        <RiskForm
          risk={risk}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {risk.eventos_riscos}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClassificationColor(risk.classificacao!)}`}>
                    {formatRiskClassification(risk.classificacao!)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(risk.severidade!)}`}></div>
                    <span className="text-sm font-medium">
                      Severidade: {getSeverityText(risk.severidade!)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteRiskMutation.loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Métricas de Risco */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-blue-900">Probabilidade</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{risk.probabilidade}/5</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-orange-900">Impacto</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{risk.impacto}/5</div>
              </div>
              
              <div className={`p-4 rounded-lg ${getSeverityColor(risk.severidade!)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">Severidade</span>
                </div>
                <div className="text-2xl font-bold">{risk.severidade}/25</div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Responsável:</span>
                <span className="text-gray-900">{risk.responsavel_risco}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700">Criado em:</span>
                <span className="text-gray-900">
                  {new Date(risk.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {risk.updated_at && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">Última atualização:</span>
                  <span className="text-gray-900">
                    {new Date(risk.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDetail;