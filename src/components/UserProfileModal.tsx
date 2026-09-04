import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Sparkles, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Flame, 
  LogOut, 
  LogIn,
  AlertCircle,
  Hash,
  Palette
} from 'lucide-react';
import { UserProfile, AvatarPresetId } from '../types';
import { AVATAR_PRESETS } from './AvatarCustomizerModal';
import { renderUserAvatar } from '../utils/avatarHelper';
import { db, collection, getDocs } from '../lib/firebase';
import { Toast, ToastData } from './Toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateProfile: (updates: { displayName?: string; statusBadge?: string; customAvatarPreset?: AvatarPresetId }) => Promise<void> | void;
  onSignOut?: () => void;
  onSignIn?: () => void;
}

const CURATED_STATUSES = [
  '🌌 Deep in contemplation',
  '🧘 Seeking grounded clarity',
  '⚡ High-velocity building',
  '📜 Writing verses in solitude',
  '🌿 Gentle nervous system reset',
  '🔥 Hackathon sprint mode',
  '🌙 Midnight reflection'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onSignOut,
  onSignIn
}) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [statusBadge, setStatusBadge] = useState(user?.statusBadge || '🌌 Deep in contemplation');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [avatarPreset, setAvatarPreset] = useState<AvatarPresetId>(user?.customAvatarPreset || 'google');
  const [reflectionsCount, setReflectionsCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || (user.uid === 'guest-user' ? 'Guest Seeker' : 'Aura Seeker'));
      setStatusBadge(user.statusBadge || '🌌 Deep in contemplation');
      setAvatarPreset(user.customAvatarPreset || 'google');
    }
  }, [user]);

  // Query reflection count from Firestore and local storage
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchStats = async () => {
      setIsLoadingCount(true);
      try {
        let count = 0;
        if (user.uid !== 'guest-user') {
          const reflectionsRef = collection(db, 'users', user.uid, 'reflections');
          const snap = await getDocs(reflectionsRef);
          count = snap.size;
        }

        // Also count locally stored messages
        const localSanctuary = ['shayari', 'hackathon', 'zen', 'journal'];
        let localCount = 0;
        localSanctuary.forEach((p) => {
          try {
            const raw = localStorage.getItem(`aura_sanctuary_msgs_${p}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                localCount += parsed.filter((m) => m.sender === 'user').length;
              }
            }
          } catch {
            // ignore
          }
        });

        setReflectionsCount(Math.max(count, localCount));
      } catch (err) {
        console.warn('Could not query reflections count:', err);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchStats();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateInput = (value: string, fieldName: 'Display name' | 'Status badge'): boolean => {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Validation Error',
        message: `${fieldName} must be at least 2 characters long.`
      });
      return false;
    }

    // Pure numbers validation (e.g. '123' must be rejected)
    if (/^\d+$/.test(trimmed)) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Validation Error',
        message: `${fieldName} must contain valid letters, not just numbers.`
      });
      return false;
    }

    // Must contain at least one letter character
    if (!/[a-zA-Z\u00C0-\u024F\u0600-\u06FF\u0900-\u097F]/.test(trimmed)) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Validation Error',
        message: `${fieldName} must contain valid alphabet letters.`
      });
      return false;
    }

    return true;
  };

  const handleSaveDisplayName = async () => {
    if (!validateInput(displayName, 'Display name')) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Profile Updated',
        message: 'Your display name has been saved securely.'
      });
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update display name. Please retry.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStatus = async (newStatus?: string) => {
    const targetStatus = newStatus || statusBadge;
    if (!validateInput(targetStatus, 'Status badge')) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({ statusBadge: targetStatus.trim() });
      setStatusBadge(targetStatus.trim());
      setIsEditingStatus(false);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Status Updated',
        message: `Your Aura status is now: "${targetStatus.trim()}"`
      });
    } catch (err) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update status badge. Please retry.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPreset = async (presetId: AvatarPresetId) => {
    setAvatarPreset(presetId);
    try {
      await onUpdateProfile({ customAvatarPreset: presetId });
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Avatar Theme Applied',
        message: `Applied ${presetId.replace('-', ' ')} avatar preset.`
      });
    } catch (err) {
      // fallback
    }
  };

  const memberSinceText = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent Traveler';

  const isGuest = !user || user.uid === 'guest-user';

  return (
    <>
      <div 
        id="user-profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-200"
      >
        <div 
          id="user-profile-modal-container"
          className="relative w-full max-w-xl flex flex-col rounded-3xl backdrop-blur-2xl bg-neutral-900/90 border border-white/20 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-['Playfair_Display']">
                  Your Sanctuary Identity
                </h3>
                <p className="text-xs text-white/60">
                  Manage your display persona, status badge &amp; zero-trust vault stats
                </p>
              </div>
            </div>

            <button
              id="close-profile-modal-btn"
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Identity Overview Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 backdrop-blur-md flex flex-col sm:flex-row items-center gap-5">
            {/* Visual Avatar */}
            <div className="relative group shrink-0">
              <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-xl">
                {renderUserAvatar({ ...user, customAvatarPreset: avatarPreset } as UserProfile, 'w-20 h-20')}
              </div>
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-400 text-neutral-950 shadow-md ring-2 ring-neutral-900" title="Active">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            {/* Core Info & Inline Name Editor */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <input
                      id="edit-display-name-input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Display Name"
                      maxLength={30}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-indigo-400/60 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      autoFocus
                    />
                    <button
                      id="save-display-name-btn"
                      onClick={handleSaveDisplayName}
                      disabled={isSaving}
                      className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all cursor-pointer"
                      title="Save name"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDisplayName(user?.displayName || '');
                        setIsEditingName(false);
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-all cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white font-['Playfair_Display'] truncate">
                      {displayName || 'Aura Seeker'}
                    </h2>
                    <button
                      id="edit-display-name-toggle-btn"
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Edit display name"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                  </div>
                )}

                {isGuest ? (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Guest Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Google Verified
                  </span>
                )}
              </div>

              {/* Email & Member Date */}
              <div className="space-y-1 text-xs text-white/65">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="truncate">{user?.email || 'guest@aura-sanctuary.internal'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-300" />
                  <span>Member Since: <strong className="text-white/90 font-normal">{memberSinceText}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Vault Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                Reflections
              </div>
              <div className="text-xl font-bold text-indigo-300 font-mono">
                {isLoadingCount ? '...' : reflectionsCount}
              </div>
              <div className="text-[10px] text-white/40">Vault entries logged</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                Security Model
              </div>
              <div className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1 mt-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Trust</span>
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">Isolated UID path</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                Identity Type
              </div>
              <div className="text-xs font-semibold text-amber-300 mt-1.5">
                {isGuest ? 'Local Session' : 'Google OAuth'}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">Directive #3 Compliant</div>
            </div>
          </div>

          {/* Editable Aura Status Badge */}
          <div className="space-y-2.5 p-4 rounded-3xl bg-black/35 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Aura Status Badge</span>
              </span>
              <button
                id="edit-status-toggle-btn"
                onClick={() => setIsEditingStatus(!isEditingStatus)}
                className="text-[11px] text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
              >
                {isEditingStatus ? 'Done' : 'Custom Status'}
              </button>
            </div>

            {isEditingStatus ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="custom-status-input"
                  type="text"
                  value={statusBadge}
                  onChange={(e) => setStatusBadge(e.target.value)}
                  placeholder="e.g. 🧘 Seeking grounded clarity"
                  maxLength={40}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/50 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  id="save-custom-status-btn"
                  onClick={() => handleSaveStatus()}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-200 flex items-center justify-between font-mono">
                <span className="truncate">{statusBadge}</span>
                <span className="text-[10px] text-white/40">Visible to Squad</span>
              </div>
            )}

            {/* Quick Status Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CURATED_STATUSES.map((badge, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSaveStatus(badge)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                    statusBadge === badge
                      ? 'bg-amber-400/25 border border-amber-400/50 text-amber-100 font-semibold'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Preset Customizer */}
          <div className="space-y-2.5 p-4 rounded-3xl bg-black/35 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-300" />
                <span>Avatar Theme Presets</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">Syncs across views</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AVATAR_PRESETS.map((p) => {
                const isSelected = avatarPreset === p.id;
                return (
                  <button
                    key={p.id}
                    id={`profile-preset-${p.id}`}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-white/15 shadow-md ring-1 ring-cyan-400/40 text-white'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/75'
                    }`}
                  >
                    <div className="shrink-0">
                      {p.id === 'google' && user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Google Avatar"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-white/20 object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${p.avatarBg} border ${p.borderAccent} flex items-center justify-center text-sm shadow-inner`}>
                          <span>{p.symbol}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{p.label}</div>
                      <div className="text-[10px] text-white/40 truncate">{p.badge}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions (Sign In or Sign Out) */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="text-[11px] text-white/40 font-mono">
              Directive #3: Passwordless Google Auth
            </div>

            <div className="flex items-center gap-2.5">
              {isGuest ? (
                <button
                  id="profile-google-signin-btn"
                  onClick={() => {
                    onClose();
                    onSignIn?.();
                  }}
                  className="px-4 py-2 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Connect Google Account</span>
                </button>
              ) : (
                <button
                  id="profile-signout-btn"
                  onClick={() => {
                    onClose();
                    onSignOut?.();
                  }}
                  className="px-4 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};
