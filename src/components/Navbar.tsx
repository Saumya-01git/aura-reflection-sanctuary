import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Palette, 
  Users, 
  Clock, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Feather, 
  Compass,
  Check,
  Headphones,
  Volume2,
  VolumeX,
  Shield,
  Sliders,
  User as UserIcon,
  Home,
  ArrowLeft
} from 'lucide-react';
import { PersonaId, WallpaperId, UserProfile } from '../types';
import { PERSONAS, WALLPAPERS, STATUS_BADGES } from '../lib/personas';
import { soundscapeEngine, SoundscapePreset } from '../utils/soundscapes';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { UserProfileModal } from './UserProfileModal';
import { SecurityAuditModal } from './SecurityAuditModal';
import { renderUserAvatar } from '../utils/avatarHelper';

interface NavbarProps {
  activeTab: 'sanctuary' | 'flashback' | 'duo' | 'timecapsule' | 'telemetry';
  setActiveTab: (tab: 'sanctuary' | 'flashback' | 'duo' | 'timecapsule' | 'telemetry') => void;
  persona: PersonaId;
  setPersona: (p: PersonaId) => void;
  wallpaper: WallpaperId;
  setWallpaper: (w: WallpaperId) => void;
  user: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onUpdateStatusBadge: (badge: string) => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  persona,
  setPersona,
  wallpaper,
  setWallpaper,
  user,
  onSignIn,
  onSignOut,
  onUpdateStatusBadge,
  onUpdateUser,
  onGoHome
}) => {
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSoundscapeMenu, setShowSoundscapeMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Dropdown Refs for Global Click-Outside Dismissal
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const wallpaperMenuRef = useRef<HTMLDivElement>(null);
  const soundscapeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Global Click-Outside & Escape Key Dismissal Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (showPersonaMenu && personaMenuRef.current && !personaMenuRef.current.contains(target)) {
        setShowPersonaMenu(false);
      }
      if (showWallpaperMenu && wallpaperMenuRef.current && !wallpaperMenuRef.current.contains(target)) {
        setShowWallpaperMenu(false);
      }
      if (showSoundscapeMenu && soundscapeMenuRef.current && !soundscapeMenuRef.current.contains(target)) {
        setShowSoundscapeMenu(false);
      }
      if (showStatusMenu && statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setShowStatusMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPersonaMenu(false);
        setShowWallpaperMenu(false);
        setShowSoundscapeMenu(false);
        setShowStatusMenu(false);
      }
    };

    if (showPersonaMenu || showWallpaperMenu || showSoundscapeMenu || showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPersonaMenu, showWallpaperMenu, showSoundscapeMenu, showStatusMenu]);

  // Soundscape state
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapePreset>('off');
  const [soundVolume, setSoundVolume] = useState<number>(0.3);

  const handleSoundscapeChange = (preset: SoundscapePreset) => {
    setActiveSoundscape(preset);
    soundscapeEngine.play(preset);
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    soundscapeEngine.setVolume(newVol);
  };

  const activePersonaConfig = PERSONAS[persona] || PERSONAS.shayari;

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-all ${
      wallpaper === 'cosmic_starlight'
        ? 'bg-[#090912]/70 border-b border-[rgba(167,139,250,0.25)] shadow-[0_4px_24px_rgba(99,102,241,0.2)]'
        : 'bg-white/10 border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            id="aura-brand-btn"
            onClick={() => {
              if (onGoHome) onGoHome();
              else setActiveTab('sanctuary');
            }}
            className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
            title="Return to Welcome Screen (1st Screen)"
          >
            {/* Custom Ethereal Glowing Prism Halo & Celestial Quill Emblem */}
            <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity" />
              <div className="relative w-full h-full rounded-2xl bg-neutral-950/80 border border-white/30 backdrop-blur-xl flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.4)] overflow-hidden">
                <svg
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 transform group-hover:rotate-6 transition-transform duration-300"
                >
                  <defs>
                    <linearGradient id="auraPrismGrad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="35%" stopColor="#818cf8" />
                      <stop offset="70%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                    <radialGradient id="auraCoreGlow" cx="18" cy="18" r="14" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="quillGold" x1="14" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="60%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Inner Aura Glow */}
                  <circle cx="18" cy="18" r="13" fill="url(#auraCoreGlow)" />
                  {/* Outer Prism Halo Ring */}
                  <circle cx="18" cy="18" r="14" stroke="url(#auraPrismGrad)" strokeWidth="1.5" strokeDasharray="3 2" className="opacity-70 animate-[spin_16s_linear_infinite]" />
                  {/* Inner Halo Arc */}
                  <path d="M7 18 A11 11 0 1 1 29 18" stroke="url(#auraPrismGrad)" strokeWidth="1.5" strokeLinecap="round" className="opacity-90" />
                  {/* Celestial Quill Feather Blade */}
                  <path
                    d="M19 6C15 11 12 18 10 26C13 25 18 24 23 20C26 17 28 12 28 9C26 7 22 6 19 6Z"
                    fill="url(#quillGold)"
                    fillOpacity="0.85"
                  />
                  {/* Quill Spine & Prism Refraction Line */}
                  <path d="M11 26C14 20 19 14 27 7" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                  {/* Celestial Diamond Star */}
                  <polygon points="27,6 29,8 27,10 25,8" fill="#ffffff" className="animate-pulse" />
                  <circle cx="11" cy="26" r="1.5" fill="#38bdf8" />
                </svg>
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Aura
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/20 shadow-sm">
                SANCTUARY & VAULT
              </span>
            </div>
          </button>

          {/* Explicit Quick Return to 1st Screen (Welcome / Landing) */}
          {onGoHome && (
            <button
              id="navbar-back-to-home-btn"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Return to Welcome Screen (1st Screen)"
            >
              <Home className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">1st Screen</span>
            </button>
          )}

          {/* Persona Quick Indicator / Selector (Cleanly in Center/Left) */}
          <div className="relative" ref={personaMenuRef}>
            <button
              id="persona-quick-selector-btn"
              onClick={() => {
                setShowPersonaMenu(!showPersonaMenu);
                setShowWallpaperMenu(false);
                setShowStatusMenu(false);
                setShowSoundscapeMenu(false);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-medium backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all shadow-sm active:scale-95"
              title="Change reflection persona"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              <span className="font-medium">{activePersonaConfig.badge}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${showPersonaMenu ? 'rotate-180' : ''}`} />
            </button>

            {showPersonaMenu && (
              <div className="absolute left-0 mt-2 w-72 p-2 rounded-3xl backdrop-blur-2xl bg-black/80 border border-white/20 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-300/80 border-b border-white/10 mb-1">
                  Active Persona & Tone
                </div>
                {Object.values(PERSONAS).map((p) => (
                  <button
                    key={p.id}
                    id={`persona-option-${p.id}`}
                    onClick={() => {
                      setPersona(p.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-2xl text-left transition-all ${
                      persona === p.id 
                        ? 'bg-white/15 border border-white/20 text-white font-medium shadow-inner' 
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold flex items-center justify-between">
                        <span>{p.badge}</span>
                        {persona === p.id && <Check className="w-3.5 h-3.5 text-indigo-300" />}
                      </div>
                      <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">{p.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls, Wallpaper, Status & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Soundscape Audio Player Toggle & Menu */}
          <div className="relative" ref={soundscapeMenuRef}>
            <button
              id="soundscape-toggle-btn"
              onClick={() => {
                setShowSoundscapeMenu(!showSoundscapeMenu);
                setShowWallpaperMenu(false);
                setShowPersonaMenu(false);
                setShowStatusMenu(false);
              }}
              className={`p-2.5 rounded-2xl backdrop-blur-xl border text-white transition-all shadow-sm flex items-center gap-1.5 ${
                activeSoundscape !== 'off'
                  ? 'bg-amber-400/25 border-amber-400/50 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80'
              }`}
              title="Ambient Soundscape (Procedural Audio Engine)"
            >
              <Headphones className="w-4 h-4" />
              {activeSoundscape !== 'off' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            {showSoundscapeMenu && (
              <div className="absolute right-0 mt-2 w-72 p-3.5 rounded-3xl backdrop-blur-2xl bg-black/85 border border-white/20 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-semibold text-white">Ambient Soundscapes</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono">Web Audio API</span>
                </div>

                {/* Presets List */}
                <div className="space-y-1">
                  {[
                    { id: 'off', label: 'Silence / Mute', desc: 'No background audio' },
                    { id: 'rain', label: '🌧️ Lofi Rain & Drizzle', desc: 'Gentle pink noise rain with distant thunder' },
                    { id: 'waves', label: '🌊 Pacific Ocean Drift', desc: 'Slow, rhythmic tidal swell' },
                    { id: 'forest', label: '🌲 Midnight Forest & Crickets', desc: 'Tranquil evening woods ambiance' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      id={`soundscape-preset-${preset.id}`}
                      onClick={() => handleSoundscapeChange(preset.id as SoundscapePreset)}
                      className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-center justify-between ${
                        activeSoundscape === preset.id
                          ? 'bg-amber-400/20 border border-amber-400/40 text-amber-100 shadow-inner'
                          : 'hover:bg-white/10 text-white/80 border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{preset.label}</div>
                        <div className="text-[10px] text-white/50">{preset.desc}</div>
                      </div>
                      {activeSoundscape === preset.id && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Volume Slider */}
                {activeSoundscape !== 'off' && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-white/70 font-mono">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Volume</span>
                      </span>
                      <span>{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive WhatsApp-style Wallpaper Selector */}
          <div className="relative" ref={wallpaperMenuRef}>
            <button
              id="wallpaper-selector-toggle-btn"
              onClick={() => {
                setShowWallpaperMenu(!showWallpaperMenu);
                setShowSoundscapeMenu(false);
                setShowPersonaMenu(false);
                setShowStatusMenu(false);
              }}
              className="p-2.5 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-sm active:scale-95"
              title="Change Backdrop Wallpaper Theme"
            >
              <Palette className="w-4 h-4 text-purple-300" />
            </button>

            {showWallpaperMenu && (
              <div className="absolute right-0 mt-2 w-80 p-3.5 rounded-3xl backdrop-blur-2xl bg-black/85 border border-white/20 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-300" />
                    <span className="text-xs font-semibold text-white">Atmosphere Wallpaper</span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono">5 Dynamic Themes</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(WALLPAPERS).map((w) => {
                    const isSelected = wallpaper === w.id;
                    return (
                      <button
                        key={w.id}
                        id={`wallpaper-theme-${w.id}`}
                        onClick={() => {
                          setWallpaper(w.id);
                          setShowWallpaperMenu(false);
                        }}
                        className={`group p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                          w.id === 'cosmic_starlight' ? 'col-span-2' : ''
                        } ${
                          isSelected
                            ? (w.activeClass || 'border-indigo-300/50 bg-white/20 shadow-md ring-1 ring-indigo-400/40')
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className={`w-full h-12 rounded-xl mb-1.5 ${w.previewBg} border border-white/20 relative overflow-hidden flex items-end justify-between p-1.5 shadow-inner`}>
                          {w.id === 'cosmic_starlight' && (
                            <div 
                              className="absolute inset-0 opacity-80 pointer-events-none" 
                              style={{
                                backgroundImage: 'radial-gradient(#ffffff 0.75px, transparent 0.75px), radial-gradient(#c084fc 1px, transparent 1px)',
                                backgroundSize: '12px 12px, 18px 18px',
                                backgroundPosition: '0 0, 6px 6px'
                              }}
                            />
                          )}
                          <span className="text-sm z-10">{w.icon}</span>
                          <span className={`w-2.5 h-2.5 rounded-full z-10 ${w.dotColor || 'bg-white'}`} />
                        </div>
                        <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
                          <span>{w.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Zero-Trust Security Audit Shortcut */}
          <button
            id="navbar-security-audit-btn"
            onClick={() => setShowSecurityModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-medium transition-all shadow-sm active:scale-95"
            title="Zero-Trust Architecture Threat Model & NIST/OWASP Compliance"
          >
            <Shield className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden md:inline">Security</span>
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative flex items-center gap-2 pl-2 border-l border-white/15">
              {/* Customizable Status Badge trigger */}
              <div className="relative" ref={statusMenuRef}>
                <button
                  id="user-status-badge-btn"
                  onClick={() => {
                    setShowStatusMenu(!showStatusMenu);
                    setShowWallpaperMenu(false);
                    setShowSoundscapeMenu(false);
                    setShowPersonaMenu(false);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] backdrop-blur-md bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/30 max-w-[140px] md:max-w-[180px] truncate transition-all shadow-sm active:scale-95"
                  title="Change status badge"
                >
                  <span className="truncate">{user.statusBadge || '🌌 Deep in contemplation'}</span>
                  <ChevronDown className="w-3 h-3 text-white/60 shrink-0" />
                </button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-10 w-64 p-2 rounded-3xl backdrop-blur-2xl bg-black/85 border border-white/20 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300/80 border-b border-white/10 mb-1">
                      Select Your Aura Status
                    </div>
                    {STATUS_BADGES.map((badge, idx) => (
                      <button
                        key={idx}
                        id={`status-badge-option-${idx}`}
                        onClick={() => {
                          onUpdateStatusBadge(badge);
                          setShowStatusMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs text-white/90 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between"
                      >
                        <span>{badge}</span>
                        {user.statusBadge === badge && <Check className="w-3 h-3 text-indigo-300" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Avatar with click to view profile & customize identity */}
              <button
                id="user-avatar-customizer-btn"
                onClick={() => setShowProfileModal(true)}
                className="relative group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
                title="View Profile & Identity"
              >
                {renderUserAvatar(user, 'w-8 h-8')}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserIcon className="w-2 h-2 text-white" />
                </div>
              </button>

              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className="p-1.5 rounded-xl text-white/60 hover:text-rose-300 hover:bg-white/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="sign-in-google-btn"
              onClick={onSignIn}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold backdrop-blur-xl bg-white/90 hover:bg-white text-neutral-950 transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>

      {/* User Profile View & Identity Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUpdateProfile={async (updates) => {
            if (onUpdateUser) {
              onUpdateUser(updates);
            }
          }}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
        />
      )}

      {/* Avatar & Sanctuary Identity Customizer Modal */}
      {showAvatarModal && (
        <AvatarCustomizerModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          user={user}
          onAvatarUpdated={(updatedUser) => {
            if (onUpdateUser) {
              onUpdateUser(updatedUser);
            }
          }}
        />
      )}

      {/* Zero-Trust Architecture Security Audit Modal */}
      {showSecurityModal && (
        <SecurityAuditModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
        />
      )}
    </header>
  );
};
