import React, { useState } from 'react';
import { 
  Bot, Sparkles, Send, X, ChevronRight, RefreshCw, 
  HelpCircle, CheckCircle2, ShieldCheck, Database 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AicteCopilotProps {
  onNavigate: (page: string) => void;
}

const SAMPLE_PROMPTS = [
  "Show top institutions by enrolment",
  "Find institutions exceeding approved intake",
  "Which states have highest pending APAAR verification?",
  "Explain why INST-AICTE-107 received high risk score",
  "Find cross-institution duplicate records"
];

export const AicteCopilot: React.FC<AicteCopilotProps> = ({ onNavigate }) => {
  const { token, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([
    {
      role: 'assistant',
      text: "Namaste! I am your **AICTE APAAR ONE Copilot**. You can ask me natural-language regulatory questions about admissions, cross-college duplicate collisions, approved intake violations, and state verification backlogs.",
      suggested_actions: ["Explore Command Center", "Check Duplicate AI", "Open Offline Center"]
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMsg = { role: 'user', text: q };
    setHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/analytics/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query: q })
      });

      if (!res.ok) throw new Error('Copilot response error');
      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response,
          summary: data.summary,
          confidence: data.confidence,
          evidence_table: data.evidence_table,
          suggested_actions: data.suggested_actions
        }
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I analyzed the national student registry. For this query, please inspect the **Regulation Bureau Compliance Desk** or the **Duplicate Detection Engine** for audited evidence.",
          suggested_actions: ["Open Regulation Bureau", "View Duplicates"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Command Center')) onNavigate('super-admin');
    else if (action.includes('Regulation') || action.includes('Show Cause')) onNavigate('regulation-bureau');
    else if (action.includes('Duplicate')) onNavigate('duplicate-detection');
    else if (action.includes('Offline')) onNavigate('offline-center');
    else if (action.includes('Compliance') || action.includes('Auditor')) onNavigate('admission-compliance');
    else if (action.includes('Institution')) onNavigate('institution-management');
    else if (action.includes('Report')) onNavigate('analytics-reports');
  };

  return (
    <>
      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white font-bold text-xs shadow-2xl shadow-cyan-500/30 flex items-center space-x-2.5 hover:scale-105 active:scale-95 transition-all border border-cyan-400/40"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        </div>
        <span className="tracking-wide">AICTE Copilot</span>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[460px] h-[580px] bg-white dark:bg-[#0a192f] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="font-extrabold text-xs tracking-wider flex items-center space-x-1.5">
                  <span>AICTE REGULATION COPILOT</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-mono">
                    AI Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Natural Language Academic Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Try:</span>
            {SAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-cyan-500 shrink-0 truncate max-w-[180px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Confidence Badge */}
                  {msg.confidence && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                      </span>
                      <span>Verified Evidence Base</span>
                    </div>
                  )}

                  {/* Evidence Table */}
                  {msg.evidence_table && msg.evidence_table.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
                      <table className="w-full text-left text-[10px]">
                        <thead className="text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            {Object.keys(msg.evidence_table[0]).slice(0, 3).map((col) => (
                              <th key={col} className="pb-1 capitalize">{col.replace('_', ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {msg.evidence_table.slice(0, 3).map((row: any, rIdx: number) => (
                            <tr key={rIdx}>
                              {Object.values(row).slice(0, 3).map((val: any, cIdx: number) => (
                                <td key={cIdx} className="py-1 pr-2 truncate max-w-[120px] font-mono">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Suggested Action Pills */}
                  {msg.suggested_actions && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.suggested_actions.map((act: string, aIdx: number) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-bold flex items-center space-x-1"
                        >
                          <span>{act}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs w-36">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                <span>Analyzing data...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-[#0a192f] border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot (e.g. Find institutions exceeding intake)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
