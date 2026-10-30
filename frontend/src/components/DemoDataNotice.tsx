import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DemoDataNotice: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold">AICTE SIH 2026 DEMO ENVIRONMENT:</strong> All 1,000+ student profiles, APAAR IDs, and institutions are synthetic simulated research records. No real citizen identifiers are utilized.
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Luhn/Verhoeff Engine Active</span>
        </span>
        <span>•</span>
        <span>Sandbox Gateway v2.6.3</span>
      </div>
    </div>
  );
};
