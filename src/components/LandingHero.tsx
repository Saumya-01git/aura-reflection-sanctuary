import React from 'react';
import { 
  Feather, 
  Zap, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  LogIn, 
  Compass, 
  Clock, 
  Users, 
  ArrowRight,
  Camera,
  Share2,
  Music,
  Lock,
  Waves,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { PersonaId, WallpaperId } from '../types';
import { PERSONAS, WALLPAPERS } from '../lib/personas';

interface LandingHeroProps {
  onSignIn: () => void;
  onEnterGuest: () => void;
  currentPersona: PersonaId;
  setPersona: (p: PersonaId) => void;
  wallpaper: WallpaperId;
  setWallpaper: (w: WallpaperId) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSignIn,
  onEnterGuest,
  currentPersona,
  setPersona,
  wallpaper,
  setWallpaper
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-14 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-xs text-white/90 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="font-mono tracking-wide text-indigo-200">ZERO-TRUST ENCRYPTED VAULT & AI COMPANION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-['Playfair_Display'] leading-[1.15]">
          A Sanctuary for Your Thoughts. A Mirror for Your Growth.
        </h1>

        <p className="text-base sm:text-lg text-white/80 leading-relaxed font-['Plus_Jakarta_Sans'] max-w-2xl mx-auto">
          Reflect with culturally rich Gemini personas, turn memories into multimodal Polaroid cards, collaborate in 5-member Squad Rooms, and seal future time capsules in a zero-trust encrypted vault.
        </p>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <button
            id="hero-google-signin-btn"
            onClick={onSignIn}
            className="px-7 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-neutral-900" />
            <span>Continue with Google</span>
          </button>

          <button
            id="hero-guest-entry-btn"
            onClick={onEnterGuest}
            className="px-7 py-3.5 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <span>Enter Guest Sanctuary →</span>
          </button>
        </div>

        {/* Security Assurance Tagline */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs text-white/55 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Isolated Single-User Vaults
          </span>
          <span>•</span>
          <span>Zero Telemetry Journal Leaks</span>
          <span>•</span>
          <span>NIST CSF / OWASP Compliant</span>
        </div>
      </div>

      {/* Interactive Persona Shifter Quick-Selector */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Four Distinct Reflection Personas</span>
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            Click any persona to preview its voice and switch modes instantly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(PERSONAS).map((p) => {
            const isSelected = currentPersona === p.id;
            return (
              <button
                key={p.id}
                id={`hero-persona-card-${p.id}`}
                onClick={() => setPersona(p.id)}
                className={`p-5 rounded-3xl backdrop-blur-xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-white/40 shadow-2xl scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-white/15 text-white">
                      {p.id === 'shayari' && <Feather className="w-4 h-4 text-amber-300" />}
                      {p.id === 'hackathon' && <Zap className="w-4 h-4 text-yellow-300" />}
                      {p.id === 'zen' && <Sparkles className="w-4 h-4 text-emerald-300" />}
                      {p.id === 'journal' && <BookOpen className="w-4 h-4 text-blue-300" />}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 shadow-sm">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-sm sm:text-base mb-1">{p.name}</h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">{p.tagline}</p>
                </div>

                <div className="p-3 rounded-2xl bg-black/35 border border-white/10 text-[11px] text-white/80 italic font-['Playfair_Display'] line-clamp-2">
                  "{p.samplePrompt}"
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete 6-Card Bento Feature Showcase */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono uppercase tracking-wider text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>The Six Pillars of Aura</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Playfair_Display']">
            Designed for Depth, Privacy, and Authentic Growth
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pillar 1: Multimodal Polaroid Moments */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  Gemini Vision
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Multimodal Polaroid Moments</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Upload photos from your journey. Gemini Vision extracts the visual emotion, tags the mood, and crafts private Polaroid keepsakes.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-900 to-indigo-950 border border-white/10 flex items-center justify-center text-cyan-200 text-xs font-mono">
                📸
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Visual Perspective</div>
                <div className="text-white/50 text-[10px]">Photo zoom & voice recitation</div>
              </div>
            </div>
          </div>

          {/* Pillar 2: Adaptive Persona Shifter */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 group-hover:scale-105 transition-transform">
                  <Feather className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  4 Archetypes
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Adaptive Persona Shifter</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Switch between Shayari & Poetic Soul (with classical couplets & recitation), Hackathon Coach (tough love for builders), Mindful Zen, and Classic Journal.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-900 to-neutral-950 border border-white/10 flex items-center justify-center text-amber-200 text-xs font-mono">
                📜
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Cultural & Pragmatic Depth</div>
                <div className="text-white/50 text-[10px]">Couplets with English translations</div>
              </div>
            </div>
          </div>

          {/* Pillar 3: Collaborative Squad Rooms */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                  Up to 5 Members
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Collaborative Squad Rooms</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Invite up to 5 hackathon teammates or friends via code AUR-*** for live retrospective and consensus brainstorming.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-900 to-neutral-950 border border-white/10 flex items-center justify-center text-emerald-200 text-xs font-mono">
                🤝
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Live AI Consensus Mediator</div>
                <div className="text-white/50 text-[10px]">Real-time joint momentum</div>
              </div>
            </div>
          </div>

          {/* Pillar 4: Selective Privacy Sharing */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 group-hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-400/10 text-indigo-300 border border-indigo-400/20">
                  Zero Chat Leak
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Selective Privacy Sharing</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Generate aesthetic quote cards for WhatsApp, Instagram, or LinkedIn with zero risk of private chat leakage.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-neutral-950 border border-white/10 flex items-center justify-center text-indigo-200 text-xs font-mono">
                🔒
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Revocable Public Links</div>
                <div className="text-white/50 text-[10px]">Instant one-click deletion drawer</div>
              </div>
            </div>
          </div>

          {/* Pillar 5: Procedural Ambient Soundscapes */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 group-hover:scale-105 transition-transform">
                  <Waves className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                  Web Audio API
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Procedural Ambient Soundscapes</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Built-in zero-asset Web Audio synthesizer for Lofi Rain, Pacific Ocean Drift, and Midnight Forest woodland hum.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-900 to-neutral-950 border border-white/10 flex items-center justify-center text-yellow-200 text-xs font-mono">
                🎵
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Pure Procedural Audio</div>
                <div className="text-white/50 text-[10px]">Offline-capable without downloads</div>
              </div>
            </div>
          </div>

          {/* Pillar 6: Flashbacks & Future Me Lockbox */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-400/40 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-400/30 text-pink-300 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-pink-400/10 text-pink-300 border border-pink-400/20">
                  Time Capsules
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">Flashbacks & Future Me Lockbox</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                On This Day perspective shifts celebrating your resilience, plus animated countdown time capsules.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-900 to-neutral-950 border border-white/10 flex items-center justify-center text-pink-200 text-xs font-mono">
                ⏳
              </div>
              <div className="text-[11px]">
                <div className="text-white/90 font-medium">Celebrate Past Resilience</div>
                <div className="text-white/50 text-[10px]">Animated wax seal unlocking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
