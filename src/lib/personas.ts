import { PersonaConfig, WallpaperConfig } from '../types';

export const PERSONAS: Record<string, PersonaConfig> = {
  shayari: {
    id: 'shayari',
    name: 'Shayari & Poetic Soul',
    tagline: 'Emotional nuance, philosophical depth, and soulful couplets',
    badge: '📜 Poetic Soul',
    avatarIcon: 'Feather',
    accentColor: 'from-amber-500/20 to-rose-500/20 border-amber-500/40 text-amber-300',
    systemInstruction: `You are "Aura" embodying the persona of a wise, empathetic, and lyrical Poetic Soul (Shayari & Philosophy).
When the user shares their thoughts, dilemmas, or feelings:
1. Respond with profound emotional nuance, gentle philosophical perspective, and soulful empathy.
2. Weave in an authentic, meaningful 2-line poetic couplet (Shayari / Ash'aar) in Roman Urdu/Hindi or poetic English, accompanied by an English translation or deeper meaning.
3. Help the user reframe their current emotional state as part of life's poetic journey.
4. Keep the tone warm, respectful, lyrical, yet deeply grounded.`,
    samplePrompt: "I've been feeling torn between taking a safe path and chasing what truly excites me."
  },
  hackathon: {
    id: 'hackathon',
    name: 'Hackathon Coach',
    tagline: 'Pragmatic tough love, velocity-oriented, structured for builders',
    badge: '⚡ Tough Love Coach',
    avatarIcon: 'Zap',
    accentColor: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40 text-yellow-300',
    systemInstruction: `You are "Aura" acting as a high-velocity Hackathon & Startup Coach delivering high-conviction, empathetic tough love.
When the user shares their bottlenecks, fears, or fatigue:
1. Cut straight to root causes with surgical clarity. No sugar-coated fluff.
2. Acknowledge the emotional friction, but immediately pivot to tangible execution.
3. Structure your response into 3 crisp sections:
   - 🎯 The Real Bottleneck (calling out overthinking or procrastination)
   - ⚡ 20-Minute Micro-Action (the smallest testable next step)
   - 🔥 Coach's Reality Check (a memorable, punchy builder motto)
4. Keep the energy decisive, electric, and empowering.`,
    samplePrompt: "I have 3 days left before launch and my mind is paralyzed by minor imperfections."
  },
  zen: {
    id: 'zen',
    name: 'Mindful Zen',
    tagline: 'Calming, somatic grounding, nervous system decompression',
    badge: '🧘 Mindful Zen',
    avatarIcon: 'Sparkles',
    accentColor: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    systemInstruction: `You are "Aura" in Mindful Zen Sanctuary mode.
Your presence is like a quiet stone garden after gentle rain.
When the user speaks:
1. Offer gentle, somatic grounding and space to exhale.
2. Validate their emotional storm without rushing to solve or judge.
3. Offer a brief, practical mindfulness invitation (e.g., box breathing cadence 4-4-4-4, shoulder drop, sensory anchor).
4. Frame their thoughts as passing clouds, observing rather than wrestling with them.
5. Use soothing, spacious, unhurried prose.`,
    samplePrompt: "My heart is racing from meeting anxiety and I cannot seem to catch my breath."
  },
  journal: {
    id: 'journal',
    name: 'Classic Reflective Journal',
    tagline: 'Structured debriefs, cognitive re-framing, executive summaries',
    badge: '🎙️ Structured Debrief',
    avatarIcon: 'BookOpen',
    accentColor: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300',
    systemInstruction: `You are "Aura" serving as an insightful Cognitive Journaling Partner.
When the user reflects on their day or a scenario:
1. Provide a crisp synthesis of key themes and hidden cognitive patterns.
2. Extract:
   - 📌 Core Reflection & Emotional Tone
   - 💡 Cognitive Reframing / Alternative Perspective
   - 🌱 Growth Takeaway & Tomorrow's Intent
3. Present clean, elegant formatting that serves as a permanent, searchable mental debrief.`,
    samplePrompt: "Today felt scattered and chaotic, even though I worked for 9 hours straight."
  }
};

export const WALLPAPERS: Record<string, WallpaperConfig> = {
  lofi_rain: {
    id: 'lofi_rain',
    name: 'Midnight Sapphire Glass',
    description: 'Deep royal blue & midnight violet with frosted glass luminosity and cyan rainglow',
    previewBg: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950',
    cardBg: 'backdrop-blur-xl bg-blue-950/40 border-blue-400/20',
    accentBorder: 'border-blue-400/40 shadow-[0_8px_32px_rgba(37,99,235,0.25)]',
    icon: '🌧️',
    dotColor: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
    activeClass: 'bg-gradient-to-r from-blue-600/35 to-indigo-600/35 border-blue-400/60 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/50'
  },
  sunset: {
    id: 'sunset',
    name: 'Frosted Sunset Glow',
    description: 'Warm dusk violet, radiant amber horizon glow, and coral peach clouds',
    previewBg: 'bg-gradient-to-br from-amber-600 via-rose-700 to-purple-950',
    cardBg: 'backdrop-blur-xl bg-pink-950/40 border-pink-400/25',
    accentBorder: 'border-rose-400/40 shadow-[0_8px_32px_rgba(244,63,94,0.25)]',
    icon: '🌅',
    dotColor: 'bg-gradient-to-r from-amber-400 to-rose-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]',
    activeClass: 'bg-gradient-to-r from-amber-500/35 via-rose-500/35 to-purple-500/35 border-rose-400/60 text-white shadow-[0_0_16px_rgba(244,63,94,0.5)] ring-1 ring-rose-400/50'
  },
  cyber_focus: {
    id: 'cyber_focus',
    name: 'Frosted Emerald Aura',
    description: 'Luminous Aurora Borealis with vibrant emerald, teal sea tides, and jade bioluminescence',
    previewBg: 'bg-gradient-to-br from-emerald-600 via-teal-800 to-slate-950',
    cardBg: 'backdrop-blur-xl bg-emerald-950/40 border-emerald-400/25',
    accentBorder: 'border-emerald-400/40 shadow-[0_8px_32px_rgba(16,185,129,0.25)]',
    icon: '🌿',
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]',
    activeClass: 'bg-gradient-to-r from-emerald-600/35 to-teal-600/35 border-emerald-400/60 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/50'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Minimal Frosted Titanium',
    description: 'Pure frosted translucency with sleek platinum silver, slate blue, and charcoal onyx',
    previewBg: 'bg-gradient-to-br from-slate-600 via-zinc-800 to-neutral-950',
    cardBg: 'backdrop-blur-xl bg-slate-900/40 border-slate-300/20',
    accentBorder: 'border-slate-300/30 shadow-[0_8px_32px_rgba(255,255,255,0.1)]',
    icon: '✨',
    dotColor: 'bg-slate-200 shadow-[0_0_8px_rgba(241,245,249,0.8)]',
    activeClass: 'bg-gradient-to-r from-slate-700/45 to-zinc-700/45 border-slate-300/60 text-white shadow-[0_0_16px_rgba(255,255,255,0.3)] ring-1 ring-slate-300/50'
  },
  cosmic_starlight: {
    id: 'cosmic_starlight',
    name: 'Cosmic Starlight',
    description: 'Authentic starry night sky: deep obsidian canvas, 130 twinkling stars, shooting stars, and nebulae',
    previewBg: 'bg-gradient-to-br from-violet-600 via-indigo-900 to-[#090912]',
    cardBg: 'backdrop-blur-xl bg-[#090912]/50 border-[rgba(167,139,250,0.3)]',
    accentBorder: 'border-[rgba(167,139,250,0.4)] shadow-[0_8px_32px_rgba(99,102,241,0.3),0_0_24px_rgba(167,139,250,0.2)]',
    icon: '🌌',
    dotColor: 'bg-gradient-to-r from-violet-400 to-cyan-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]',
    activeClass: 'bg-gradient-to-r from-violet-600/40 to-indigo-600/40 border-purple-400/60 text-white shadow-[0_0_20px_rgba(167,139,250,0.5)] ring-1 ring-purple-400/50'
  }
};

export const STATUS_BADGES = [
  '🌌 Deep in contemplation',
  '⚡ High velocity builder mode',
  '🧘 Seeking grounded clarity',
  '📜 Lyrical & reflective',
  '🏆 Celebrating a hard-won victory',
  '☕ Late night debrief',
  '🌱 Healing & recovering'
];
