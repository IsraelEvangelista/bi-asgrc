import React from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusCardsProps {
  data: {
    emImplementacao: number;
    implementada: number;
    naoIniciada: number;
  };
}

const StatusCards: React.FC<StatusCardsProps> = ({ data }) => {
  return (
    <div className="flex justify-between items-center h-full gap-4">
      {/* Card Em implementação */}
      <div className="w-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg border border-blue-300 p-4 text-white h-24 min-h-24">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Em implementação</h3>
              <p className="text-2xl font-bold text-white">{data.emImplementacao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Implementada */}
      <div className="w-64 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg border border-green-300 p-4 text-white h-24 min-h-24">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Implementada</h3>
              <p className="text-2xl font-bold text-white">{data.implementada}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Não Iniciada */}
      <div className="w-64 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg border border-yellow-300 p-4 text-white h-24 min-h-24">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-110 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Não Iniciada</h3>
              <p className="text-2xl font-bold text-white">{data.naoIniciada}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;