import React from 'react';
import { Target, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import Layout from '../components/Layout';

const MatrizRisco = () => {
  // Mock data para demonstração
  const riscos = [
    {
      id: 1,
      nome: 'Risco de Liquidez',
      probabilidade: 'Alta',
      impacto: 'Alto',
      nivel: 'Crítico',
      categoria: 'Financeiro',
      responsavel: 'Diretoria Financeira'
    },
    {
      id: 2,
      nome: 'Risco Operacional',
      probabilidade: 'Média',
      impacto: 'Médio',
      nivel: 'Moderado',
      categoria: 'Operacional',
      responsavel: 'Gerência de Operações'
    },
    {
      id: 3,
      nome: 'Risco Regulatório',
      probabilidade: 'Baixa',
      impacto: 'Alto',
      nivel: 'Moderado',
      categoria: 'Regulatório',
      responsavel: 'Assessoria Jurídica'
    }
  ];

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Crítico':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Alto':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Matriz de Risco</h1>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Riscos Críticos</p>
                  <p className="text-2xl font-bold text-red-900">1</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Riscos Altos</p>
                  <p className="text-2xl font-bold text-orange-900">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Riscos Moderados</p>
                  <p className="text-2xl font-bold text-yellow-900">2</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Riscos Baixos</p>
                  <p className="text-2xl font-bold text-green-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Riscos */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probabilidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {riscos.map((risco) => (
                  <tr key={risco.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{risco.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{risco.categoria}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{risco.probabilidade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{risco.impacto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getNivelColor(risco.nivel)}`}>
                        {risco.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{risco.responsavel}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matriz Visual */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Matriz Visual de Riscos</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-4 gap-2 h-64">
                {/* Eixo Y - Probabilidade */}
                <div className="flex flex-col justify-between text-xs text-gray-600">
                  <span>Alta</span>
                  <span>Média</span>
                  <span>Baixa</span>
                </div>
                
                {/* Matriz 3x3 */}
                <div className="col-span-3 grid grid-cols-3 gap-1">
                  {/* Linha Alta Probabilidade */}
                  <div className="bg-yellow-200 border border-yellow-300 rounded p-2 text-xs">
                    <span className="font-medium">Moderado</span>
                  </div>
                  <div className="bg-orange-200 border border-orange-300 rounded p-2 text-xs">
                    <span className="font-medium">Alto</span>
                  </div>
                  <div className="bg-red-200 border border-red-300 rounded p-2 text-xs">
                    <span className="font-medium">Crítico</span>
                    <div className="mt-1 text-xs">Risco de Liquidez</div>
                  </div>
                  
                  {/* Linha Média Probabilidade */}
                  <div className="bg-green-200 border border-green-300 rounded p-2 text-xs">
                    <span className="font-medium">Baixo</span>
                  </div>
                  <div className="bg-yellow-200 border border-yellow-300 rounded p-2 text-xs">
                    <span className="font-medium">Moderado</span>
                    <div className="mt-1 text-xs">Risco Operacional</div>
                  </div>
                  <div className="bg-orange-200 border border-orange-300 rounded p-2 text-xs">
                    <span className="font-medium">Alto</span>
                  </div>
                  
                  {/* Linha Baixa Probabilidade */}
                  <div className="bg-green-200 border border-green-300 rounded p-2 text-xs">
                    <span className="font-medium">Baixo</span>
                  </div>
                  <div className="bg-green-200 border border-green-300 rounded p-2 text-xs">
                    <span className="font-medium">Baixo</span>
                  </div>
                  <div className="bg-yellow-200 border border-yellow-300 rounded p-2 text-xs">
                    <span className="font-medium">Moderado</span>
                    <div className="mt-1 text-xs">Risco Regulatório</div>
                  </div>
                </div>
              </div>
              
              {/* Eixo X - Impacto */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div></div>
                <div className="text-center text-xs text-gray-600">Baixo</div>
                <div className="text-center text-xs text-gray-600">Médio</div>
                <div className="text-center text-xs text-gray-600">Alto</div>
              </div>
              <div className="text-center text-sm font-medium text-gray-700 mt-2">Impacto</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatrizRisco;