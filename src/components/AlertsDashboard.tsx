import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingUp, Eye } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { Indicator } from '../types/indicator';
import { Action } from '../types/action';
import AlertBanner from './AlertBanner';

interface AlertsDashboardProps {
  indicators: Indicator[];
  actions: Action[];
  className?: string;
}

const AlertsDashboard: React.FC<AlertsDashboardProps> = ({
  indicators,
  actions,
  className = ''
}) => {
  const alerts = useAlerts(indicators, actions);

  if (alerts.totalAlerts === 0) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">
              Tudo em Ordem!
            </h3>
            <p className="text-green-700">
              Não há alertas críticos no momento. Todos os indicadores estão dentro da tolerância e as ações estão em dia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Resumo de Alertas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumo de Alertas</h3>
          <div className="flex items-center space-x-4">
            {alerts.criticalAlerts > 0 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{alerts.criticalAlerts} Críticos</span>
              </div>
            )}
            {alerts.warningAlerts > 0 && (
              <div className="flex items-center text-yellow-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{alerts.warningAlerts} Avisos</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alertas de Indicadores */}
          {alerts.indicatorAlerts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-800">Indicadores Fora da Tolerância</h4>
                <Link
                  to="/indicadores"
                  className="text-yellow-700 hover:text-yellow-900 text-sm flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Todos
                </Link>
              </div>
              <p className="text-yellow-700 text-sm mb-3">
                {alerts.indicatorAlerts.length} indicador{alerts.indicatorAlerts.length > 1 ? 'es' : ''} requer{alerts.indicatorAlerts.length > 1 ? 'm' : ''} atenção
              </p>
              <div className="space-y-2">
                {alerts.indicatorAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    <span className="text-yellow-600">{alert.mensagem}</span>
                  </div>
                ))}
                {alerts.indicatorAlerts.length > 3 && (
                  <p className="text-xs text-yellow-600">
                    +{alerts.indicatorAlerts.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Alertas de Ações */}
          {alerts.actionAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-red-800">Ações Atrasadas</h4>
                <Link
                  to="/acoes"
                  className="text-red-700 hover:text-red-900 text-sm flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Todas
                </Link>
              </div>
              <p className="text-red-700 text-sm mb-3">
                {alerts.actionAlerts.length} ação{alerts.actionAlerts.length > 1 ? 'ões' : ''} atrasada{alerts.actionAlerts.length > 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {alerts.actionAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="text-sm text-red-800">
                    <span className="text-red-600">{alert.message}</span>
                  </div>
                ))}
                {alerts.actionAlerts.length > 3 && (
                  <p className="text-xs text-red-600">
                    +{alerts.actionAlerts.length - 3} mais...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alertas Individuais */}
      {alerts.criticalAlerts > 0 && (
        <AlertBanner
          type="danger"
          title="Atenção Requerida"
          message={`Existem ${alerts.criticalAlerts} alerta${alerts.criticalAlerts > 1 ? 's' : ''} crítico${alerts.criticalAlerts > 1 ? 's' : ''} que requer${alerts.criticalAlerts > 1 ? 'm' : ''} ação imediata.`}
          count={alerts.criticalAlerts}
        />
      )}
    </div>
  );
};

export default AlertsDashboard;