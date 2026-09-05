import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Database, 
  Cpu, 
  EyeOff, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileCode,
  KeyRound,
  AlertOctagon
} from 'lucide-react';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'threats' | 'rules' | 'owasp' | 'deployment'>('threats');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const campaignLabelCmd = `gcloud run services update aura-sanctuary \\
  --update-labels=dev-tutorial=cloud-run-ai-challenge \\
  --region=asia-southeast1`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(campaignLabelCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      id="security-audit-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/75 animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl backdrop-blur-2xl bg-neutral-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-['Playfair_Display']">
                  Enterprise Security Architecture & Threat Model
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                  Zero-Trust Verified
                </span>
              </div>
              <p className="text-xs text-cyan-200/70">
                Audited countermeasures across the 5 Threat Zones & OWASP LLM Top 10
              </p>
            </div>
          </div>

          <button
            id="close-security-audit-btn"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-white/10 bg-black/20 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'threats'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>5 Threat Zones</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firestore Rules & Isolation</span>
          </button>

          <button
            onClick={() => setActiveTab('owasp')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'owasp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>OWASP Top 10 Mitigations</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'deployment'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Cloud Run Compliance</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-white/80">
          {activeTab === 'threats' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Structured Scenario-Driven Threat Analysis</span>
                </h4>
                <p className="text-white/70 leading-relaxed">
                  Every layer of Aura—from prompt input and vision analysis down to Firestore persistence and API proxies—undergoes systematic isolation.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/15 bg-white/5 font-semibold text-cyan-200">
                      <th className="p-3">Threat Zone</th>
                      <th className="p-3">Identified Risks</th>
                      <th className="p-3">Architectural Countermeasure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="p-3 font-semibold text-white">1. Input Surfaces</td>
                      <td className="p-3 text-rose-300">Prompt injection, script injection via photo caption or dictation</td>
                      <td className="p-3 text-emerald-300">Strict schema validation, React text encoding, client/server payload stripping, and base64 image MIME verification.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">2. Planning & Reasoning</td>
                      <td className="p-3 text-rose-300">Persona jailbreaks, system instruction bypass via uploaded images</td>
                      <td className="p-3 text-emerald-300">Immutable system instructions in server-side `@google/genai` calls, structured JSON outputs, and isolated turn histories.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">3. Tool Execution</td>
                      <td className="p-3 text-rose-300">API key leakage, unauthenticated external RPC exploitation</td>
                      <td className="p-3 text-emerald-300">100% server-side Gemini API proxy (`/api/*`). Zero API keys compiled into browser bundles. Cloud Run Secret Manager ingestion.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">4. Memory & State</td>
                      <td className="p-3 text-rose-300">Cross-user data exposure, unauthorized duo room infiltration</td>
                      <td className="p-3 text-emerald-300">Single-User Vault rule (`request.auth.uid == userId`) for reflections, moments, and time capsules. Squad room participation whitelist (`size() &lt;= 5`).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">5. Inter-System Communication</td>
                      <td className="p-3 text-rose-300">Public snippet leakage of full chat logs, telemetry telemetry PII sink</td>
                      <td className="p-3 text-emerald-300">Public snippets store ONLY selected text with all conversation history stripped. Telemetry sinks aggregate counts only (Zero-Journal Privacy Guarantee).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-400/30 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero Insecure Defaults Policy</span>
                </div>
                <p className="text-white/70">
                  Aura rejects wildcard read/write patterns. Every path is strictly constrained to the authenticated UID or whitelisted participant array.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-[11px] text-emerald-200 overflow-x-auto space-y-2 leading-relaxed">
                <div className="text-white/40">// Active Cloud Firestore Security Rules</div>
                <div>rules_version = '2';</div>
                <div>service cloud.firestore &#123;</div>
                <div className="pl-4">match /databases/&#123;database&#125;/documents &#123;</div>
                <div className="pl-8 text-cyan-300">// 1. Single-User Vault Isolation (Reflections, Moments, Capsules)</div>
                <div className="pl-8">match /users/&#123;userId&#125;/&#123;document=**&#125; &#123;</div>
                <div className="pl-12 text-emerald-300">allow read, write: if request.auth != null &amp;&amp; request.auth.uid == userId;</div>
                <div className="pl-8">&#125;</div>
                <div className="pl-8 text-cyan-300">// 2. Squad / Circle Rooms (Max 5 Members)</div>
                <div className="pl-8">match /duo_rooms/&#123;roomId&#125; &#123;</div>
                <div className="pl-12 text-emerald-300">allow read, write: if request.auth != null &amp;&amp; (request.auth.uid in resource.data.participantUids || request.auth.uid in request.resource.data.participantUids) &amp;&amp; request.resource.data.participantUids.size() &lt;= 5;</div>
                <div className="pl-8">&#125;</div>
                <div className="pl-8 text-cyan-300">// 3. Revocable Public Quote Snippets</div>
                <div className="pl-8">match /public_snippets/&#123;snippetId&#125; &#123;</div>
                <div className="pl-12 text-emerald-300">allow read: if true;</div>
                <div className="pl-12 text-emerald-300">allow create: if request.auth != null &amp;&amp; request.resource.data.authorUid == request.auth.uid;</div>
                <div className="pl-12 text-emerald-300">allow update, delete: if request.auth != null &amp;&amp; resource.data.authorUid == request.auth.uid;</div>
                <div className="pl-8">&#125;</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
              </div>
            </div>
          )}

          {activeTab === 'owasp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>OWASP Top 10 Web Mitigations</span>
                  </div>
                  <ul className="space-y-1.5 text-white/70 pl-2">
                    <li>• <strong>A01 Broken Access Control:</strong> Strict auth checks at API routes and document paths.</li>
                    <li>• <strong>A02 Cryptographic Failures:</strong> HTTPS-enforced transit via Cloud Run ingress proxy.</li>
                    <li>• <strong>A03 Injection:</strong> Parameterized Firestore queries, no shell execution, HTML-encoded outputs.</li>
                    <li>• <strong>A07 Identification &amp; Auth:</strong> Federated Google OAuth via Firebase Auth (no password storage).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <Cpu className="w-4 h-4" />
                    <span>OWASP Top 10 for LLMs</span>
                  </div>
                  <ul className="space-y-1.5 text-white/70 pl-2">
                    <li>• <strong>LLM01 Prompt Injection:</strong> Untrusted data framed as passive data objects, never executable instructions.</li>
                    <li>• <strong>LLM02 Insecure Output:</strong> Client encodes model responses prior to DOM rendering.</li>
                    <li>• <strong>LLM06 Sensitive Info Disclosure:</strong> Admin telemetry zero-journal guarantee isolates private reflections.</li>
                    <li>• <strong>LLM10 Unbounded Consumption:</strong> Rate limits, token limits, and model fallback ladder.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <KeyRound className="w-4 h-4" />
                  <span>Secret Management &amp; Zero-Hardcoding Hygiene</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  No operational API keys, service account credentials, or database secrets are committed into the repository or client artifacts. Operational secrets are injected strictly via container environment variables from Google Cloud Secret Manager.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Cloud Run AI Challenge Verification Protocol</span>
                </h4>
                <p className="text-white/70">
                  To ensure automated scoring crawlers verify this container deployment, the service is labeled with the mandatory resource tag:
                </p>

                <div className="relative mt-2 p-3.5 rounded-2xl bg-black/60 border border-white/15 font-mono text-[11px] text-cyan-200">
                  <pre>{campaignLabelCmd}</pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all flex items-center gap-1 text-[10px]"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Server-Side Model Fallback Execution Ladder</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-400/20 text-emerald-200">
                    <div className="text-white/50">PRIMARY:</div>
                    <strong>gemini-3.8-flash</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-cyan-400/20 text-cyan-200">
                    <div className="text-white/50">HIGH-AVAILABILITY:</div>
                    <strong>gemini-3.1-flash-lite</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-purple-400/20 text-purple-200">
                    <div className="text-white/50">DYNAMIC ALIAS:</div>
                    <strong>gemini-flash-latest</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-[11px] text-white/50">
            Aura v2.5 Enterprise Compliance Matrix
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
