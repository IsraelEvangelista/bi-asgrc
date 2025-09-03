import React from 'react';
import { AlertTriangle, Clock, XCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export type AlertType = 'warning' | 'danger' | 'success' | 'info';

interface AlertBannerProps {
  type: AlertType;
  title: string;
  message: string;
  count?: number;
  onDismiss?: () => void;
  className?: string;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600'
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600'
  }
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  count,
  onDismiss,
  className
}) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4 mb-4',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start">
        <Icon className={cn('h-5 w-5 mt-0.5 mr-3', config.iconColor)} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={cn('text-sm font-medium', config.textColor)}>
              {title}
              {count !== undefined && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50">
                  {count}
                </span>
              )}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={cn(
                  'ml-3 inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.textColor,
                  'hover:bg-white hover:bg-opacity-20'
                )}
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className={cn('mt-1 text-sm', config.textColor)}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;