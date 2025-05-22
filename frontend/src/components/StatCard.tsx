import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.FC<React.ComponentProps<'svg'>>;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  change,
  color = 'blue',
  className = '',
}) => {
  // Define color schemes based on the color prop
  const colorSchemes = {
    blue: {
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      border: 'border-blue-200',
      valueColor: 'text-blue-800',
      changeUp: 'text-blue-700',
      changeDown: 'text-blue-700'
    },
    green: {
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      border: 'border-emerald-200',
      valueColor: 'text-emerald-800',
      changeUp: 'text-emerald-700',
      changeDown: 'text-red-600'
    },
    red: {
      bgGradient: 'from-rose-50 to-rose-100',
      iconBg: 'bg-rose-100', 
      iconColor: 'text-rose-700',
      border: 'border-rose-200',
      valueColor: 'text-rose-800',
      changeUp: 'text-emerald-600',
      changeDown: 'text-rose-700'
    },
    yellow: {
      bgGradient: 'from-amber-50 to-amber-100',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      border: 'border-amber-200',
      valueColor: 'text-amber-800',
      changeUp: 'text-emerald-600',
      changeDown: 'text-rose-600'
    },
    purple: {
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      border: 'border-purple-200',
      valueColor: 'text-purple-800',
      changeUp: 'text-emerald-600',
      changeDown: 'text-rose-600'
    },
    indigo: {
      bgGradient: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      border: 'border-indigo-200',
      valueColor: 'text-indigo-800',
      changeUp: 'text-emerald-600',
      changeDown: 'text-rose-600'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <div className={`rounded-xl shadow-sm bg-gradient-to-br ${scheme.bgGradient} p-5 border ${scheme.border} backdrop-blur-sm ${className}`}>
      <div className="flex justify-between items-start">
        <div className="grow">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className={`mt-1 text-2xl font-bold ${scheme.valueColor}`}>{value}</div>
          
          {(trend && change !== undefined) && (
            <div className="flex items-center mt-1">
              <span 
                className={`inline-flex items-center text-xs font-medium ${
                  trend === 'up' ? 'text-emerald-600' : 
                  trend === 'down' ? 'text-rose-600' : 'text-gray-600'
                }`}
              >
                {trend === 'up' && <ArrowUpIcon className="w-3 h-3 mr-1" />}
                {trend === 'down' && <ArrowDownIcon className="w-3 h-3 mr-1" />}
                {change}%
              </span>
              <span className="text-xs text-gray-400 ml-1">dari bulan lalu</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} ${scheme.iconColor}`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
