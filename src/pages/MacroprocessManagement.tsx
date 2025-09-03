import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
  Building2,
  ArrowLeft
} from 'lucide-react';
import {
  Macroprocesso,
  MacroprocessoFormData,
  ProcessFilters,
  SITUACAO_OPTIONS,
  TIPO_MACROPROCESSO_OPTIONS
} from '../types/process';
import { useProcesses } from '../hooks/useProcesses';
import Layout from '../components/Layout';

const MacroprocessManagement: React.FC = () => {
  const {
    isLoading,
    error,
    macroprocessos,
    fetchMacroprocessos,
    createMacroprocesso,
    updateMacroprocesso,
    deleteMacroprocesso,
    clearError
  } = useProcesses();

  const [showForm, setShowForm] = useState(false);
  const [editingMacroprocesso, setEditingMacroprocesso] = useState<Macroprocesso | null>(null);
  const [filters, setFilters] = useState<ProcessFilters>({
    search: '',
    situacao: 'Todos'
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<MacroprocessoFormData>({
    tipo_macroprocesso: '',
    macroprocesso: '',
    link_macro: '',
    situacao: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchMacroprocessos(filters);
  }, [fetchMacroprocessos, filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (key: keyof ProcessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.tipo_macroprocesso.trim()) {
      errors.tipo_macroprocesso = 'Tipo de macroprocesso é obrigatório';
    }

    if (!formData.macroprocesso.trim()) {
      errors.macroprocesso = 'Nome do macroprocesso é obrigatório';
    }

    if (formData.link_macro && !isValidUrl(formData.link_macro)) {
      errors.link_macro = 'URL inválida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingMacroprocesso) {
        await updateMacroprocesso({
          id: editingMacroprocesso.id,
          ...formData
        });
      } else {
        await createMacroprocesso(formData);
      }

      resetForm();
    } catch (err) {
      console.error('Erro ao salvar macroprocesso:', err);
    }
  };

  const handleEdit = (macroprocesso: Macroprocesso) => {
    setEditingMacroprocesso(macroprocesso);
    setFormData({
      tipo_macroprocesso: macroprocesso.tipo_macroprocesso,
      macroprocesso: macroprocesso.macroprocesso,
      link_macro: macroprocesso.link_macro || '',
      situacao: macroprocesso.situacao
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este macroprocesso?')) {
      await deleteMacroprocesso(id);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_macroprocesso: '',
      macroprocesso: '',
      link_macro: '',
      situacao: 'Ativo'
    });
    setFormErrors({});
    setEditingMacroprocesso(null);
    setShowForm(false);
  };

  const getSituacaoColor = (situacao: string) => {
    return situacao === 'Ativo' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Estratégico': 'text-blue-600 bg-blue-100',
      'Operacional': 'text-green-600 bg-green-100',
      'Suporte': 'text-yellow-600 bg-yellow-100',
      'Gerencial': 'text-purple-600 bg-purple-100'
    };
    return colors[tipo] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/processos"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Gerenciamento de Macroprocessos
              </h1>
              <p className="text-gray-600 mt-1">Gerencie os macroprocessos organizacionais</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Macroprocesso
          </button>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar macroprocessos..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {showFilters && (
              <>
                {/* Situação */}
                <div className="w-full md:w-48">
                  <select
                    value={filters.situacao || 'Todos'}
                    onChange={(e) => handleFilterChange('situacao', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Todos">Todas as Situações</option>
                    {SITUACAO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div className="w-full md:w-48">
                  <select
                    value={filters.tipo_macroprocesso || ''}
                    onChange={(e) => handleFilterChange('tipo_macroprocesso', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {TIPO_MACROPROCESSO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Macroprocesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : macroprocessos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum macroprocesso encontrado
                    </td>
                  </tr>
                ) : (
                  macroprocessos.map((macroprocesso) => (
                    <tr key={macroprocesso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{macroprocesso.macroprocesso}</div>
                          <div className="text-sm text-gray-500">ID: {macroprocesso.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(macroprocesso.tipo_macroprocesso)}`}>
                          {macroprocesso.tipo_macroprocesso}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSituacaoColor(macroprocesso.situacao)}`}>
                          {macroprocesso.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {macroprocesso.total_processos || 0} processo(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {macroprocesso.total_subprocessos || 0} subprocesso(s)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {macroprocesso.link_macro ? (
                          <a
                            href={macroprocesso.link_macro}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(macroprocesso)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(macroprocesso.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingMacroprocesso ? 'Editar' : 'Novo'} Macroprocesso
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Macroprocesso *
                  </label>
                  <select
                    value={formData.tipo_macroprocesso}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_macroprocesso: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione o tipo</option>
                    {TIPO_MACROPROCESSO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.tipo_macroprocesso && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.tipo_macroprocesso}</p>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Macroprocesso *
                  </label>
                  <input
                    type="text"
                    value={formData.macroprocesso}
                    onChange={(e) => setFormData(prev => ({ ...prev, macroprocesso: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite o nome do macroprocesso"
                  />
                  {formErrors.macroprocesso && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.macroprocesso}</p>
                  )}
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.link_macro}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_macro: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://exemplo.com"
                  />
                  {formErrors.link_macro && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.link_macro}</p>
                  )}
                </div>

                {/* Situação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Situação
                  </label>
                  <select
                    value={formData.situacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, situacao: e.target.value as 'Ativo' | 'Inativo' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SITUACAO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {editingMacroprocesso ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MacroprocessManagement;