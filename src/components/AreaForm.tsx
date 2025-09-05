import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { AreaGerencia, AreaGerenciaFormData, ConfigFormErrors } from '../types/config';
import { toast } from 'sonner';

interface AreaFormProps {
  area?: AreaGerencia | null;
  onClose: () => void;
  onSave?: (area: AreaGerencia) => void;
}

const AreaForm: React.FC<AreaFormProps> = ({ area, onClose, onSave }) => {
  const { createArea, updateArea, loading } = useConfig();
  const [formData, setFormData] = useState<AreaGerenciaFormData>({
    gerencia: '',
    diretoria: '',
    sigla_area: '',
    responsavel_area: '',
    descricao: '',
    ativa: true
  });
  const [errors, setErrors] = useState<ConfigFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (area) {
      setFormData({
        gerencia: area.gerencia,
        diretoria: area.diretoria || '',
        sigla_area: area.sigla_area,
        responsavel_area: area.responsavel_area || '',
        descricao: area.descricao || '',
        ativa: area.ativa
      });
    }
  }, [area]);

  const validateForm = (): boolean => {
    const newErrors: ConfigFormErrors = {};

    if (!formData.gerencia.trim()) {
      newErrors.gerencia = 'Nome é obrigatório';
    } else if (formData.gerencia.length < 2) {
      newErrors.gerencia = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.gerencia.length > 100) {
      newErrors.gerencia = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
    }

    if (formData.responsavel_area && formData.responsavel_area.length > 100) {
      newErrors.responsavel_area = 'Responsável deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedArea: AreaGerencia;
      
      if (area?.id) {
        // Editing existing area
        savedArea = await updateArea(area.id, formData);
        toast.success('Área atualizada com sucesso!');
      } else {
        // Creating new area
        savedArea = await createArea(formData);
        toast.success('Área criada com sucesso!');
      }

      onSave?.(savedArea);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar área:', error);
      toast.error('Erro ao salvar área. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AreaGerenciaFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {area ? 'Editar Área' : 'Nova Área'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              id="nome"
              value={formData.gerencia}
              onChange={(e) => handleInputChange('gerencia', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.gerencia ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Digite o nome da área"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.gerencia && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.gerencia}
              </div>
            )}
          </div>

          {/* Diretoria */}
          <div>
            <label htmlFor="diretoria" className="block text-sm font-medium text-gray-700 mb-1">
              Diretoria
            </label>
            <input
              type="text"
              id="diretoria"
              value={formData.diretoria || ''}
              onChange={(e) => handleInputChange('diretoria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Digite a diretoria (opcional)"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                errors.descricao ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva a área (opcional)"
              disabled={isSubmitting}
              maxLength={500}
            />
            {errors.descricao && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.descricao}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {formData.descricao.length}/500 caracteres
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <input
              type="text"
              id="responsavel"
              value={formData.responsavel_area}
              onChange={(e) => handleInputChange('responsavel_area', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.responsavel_area ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Nome do responsável (opcional)"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.responsavel_area && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.responsavel_area}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => handleInputChange('ativa', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-700">Área ativa</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Áreas inativas não aparecerão nas opções de seleção
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {area ? 'Atualizar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaForm;