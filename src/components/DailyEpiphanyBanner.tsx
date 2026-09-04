import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Feather, X, MessageSquareQuote } from 'lucide-react';

interface DailyEpiphanyBannerProps {
  userName?: string | null;
  onReflectOnEpiphany: (text: string) => void;
}

interface EpiphanyItem {
  id: string;
  couplet: string;
  translation: string;
  poetOrContext: string;
  mode: 'shayari' | 'builder' | 'zen';
}

const DAILY_EPIPHANIES: EpiphanyItem[] = [
  {
    id: '1',
    couplet: 'Sitaron se aage jahan aur bhi hain, abhi ishq ke imtihan aur bhi hain.',
    translation: 'Beyond the stars, there are yet other realms; more trials of love and longing await.',
    poetOrContext: 'Allama Iqbal',
    mode: 'shayari'
  },
  {
    id: '2',
    couplet: 'Hazaron khwahishen aisi ke har khwahish pe dam nikle, bohat niklay mere armaan...',
    translation: 'Thousands of desires, each so profound; many fulfilled, yet longing remains boundless.',
    poetOrContext: 'Mirza Ghalib',
    mode: 'shayari'
  },
  {
    id: '3',
    couplet: 'Woh firaaq aur woh visaal kahan, kaarwan-e-khayal kahan.',
    translation: 'Where is that parting and where is that union now; where has the caravan of thoughts wandered?',
    poetOrContext: 'Faiz Ahmed Faiz',
    mode: 'shayari'
  },
  {
    id: '4',
    couplet: 'The bottleneck you avoid is the bridge you must build. Speed is momentum, intention is velocity.',
    translation: 'Action clarifies what overthinking paralyzes. Build today, refine tomorrow.',
    poetOrContext: 'Builder Mindset',
    mode: 'builder'
  },
  {
    id: '5',
    couplet: 'The silence inside your breath is older than all your anxieties.',
    translation: 'You are not the storm. You are the space in which the storm happens.',
    poetOrContext: 'Mindful Zen',
    mode: 'zen'
  }
];

export const DailyEpiphanyBanner: React.FC<DailyEpiphanyBannerProps> = ({
  onReflectOnEpiphany,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    setCurrentIndex(dayOfYear % DAILY_EPIPHANIES.length);
  }, []);

  if (isDismissed) {
    return null;
  }

  const currentEpiphany = DAILY_EPIPHANIES[currentIndex];

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${currentEpiphany.couplet}. Meaning: ${currentEpiphany.translation}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleReflectClick = () => {
    onReflectOnEpiphany(
      `I want to reflect deeply on today's Sher:\n"${currentEpiphany.couplet}"\nMeaning: ${currentEpiphany.translation}\nHow can this perspective apply to my current mind and journey?`
    );
  };

  const singleLineCouplet = currentEpiphany.couplet.replace(/\n+/g, ' ');

  return (
    <div 
      id="daily-epiphany-compact-banner"
      className="w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-2xl backdrop-blur-xl bg-white/[0.05] border border-amber-400/25 text-xs shadow-sm hover:border-amber-400/35 transition-all"
    >
      {/* Couplet & Poet Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="p-1 rounded-lg bg-amber-400/15 text-amber-300 shrink-0 border border-amber-400/25">
          <Feather className="w-3.5 h-3.5" />
        </span>
        
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider shrink-0 hidden sm:inline">
            Daily Epiphany
          </span>
          <span className="hidden sm:inline text-white/30 shrink-0">•</span>
          <span 
            className="font-['Playfair_Display'] italic text-amber-100 font-medium truncate text-xs sm:text-[13px] cursor-pointer hover:text-amber-200 transition-colors"
            title={`${singleLineCouplet} (${currentEpiphany.translation})`}
            onClick={handleReflectClick}
          >
            "{singleLineCouplet}"
          </span>
          <span className="text-[10px] text-white/50 shrink-0 font-sans hidden md:inline">
            — {currentEpiphany.poetOrContext}
          </span>
        </div>
      </div>

      {/* Action Controls: Audio Speak, Reflect, and Dismiss ✕ */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          id="listen-epiphany-btn"
          onClick={handleSpeak}
          className={`p-1.5 rounded-xl transition-all border cursor-pointer ${
            isSpeaking 
              ? 'bg-amber-400 text-neutral-950 border-amber-300 font-bold shadow-[0_0_10px_rgba(251,191,36,0.5)]' 
              : 'bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border-white/10'
          }`}
          title={isSpeaking ? 'Pause audio' : 'Listen to Sher'}
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <button
          id="reflect-epiphany-btn"
          onClick={handleReflectClick}
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/25 text-[11px] font-medium transition-all cursor-pointer"
          title="Reflect on this Sher with Aura"
        >
          <MessageSquareQuote className="w-3 h-3" />
          <span>Reflect</span>
        </button>

        <button
          id="dismiss-epiphany-btn"
          onClick={() => {
            if (isSpeaking && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }
            setIsDismissed(true);
          }}
          className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
