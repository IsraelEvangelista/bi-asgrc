import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  AlertCircle,
  Settings,
  ArrowLeft,
  Building
} from 'lucide-react';
import {
  Processo,
  ProcessoFormData,
  ProcessFilters,
  SITUACAO_OPTIONS
} from '../types/process';
import { useProcesses } from '../hooks/useProcesses';
import Layout from '../components/Layout';

const ProcessManagement: React.FC = () => {
  const {
    isLoading,
    error,
    processos,
    macroprocessos,
    fetchProcessos,
    fetchMacroprocessos,
    createProcesso,
    updateProcesso,
    deleteProcesso,
    clearError
  } = useProcesses();

  const [showForm, setShowForm] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [filters, setFilters] = useState<ProcessFilters>({
    search: '',
    situacao: 'Todos'
  });
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<ProcessoFormData>({
    id_macro: '',
    processo: '',
    responsavel_processo: '',
    situacao: 'Ativo'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProcessos(filters);
    fetchMacroprocessos(); // Para popular o select de macroprocessos
  }, [fetchProcessos, fetchMacroprocessos, filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (key: keyof ProcessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.id_macro) {
      errors.id_macro = 'Macroprocesso é obrigatório';
    }

    if (!formData.processo.trim()) {
      errors.processo = 'Nome do processo é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingProcesso) {
        await updateProcesso({
          id: editingProcesso.id,
          ...formData
        });
      } else {
        await createProcesso(formData);
      }

      resetForm();
    } catch (err) {
      console.error('Erro ao salvar processo:', err);
    }
  };

  const handleEdit = (processo: Processo) => {
    setEditingProcesso(processo);
    setFormData({
      id_macro: processo.id_macro,
      processo: processo.processo,
      responsavel_processo: processo.responsavel_processo || '',
      situacao: processo.situacao
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este processo?')) {
      await deleteProcesso(id);
    }
  };

  const resetForm = () => {
    setFormData({
      id_macro: '',
      processo: '',
      responsavel_processo: '',
      situacao: 'Ativo'
    });
    setFormErrors({});
    setEditingProcesso(null);
    setShowForm(false);
  };

  const getSituacaoColor = (situacao: string) => {
    return situacao === 'Ativo' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getMacroprocessoName = (id: string) => {
    const macro = macroprocessos.find(m => m.id === id);
    return macro ? macro.macroprocesso : 'N/A';
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
                <Settings className="w-6 h-6" />
                Gerenciamento de Processos
              </h1>
              <p className="text-gray-600 mt-1">Gerencie os processos organizacionais</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Processo
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
                  placeholder="Buscar processos..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {showFilters && (
              <>
                {/* Macroprocesso */}
                <div className="w-full md:w-64">
                  <select
                    value={filters.macroprocesso_id || ''}
                    onChange={(e) => handleFilterChange('macroprocesso_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os Macroprocessos</option>
                    {macroprocessos.map(macro => (
                      <option key={macro.id} value={macro.id}>
                        {macro.macroprocesso}
                      </option>
                    ))}
                  </select>
                </div>

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
                    Processo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Macroprocesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : processos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum processo encontrado
                    </td>
                  </tr>
                ) : (
                  processos.map((processo) => (
                    <tr key={processo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{processo.processo}</div>
                          <div className="text-sm text-gray-500">ID: {processo.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {processo.macroprocesso?.macroprocesso || getMacroprocessoName(processo.id_macro)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {processo.macroprocesso?.tipo_macroprocesso}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {processo.responsavel_processo || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSituacaoColor(processo.situacao)}`}>
                          {processo.situacao}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(processo)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(processo.id)}
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
                {editingProcesso ? 'Editar' : 'Novo'} Processo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Macroprocesso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Macroprocesso *
                  </label>
                  <select
                    value={formData.id_macro}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_macro: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione o macroprocesso</option>
                    {macroprocessos.filter(m => m.situacao === 'Ativo').map(macro => (
                      <option key={macro.id} value={macro.id}>
                        {macro.macroprocesso} ({macro.tipo_macroprocesso})
                      </option>
                    ))}
                  </select>
                  {formErrors.id_macro && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.id_macro}</p>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Processo *
                  </label>
                  <input
                    type="text"
                    value={formData.processo}
                    onChange={(e) => setFormData(prev => ({ ...prev, processo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite o nome do processo"
                  />
                  {formErrors.processo && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.processo}</p>
                  )}
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável pelo Processo
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel_processo}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel_processo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do responsável"
                  />
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
                    {editingProcesso ? 'Atualizar' : 'Criar'}
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

export default ProcessManagement;