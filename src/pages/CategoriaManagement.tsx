import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, TreePine, Filter } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Categoria } from '../types/config';
import { toast } from 'sonner';
import CategoriaForm from '../components/CategoriaForm';
import Layout from '../components/Layout';

interface CategoriaManagementProps {
  onCategoriaSelect?: (categoria: Categoria) => void;
}

const CategoriaManagement: React.FC<CategoriaManagementProps> = ({ onCategoriaSelect }) => {
  const { categorias, naturezas, loading, fetchCategorias, deleteCategoria } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNatureza, setSelectedNatureza] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const filteredCategorias = categorias.filter(categoria => {
    const matchesSearch = categoria.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categoria.natureza?.natureza.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNatureza = !selectedNatureza || categoria.id_natureza === selectedNatureza;
    
    return matchesSearch && matchesNatureza;
  });

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategoria(id);
      toast.success('Categoria excluída com sucesso!');
      setDeleteConfirm(null);
    } catch {
      toast.error('Erro ao excluir categoria. Verifique se não há subcategorias vinculadas.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategoria(null);
    fetchCategorias(); // Refresh data
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedNatureza('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie as categorias de riscos organizadas por natureza</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </h3>
          {(searchTerm || selectedNatureza) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por categoria, descrição ou natureza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Natureza Filter */}
          <div>
            <select
              value={selectedNatureza}
              onChange={(e) => setSelectedNatureza(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as naturezas</option>
              {naturezas.filter(n => n.ativa).map((natureza) => (
                <option key={natureza.id} value={natureza.id}>
                  {natureza.natureza}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Tag className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Categorias</p>
              <p className="text-2xl font-semibold text-gray-900">{categorias.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TreePine className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Categorias Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {categorias.filter(categoria => categoria.ativa).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Search className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resultados</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredCategorias.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Naturezas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(categorias.map(c => c.id_natureza)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCategorias.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedNatureza ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira categoria.'}
            </p>
            {!searchTerm && !selectedNatureza && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Primeira Categoria
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hierarquia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategorias.map((categoria) => (
                  <tr 
                    key={categoria.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onCategoriaSelect?.(categoria)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <TreePine className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium">{categoria.natureza?.natureza}</span>
                        <span className="mx-2">→</span>
                        <span className="text-blue-600">{categoria.categoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{categoria.categoria}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {categoria.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        categoria.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {categoria.ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(categoria);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(categoria.id);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e pode afetar subcategorias vinculadas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <CategoriaForm
          categoria={editingCategoria}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}
      </div>
    </Layout>
  );
};

export default CategoriaManagement;