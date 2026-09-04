/**
 * Aura - Type Definitions
 */

export type PersonaId = 'shayari' | 'hackathon' | 'zen' | 'journal';

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  tagline: string;
  badge: string;
  avatarIcon: string;
  accentColor: string;
  systemInstruction: string;
  samplePrompt: string;
}

export type WallpaperId = 'lofi_rain' | 'sunset' | 'cyber_focus' | 'obsidian';

export interface WallpaperConfig {
  id: WallpaperId;
  name: string;
  description: string;
  previewBg: string;
  cardBg: string;
  accentBorder: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system' | 'partner';
  senderName?: string;
  senderPhoto?: string;
  text: string;
  timestamp: number;
  couplet?: string; // Optional Shayari couplet
  personaId?: PersonaId;
  modelUsed?: string;
}

export interface JournalSession {
  id: string;
  userId: string;
  dateKey: string; // e.g. "2026-09-04"
  createdAt: number;
  updatedAt: number;
  title: string;
  preview: string;
  personaId: PersonaId;
  moodBadge: string;
  tags?: string[];
  messages: ChatMessage[];
  moments?: PolaroidMoment[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  statusBadge?: string;
  preferredPersona?: PersonaId;
  preferredWallpaper?: WallpaperId;
  customAvatarPreset?: AvatarPresetId;
  createdAt: number;
}

export interface MilestoneEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  category: 'challenge' | 'breakthrough' | 'learning' | 'gratitude';
  timestamp: number;
  reflectionCount?: number;
  conqueredNote?: string;
}

export interface PublicSnippet {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  couplet?: string;
  personaTitle?: string;
  theme: 'velvet' | 'gold' | 'cyber' | 'obsidian';
  createdAt: number;
  likesCount?: number;
}

export interface DuoRoom {
  id: string;
  roomCode: string;
  title: string;
  creatorUid: string;
  creatorName: string;
  participantUids: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  createdAt: number;
  lastActive: number;
  activePersona: PersonaId;
}

export interface TimeCapsule {
  id: string;
  userId: string;
  title: string;
  letter: string;
  createdAt: number;
  unlockDate: number;
  isOpened: boolean;
  sealedMood: string;
}

export interface SystemTelemetry {
  totalReflections: number;
  activeSessions: number;
  uptimeSeconds: number;
  modelStatus: {
    primary: string;
    fallback: string;
    lastChecked: number;
    health: 'healthy' | 'degraded';
  };
  recentReflectionsCount24h: number;
}

export interface PolaroidMoment {
  id: string;
  userId: string;
  photoDataUrl: string;
  caption: string;
  visualAnalysis: string;
  evocativeTitle: string;
  emotionalTone: string;
  timestamp: number;
  photoUrl?: string;
  reflection?: string;
  title?: string;
  tone?: string;
  poeticNote?: string;
  detectedScene?: string;
}

export type AvatarPresetId = 'google' | 'poetic-sage' | 'night-owl' | 'cyber-builder' | 'zen-seeker';

export interface AvatarPreset {
  id: AvatarPresetId;
  label: string;
  badge: string;
  avatarBg: string;
  borderAccent: string;
  symbol: string;
  description: string;
}
