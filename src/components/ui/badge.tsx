import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const getVariantClasses = (variant: string) => {
  switch (variant) {
    case 'secondary':
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
    case 'destructive':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'outline':
      return 'border border-gray-300 text-gray-700 hover:bg-gray-50';
    default:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  }
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variantClasses = getVariantClasses(variant);
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};