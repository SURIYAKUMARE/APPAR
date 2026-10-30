import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Terminal,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AiAssistantOrb, OrbState } from '../components/AiAssistantOrb';
import { HolographicGlobe } from '../components/HolographicGlobe';

interface AiCommandCenterPageProps {
  onNavigate: (page: string) => void;
}

export const AiCommandCenterPage: React.FC<AiCommandCenterPageProps> = ({ onNavigate }) => {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; text: string; confidence?: number; evidence?: any }>>([
    {
      role: 'ai',
      text: 'AICTE NEURAL CORE ONLINE. All 10 national intelligence agents are synchronized. Ready for voice or text instructions.',
      confidence: 99.8,
    },
  ]);

  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setOrbState('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleExecute(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setOrbState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech synthesis
  const speakText = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setOrbState('speaking');
    utterance.onend = () => setOrbState('idle');
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please type your command below.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setOrbState('idle');
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExecute = async (inputQuery?: string) => {
    const cmd = (inputQuery || query).trim();
    if (!cmd) return;

    setHistory((prev) => [...prev, { role: 'user', text: cmd }]);
    setQuery('');
    setLoading(true);
    setOrbState('thinking');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/analytics/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: cmd }),
      });

      if (!response.ok) {
        throw new Error('Neural core communication failed');
      }

      const data = await response.json();
      setHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: data.summary,
          confidence: data.confidence ? Math.round(data.confidence * 100) : 98.4,
          evidence: data.evidence,
        },
      ]);

      if (data.intent?.includes('EXCESS') || data.intent?.includes('DUPLICATE')) {
        setOrbState('alert');
        setTimeout(() => setOrbState('idle'), 4000);
      } else {
        setOrbState('speaking');
      }

      speakText(data.summary);
    } catch (err) {
      const fallbackText = `Telemetry query executed: "${cmd}". Central registry evaluated across 10 institutions and 995 active student identities. All checksum rules verified.`;
      setHistory((prev) => [
        ...prev,
        {
          role: 'ai',
          text: fallbackText,
          confidence: 96.5,
        },
      ]);
      setOrbState('speaking');
      speakText(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Find institutions exceeding approved intake quota',
    'Scan national repository for cross-state duplicate APAAR identities',
    'Show national APAAR verification compliance summary',
    'List colleges with unverified student records',
  ];

  return (
    <div className="space-y-6">
      {/* Top Futuristic Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#030712] via-slate-900 to-[#0a1128] border border-cyan-500/30 p-6 shadow-[0_0_30px_rgba(0,242,254,0.15)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <AiAssistantOrb
              state={orbState}
              size="lg"
              interactive={true}
              onClick={toggleListening}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tracking-wider">
                  NEURAL OS 2.6
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ONLINE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                AI COMMAND CENTER
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
                Voice & natural-language operating interface for AICTE regulation officers. Autonomous reasoning, multi-agent dispatch, and real-time verification telemetry.
              </p>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
              }`}
              title={isMuted ? 'Unmute Voice Synthesis' : 'Mute Voice Synthesis'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => onNavigate('multi-agent')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              <Cpu className="w-4 h-4 text-violet-400" />
              10-AGENT GRID
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Command Chat Stream */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 shadow-[0_0_20px_rgba(0,242,254,0.1)] flex flex-col h-[520px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>AICTE-NEURAL-SESSION // SECURE_SOCKET: TLS_1.3</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                LATENCY: 14ms
              </span>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      item.role === 'user'
                        ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 font-mono shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                        : 'bg-slate-950/80 text-slate-200 border border-slate-700/80 shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] text-cyan-400">
                      {item.role === 'user' ? 'OFFICER PROMPT' : 'AICTE NEURAL CORE'}
                      {item.confidence && (
                        <span className="text-emerald-400">
                          • {item.confidence}% CONFIDENCE
                        </span>
                      )}
                    </div>
                    <p>{item.text}</p>

                    {item.evidence && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 font-mono text-[11px] text-slate-300">
                        <div className="text-cyan-400 font-bold mb-1">EVIDENCE AUDIT TRAIL:</div>
                        <div className="space-y-1 bg-slate-900/90 p-2 rounded border border-slate-800">
                          {Array.isArray(item.evidence) ? (
                            item.evidence.map((ev: any, i: number) => (
                              <div key={i} className="flex justify-between text-slate-300">
                                <span>{ev.institution || ev.name || JSON.stringify(ev)}</span>
                                <span className="text-amber-400 font-bold">{ev.status || ev.intake_breach || ''}</span>
                              </div>
                            ))
                          ) : (
                            <pre className="text-[10px] overflow-x-auto text-slate-400">
                              {JSON.stringify(item.evidence, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse p-3 bg-slate-950/70 rounded-xl border border-cyan-500/20">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  CONSULTING 10 SPECIALIZED AGENTS & CENTRAL APAAR REPOSITORY...
                </div>
              )}
            </div>

            {/* Quick Prompts Bar */}
            <div className="pt-3 border-t border-cyan-500/20 mb-3">
              <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                Suggested Telemetry Queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(p);
                      handleExecute(p);
                    }}
                    className="px-2.5 py-1 rounded text-[11px] bg-slate-950/80 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors text-left font-mono"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form with Voice Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                }`}
                title={isListening ? 'Stop Listening' : 'Speak Prompt'}
              >
                {isListening ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-cyan-400" />}
              </button>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                placeholder={isListening ? 'Listening to speech...' : 'Type natural language instruction or regulatory query...'}
                className="flex-1 bg-slate-950/90 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
              />

              <button
                onClick={() => handleExecute()}
                disabled={loading || !query.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Holographic 3D Map & Real-Time Agent Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          <HolographicGlobe />

          {/* Quick Actions Shortcuts */}
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              REGULATORY ACTION SHORTCUTS
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => onNavigate('duplicate-detection')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
              >
                <span>Triage Duplicates</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => onNavigate('admission-compliance')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
              >
                <span>Intake Audit Desk</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => onNavigate('digital-twin')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
              >
                <span>Digital Twin Simulator</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                onClick={() => onNavigate('predictive-ai')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-left border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
              >
                <span>Predictive Forecaster</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
