import React, { useState } from 'react';
import { useConceitos, Conceito } from '../hooks/useConceitos';
import { BookOpen, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';

const Conceitos: React.FC = () => {
  const { conceitos, loading, error } = useConceitos();
  const [conceitoSelecionado, setConceitoSelecionado] = useState<Conceito | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const handleConceitoSelect = (conceito: Conceito) => {
    if (conceitoSelecionado?.id === conceito.id) {
      // Se o mesmo conceito for clicado, deseleciona
      setConceitoSelecionado(null);
    } else {
      // Seleciona novo conceito e força nova animação
      setConceitoSelecionado(conceito);
      setAnimationKey(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Conceitos de Gestão de Riscos</h1>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando conceitos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Conceitos de Gestão de Riscos</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Erro ao carregar conceitos: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="w-full space-y-6">
          {/* Cabeçalho */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Conceitos de Gestão de Riscos</h1>
            </div>
            <p className="mt-2 text-gray-600">
              Selecione um conceito abaixo para visualizar sua descrição detalhada.
            </p>
          </div>

          {/* Layout Vertical: Seleção à esquerda e conteúdo à direita */}
          <div className="flex gap-6 min-h-[600px]">
            {/* Barra Vertical de Seleção de Conceitos */}
            <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Selecione um Conceito</h2>
              
              {conceitos.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum conceito encontrado.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {conceitos.map((conceito) => (
                    <button
                      key={conceito.id}
                      onClick={() => handleConceitoSelect(conceito)}
                      className={`
                        w-full group relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${
                          conceitoSelecionado?.id === conceito.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`
                          text-sm font-medium pr-2
                          ${
                            conceitoSelecionado?.id === conceito.id
                              ? 'text-blue-700'
                              : 'text-gray-700 group-hover:text-blue-600'
                          }
                        `}>
                          {conceito.conceitos}
                        </span>
                        <ChevronRight className={`
                          h-4 w-4 transition-transform duration-200 flex-shrink-0
                          ${
                            conceitoSelecionado?.id === conceito.id
                              ? 'text-blue-500 rotate-90'
                              : 'text-gray-400 group-hover:text-blue-500'
                          }
                        `} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Área de Conteúdo à Direita */}
            <div className="flex-1">
              {/* Caixa de Descrição com Animação */}
              {conceitoSelecionado ? (
                <div 
                  key={animationKey}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slide-in-left h-full"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-blue-600">
                      {conceitoSelecionado.conceitos}
                    </h3>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {conceitoSelecionado.descricao}
                    </p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Última atualização: {new Date(conceitoSelecionado.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                /* Mensagem quando nenhum conceito está selecionado */
                conceitos.length > 0 && (
                  <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center h-full flex flex-col justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Selecione um conceito à esquerda</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Clique em qualquer conceito para visualizar sua descrição detalhada
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Conceitos;