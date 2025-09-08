import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'white';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
  variant = 'primary'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600';
      case 'secondary':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-blue-600';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          className={`animate-spin ${getSizeClasses()} ${getVariantClasses()}`} 
        />
        {text && (
          <span className={`${getTextSizeClasses()} ${getVariantClasses()} font-medium`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Componente para tela cheia de carregamento com transição suave
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out animate-fade-in">
      <div className="text-center animate-pulse">
        <div className="bg-white rounded-full p-4 shadow-lg mb-4 inline-block">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <p className="text-gray-700 font-medium text-lg">{text}</p>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// Componente de transição suave para navegação
export const SmoothTransitionLoader: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center transition-all duration-200 ease-out">
      <div className="bg-white rounded-lg shadow-xl p-6 text-center border border-gray-100">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600 font-medium text-sm">{text}</p>
      </div>
    </div>
  );
};

// Componente para carregamento em cards/seções
export const SectionLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Carregando...', 
  className = 'py-12' 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner size="lg" text={text} variant="secondary" />
    </div>
  );
};

// Componente para carregamento inline (botões, etc.)
export const InlineLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <LoadingSpinner size="sm" variant="white" className={className} />
  );
};

export default LoadingSpinner;