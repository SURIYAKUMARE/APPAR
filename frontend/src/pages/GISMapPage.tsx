import React, { useState } from 'react';
import { RealIndiaGISMap } from '../components/RealIndiaGISMap';
import { 
  Compass, Globe, Layers, MapPin, Building2, Users, 
  ShieldCheck, AlertTriangle, ChevronRight, Download, Filter, RefreshCw
} from 'lucide-react';

interface GISMapPageProps {
  onNavigate: (page: string) => void;
}

export const GISMapPage: React.FC<GISMapPageProps> = ({ onNavigate }) => {
  const [selectedState, setSelectedState] = useState('');

  return (
    <div className="space-y-6">
      
      {/* Page Title & Google Stitch Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-[#1E2D52]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              National Real GIS Geospatial Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Satellite Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real GPS geolocations of AICTE technical institutions across India with OpenStreetMap and Esri satellite tile layers.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {selectedState && (
            <button
              onClick={() => setSelectedState('')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#101B36] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Clear Filter: {selectedState}
            </button>
          )}

          <button
            onClick={() => onNavigate('institution-management')}
            className="m3-btn-secondary text-xs py-2"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institution Directory</span>
          </button>

          <button
            onClick={() => onNavigate('super-admin')}
            className="m3-btn-primary text-xs py-2"
          >
            <span>Executive Dashboard</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Map Component */}
      <RealIndiaGISMap 
        selectedState={selectedState} 
        onSelectState={setSelectedState} 
        onSelectInstitution={(instId) => onNavigate('institution-management')} 
      />

      {/* Regional Quick Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="m3-card p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Northern Region Hubs</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Delhi & Punjab</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">800 Sanctioned Seats • 97.2% Verified</p>
        </div>

        <div className="m3-card p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Southern Region Hubs</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Chennai & Bengaluru</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">1,240 Sanctioned Seats • 98.2% Verified</p>
        </div>

        <div className="m3-card p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Western Region Hubs</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Mumbai, Pune, Guj</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">1,100 Sanctioned Seats • 94.6% Verified</p>
        </div>

        <div className="m3-card p-4 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Eastern & Central Hubs</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">Kolkata & Hyderabad</div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">760 Sanctioned Seats • 1 Intake Audit</p>
        </div>
      </div>

    </div>
  );
};
