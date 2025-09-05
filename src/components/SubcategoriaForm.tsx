import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Subcategoria, SubcategoriaFormData, ConfigFormErrors } from '../types/config';
import { toast } from 'sonner';

interface SubcategoriaFormProps {
  subcategoria?: Subcategoria | null;
  onClose: () => void;
  onSave?: (subcategoria: Subcategoria) => void;
}

const SubcategoriaForm: React.FC<SubcategoriaFormProps> = ({ subcategoria, onClose, onSave }) => {
  const { createSubcategoria, updateSubcategoria, loading, naturezas, categorias } = useConfig();
  const [formData, setFormData] = useState<SubcategoriaFormData>({
    id_categoria: '',
    subcategoria: '',
    descricao: '',
    ativa: true
  });
  const [selectedNatureza, setSelectedNatureza] = useState('');
  const [errors, setErrors] = useState<ConfigFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subcategoria) {
      setFormData({
        id_categoria: subcategoria.id_categoria,
        subcategoria: subcategoria.subcategoria,
        descricao: subcategoria.descricao || '',
        ativa: subcategoria.ativa
      });
      
      // Encontrar a natureza da categoria selecionada
      const categoria = categorias.find(c => c.id === subcategoria.id_categoria);
      if (categoria) {
        setSelectedNatureza(categoria.id_natureza);
      }
    }
  }, [subcategoria, categorias]);

  const validateForm = (): boolean => {
    const newErrors: ConfigFormErrors = {};

    if (!selectedNatureza.trim()) {
      newErrors.id_natureza = 'Natureza é obrigatória';
    }

    if (!formData.id_categoria.trim()) {
      newErrors.id_categoria = 'Categoria é obrigatória';
    }

    if (!formData.subcategoria.trim()) {
      newErrors.subcategoria = 'Nome da subcategoria é obrigatório';
    } else if (formData.subcategoria.length < 2) {
      newErrors.subcategoria = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.subcategoria.length > 100) {
      newErrors.subcategoria = 'Nome deve ter no máximo 100 caracteres';
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
      let savedSubcategoria: Subcategoria;
      
      if (subcategoria?.id) {
        // Editing existing subcategoria
        savedSubcategoria = await updateSubcategoria(subcategoria.id, formData);
        toast.success('Subcategoria atualizada com sucesso!');
      } else {
        // Creating new subcategoria
        savedSubcategoria = await createSubcategoria(formData);
        toast.success('Subcategoria criada com sucesso!');
      }

      onSave?.(savedSubcategoria);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      toast.error('Erro ao salvar subcategoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SubcategoriaFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNaturezaChange = (naturezaId: string) => {
    setSelectedNatureza(naturezaId);
    // Limpar categoria selecionada quando natureza muda
    setFormData(prev => ({ ...prev, id_categoria: '' }));
    
    // Clear errors
    if (errors.id_natureza) {
      setErrors(prev => ({ ...prev, id_natureza: undefined }));
    }
    if (errors.id_categoria) {
      setErrors(prev => ({ ...prev, id_categoria: undefined }));
    }
  };

  // Filtrar apenas naturezas ativas
  const naturezasAtivas = naturezas.filter(n => n.ativa);
  
  // Filtrar categorias pela natureza selecionada e apenas ativas
  const categoriasDisponiveis = categorias.filter(c => 
    c.id_natureza === selectedNatureza && c.ativa
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {subcategoria ? 'Editar Subcategoria' : 'Nova Subcategoria'}
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
          {/* Natureza */}
          <div>
            <label htmlFor="natureza" className="block text-sm font-medium text-gray-700 mb-1">
              Natureza *
            </label>
            <select
              id="natureza"
              value={selectedNatureza}
              onChange={(e) => handleNaturezaChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.id_natureza ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecione uma natureza</option>
              {naturezasAtivas.map((natureza) => (
                <option key={natureza.id} value={natureza.id}>
                  {natureza.natureza}
                </option>
              ))}
            </select>
            {errors.id_natureza && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.id_natureza}
              </div>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              id="categoria"
              value={formData.id_categoria}
              onChange={(e) => handleInputChange('id_categoria', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.id_categoria ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting || !selectedNatureza}
            >
              <option value="">
                {selectedNatureza ? 'Selecione uma categoria' : 'Primeiro selecione uma natureza'}
              </option>
              {categoriasDisponiveis.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.categoria}
                </option>
              ))}
            </select>
            {errors.id_categoria && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.id_categoria}
              </div>
            )}
          </div>

          {/* Nome da Subcategoria */}
          <div>
            <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Subcategoria *
            </label>
            <input
              type="text"
              id="subcategoria"
              value={formData.subcategoria}
              onChange={(e) => handleInputChange('subcategoria', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.subcategoria ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Digite o nome da subcategoria"
              disabled={isSubmitting}
              maxLength={100}
            />
            {errors.subcategoria && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.subcategoria}
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
              placeholder="Descreva a subcategoria (opcional)"
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
              <span className="text-sm font-medium text-gray-700">Subcategoria ativa</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Subcategorias inativas não aparecerão nas opções de seleção
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
                  {subcategoria ? 'Atualizar' : 'Criar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoriaForm;