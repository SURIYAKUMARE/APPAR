import React, { useEffect, useRef, useState } from 'react';
import { Globe2, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface NationalNode {
  name: string;
  lat: number;
  lng: number;
  students: number;
  complianceRate: number;
  status: 'OPTIMAL' | 'AUDIT_FLAG' | 'SYNCING';
}

const INDIAN_NODES: NationalNode[] = [
  { name: 'AICTE HQ (New Delhi)', lat: 28.6139, lng: 77.2090, students: 28450, complianceRate: 99.4, status: 'OPTIMAL' },
  { name: 'Maharashtra Hub (Mumbai/Pune)', lat: 19.0760, lng: 72.8777, students: 48920, complianceRate: 98.1, status: 'OPTIMAL' },
  { name: 'Karnataka Hub (Bengaluru)', lat: 12.9716, lng: 77.5946, students: 42100, complianceRate: 98.8, status: 'OPTIMAL' },
  { name: 'Tamil Nadu Hub (Chennai)', lat: 13.0827, lng: 80.2707, students: 39400, complianceRate: 97.9, status: 'OPTIMAL' },
  { name: 'Telangana Hub (Hyderabad)', lat: 17.3850, lng: 78.4867, students: 31200, complianceRate: 98.2, status: 'OPTIMAL' },
  { name: 'West Bengal Hub (Kolkata)', lat: 22.5726, lng: 88.3639, students: 24600, complianceRate: 96.5, status: 'AUDIT_FLAG' },
  { name: 'Gujarat Hub (Ahmedabad)', lat: 23.0225, lng: 72.5714, students: 21800, complianceRate: 99.1, status: 'OPTIMAL' },
  { name: 'UP Nodal Center (Lucknow)', lat: 26.8467, lng: 80.9462, students: 34100, complianceRate: 97.2, status: 'OPTIMAL' },
];

export const HolographicGlobe: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<NationalNode>(INDIAN_NODES[0]);
  const [rotationX, setRotationX] = useState<number>(0.2);
  const [rotationY, setRotationY] = useState<number>(-1.3);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Generate latitude/longitude dot grid
    const points: { lat: number; lng: number }[] = [];
    for (let lat = -80; lat <= 80; lat += 15) {
      const radiusAtLat = Math.cos((lat * Math.PI) / 180);
      const lngStep = Math.max(12, Math.round(18 / (radiusAtLat || 0.1)));
      for (let lng = -180; lng < 180; lng += lngStep) {
        points.push({ lat, lng });
      }
    }

    const render = () => {
      t += 0.01;
      // Auto gentle rotate if not dragging
      if (!isDraggingRef.current) {
        setRotationY((prev) => prev + 0.003);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const globeRadius = Math.min(cx, cy) * 0.72;

      // Outer ambient sci-fi ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.2);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, globeRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Telemetry degree ticks
      for (let i = 0; i < 36; i++) {
        const rad = (i * Math.PI * 2) / 36;
        const x1 = Math.cos(rad) * (globeRadius * 1.32);
        const y1 = Math.sin(rad) * (globeRadius * 1.32);
        const x2 = Math.cos(rad) * (globeRadius * 1.37);
        const y2 = Math.sin(rad) * (globeRadius * 1.37);
        ctx.strokeStyle = i % 9 === 0 ? 'rgba(0, 242, 254, 0.6)' : 'rgba(0, 242, 254, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // Atmospheric back glow
      const atmGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.5, cx, cy, globeRadius * 1.15);
      atmGrad.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
      atmGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.15)');
      atmGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Project spherical points to 2D
      const project = (lat: number, lng: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180) + rotationY;

        // 3D coordinates on unit sphere
        let x = Math.sin(phi) * Math.cos(theta);
        let y = Math.cos(phi);
        let z = Math.sin(phi) * Math.sin(theta);

        // Tilt with rotationX
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const yNew = y * cosX - z * sinX;
        const zNew = y * sinX + z * cosX;

        return {
          px: cx + x * globeRadius,
          py: cy - yNew * globeRadius,
          visible: zNew > 0,
          depth: zNew,
        };
      };

      // Draw background grid points
      for (const pt of points) {
        const p = project(pt.lat, pt.lng);
        if (p.visible) {
          const alpha = 0.1 + p.depth * 0.45;
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, 1.2 + p.depth * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Indian National Educational Nodes
      INDIAN_NODES.forEach((node, idx) => {
        const p = project(node.lat, node.lng);
        if (p.visible) {
          const isSelected = selectedNode.name === node.name;
          const pulse = (Math.sin(t * 4 + idx) + 1) * 3;

          // Connecting beacon ray
          ctx.strokeStyle = isSelected ? 'rgba(0, 242, 254, 0.8)' : 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.px, p.py - 16);
          ctx.stroke();

          // Ripple circle
          ctx.strokeStyle = node.status === 'AUDIT_FLAG' 
            ? `rgba(239, 68, 68, ${0.4 + pulse * 0.1})` 
            : `rgba(0, 242, 254, ${0.4 + pulse * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.px, p.py - 16, 4 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Solid Marker Core
          ctx.fillStyle = node.status === 'AUDIT_FLAG' ? '#ef4444' : '#00f2fe';
          ctx.beginPath();
          ctx.arc(p.px, p.py - 16, isSelected ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Node Text Tag
          if (isSelected || p.depth > 0.4) {
            ctx.font = '10px monospace';
            ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.8)';
            ctx.fillText(node.name.split(' (')[0], p.px + 10, p.py - 16);
          }
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotationX, rotationY, selectedNode]);

  // Mouse handlers for dragging globe
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotationY((prev) => prev + deltaX * 0.008);
    setRotationX((prev) => Math.max(-0.8, Math.min(0.8, prev + deltaY * 0.008)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#060d1f] to-slate-950 p-6 border border-cyan-500/30 shadow-[0_0_35px_rgba(0,242,254,0.12)]">
      {/* Header Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Globe2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                HOLOGRAPHIC NATIONAL ADMISSION GRID
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                LIVE 3D
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 3D Geospatial Academic Network • Click & drag to rotate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            SYNCHRONIZED: 10/10 HUBS
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            ENTROPY: 99.8% VERIFIED
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Canvas Area */}
        <div className="lg:col-span-7 flex justify-center items-center select-none cursor-grab active:cursor-grabbing relative">
          <canvas
            ref={canvasRef}
            width={440}
            height={380}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full drop-shadow-[0_0_20px_rgba(0,242,254,0.3)]"
          />
          <div className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-400/60 bg-slate-900/80 px-2 py-1 rounded border border-cyan-500/20">
            FOV: 45° • RAD: 6371 KM • LAT/LNG ROTATION
          </div>
        </div>

        {/* Selected Node Telemetry HUD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                Selected Regional Telemetry
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedNode.status === 'OPTIMAL'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white">{selectedNode.name}</h4>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">STUDENTS MONITORED</span>
                <span className="text-lg font-bold text-cyan-300 font-mono">
                  {selectedNode.students.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">COMPLIANCE INDEX</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {selectedNode.complianceRate}%
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>APAAR ID Seeding Density</span>
                <span className="text-cyan-400 font-bold">{selectedNode.complianceRate}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                  style={{ width: `${selectedNode.complianceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Node Selector Pills */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">
              Quick Focus Regional Hub:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INDIAN_NODES.map((node) => (
                <button
                  key={node.name}
                  onClick={() => setSelectedNode(node)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    selectedNode.name === node.name
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,242,254,0.5)]'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  {node.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
