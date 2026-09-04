import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Send, 
  Feather, 
  Heart,
  Timer,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimeCapsule, UserProfile } from '../types';
import { db, collection, addDoc, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from '../lib/firebase';
import { stripUndefined, sanitizeText } from '../lib/sanitize';

interface TimeCapsuleModalProps {
  user: UserProfile | null;
  onSignIn: () => void;
}

const DEFAULT_CAPSULES: TimeCapsule[] = [
  {
    id: 'capsule-demo-1',
    userId: 'demo',
    title: 'A Letter to the Builder in 6 Months',
    letter: 'Dear Future Self,\n\nI hope when you unlock this letter, the panic of the early architecture migration feels like ancient history. Remember why you started: to build software that has soul, elegance, and integrity. Do not let cynical velocity crowd out your love of craft.\n\nKeep breathing deeply.',
    createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
    unlockDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // Ready to open!
    isOpened: false,
    sealedMood: 'Audacious & Grounded'
  },
  {
    id: 'capsule-demo-2',
    userId: 'demo',
    title: 'A Note for Next New Year',
    letter: 'Did you finally take that solo hiking trip in the mountains? Did you let yourself celebrate the small wins without rushing to the next milestone?',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    unlockDate: Date.now() + 120 * 24 * 60 * 60 * 1000, // Locked
    isOpened: false,
    sealedMood: 'Curious & Hopeful'
  }
];

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({ user, onSignIn }) => {
  const [capsules, setCapsules] = useState<TimeCapsule[]>(() => {
    const saved = localStorage.getItem('aura_time_capsules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CAPSULES;
  });

  const [isComposing, setIsComposing] = useState(false);
  const [openedCapsule, setOpenedCapsule] = useState<TimeCapsule | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [letter, setLetter] = useState('');
  const [mood, setMood] = useState('Hopeful & Resilient');
  const [duration, setDuration] = useState('3_months');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [aiPromptSuggestion, setAiPromptSuggestion] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_time_capsules', JSON.stringify(capsules));
    } catch (e) {}
  }, [capsules]);

  // Load from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchCapsules = async () => {
      try {
        const ref = collection(db, 'users', user.uid, 'time_capsules');
        const q = query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded: TimeCapsule[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              userId: user.uid,
              title: data.title || 'Letter to Future Self',
              letter: data.letter || '',
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
              unlockDate: data.unlockDate || Date.now(),
              isOpened: !!data.isOpened,
              sealedMood: data.sealedMood || 'Thoughtful'
            });
          });
          setCapsules(loaded);
        }
      } catch (err) {
        console.warn('Could not fetch capsules from Firestore:', err);
      }
    };
    fetchCapsules();
  }, [user]);

  // Generate AI Prompt for letter
  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/timecapsule/seal-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, timeframe: duration.replace('_', ' ') })
      });
      if (res.ok) {
        const data = await res.json();
        setAiPromptSuggestion(data.prompt);
      }
    } catch (err) {
      setAiPromptSuggestion(
        "1. What is a hidden fear you are carrying right now that you hope your future self has outgrown?\n2. What is one promise to your well-being you will make today?\n3. Who in your life deserves an unprompted thank you today?"
      );
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Seal Time Capsule
  const handleSealCapsule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !letter.trim()) return;

    let unlockTimestamp = Date.now() + 90 * 24 * 60 * 60 * 1000;
    if (duration === '1_month') unlockTimestamp = Date.now() + 30 * 24 * 60 * 60 * 1000;
    if (duration === '3_months') unlockTimestamp = Date.now() + 90 * 24 * 60 * 60 * 1000;
    if (duration === '6_months') unlockTimestamp = Date.now() + 180 * 24 * 60 * 60 * 1000;
    if (duration === '1_year') unlockTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000;

    const newCapsule: TimeCapsule = {
      id: `capsule-${Date.now()}`,
      userId: user?.uid || 'guest',
      title: sanitizeText(title),
      letter: sanitizeText(letter),
      createdAt: Date.now(),
      unlockDate: unlockTimestamp,
      isOpened: false,
      sealedMood: mood
    };

    setCapsules([newCapsule, ...capsules]);

    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'time_capsules');
        await addDoc(col, stripUndefined({
          title: newCapsule.title,
          letter: newCapsule.letter,
          createdAt: serverTimestamp(),
          unlockDate: newCapsule.unlockDate,
          isOpened: false,
          sealedMood: newCapsule.sealedMood
        }));
      } catch (err) {
        console.warn('Error persisting capsule:', err);
      }
    }

    // Trigger seal celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    setTitle('');
    setLetter('');
    setIsComposing(false);
  };

  // Open / Unseal Capsule
  const handleUnseal = async (c: TimeCapsule) => {
    if (Date.now() < c.unlockDate) return;

    // Trigger celebration
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    const updated = capsules.map((item) => item.id === c.id ? { ...item, isOpened: true } : item);
    setCapsules(updated);
    setOpenedCapsule({ ...c, isOpened: true });

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'time_capsules', c.id), {
          isOpened: true
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const formatCountdown = (unlockDate: number) => {
    const diff = unlockDate - Date.now();
    if (diff <= 0) return 'Ready to Unlock!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `Unlocks in ~${months} month${months > 1 ? 's' : ''} (${days} days)`;
    }
    return `Unlocks in ${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-pink-900/20 border border-pink-400/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-pink-300 text-xs font-mono uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-pink-400" />
            <span>Future Me Sanctuary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Playfair_Display']">
            Future Me Time Capsule
          </h2>
          <p className="text-sm text-pink-100/80 mt-1.5 max-w-2xl leading-relaxed">
            Write an honest, unfiltered letter to your future self. It is sealed with an animated wax seal and locked until your chosen unlock date.
          </p>
        </div>

        <button
          id="write-time-capsule-btn"
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-semibold text-xs shadow-[0_0_15px_rgba(236,72,153,0.4)] active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Write New Letter</span>
        </button>
      </div>

      {/* Sealed Letters Vault */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-pink-400" />
            <span>Your Sealed Capsules</span>
          </h3>
          <span className="text-xs text-white/60 font-mono">{capsules.length} Time Capsules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capsules.map((c) => {
            const isReady = Date.now() >= c.unlockDate;
            const isUnlocked = c.isOpened;

            return (
              <div
                key={c.id}
                className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-white/10 border-white/20 shadow-xl'
                    : isReady
                    ? 'bg-pink-950/30 border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.25)] ring-1 ring-pink-400/30'
                    : 'bg-white/5 border-white/10 shadow-md'
                }`}
              >
                {/* Wax Seal Visual Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner backdrop-blur-md ${
                      isUnlocked 
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
                        : isReady 
                        ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.5)] animate-pulse' 
                        : 'bg-white/10 border-white/15 text-white/60'
                    }`}>
                      {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-white">{c.title}</h4>
                      <div className="text-[11px] text-white/60">
                        Mood: <span className="text-pink-300 font-medium">{c.sealedMood}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-3 py-1 rounded-full border backdrop-blur-md ${
                    isUnlocked
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                      : isReady
                      ? 'bg-pink-500/30 border-pink-400 text-white font-bold shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                      : 'bg-white/10 border-white/20 text-white/70'
                  }`}>
                    {isUnlocked ? 'Unsealed' : formatCountdown(c.unlockDate)}
                  </span>
                </div>

                {/* Capsule Preview / Content */}
                <div className="my-3 p-4 rounded-2xl bg-black/25 border border-white/10 text-xs backdrop-blur-md">
                  {isUnlocked ? (
                    <p className="text-white/90 line-clamp-4 whitespace-pre-wrap font-['Plus_Jakarta_Sans'] leading-relaxed">
                      {c.letter}
                    </p>
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center text-white/60 gap-2">
                      <Lock className="w-6 h-6 text-pink-400/60" />
                      <p className="text-xs font-mono text-white/60">
                        {isReady ? 'The seal is ready to be broken.' : 'Contents locked in encrypted vault until unlock date.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 flex items-center justify-between text-[11px] text-white/50 border-t border-white/10">
                  <span>Sealed on {new Date(c.createdAt).toLocaleDateString()}</span>

                  {isReady && !isUnlocked && (
                    <button
                      onClick={() => handleUnseal(c)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white font-bold text-xs shadow-[0_0_12px_rgba(236,72,153,0.4)] active:scale-95 transition-all"
                    >
                      Break Wax Seal & Read
                    </button>
                  )}

                  {isUnlocked && (
                    <button
                      onClick={() => setOpenedCapsule(c)}
                      className="text-indigo-300 hover:text-indigo-200 font-medium"
                    >
                      View Full Letter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compose Letter Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-xl backdrop-blur-2xl bg-black/80 rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-pink-500/20 border border-pink-400/30">
                  <Feather className="w-4 h-4 text-pink-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Write to Your Future Self</h3>
                  <p className="text-[11px] text-white/60">Lock your thoughts in a digital wax-sealed capsule</p>
                </div>
              </div>
              <button
                onClick={() => setIsComposing(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSealCapsule} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-medium mb-1.5">Capsule Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. For when the next chapter begins"
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-pink-400/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-medium mb-1.5">Unlock In</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="1_month" className="bg-neutral-900 text-white">1 Month</option>
                    <option value="3_months" className="bg-neutral-900 text-white">3 Months</option>
                    <option value="6_months" className="bg-neutral-900 text-white">6 Months</option>
                    <option value="1_year" className="bg-neutral-900 text-white">1 Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-1.5">Current Mood / Seal</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="Hopeful & Resilient" className="bg-neutral-900 text-white">Hopeful & Resilient</option>
                    <option value="Curious & Wondering" className="bg-neutral-900 text-white">Curious & Wondering</option>
                    <option value="Audacious & Driven" className="bg-neutral-900 text-white">Audacious & Driven</option>
                    <option value="Vulnerable & Tender" className="bg-neutral-900 text-white">Vulnerable & Tender</option>
                    <option value="Reflective & Peaceful" className="bg-neutral-900 text-white">Reflective & Peaceful</option>
                  </select>
                </div>
              </div>

              {/* AI Prompt Generator */}
              <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/80 text-[11px] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Need inspiration for what to write?
                  </span>
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt}
                    className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold"
                  >
                    {isGeneratingPrompt ? 'Thinking...' : 'Inspire with AI'}
                  </button>
                </div>
                {aiPromptSuggestion && (
                  <div className="text-[11px] text-white/90 whitespace-pre-line backdrop-blur-md bg-white/5 p-3 rounded-xl border border-white/10 mt-2 font-['Plus_Jakarta_Sans']">
                    {aiPromptSuggestion}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1.5">Your Letter</label>
                <textarea
                  required
                  rows={6}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  placeholder="Dear future self, right now I am wrestling with..."
                  className="w-full p-3.5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-pink-400/80 resize-none font-['Plus_Jakarta_Sans'] leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-5 py-2.5 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-semibold shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Seal & Lock Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Unsealed Letter Modal */}
      {openedCapsule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-lg backdrop-blur-2xl bg-black/80 rounded-3xl border border-amber-400/30 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-base text-white">{openedCapsule.title}</h3>
              </div>
              <button
                onClick={() => setOpenedCapsule(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-white/60 mb-4 flex items-center gap-2">
              <span>Sealed on {new Date(openedCapsule.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-amber-300">Mood: {openedCapsule.sealedMood}</span>
            </div>

            <div className="p-5 rounded-2xl backdrop-blur-md bg-white/5 border border-white/15 text-sm leading-relaxed text-white whitespace-pre-wrap font-['Playfair_Display'] italic">
              {openedCapsule.letter}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setOpenedCapsule(null)}
                className="px-5 py-2.5 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-medium text-xs"
              >
                Close Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
