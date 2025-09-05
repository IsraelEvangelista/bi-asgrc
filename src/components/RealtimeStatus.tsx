import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';

/**
 * Componente para exibir o status da conexão Real-time
 */
const RealtimeStatus = () => {
  const [showStatus, setShowStatus] = useState(false);
  const { isConnected, reconnect } = useRealtimeNotifications();

  // Mostrar status por alguns segundos quando a conexão mudar
  useEffect(() => {
    setShowStatus(true);
    const timer = setTimeout(() => {
      setShowStatus(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isConnected]);

  // Não mostrar nada se estiver conectado e não deve mostrar status
  if (isConnected && !showStatus) {
    return null;
  }

  return (
    <div className={`
      fixed bottom-4 right-4 z-50
      flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
      text-sm font-medium transition-all duration-300
      ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
      }
      ${
        showStatus 
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }
    `}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Conectado em tempo real</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Desconectado</span>
          <button
            onClick={reconnect}
            className="ml-2 p-1 hover:bg-red-200 rounded transition-colors"
            title="Tentar reconectar"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};

export default RealtimeStatus;