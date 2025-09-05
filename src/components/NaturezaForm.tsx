import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Natureza, NaturezaFormData, ConfigFormErrors } from '../types/config';
import { toast } from 'sonner';

interface NaturezaFormProps {
  natureza?: Natureza | null;
  onClose: () => void;
  onSave?: (natureza: Natureza) => void;
}

const NaturezaForm: React.FC<NaturezaFormProps> = ({ natureza, onClose, onSave }) => {
  const { createNatureza, updateNatureza, loading } = useConfig();
  const [formData, setFormData] = useState<NaturezaFormData>({
    natureza: '',
    descricao: '',
    ativa: true
  });
  const [errors, setErrors] = useState<ConfigFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (natureza) {
      setFormData({
        natureza: natureza.natureza,
        descricao: natureza.descricao || '',
        ativa: natureza.ativa
      });
    }
  }, [natureza]);

  const validateForm = (): boolean => {
    const newErrors: ConfigFormErrors = {};

    if (!formData.natureza.trim()) {
      newErrors.natureza = 'Nome é obrigatório';
    } else if (formData.natureza.length < 2) {
      newErrors.natureza = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.natureza.length > 100) {
      newErrors.natureza = 'Nome deve ter no máximo 100 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
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
      let savedNatureza: Natureza;
      
      if (natureza?.id) {
        // Editing existing natureza
        savedNatureza = await updateNatureza(natureza.id, formData);
        toast.success('Natureza atualizada com sucesso!');
      } else {
        // Creating new natureza
        savedNatureza = await createNatureza(formData);
        toast.success('Natureza criada com sucesso!');
      }

      onSave?.(savedNatureza);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar natureza:', error);
      toast.error('Erro ao salvar natureza. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NaturezaFormData, value: string | boolean) => {
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
            {natureza ? 'Editar Natureza' : 'Nova Natureza'}
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
              value={formData.natureza}
              onChange={(e) => handleInputChange('natureza', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.natureza ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Digite o nome da natureza"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.natureza && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.natureza}
              </div>
            )}
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
              placeholder="Descreva a natureza (opcional)"
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
              <span className="text-sm font-medium text-gray-700">Natureza ativa</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Naturezas inativas não aparecerão nas opções de seleção
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
                  {natureza ? 'Atualizar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NaturezaForm;