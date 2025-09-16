import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'outline':
      return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
    case 'ghost':
      return 'text-gray-700 hover:bg-gray-100';
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700';
  }
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'h-8 px-3 text-sm';
    case 'lg':
      return 'h-12 px-8 text-lg';
    default:
      return 'h-10 px-4 text-sm';
  }
};

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) => {
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};