import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateRisk } from '@/hooks/useRisks';
import { RiskFormData } from '@/types';
import RiskForm from '@/components/RiskForm';
import { toast } from 'sonner';

const RiskFormPage: React.FC = () => {
  const navigate = useNavigate();
  const createRiskMutation = useCreateRisk();

  const handleSubmit = async (data: RiskFormData) => {
    try {
      const newRisk = await createRiskMutation.createRisk(data);
      if (!newRisk) {
        throw new Error(createRiskMutation.error || 'Erro ao criar risco');
      }
      toast.success('Risco cadastrado com sucesso!');
      navigate('/riscos');
    } catch (error) {
      console.error('Erro ao cadastrar risco:', error);
      toast.error('Erro ao cadastrar risco. Tente novamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/riscos')}
          className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Novo Risco</h1>
      </div>

      <RiskForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/riscos')}
      />
    </div>
  );
};

export default RiskFormPage;