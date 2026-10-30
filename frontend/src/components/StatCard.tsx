import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const colorMap = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue'
}) => {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between text-xs">
            {subtitle && (
              <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
            )}
            {trend && (
              <span
                className={`flex items-center font-medium ${
                  trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
