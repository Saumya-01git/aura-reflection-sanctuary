import React from 'react';
import { X, Check, Sparkles, User, Feather, Moon, Terminal, Sun } from 'lucide-react';
import { UserProfile, AvatarPresetId, AvatarPreset } from '../types';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSelectPreset: (presetId: AvatarPresetId) => void;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'google',
    label: 'Google Account Photo',
    badge: 'Google Identity',
    avatarBg: 'bg-white/10',
    borderAccent: 'border-white/30',
    symbol: 'G',
    description: 'Synced directly with your Google Sign-In avatar'
  },
  {
    id: 'poetic-sage',
    label: 'Poetic Sage',
    badge: '📜 Poetic Sage',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-violet-600',
    borderAccent: 'border-emerald-400/40',
    symbol: '📜',
    description: 'Contemplative seeker of verses, philosophical depth, and lyricism'
  },
  {
    id: 'night-owl',
    label: 'Night Owl',
    badge: '🦉 Night Owl',
    avatarBg: 'bg-gradient-to-tr from-indigo-600 to-purple-900',
    borderAccent: 'border-indigo-400/40',
    symbol: '🦉',
    description: 'Late night thinker navigating deep solitude and creative focus'
  },
  {
    id: 'cyber-builder',
    label: 'Cyber Builder',
    badge: '⚡ Cyber Builder',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-teal-700',
    borderAccent: 'border-cyan-400/40',
    symbol: '⚡',
    description: 'High-velocity creator building products, momentum, and code'
  },
  {
    id: 'zen-seeker',
    label: 'Zen Seeker',
    badge: '🧘 Zen Seeker',
    avatarBg: 'bg-gradient-to-tr from-amber-400 to-rose-500',
    borderAccent: 'border-amber-400/40',
    symbol: '🧘',
    description: 'Grounding presence seeking nervous system calm and mindfulness'
  }
];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  isOpen,
  onClose,
  user,
  onSelectPreset,
}) => {
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

  const currentPresetId: AvatarPresetId = user?.customAvatarPreset || 'google';

  return (
    <div 
      id="avatar-customizer-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/75 animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        className="relative w-full max-w-md rounded-3xl backdrop-blur-2xl bg-neutral-900/90 border border-cyan-500/30 shadow-2xl p-6 space-y-5 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Playfair_Display']">
                Avatar &amp; Identity Customizer
              </h3>
              <p className="text-xs text-cyan-200/70">
                Choose how you appear across the Sanctuary &amp; Squad Rooms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                id={`avatar-preset-${preset.id}`}
                onClick={() => {
                  onSelectPreset(preset.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-cyan-400 bg-white/15 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Visual Avatar Bubble */}
                <div className="relative shrink-0">
                  {preset.id === 'google' && user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Google avatar"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full border border-white/30 object-cover"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full ${preset.avatarBg} border ${preset.borderAccent} flex items-center justify-center text-lg shadow-inner`}>
                      <span>{preset.symbol}</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-cyan-400 text-neutral-950 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {preset.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Preferences saved to your private vault</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
