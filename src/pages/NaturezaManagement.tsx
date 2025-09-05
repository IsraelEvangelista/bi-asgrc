import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertTriangle, Tag } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Natureza } from '../types/config';
import { toast } from 'sonner';
import NaturezaForm from '../components/NaturezaForm';
import Layout from '../components/Layout';

interface NaturezaManagementProps {
  onNaturezaSelect?: (natureza: Natureza) => void;
}

const NaturezaManagement: React.FC<NaturezaManagementProps> = ({ onNaturezaSelect }) => {
  const { naturezas, loading, fetchNaturezas, deleteNatureza } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNatureza, setEditingNatureza] = useState<Natureza | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchNaturezas();
  }, [fetchNaturezas]);

  const filteredNaturezas = naturezas.filter(natureza =>
    natureza.natureza.toLowerCase().includes(searchTerm.toLowerCase()) ||
    natureza.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (natureza: Natureza) => {
    setEditingNatureza(natureza);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNatureza(id);
      toast.success('Natureza excluída com sucesso!');
      setDeleteConfirm(null);
    } catch {
      toast.error('Erro ao excluir natureza. Verifique se não há vínculos.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNatureza(null);
    fetchNaturezas(); // Refresh data
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
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Naturezas</h1>
          <p className="text-gray-600 mt-1">Gerencie as naturezas de riscos da organização</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Natureza
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Tag className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Naturezas</p>
              <p className="text-2xl font-semibold text-gray-900">{naturezas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Naturezas Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {naturezas.filter(natureza => natureza.ativa).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Search className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resultados</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredNaturezas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Naturezas List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredNaturezas.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma natureza encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando sua primeira natureza.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Criar Primeira Natureza
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
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
                {filteredNaturezas.map((natureza) => (
                  <tr 
                    key={natureza.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onNaturezaSelect?.(natureza)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{natureza.natureza}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {natureza.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        natureza.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {natureza.ativa ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(natureza);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(natureza.id);
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
              Tem certeza que deseja excluir esta natureza? Esta ação não pode ser desfeita e pode afetar categorias vinculadas.
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
        <NaturezaForm
          natureza={editingNatureza}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      )}
      </div>
    </Layout>
  );
};

export default NaturezaManagement;