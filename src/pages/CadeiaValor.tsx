import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Users } from 'lucide-react';

const CadeiaValor: React.FC = () => {
  const navigate = useNavigate();

  // Mapeamento dos botões com os IDs dos macroprocessos
  const macroprocessoIds: { [key: string]: string } = {
    'Estratégia': 'b962efbd-db91-4b1d-862c-e5c1c0487e94',
    'Governança': 'b69aac0f-de93-4fe3-9463-e791c657846b',
    'Suporte ao Negócio': 'b20bfbb9-374e-436f-b204-85b4c3da5e33',
    'Instrumento de Regularização do Uso': '765bb1d5-7841-48ea-92a4-162ee55f5023',
    'Operação e Manutenção': '7e33ba86-803c-41d8-afc8-b383d37486b4',
    'Monitoramento': '7f27698a-beb7-49c1-8bb6-fba316642cf5',
    'Gestão Participativa': 'a3b6fbcf-ddcf-4e4d-9f80-d1c5d25efdc1',
    'Estudos e Projetos': 'cbbc840d-7063-423e-a947-464616c5cc78',
    'Gestão e Desenvolvimento de Pessoas': '8609f895-62d5-4e4a-bad5-ffcbd06dc115',
    'Suprimentos': '01c0a3c9-973c-45d7-8cbf-ac267c243445',
    'Registro e Suporte': 'decacada-a26b-4601-bcd5-36667bf2a129',
    'Financeiro': 'afb6fca6-31cb-4c48-b095-03d21f4e3695'
  };

  const handleProcessClick = (tipo: string, nome: string) => {
    const macroprocessoId = macroprocessoIds[nome];
    if (macroprocessoId) {
      navigate(`/processo/${macroprocessoId}`);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-8 border-4 border-blue-300 rounded-2xl animated-border bg-white">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CADEIA DE VALOR <span className="text-blue-600">COGERH</span>
          </h1>
        </div>

        {/* Missão, Visão e Valores */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Missão */}
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-200 hover:text-black transition-all duration-300 group cursor-pointer">
            <h2 className="text-xl font-bold mb-4 group-hover:hidden">Missão</h2>
            <p className="text-sm hidden group-hover:block">Contribuir para o desenvolvimento sustentável e a qualidade de vida no Ceará, promovendo o acesso à água, por meio de gestão participativa e eficaz dos recursos hidrícos.</p>
          </div>

          {/* Visão */}
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-200 hover:text-black transition-all duration-300 group cursor-pointer">
            <h2 className="text-xl font-bold mb-4 group-hover:hidden">Visão</h2>
            <p className="text-sm hidden group-hover:block">A Cogerh pretende ser reconhecida até 2050 como referência internacional no gerenciamento dos recursos hídricos e em inovação nas práticas de gestão e diversificação da matriz hídrica.</p>
          </div>

          {/* Valores */}
          <div className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-200 hover:text-black transition-all duration-300 group cursor-pointer">
            <h2 className="text-xl font-bold mb-4 group-hover:hidden">Valores</h2>
            <p className="text-sm hidden group-hover:block">Atitude inovadora, Proatividade, Compromisso, Trabalho em equipe e cooperativo, Excelência técnica, Foco nos resultados.</p>
          </div>
        </div>

        {/* Layout Principal com Processos e Entregas/Valores */}
        <div className="flex gap-6">
          {/* Coluna Esquerda - Processos */}
          <div className="flex-1 space-y-4">
            {/* Macroprocessos de Gestão */}
            <div className="relative">
              {/* Título Vertical */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-blue-600 text-white flex items-center justify-center" style={{height: 140}}>
                <span className="transform -rotate-90 whitespace-nowrap text-xs font-bold leading-tight text-center">
                  Macroprocessos<br />de Gestão
                </span>
              </div>
              
              {/* Conteúdo retangular */}
              <div className="ml-10 bg-blue-100 p-4 relative flex items-center" style={{height: 140}}>
                <div className="grid grid-cols-3 gap-3 w-full">
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Gestão', 'Estratégia')}
                    className="bg-blue-500 text-white p-3 text-center text-sm font-medium flex items-center justify-center h-16 hover:bg-blue-600 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)'}}
                  >Estratégia</button>
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Gestão', 'Governança')}
                    className="bg-blue-500 text-white p-3 text-center text-sm font-medium flex items-center justify-center h-16 hover:bg-blue-600 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)'}}
                  >Governança</button>
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Gestão', 'Suporte ao Negócio')}
                    className="bg-blue-500 text-white p-3 text-center text-sm font-medium flex items-center justify-center h-16 hover:bg-blue-600 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)'}}
                  >Suporte ao Negócio</button>
                </div>
              </div>
            </div>

            {/* Macroprocessos Finalísticos */}
            <div className="relative">
              {/* Título Vertical */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-600 text-white flex items-center justify-center" style={{height: 140}}>
                <span className="transform -rotate-90 whitespace-nowrap text-xs font-bold leading-tight text-center">
                  Macroprocessos<br />Finalísticos
                </span>
              </div>
              
              {/* Conteúdo com seta para direita */}
              <div className="ml-10 bg-gray-200 p-4 relative flex items-center" style={{clipPath: 'polygon(0 0, 85% 0, 95% 50%, 85% 100%, 0 100%)', height: 140}}>
                <div className="grid grid-cols-2 gap-3 w-full" style={{maxWidth: '75%'}}>
                  <div className="space-y-2 flex flex-col justify-center">
                    <button 
                      onClick={() => handleProcessClick('Macroprocessos Finalísticos', 'Instrumento de Regularização do Uso')}
                      className="bg-blue-600 text-white p-2 rounded text-center text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >Instrumento de Regularização do Uso</button>
                    <button 
                      onClick={() => handleProcessClick('Macroprocessos Finalísticos', 'Operação e Manutenção')}
                      className="bg-blue-600 text-white p-2 rounded text-center text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >Operação e Manutenção</button>
                    <button 
                      onClick={() => handleProcessClick('Macroprocessos Finalísticos', 'Monitoramento')}
                      className="bg-blue-500 text-white p-2 rounded text-center text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                    >Monitoramento</button>
                  </div>
                  
                  <div className="space-y-2 flex flex-col justify-center">
                    <button 
                      onClick={() => handleProcessClick('Macroprocessos Finalísticos', 'Gestão Participativa')}
                      className="bg-blue-600 text-white p-2 rounded text-center text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >Gestão Participativa</button>
                    <button 
                      onClick={() => handleProcessClick('Macroprocessos Finalísticos', 'Estudos e Projetos')}
                      className="bg-blue-500 text-white p-2 rounded text-center text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer"
                    >Estudos e Projetos</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Macroprocessos de Suporte */}
            <div className="relative">
              {/* Título Vertical */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-blue-600 text-white flex items-center justify-center" style={{height: 140}}>
                <span className="transform -rotate-90 whitespace-nowrap text-xs font-bold leading-tight text-center">
                  Macroprocessos<br />de Suporte
                </span>
              </div>
              
              {/* Conteúdo retangular */}
              <div className="ml-10 bg-blue-100 p-4 relative flex items-center" style={{height: 140}}>
                <div className="grid grid-cols-4 gap-3 w-full">
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Suporte', 'Gestão e Desenvolvimento de Pessoas')}
                    className="bg-blue-400 text-white p-3 text-center text-xs font-medium flex items-center justify-center h-16 hover:bg-blue-500 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'}}
                  >Gestão e Desenvolvimento de Pessoas</button>
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Suporte', 'Suprimentos')}
                    className="bg-blue-400 text-white p-3 text-center text-xs font-medium flex items-center justify-center h-16 hover:bg-blue-500 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'}}
                  >Suprimentos</button>
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Suporte', 'Registro e Suporte')}
                    className="bg-blue-400 text-white p-3 text-center text-xs font-medium flex items-center justify-center h-16 hover:bg-blue-500 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'}}
                  >Registro e Suporte</button>
                  <button 
                    onClick={() => handleProcessClick('Macroprocessos de Suporte', 'Financeiro')}
                    className="bg-blue-400 text-white p-3 text-center text-xs font-medium flex items-center justify-center h-16 hover:bg-blue-500 transition-colors cursor-pointer" 
                    style={{clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)'}}
                  >Financeiro</button>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Entregas e Valores */}
          <div className="w-80 space-y-4">
            {/* Entregas */}
            <div className="bg-blue-800 text-white p-6 rounded-lg shadow-lg h-[220px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">Entregas</h3>
                <ul className="space-y-2 text-xs">
                  <li>Acesso ao uso racional da água de forma otimizada</li>
                  <li>Infraestrutura hídrica e segurança operacional</li>
                  <li>Participação social na Gestão de Recursos Hídricos</li>
                  <li>Acesso à informação para gestão dos Recursos Hídricos</li>
                  <li>Estudos e Projetos para segurança hídrica</li>
                </ul>
              </div>
            </div>

            {/* Valores Gerados */}
            <div className="bg-blue-800 text-white p-6 rounded-lg shadow-lg h-[220px] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">Valores Gerados</h3>
                <ul className="space-y-2 text-xs">
                  <li>Garantir e assegurar o acesso ao uso otimizado e racional da água</li>
                  <li>Garantir a segurança da infraestrutura hídrica e operacional</li>
                  <li>Promover a gestão participativa dos recursos hídricos</li>
                  <li>Subsidiar o acesso ao uso otimizado e racional da água</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seta entre Entregas/Valores e Sociedade */}
          <div className="flex flex-col items-center justify-center px-4 relative">
            <div className="relative">
              <img 
                src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757118095290.png" 
                alt="Seta" 
                className="h-[448px] w-auto" 
              />
            </div>

          </div>

          {/* Ícone da Sociedade */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2">
              <img 
                src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1757116049479.png" 
                alt="Sociedade" 
                className="h-20 w-20" 
              />
            </div>
          </div>
        </div>



        {/* Logo COGERH */}
        <div className="flex flex-col items-center mt-4">

        </div>
      </div>
    </Layout>
  );
};

export default CadeiaValor;