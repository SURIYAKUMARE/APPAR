import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Activity } from 'lucide-react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'alert';

interface AiAssistantOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
  label?: string;
  subLabel?: string;
}

export const AiAssistantOrb: React.FC<AiAssistantOrbProps> = ({
  state = 'idle',
  size = 'md',
  interactive = true,
  onClick,
  label,
  subLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dimension scaling
  const dimensions = {
    sm: { width: 90, height: 90, coreRadius: 18 },
    md: { width: 140, height: 140, coreRadius: 28 },
    lg: { width: 220, height: 220, coreRadius: 46 },
    xl: { width: 300, height: 300, coreRadius: 65 },
  }[size];

  // Canvas particle / wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseR = dimensions.coreRadius;

      // Pulse multiplier based on state
      let pulse = Math.sin(t * 2) * 4;
      let ringSpeed = t;
      let primaryColor = 'rgba(0, 242, 254, ';
      let secondaryColor = 'rgba(139, 92, 246, ';

      if (state === 'listening') {
        pulse = Math.sin(t * 8) * 8;
        primaryColor = 'rgba(6, 182, 212, ';
      } else if (state === 'thinking') {
        ringSpeed = t * 2.5;
        primaryColor = 'rgba(168, 85, 247, ';
        secondaryColor = 'rgba(0, 242, 254, ';
      } else if (state === 'speaking') {
        pulse = Math.sin(t * 5) * 6 + Math.cos(t * 12) * 3;
        primaryColor = 'rgba(16, 185, 129, ';
        secondaryColor = 'rgba(0, 242, 254, ';
      } else if (state === 'alert') {
        pulse = Math.sin(t * 10) * 7;
        primaryColor = 'rgba(239, 68, 68, ';
        secondaryColor = 'rgba(245, 158, 11, ';
      }

      // Outer Glowing Ring 1 (Clockwise)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(ringSpeed * 0.5);
      ctx.strokeStyle = primaryColor + '0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14]);
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 1.85 + pulse * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Outer Ring 2 (Counter-Clockwise with ticks)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-ringSpeed * 0.8);
      ctx.strokeStyle = secondaryColor + '0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, baseR * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting energy satellite dots
      for (let i = 0; i < 3; i++) {
        const angle = (i * (Math.PI * 2)) / 3 + ringSpeed;
        const orbitX = Math.cos(angle) * (baseR * 1.5);
        const orbitY = Math.sin(angle) * (baseR * 1.5);
        ctx.fillStyle = primaryColor + '0.9)';
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Radial Core Glow
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        baseR + pulse
      );
      grad.addColorStop(0, primaryColor + '0.95)');
      grad.addColorStop(0.4, secondaryColor + '0.7)');
      grad.addColorStop(0.8, primaryColor + '0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseR + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Inner Core Specular Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (baseR + pulse) * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Voice visualizer frequency lines when active
      if (state === 'speaking' || state === 'listening') {
        const barCount = 16;
        for (let i = 0; i < barCount; i++) {
          const angle = (i * (Math.PI * 2)) / barCount;
          const barLen = 6 + Math.abs(Math.sin(t * 6 + i)) * (state === 'speaking' ? 14 : 9);
          const x1 = centerX + Math.cos(angle) * (baseR * 1.15);
          const y1 = centerY + Math.sin(angle) * (baseR * 1.15);
          const x2 = centerX + Math.cos(angle) * (baseR * 1.15 + barLen);
          const y2 = centerY + Math.sin(angle) * (baseR * 1.15 + barLen);

          ctx.strokeStyle = primaryColor + '0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, dimensions]);

  const getStateBadge = () => {
    switch (state) {
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Mic className="w-3 h-3 text-cyan-400" /> LISTENING...
          </span>
        );
      case 'thinking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/40">
            <Sparkles className="w-3 h-3 text-violet-400 animate-spin" /> SYNCHRONIZING AGENTS
          </span>
        );
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Volume2 className="w-3 h-3 text-emerald-400" /> SYNTHESIZING AUDIO
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
            <Activity className="w-3 h-3 text-red-400" /> ANOMALY DETECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-cyan-400/90 border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            AICTE NEURAL CORE READY
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        onClick={interactive ? onClick : undefined}
        className={`relative flex items-center justify-center transition-transform ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
        title={interactive ? 'Click to engage AICTE Voice Intelligence' : undefined}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="relative z-10"
        />
        {/* Soft background glow aura */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors pointer-events-none ${
            state === 'alert'
              ? 'bg-red-500'
              : state === 'thinking'
              ? 'bg-violet-600'
              : state === 'speaking'
              ? 'bg-emerald-500'
              : 'bg-cyan-500'
          }`}
        />
      </div>

      {(label || subLabel || getStateBadge()) && (
        <div className="mt-2 space-y-1">
          {getStateBadge()}
          {label && (
            <h4 className="text-sm font-semibold tracking-wide text-white">
              {label}
            </h4>
          )}
          {subLabel && (
            <p className="text-xs text-slate-400 font-mono">
              {subLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
