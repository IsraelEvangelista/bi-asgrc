import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';
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

  return null;
};

export default AlertBanner;