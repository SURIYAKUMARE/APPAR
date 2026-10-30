import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  subLabel?: string;
  type: string;
  group: string;
  compliance_score?: number;
  is_collision?: boolean;
  radius: number;
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  color?: string;
  dashed?: boolean;
}

interface AcademicIdentityGraphPageProps {
  onNavigate: (page: string) => void;
}

export const AcademicIdentityGraphPage: React.FC<AcademicIdentityGraphPageProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'COLLISIONS' | 'INSTITUTIONS'>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const draggedNodeRef = useRef<GraphNode | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/identity-graph', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          // Initialize random coordinates around center
          const width = 800;
          const height = 500;
          const initializedNodes = data.nodes.map((n: GraphNode, i: number) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const dist = n.type === 'CENTRAL_AUTHORITY' ? 0 : n.type === 'INSTITUTION' ? 140 : 260;
            return {
              ...n,
              x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
              y: height / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
              vx: 0,
              vy: 0,
            };
          });
          setNodes(initializedNodes);
          setEdges(data.edges);
          setSelectedNode(initializedNodes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, []);

  // Physics animation simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const simulate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(zoom, zoom);

      // Filter nodes & edges
      const activeNodes = nodes.filter((n) => {
        if (filterMode === 'COLLISIONS') return n.is_collision || n.type === 'CENTRAL_AUTHORITY';
        if (filterMode === 'INSTITUTIONS') return n.type === 'INSTITUTION' || n.type === 'CENTRAL_AUTHORITY';
        return true;
      });

      const activeNodeIds = new Set(activeNodes.map((n) => n.id));
      const activeEdges = edges.filter(
        (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
      );

      // Node lookup
      const nodeMap = new Map<string, GraphNode>();
      activeNodes.forEach((n) => nodeMap.set(n.id, n));

      // Draw Edges
      activeEdges.forEach((e) => {
        const s = nodeMap.get(e.source);
        const t = nodeMap.get(e.target);
        if (!s || !t || s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined) return;

        ctx.strokeStyle = e.color || 'rgba(0, 242, 254, 0.25)';
        ctx.lineWidth = e.dashed ? 2 : 1;
        if (e.dashed) {
          ctx.setLineDash([6, 6]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      });

      ctx.setLineDash([]);

      // Draw Nodes
      activeNodes.forEach((n) => {
        if (n.x === undefined || n.y === undefined) return;

        const isSelected = selectedNode?.id === n.id;

        // Outer glow
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isSelected ? 20 : 8;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Stroke ring
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset

        // Label
        ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.radius + 12);
      });

      ctx.restore();

      animId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, edges, selectedNode, filterMode, zoom]);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offsetRef.current.x) / zoom;
    const mouseY = (e.clientY - rect.top - offsetRef.current.y) / zoom;

    // Check if clicked a node
    const clicked = nodes.find((n) => {
      if (n.x === undefined || n.y === undefined) return false;
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    if (clicked) {
      draggedNodeRef.current = clicked;
      setSelectedNode(clicked);
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (draggedNodeRef.current) {
      const rect = canvas.getBoundingClientRect();
      draggedNodeRef.current.x = (e.clientX - rect.left - offsetRef.current.x) / zoom;
      draggedNodeRef.current.y = (e.clientY - rect.top - offsetRef.current.y) / zoom;
    } else if (isPanningRef.current) {
      offsetRef.current = {
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      };
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isPanningRef.current = false;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#060d1f] to-slate-950 border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
              NATIONAL IDENTITY GRAPH
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              PRIVACY PRESERVED (HMAC-SHA256)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            RELATIONSHIP & COLLISION GRAPH
            <Share2 className="w-7 h-7 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Visual graph connecting AICTE regulatory nodes, academic institutions, departments, and cross-college collision clusters. Click and drag nodes to explore relationships.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          {(['ALL', 'COLLISIONS', 'INSTITUTIONS'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                filterMode === mode
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-4 shadow-[0_0_20px_rgba(0,242,254,0.1)] relative overflow-hidden flex flex-col justify-between h-[520px]">
          {/* Top Canvas Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>NODES: {nodes.length} • EDGES: {edges.length}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  offsetRef.current = { x: 0, y: 0 };
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={460}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          <div className="text-[10px] font-mono text-slate-500 bg-slate-950/80 p-2 rounded-lg border border-slate-800 z-10 flex items-center justify-between">
            <span>Red dashed lines = Concurrent Dual Admission Collisions</span>
            <span>Click any node to inspect metadata</span>
          </div>
        </div>

        {/* Selected Node Telemetry HUD */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-4 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                NODE METADATA INSPECTOR
              </span>
              {selectedNode?.is_collision && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  DUPLICATE COLLISION
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    {selectedNode.type}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {selectedNode.label}
                  </h3>
                  {selectedNode.subLabel && (
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {selectedNode.subLabel}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ENTITY GROUP</span>
                    <span className="text-cyan-300 font-bold">{selectedNode.group}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">NODE IDENTIFIER</span>
                    <span className="text-slate-300 font-bold truncate block">{selectedNode.id}</span>
                  </div>
                </div>

                {selectedNode.is_collision && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Concurrent Enrolment Alert</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This student APAAR ID hash has active registrations at two distinct institutions. Flagged for Regulation Bureau side-by-side audit.
                    </p>
                    <button
                      onClick={() => onNavigate('duplicate-detection')}
                      className="w-full py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-xs font-bold transition-colors"
                    >
                      Open Duplicate Workspace
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Click a graph node to inspect relationships.
              </div>
            )}
          </div>

          {/* Privacy Notice Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              DPDP Act 2023 Identity Anonymization:
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All student nodes are anonymized with salted HMAC-SHA256 identifiers. Cross-institutional linkages are verified mathematically without exposing confidential raw data across college silos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
