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

// Componente para tela cheia de carregamento
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center z-50 loading-transition">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        <LoadingSpinner size="xl" text={text} />
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