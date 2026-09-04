import React from 'react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS } from '../components/AvatarCustomizerModal';

export const renderUserAvatar = (user: UserProfile | null, sizeClass = 'w-8 h-8') => {
  if (!user) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white shadow-sm shrink-0`}>
        A
      </div>
    );
  }

  const presetId = user.customAvatarPreset || 'google';
  if (presetId === 'google' && user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'User Avatar'}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-full border border-white/30 object-cover shadow-sm shrink-0`}
      />
    );
  }

  const preset = AVATAR_PRESETS.find((p) => p.id === presetId) || AVATAR_PRESETS[1];
  return (
    <div className={`${sizeClass} rounded-full ${preset.avatarBg} border ${preset.borderAccent} flex items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-sm shrink-0`}>
      <span>{preset.symbol}</span>
    </div>
  );
};
