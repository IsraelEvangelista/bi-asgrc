import React from 'react';
import Layout from '../components/Layout';
import { Network, GitBranch, Layers, ArrowRight, Building } from 'lucide-react';

const ArquiteturaProcessos: React.FC = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Network className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Arquitetura de Processos</h1>
          </div>
          <p className="text-gray-600">
            Visualização da estrutura organizacional dos processos da COGERH, 
            mostrando a hierarquia e relacionamentos entre macroprocessos, processos e subprocessos.
          </p>
        </div>

        {/* Níveis da Arquitetura */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nível 1 - Macroprocessos */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Layers className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-800">Nível 1 - Macroprocessos</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-600 text-white p-3 rounded text-center font-medium">
                Gestão Estratégica
              </div>
              <div className="bg-blue-600 text-white p-3 rounded text-center font-medium">
                Processos Finalísticos
              </div>
              <div className="bg-blue-600 text-white p-3 rounded text-center font-medium">
                Processos de Suporte
              </div>
            </div>
          </div>

          {/* Nível 2 - Processos */}
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <GitBranch className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-800">Nível 2 - Processos</h2>
            </div>
            <div className="space-y-2">
              <div className="bg-green-500 text-white p-2 rounded text-sm text-center">
                Planejamento Estratégico
              </div>
              <div className="bg-green-500 text-white p-2 rounded text-sm text-center">
                Gestão de Recursos Hídricos
              </div>
              <div className="bg-green-500 text-white p-2 rounded text-sm text-center">
                Operação e Manutenção
              </div>
              <div className="bg-green-500 text-white p-2 rounded text-sm text-center">
                Gestão de Pessoas
              </div>
              <div className="bg-green-500 text-white p-2 rounded text-sm text-center">
                Gestão Financeira
              </div>
            </div>
          </div>

          {/* Nível 3 - Subprocessos */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="h-6 w-6 text-orange-600" />
              <h2 className="text-xl font-bold text-orange-800">Nível 3 - Subprocessos</h2>
            </div>
            <div className="space-y-2">
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Elaboração do Plano Diretor
              </div>
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Outorga de Uso da Água
              </div>
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Monitoramento Hidrológico
              </div>
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Manutenção Preventiva
              </div>
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Recrutamento e Seleção
              </div>
              <div className="bg-orange-400 text-white p-2 rounded text-xs text-center">
                Controle Orçamentário
              </div>
            </div>
          </div>
        </div>

        {/* Fluxo de Relacionamentos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Fluxo de Relacionamentos</h2>
          
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white p-4 rounded-lg mb-2">
                <Layers className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm font-medium">Macroprocessos</p>
              <p className="text-xs text-gray-500">Visão Estratégica</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            <div className="text-center">
              <div className="bg-green-600 text-white p-4 rounded-lg mb-2">
                <GitBranch className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm font-medium">Processos</p>
              <p className="text-xs text-gray-500">Visão Tática</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-gray-400" />
            
            <div className="text-center">
              <div className="bg-orange-600 text-white p-4 rounded-lg mb-2">
                <Building className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm font-medium">Subprocessos</p>
              <p className="text-xs text-gray-500">Visão Operacional</p>
            </div>
          </div>
        </div>

        {/* Características dos Processos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Processos Primários</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Gestão de Recursos Hídricos</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Operação de Infraestrutura</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Monitoramento e Controle</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Estudos e Projetos</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Processos de Apoio</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gestão de Pessoas</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gestão Financeira</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tecnologia da Informação</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Suprimentos e Logística</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArquiteturaProcessos;