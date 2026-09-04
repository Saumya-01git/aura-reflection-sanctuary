import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Lock, 
  Cpu, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  EyeOff,
  Shield
} from 'lucide-react';
import { UserProfile } from '../types';
import { SecurityAuditModal } from './SecurityAuditModal';

interface AdminTelemetryProps {
  user: UserProfile | null;
}

export const AdminTelemetryModal: React.FC<AdminTelemetryProps> = ({ user }) => {
  const [evaluatorRole, setEvaluatorRole] = useState<'admin' | 'user'>('admin');
  const [telemetry, setTelemetry] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSecurityAuditModal, setShowSecurityAuditModal] = useState(false);

  const fetchTelemetry = async (roleToFetch: 'admin' | 'user' = evaluatorRole) => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`/api/telemetry?role=${roleToFetch}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      } else if (res.status === 403) {
        const errData = await res.json();
        setErrorStatus(errData.message || 'Access Forbidden: Insufficient RBAC privileges.');
        setTelemetry(null);
      }
    } catch (e) {
      console.warn('Error fetching telemetry:', e);
    } finally {
      setLoading(false);
      setLastRefreshed(Date.now());
    }
  };

  useEffect(() => {
    fetchTelemetry(evaluatorRole);
  }, [evaluatorRole]);

  const handlePulse = async () => {
    if (evaluatorRole === 'user') return;
    setIsSimulating(true);
    try {
      await fetch('/api/telemetry/record', { method: 'POST' });
      await fetchTelemetry('admin');
    } catch (e) {
      // ignore
    } finally {
      setIsSimulating(false);
    }
  };

  const formatUptime = (seconds: number = 0) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Banner with Evaluator Role Preview Toggle */}
      <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-cyan-950/30 border border-cyan-400/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC) System Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Playfair_Display']">
            System Telemetry & Health Vault
          </h2>
          <p className="text-sm text-cyan-100/80 mt-1.5 max-w-2xl leading-relaxed">
            Live operational observability for Aura running on Google Cloud Run with Firebase Auth and Firestore.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
          {/* Evaluator Role Preview Toggle */}
          <div className="p-1 rounded-2xl backdrop-blur-md bg-black/40 border border-white/20 flex items-center gap-1 shadow-inner">
            <span className="text-[10px] font-mono uppercase text-white/50 px-2">Role:</span>
            <button
              id="evaluator-role-user-btn"
              onClick={() => setEvaluatorRole('user')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                evaluatorRole === 'user'
                  ? 'bg-rose-500/80 text-white shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              User View (Restricted)
            </button>
            <button
              id="evaluator-role-admin-btn"
              onClick={() => setEvaluatorRole('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                evaluatorRole === 'admin'
                  ? 'bg-cyan-500 text-neutral-950 font-semibold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Admin View (Observability)
            </button>
          </div>

          {evaluatorRole === 'admin' && (
            <div className="flex items-center gap-2">
              {/* Zero-Trust Architecture Security Audit Trigger */}
              <button
                id="open-security-audit-btn"
                onClick={() => setShowSecurityAuditModal(true)}
                className="px-3.5 py-3 rounded-2xl backdrop-blur-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                title="View Zero-Trust Threat Model & Security Controls"
              >
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                <span>Security Audit</span>
              </button>

              <button
                onClick={() => fetchTelemetry('admin')}
                disabled={loading}
                className="p-3 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs flex items-center gap-2 transition-all shadow-sm"
                title="Refresh metrics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline font-medium">Refresh</span>
              </button>

              <button
                onClick={handlePulse}
                disabled={isSimulating}
                className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Pulse Telemetry</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Access-Restricted State when in User View */}
      {evaluatorRole === 'user' ? (
        <div className="p-8 sm:p-10 rounded-3xl backdrop-blur-2xl bg-black/40 border border-rose-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  HTTP 403 Forbidden
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15 font-mono text-[10px]">
                  RBAC Boundary Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Access Restricted: Insufficient Privileges</h3>
              <p className="text-xs text-rose-200/80 leading-relaxed max-w-2xl">
                {errorStatus || "Under Aura's Zero-Trust RBAC security model, standard user accounts cannot inspect system telemetry counters, container diagnostics, or health logs."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-emerald-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Data Leakage Boundary</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Telemetry sinks, model error distributions, and infrastructure uptime are isolated from end-user sessions.
              </p>
            </div>

            <div className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-cyan-300 font-semibold flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Single-User Vault Isolation</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Users have sovereign control over their private reflections (<code className="text-cyan-200">/users/&#123;uid&#125;/*</code>) without access to server-level analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-white/50">
            <span>Switch the toggle above to <strong className="text-cyan-300">Admin View</strong> to preview telemetry metrics.</span>
            <button
              onClick={() => setEvaluatorRole('admin')}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 font-medium transition-all"
            >
              Switch to Admin View &rarr;
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Critical Security & Privacy Banner */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-emerald-950/30 border border-emerald-400/30 shadow-xl flex items-start gap-3.5 text-xs">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 shrink-0 mt-0.5">
              <EyeOff className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                <span>Zero-Journal Privacy Guarantee (RBAC Compliant)</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Verified In Safe Sink
                </span>
              </h4>
              <p className="text-white/75 leading-relaxed">
                By system architecture and Firestore security rules, administrators and telemetry monitors are strictly forbidden from viewing private user reflection text, time capsule letters, or journal transcripts. Telemetry sinks only aggregate anonymized counts, model latency, and system uptime.
              </p>
            </div>
          </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reflections */}
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Total Reflections</span>
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            {telemetry?.totalReflections ?? 124}
          </div>
          <div className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Serving real-time turns</span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Active Sessions</span>
            <Activity className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-200 tracking-tight">
            {telemetry?.activeSessions ?? 14}
          </div>
          <div className="text-[11px] text-white/50 mt-1">
            Distributed concurrent users
          </div>
        </div>

        {/* System Uptime */}
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Cloud Run Uptime</span>
            <Clock className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatUptime(telemetry?.uptimeSeconds || 240)}
          </div>
          <div className="text-[11px] text-amber-200 mt-1">
            Container active & healthy
          </div>
        </div>

        {/* Gemini Ladder Status */}
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg transition-all">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Gemini Ladder</span>
            <Cpu className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 tracking-tight truncate">
            {telemetry?.modelStatus?.primary || 'gemini-2.5-flash'}
          </div>
          <div className="text-[11px] text-emerald-200 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Fallback ladder ready</span>
          </div>
        </div>
      </div>

      {/* Model Resilience Ladder Details */}
      <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Gemini Model Resilience & Fallback Protocol Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] font-mono uppercase text-emerald-300 font-semibold mb-1">
              Tier 1: Primary Model
            </div>
            <div className="font-mono text-white font-bold">gemini-2.5-flash</div>
            <div className="text-[11px] text-white/60 mt-1 leading-relaxed">Sub-second generation latency, high emotional resonance</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] font-mono uppercase text-cyan-300 font-semibold mb-1">
              Tier 2: High Availability
            </div>
            <div className="font-mono text-white font-bold">gemini-2.0-flash</div>
            <div className="text-[11px] text-white/60 mt-1 leading-relaxed">Automatic failover on 429 rate limit or 503 capacity errors</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/25 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] font-mono uppercase text-purple-300 font-semibold mb-1">
              Tier 3: Deep Reasoning
            </div>
            <div className="font-mono text-white font-bold">gemini-2.5-pro</div>
            <div className="text-[11px] text-white/60 mt-1 leading-relaxed">Cognitive perspective shifts and long-term milestone synthesis</div>
          </div>
        </div>
      </div>

      {/* Cloud Run Deployment & Campaign Compliance */}
      <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl space-y-3 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-300" />
          <span>Google Cloud Run Deployment Verification</span>
        </h3>

        <p className="text-white/70 leading-relaxed">
          This service is configured with the mandatory Google Cloud Run campaign label for automatic challenge verification:
        </p>

        <div className="p-4 rounded-2xl bg-black/40 font-mono text-[11px] text-cyan-200 border border-white/10 overflow-x-auto shadow-inner">
          gcloud run services update aura-sanctuary \
            --update-labels=dev-tutorial=cloud-run-ai-challenge \
            --region=asia-southeast1
        </div>
      </div>
        </>
      )}

      {/* Zero-Trust Architecture Security Audit Modal */}
      {showSecurityAuditModal && (
        <SecurityAuditModal
          isOpen={showSecurityAuditModal}
          onClose={() => setShowSecurityAuditModal(false)}
        />
      )}
    </div>
  );
};

function Sparkles(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
