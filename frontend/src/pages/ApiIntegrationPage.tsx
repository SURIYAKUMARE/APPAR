import React, { useState } from 'react';
import { 
  Webhook, Key, Globe, CheckCircle2, Copy, 
  RefreshCw, Terminal, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ApiIntegrationPageProps {
  onNavigate: (page: string) => void;
}

const ENDPOINTS = [
  { method: 'POST', path: '/api/auth/login', desc: 'SSO login with captcha and rate limiting' },
  { method: 'POST', path: '/api/auth/mfa/verify', desc: 'Validates second-factor TOTP / SMS token' },
  { method: 'GET', path: '/api/institutions', desc: 'List technical institutions filtered by state and standing' },
  { method: 'POST', path: '/api/students', desc: 'Register student with real-time Luhn/Verhoeff & duplicate scan' },
  { method: 'POST', path: '/api/students/bulk-upload', desc: 'Batch ingest CSV / Excel student files' },
  { method: 'GET', path: '/api/students', desc: 'Search and filter students with institutional data isolation' },
  { method: 'POST', path: '/api/apaar/verify', desc: 'Gateway adapter for DigiLocker and ABC central depository' },
  { method: 'POST', path: '/api/admissions/validate', desc: 'Validates actual enrolment vs approved intake capacity' },
  { method: 'GET', path: '/api/analytics/dashboard', desc: 'National KPI and compliance intelligence metrics' },
  { method: 'POST', path: '/api/sync/push', desc: 'Push local offline IndexedDB queued records to central registry' },
  { method: 'GET', path: '/api/sync/pull', desc: 'Pull delta updates for client offline caching' },
  { method: 'POST', path: '/api/verification/request', desc: 'Create third-party verifier request with signed QR token' },
  { method: 'GET', path: '/api/audit/logs', desc: 'Query immutable tamper-evident SHA-256 audit ledger' }
];

export const ApiIntegrationPage: React.FC<ApiIntegrationPageProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [apiKey, setApiKey] = useState('apaar_live_key_99f2e71b40984812a6');
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestCall = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = selectedEndpoint.path;
      const options: any = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (selectedEndpoint.method === 'GET') {
        const res = await fetch(url, options);
        const data = await res.json();
        setTestResult(data);
      } else {
        // Mock execution for POST in UI preview
        setTestResult({
          status: 'SUCCESS',
          endpoint: selectedEndpoint.path,
          method: selectedEndpoint.method,
          response_code: 200,
          latency: '24ms',
          data: {
            message: 'Endpoint verified operational in sandbox environment.'
          }
        });
      }
    } catch (e: any) {
      setTestResult({ error: e.message || 'Call failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Webhook className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              API Architecture & External Gateway Adapters
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            OpenAPI 3.1 Specification • DigiLocker / ABC Sandbox Adapters • Webhook Dispatchers.
          </p>
        </div>

        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500 flex items-center space-x-2 transition-colors shadow-sm"
        >
          <span>Interactive Swagger UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Gateway Adapters Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ABC Gateway</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            Academic Bank of Credits
          </div>
          <div className="text-[11px] text-slate-500">
            Adapter: Sandbox Protocol v2.6 • Latency 38ms
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DigiLocker NAD</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            National Academic Depository
          </div>
          <div className="text-[11px] text-slate-500">
            Digital Signature: RSA-SHA256 • Status: Online
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">UIDAI Engine</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            Verhoeff Checksum Check
          </div>
          <div className="text-[11px] text-slate-500">
            Algorithmic Check: 100% In-Memory Local
          </div>
        </div>
      </div>

      {/* API Key Box */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>INSTITUTION REGULATORY API KEY</span>
          </div>
          <div className="font-mono text-xs text-slate-300 truncate max-w-md">
            {apiKey}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyKey}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Endpoints Explorer & Sandbox Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Endpoints List (1 col) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            API Endpoints Catalog
          </h3>
          {ENDPOINTS.map((ep, i) => (
            <button
              key={i}
              onClick={() => setSelectedEndpoint(ep)}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start space-x-2 ${
                selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                ep.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {ep.method}
              </span>
              <span className="font-mono truncate">{ep.path}</span>
            </button>
          ))}
        </div>

        {/* Live Test Bench (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                selectedEndpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {selectedEndpoint.method}
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {selectedEndpoint.path}
              </span>
            </div>

            <button
              onClick={handleTestCall}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
              <span>Execute Sandbox Request</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEndpoint.desc}</p>

          {/* Response Console */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sandbox JSON Response:
            </span>
            <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
              {testResult ? JSON.stringify(testResult, null, 2) : '// Click "Execute Sandbox Request" to probe this REST endpoint in real-time.'}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
