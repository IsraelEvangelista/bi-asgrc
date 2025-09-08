import React, { useState } from 'react';
import { useConceitos } from '../hooks/useConceitos';
import { Conceito } from '../types/config';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';
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
      <Layout>
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
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Conceitos de Gestão de Riscos</h1>
            </div>
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <BookOpen className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg font-medium">Erro ao carregar conceitos</p>
              </div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="w-full space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="relative px-8 py-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Conceitos de Gestão de Riscos
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Explore os fundamentos essenciais da gestão de riscos corporativos
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Selecione um conceito para visualizar sua descrição detalhada
                </span>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          </div>

          {/* Layout Vertical: Seleção à esquerda e conteúdo à direita */}
          <div className="flex gap-8 min-h-[600px]">
            {/* Barra Vertical de Seleção de Conceitos */}
            <div className="w-80 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Conceitos Disponíveis
                </h2>
              </div>
              
              {conceitos.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum conceito encontrado.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {conceitos.map((conceito, index) => (
                    <button
                      key={conceito.id}
                      onClick={() => handleConceitoSelect(conceito)}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className={`
                        w-full group relative p-4 rounded-xl transition-all duration-300 text-left
                        transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                        animate-slide-in-left shadow-md
                        ${
                          conceitoSelecionado?.id === conceito.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-lg hover:border-blue-300/50 shadow-sm'
                        }
                      `}
                    >
                      <span className={`
                        text-sm font-semibold leading-relaxed block transition-all duration-500
                        ${
                          conceitoSelecionado?.id === conceito.id
                            ? 'text-white animate-slide-in-name'
                            : 'text-gray-700 group-hover:text-blue-600'
                        }
                      `}>
                        {conceito.termo}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Área de Conteúdo à Direita */}
            <div className="flex-1">
              {/* Caixa de Descrição com Transição Suave */}
              {conceitoSelecionado ? (
                <div 
                  key={animationKey}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 h-full page-content animate-slide-in-left overflow-hidden relative shadow-lg"
                >
                  {/* Background decorativo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                          {conceitoSelecionado.termo}
                        </h3>
                        <div className="flex items-center space-x-2 text-blue-600/70">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-medium">Conceito Fundamental</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-xl p-6 backdrop-blur-sm">
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base animate-slide-in-description">
                          {conceitoSelecionado.definicao}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mensagem quando nenhum conceito está selecionado */
                conceitos.length > 0 && (
                  <div className="bg-gradient-to-br from-white/60 to-blue-50/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-200/50 p-12 text-center h-full flex flex-col justify-center relative overflow-hidden shadow-md">
                    {/* Background decorativo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/30 rounded-full translate-y-16 -translate-x-16"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                          Selecione um Conceito
                        </h3>
                        <p className="text-gray-600 text-base">
                          Clique em qualquer conceito à esquerda para visualizar sua descrição detalhada
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 text-blue-500/70">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-sm font-medium">Comece explorando os conceitos</span>
                      </div>
                    </div>
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