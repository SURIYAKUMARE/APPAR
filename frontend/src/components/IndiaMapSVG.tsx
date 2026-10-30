import React, { useState } from 'react';
import { MapPin, Building2, Users, ShieldCheck, ChevronRight } from 'lucide-react';

interface IndiaMapSVGProps {
  onSelectState: (state: string) => void;
  selectedState: string;
}

interface StateData {
  name: string;
  code: string;
  students: number;
  institutions: number;
  compliance: number;
  coords: { x: number; y: number };
}

const MONITORED_STATES: StateData[] = [
  { name: 'Punjab', code: 'PB', students: 88, institutions: 1, compliance: 96.2, coords: { x: 26, y: 22 } },
  { name: 'Delhi', code: 'DL', students: 112, institutions: 1, compliance: 98.4, coords: { x: 33, y: 28 } },
  { name: 'Uttar Pradesh', code: 'UP', students: 132, institutions: 1, compliance: 78.4, coords: { x: 45, y: 32 } },
  { name: 'Gujarat', code: 'GJ', students: 95, institutions: 1, compliance: 95.8, coords: { x: 18, y: 44 } },
  { name: 'West Bengal', code: 'WB', students: 92, institutions: 1, compliance: 94.6, coords: { x: 74, y: 42 } },
  { name: 'Maharashtra', code: 'MH', students: 104, institutions: 1, compliance: 97.2, coords: { x: 32, y: 55 } },
  { name: 'Telangana', code: 'TG', students: 98, institutions: 1, compliance: 95.0, coords: { x: 46, y: 58 } },
  { name: 'Karnataka', code: 'KA', students: 102, institutions: 1, compliance: 98.0, coords: { x: 36, y: 72 } },
  { name: 'Tamil Nadu', code: 'TN', students: 108, institutions: 1, compliance: 99.1, coords: { x: 44, y: 84 } },
  { name: 'Kerala', code: 'KL', students: 90, institutions: 1, compliance: 97.5, coords: { x: 34, y: 86 } }
];

export const IndiaMapSVG: React.FC<IndiaMapSVGProps> = ({ onSelectState, selectedState }) => {
  const [hovered, setHovered] = useState<StateData | null>(null);

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-[#0a192f] to-[#0f2027] rounded-3xl p-6 border border-slate-700 shadow-xl overflow-hidden text-white">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-cyan-400">
              Interactive National Geospatial Surveillance
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">Click a state node to filter regional regulatory metrics</p>
        </div>

        {selectedState && (
          <button
            onClick={() => onSelectState('')}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
          >
            Clear Filter ({selectedState})
          </button>
        )}
      </div>

      {/* SVG Canvas Map Schematic */}
      <div className="relative h-96 w-full flex items-center justify-center my-2">
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-96 select-none">
          {/* Schematic India Boundary Polygons */}
          <path
            d="M 28 8 L 40 8 L 48 16 L 36 24 L 56 26 L 68 32 L 84 36 L 76 46 L 70 54 L 58 64 L 48 88 L 38 88 L 32 74 L 24 60 L 16 48 L 18 36 L 24 24 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="0.8"
            opacity="0.6"
          />

          {/* Connective Neural Constellation Lines between State Hubs */}
          {MONITORED_STATES.map((s, idx) => {
            if (idx === MONITORED_STATES.length - 1) return null;
            const next = MONITORED_STATES[idx + 1];
            return (
              <line
                key={`line-${idx}`}
                x1={s.coords.x}
                y1={s.coords.y}
                x2={next.coords.x}
                y2={next.coords.y}
                stroke="#06b6d4"
                strokeWidth="0.4"
                strokeDasharray="1,1"
                opacity="0.3"
              />
            );
          })}

          {/* Interactive State Nodes */}
          {MONITORED_STATES.map((s) => {
            const isSelected = selectedState === s.name;
            const isHovered = hovered?.name === s.name;
            const isBreach = s.compliance < 80;

            return (
              <g
                key={s.code}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectState(isSelected ? '' : s.name)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Ping wave */}
                <circle
                  cx={s.coords.x}
                  cy={s.coords.y}
                  r={isSelected ? 4.5 : 2.5}
                  fill={isBreach ? '#f43f5e' : (isSelected ? '#06b6d4' : '#38bdf8')}
                  opacity={isSelected ? 0.8 : 0.4}
                  className="animate-ping"
                />

                {/* Core node circle */}
                <circle
                  cx={s.coords.x}
                  cy={s.coords.y}
                  r={isSelected ? 3.5 : 2.2}
                  fill={isBreach ? '#ef4444' : (isSelected ? '#06b6d4' : '#0284c7')}
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />

                {/* State Label */}
                <text
                  x={s.coords.x + 3.2}
                  y={s.coords.y + 1}
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  fontSize={isSelected ? '2.8' : '2.2'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
                >
                  {s.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Tooltip */}
        {hovered && (
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur border border-cyan-500/40 p-3.5 rounded-2xl shadow-xl w-56 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="font-bold text-white text-sm">{hovered.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                hovered.compliance >= 90 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {hovered.compliance}%
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Enrolled Students:</span>
              <span className="font-mono font-bold text-cyan-400">{hovered.students}</span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Technical Institutes:</span>
              <span className="font-mono text-slate-200">{hovered.institutions}</span>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 font-mono">
              Click to isolate {hovered.name} data
            </div>
          </div>
        )}
      </div>

      {/* State Quick Selection Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-white/10 no-scrollbar text-xs">
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">States:</span>
        {MONITORED_STATES.map((s) => (
          <button
            key={s.code}
            onClick={() => onSelectState(selectedState === s.name ? '' : s.name)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition-all ${
              selectedState === s.name
                ? 'bg-cyan-500 text-slate-900 font-bold shadow-md shadow-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

    </div>
  );
};
