import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, Layers, Search, Maximize2, Minimize2, RotateCcw, 
  Building2, Users, ShieldCheck, AlertTriangle, ChevronRight,
  ExternalLink, Compass, Globe, Sparkles, CheckCircle2
} from 'lucide-react';

interface RealIndiaGISMapProps {
  selectedState?: string;
  onSelectState?: (state: string) => void;
  onSelectInstitution?: (institutionId: string) => void;
}

interface InstituteLocation {
  id: string;
  name: string;
  state: string;
  city: string;
  aishe: string;
  lat: number;
  lng: number;
  approvedIntake: number;
  enrolledStudents: number;
  apaarVerifiedRate: number;
  complianceScore: number;
  status: 'APPROVED' | 'INVESTIGATION';
  category: string;
}

const INSTITUTIONS: InstituteLocation[] = [
  {
    id: 'INST-101',
    name: 'Delhi Institute of Technology & Research',
    state: 'Delhi',
    city: 'New Delhi',
    aishe: 'C-10923',
    lat: 28.6139,
    lng: 77.2090,
    approvedIntake: 420,
    enrolledStudents: 398,
    apaarVerifiedRate: 94.2,
    complianceScore: 98.4,
    status: 'APPROVED',
    category: 'Autonomous Engineering'
  },
  {
    id: 'INST-102',
    name: 'IIT Madras Technology Campus',
    state: 'Tamil Nadu',
    city: 'Chennai',
    aishe: 'C-28491',
    lat: 12.9915,
    lng: 80.2337,
    approvedIntake: 450,
    enrolledStudents: 442,
    apaarVerifiedRate: 98.8,
    complianceScore: 99.1,
    status: 'APPROVED',
    category: 'Institute of National Importance'
  },
  {
    id: 'INST-103',
    name: 'Mumbai National College of Engineering',
    state: 'Maharashtra',
    city: 'Mumbai',
    aishe: 'C-39102',
    lat: 19.0760,
    lng: 72.8777,
    approvedIntake: 380,
    enrolledStudents: 365,
    apaarVerifiedRate: 91.5,
    complianceScore: 97.2,
    status: 'APPROVED',
    category: 'State Technological'
  },
  {
    id: 'INST-104',
    name: 'Bengaluru Institute of Artificial Intelligence',
    state: 'Karnataka',
    city: 'Bengaluru',
    aishe: 'C-48194',
    lat: 12.9716,
    lng: 77.5946,
    approvedIntake: 400,
    enrolledStudents: 388,
    apaarVerifiedRate: 95.0,
    complianceScore: 98.0,
    status: 'APPROVED',
    category: 'Deemed University'
  },
  {
    id: 'INST-105',
    name: 'Anna University School of Technology',
    state: 'Tamil Nadu',
    city: 'Chennai',
    aishe: 'C-18492',
    lat: 13.0110,
    lng: 80.2355,
    approvedIntake: 390,
    enrolledStudents: 382,
    apaarVerifiedRate: 96.5,
    complianceScore: 99.0,
    status: 'APPROVED',
    category: 'State University'
  },
  {
    id: 'INST-106',
    name: 'Kolkata Central Engineering University',
    state: 'West Bengal',
    city: 'Kolkata',
    aishe: 'C-51923',
    lat: 22.5726,
    lng: 88.3639,
    approvedIntake: 360,
    enrolledStudents: 340,
    apaarVerifiedRate: 89.2,
    complianceScore: 94.6,
    status: 'APPROVED',
    category: 'Central Technological'
  },
  {
    id: 'INST-107',
    name: 'Hyderabad National Institute of Technology',
    state: 'Telangana',
    city: 'Hyderabad',
    aishe: 'C-62914',
    lat: 17.3850,
    lng: 78.4867,
    approvedIntake: 400,
    enrolledStudents: 412, // Exceeding intake anomaly
    apaarVerifiedRate: 86.4,
    complianceScore: 88.0,
    status: 'INVESTIGATION',
    category: 'Autonomous College'
  },
  {
    id: 'INST-108',
    name: 'Pune College of Advanced Engineering',
    state: 'Maharashtra',
    city: 'Pune',
    aishe: 'C-71934',
    lat: 18.5204,
    lng: 73.8567,
    approvedIntake: 380,
    enrolledStudents: 370,
    apaarVerifiedRate: 93.8,
    complianceScore: 97.0,
    status: 'APPROVED',
    category: 'State Affiliated'
  },
  {
    id: 'INST-109',
    name: 'Ahmedabad Institute of Technology',
    state: 'Gujarat',
    city: 'Ahmedabad',
    aishe: 'C-82910',
    lat: 23.0225,
    lng: 72.5714,
    approvedIntake: 340,
    enrolledStudents: 325,
    apaarVerifiedRate: 92.1,
    complianceScore: 95.8,
    status: 'APPROVED',
    category: 'Private Technological'
  },
  {
    id: 'INST-110',
    name: 'Punjab Technical University Campus',
    state: 'Punjab',
    city: 'Chandigarh / Jalandhar',
    aishe: 'C-93821',
    lat: 31.3260,
    lng: 75.5762,
    approvedIntake: 380,
    enrolledStudents: 360,
    apaarVerifiedRate: 90.0,
    complianceScore: 96.2,
    status: 'APPROVED',
    category: 'State University'
  }
];

// Map Tile Providers
const TILE_LAYERS = {
  stitch: {
    name: 'Google Stitch (CartoDB)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  satellite: {
    name: 'Real Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery'
  },
  dark: {
    name: 'Dark Matter (Night)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

export const RealIndiaGISMap: React.FC<RealIndiaGISMapProps> = ({ 
  selectedState = '', 
  onSelectState, 
  onSelectInstitution 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTileKey, setActiveTileKey] = useState<keyof typeof TILE_LAYERS>('stitch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInst, setSelectedInst] = useState<InstituteLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDensityLayer, setShowDensityLayer] = useState(true);

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    // Center on India geographic coordinates: ~21.7679, 78.8718
    const map = L.map(mapContainerRef.current, {
      center: [21.7679, 78.8718],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false, // We create custom Google Stitch style controls
      attributionControl: false
    });

    // Add initial tile layer
    const initialTile = TILE_LAYERS[activeTileKey];
    const tileLayer = L.tileLayer(initialTile.url, {
      attribution: initialTile.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Create markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer switch changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const nextTile = TILE_LAYERS[activeTileKey];
    tileLayerRef.current.setUrl(nextTile.url);
  }, [activeTileKey]);

  // Render Institution Markers with Google Stitch Design
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    INSTITUTIONS.forEach((inst) => {
      // Check if state filter applies
      if (selectedState && inst.state.toLowerCase() !== selectedState.toLowerCase()) {
        return;
      }

      // Check if search query applies
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          inst.name.toLowerCase().includes(q) || 
          inst.city.toLowerCase().includes(q) || 
          inst.state.toLowerCase().includes(q) ||
          inst.id.toLowerCase().includes(q);
        if (!matches) return;
      }

      const isAlert = inst.status === 'INVESTIGATION';

      // Create Custom High-Tech SVG Marker
      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
            <!-- Pulsing Ring -->
            <div class="absolute -top-1 -left-1 w-9 h-9 rounded-full ${
              isAlert ? 'bg-rose-500/30' : 'bg-[#2457E8]/25'
            } animate-ping pointer-events-none"></div>

            <!-- Pin Body -->
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-125 border-2 border-white ${
              isAlert ? 'bg-gradient-to-tr from-rose-600 to-amber-500' : 'bg-gradient-to-tr from-[#2457E8] to-[#16C8D8]'
            }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>

            <!-- Pill Label -->
            <div class="absolute left-1/2 -translate-x-1/2 -bottom-5 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[9px] font-bold tracking-tight whitespace-nowrap shadow-md pointer-events-none">
              ${inst.id}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([inst.lat, inst.lng], { icon: customIcon });

      // Click event
      marker.on('click', () => {
        setSelectedInst(inst);
        if (onSelectInstitution) {
          onSelectInstitution(inst.id);
        }
        if (onSelectState) {
          onSelectState(inst.state);
        }
      });

      // Density circle overlay
      if (showDensityLayer) {
        const radius = Math.sqrt(inst.enrolledStudents) * 2200;
        const circle = L.circle([inst.lat, inst.lng], {
          radius: radius,
          color: isAlert ? '#E34B55' : '#2457E8',
          fillColor: isAlert ? '#E34B55' : '#16C8D8',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '3, 4'
        });
        circle.addTo(markersGroup);
      }

      marker.addTo(markersGroup);
    });
  }, [selectedState, searchQuery, activeTileKey, showDensityLayer]);

  // Pan to institution or reset
  const handleFlyTo = (lat: number, lng: number, zoom = 12) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, {
      duration: 1.5
    });
  };

  const handleResetMap = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([21.7679, 78.8718], 5, { duration: 1.2 });
    setSelectedInst(null);
    if (onSelectState) onSelectState('');
  };

  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut();
  };

  return (
    <div className={`relative m3-card overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full'
    }`}>
      
      {/* Google Stitch Top Control Bar */}
      <div className="p-3.5 bg-white/95 dark:bg-[#101B36]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E2D52] flex flex-wrap items-center justify-between gap-3 select-none">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2457E8] to-[#16C8D8] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                National GIS Telemetry & Real Satellite Map
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sat-Feed
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Real GPS Geolocation across 10 Technical Institutions & 3,900 Sanctioned Seats
            </p>
          </div>
        </div>

        {/* Center: Search College or City on Map */}
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, college, or AISHE..."
            className="m3-input w-full pl-8 py-1.5 text-xs bg-slate-50 dark:bg-[#0A1124]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Right: Layer Switcher & Tools */}
        <div className="flex items-center gap-2">
          
          {/* Segmented Tile Layer Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-[#0A1124] rounded-xl border border-slate-200 dark:border-[#1E2D52] text-[11px] font-semibold">
            <button
              onClick={() => setActiveTileKey('stitch')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTileKey === 'stitch'
                  ? 'bg-white dark:bg-[#101B36] text-[#2457E8] dark:text-[#16C8D8] shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Google Stitch
            </button>
            <button
              onClick={() => setActiveTileKey('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTileKey === 'satellite'
                  ? 'bg-white dark:bg-[#101B36] text-[#2457E8] dark:text-[#16C8D8] shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveTileKey('dark')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTileKey === 'dark'
                  ? 'bg-white dark:bg-[#101B36] text-[#2457E8] dark:text-[#16C8D8] shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dark GIS
            </button>
          </div>

          {/* Density circles toggle */}
          <button
            onClick={() => setShowDensityLayer(!showDensityLayer)}
            title="Toggle Student Enrolment Density Radii"
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              showDensityLayer
                ? 'bg-blue-50 text-[#2457E8] dark:bg-blue-950/60 dark:text-cyan-400 border-blue-200'
                : 'bg-white dark:bg-[#101B36] text-slate-500 border-slate-200 dark:border-[#1E2D52]'
            }`}
          >
            Density
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1124] text-slate-600 dark:text-slate-300 hover:text-[#2457E8] border border-slate-200 dark:border-[#1E2D52]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Reset Map */}
          <button
            onClick={handleResetMap}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1124] text-slate-600 dark:text-slate-300 hover:text-[#2457E8] border border-slate-200 dark:border-[#1E2D52]"
            title="Reset National View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Real Map Canvas Container */}
      <div className="relative">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[460px] z-10 bg-slate-100 dark:bg-slate-900"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '460px' }}
        />

        {/* Floating Google-Style Zoom Controls (Top-Right on Map) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col bg-white dark:bg-[#101B36] rounded-xl shadow-lg border border-slate-200 dark:border-[#1E2D52] overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Floating National Regional Pills (Bottom-Left on Map) */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/90 dark:bg-[#101B36]/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-[#1E2D52] text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Quick Region:</span>
          {[
            { label: 'All India', lat: 21.7679, lng: 78.8718, zoom: 5 },
            { label: 'Delhi NCR', lat: 28.6139, lng: 77.2090, zoom: 11 },
            { label: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 11 },
            { label: 'Bengaluru', lat: 12.9716, lng: 77.5946, zoom: 11 },
            { label: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 11 },
            { label: 'Kolkata', lat: 22.5726, lng: 88.3639, zoom: 11 },
            { label: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 11 },
          ].map((reg, idx) => (
            <button
              key={idx}
              onClick={() => handleFlyTo(reg.lat, reg.lng, reg.zoom)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-[#0A1124] text-slate-700 dark:text-slate-300 hover:bg-[#2457E8] hover:text-white transition-all shadow-2xs"
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Selected Institution Popover Card (Elevated Google Stitch Style) */}
        {selectedInst && (
          <div className="absolute top-4 left-4 z-20 max-w-sm w-full bg-white/95 dark:bg-[#101B36]/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-[#1E2D52] space-y-3 animate-in fade-in slide-in-from-top-2">
            
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#2457E8] dark:text-[#16C8D8]">
                    {selectedInst.id}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    AISHE: {selectedInst.aishe}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  {selectedInst.name}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedInst(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sanctioned Seats</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedInst.approvedIntake}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Enrolled Students</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedInst.enrolledStudents}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">APAAR Verified</span>
                <span className="font-mono font-bold text-[#16A36A] mt-0.5 block">
                  {selectedInst.apaarVerifiedRate}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1124] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Compliance Index</span>
                <span className="font-mono font-bold text-[#2457E8] dark:text-[#16C8D8] mt-0.5 block">
                  {selectedInst.complianceScore}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => handleFlyTo(selectedInst.lat, selectedInst.lng, 15)}
                className="text-[11px] font-semibold text-[#2457E8] dark:text-[#16C8D8] hover:underline flex items-center gap-1"
              >
                <span>Zoom In (Campus)</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => {
                  if (onSelectInstitution) onSelectInstitution(selectedInst.id);
                  setSelectedInst(null);
                }}
                className="m3-btn-primary text-[11px] py-1 px-3"
              >
                Inspect Institution
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Google Stitch Bottom Telemetry Bar */}
      <div className="p-3 bg-slate-50/80 dark:bg-[#0A1124]/80 border-t border-slate-100 dark:border-[#1E2D52] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2457E8]" />
            <span>100% Compliant Campuses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E34B55] animate-pulse" />
            <span>Intake Anomaly / Review Required (INST-107)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Map Provider: {TILE_LAYERS[activeTileKey].name}</span>
          <span>•</span>
          <span>Projection: EPSG:3857 WGS84</span>
        </div>
      </div>

    </div>
  );
};
