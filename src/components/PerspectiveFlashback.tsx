import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight, 
  Calendar, 
  Award,
  ChevronRight,
  TrendingUp,
  X,
  Trash2,
  Camera,
  Layers
} from 'lucide-react';
import { MilestoneEntry, UserProfile, PolaroidMoment } from '../types';
import { db, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from '../lib/firebase';
import { stripUndefined, sanitizeText } from '../lib/sanitize';
import { PolaroidCard } from './PolaroidCard';

interface PerspectiveFlashbackProps {
  user: UserProfile | null;
  onClose?: () => void;
  onJumpToChatWithPrompt?: (prompt: string) => void;
}

const DEFAULT_MILESTONES: MilestoneEntry[] = [
  {
    id: 'm-1',
    userId: 'sample',
    title: 'The Imposter Syndrome Wall',
    summary: 'Terrified that I was not technical enough for our cloud architecture redesign.',
    conqueredNote: 'Led the entire deployment flawlessly; team adopted the modular standard.',
    category: 'challenge',
    timestamp: Date.now() - 90 * 24 * 60 * 60 * 1000, // 3 months ago
  },
  {
    id: 'm-2',
    userId: 'sample',
    title: 'Panic Before First Live Demo',
    summary: 'Heart racing at 3 AM debugging WebSocket connections with no backup plan.',
    conqueredNote: 'Shipped to 120+ live attendees with zero downtime. Conquered the fear of being seen.',
    category: 'breakthrough',
    timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000, // 1.5 months ago
  },
  {
    id: 'm-3',
    userId: 'sample',
    title: 'Burnout & Reclaiming Sleep',
    summary: 'Struggling with late night doom-working and brain fog.',
    conqueredNote: 'Enforced a 10:30 PM digital sunset ritual. Energy and emotional patience doubled.',
    category: 'learning',
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
  }
];

export const PerspectiveFlashback: React.FC<PerspectiveFlashbackProps> = ({
  user,
  onClose,
  onJumpToChatWithPrompt
}) => {
  const [milestones, setMilestones] = useState<MilestoneEntry[]>(() => {
    const saved = localStorage.getItem('aura_milestones');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_MILESTONES;
  });

  const [moments, setMoments] = useState<PolaroidMoment[]>(() => {
    const saved = localStorage.getItem(`aura_moments_${user?.uid || 'guest'}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'all' | 'milestones' | 'moments'>('all');
  const [flashbackSynthesis, setFlashbackSynthesis] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New milestone form state
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newConqueredNote, setNewConqueredNote] = useState('');
  const [newCategory, setNewCategory] = useState<MilestoneEntry['category']>('challenge');
  const [pastTimeframe, setPastTimeframe] = useState('3 months ago');

  // Load moments & milestones from Firestore if user is signed in
  useEffect(() => {
    if (!user) return;

    const fetchMilestones = async () => {
      try {
        const ref = collection(db, 'users', user.uid, 'milestones');
        const q = query(ref, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const loaded: MilestoneEntry[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              userId: user.uid,
              title: data.title || '',
              summary: data.summary || '',
              conqueredNote: data.conqueredNote || '',
              category: data.category || 'challenge',
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now())
            });
          });
          setMilestones(loaded);
        }
      } catch (err) {
        console.warn('Could not fetch milestones from Firestore:', err);
      }
    };

    const fetchMoments = async () => {
      try {
        const ref = collection(db, 'users', user.uid, 'moments');
        const q = query(ref, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const loaded: PolaroidMoment[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              userId: user.uid,
              photoDataUrl: data.photoDataUrl || data.photoUrl || '',
              caption: data.caption || data.reflection || '',
              visualAnalysis: data.visualAnalysis || data.detectedScene || '',
              evocativeTitle: data.evocativeTitle || data.title || '',
              emotionalTone: data.emotionalTone || data.tone || 'Peaceful',
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              photoUrl: data.photoUrl || data.photoDataUrl || '',
              reflection: data.reflection || data.caption || '',
              title: data.title || data.evocativeTitle || '',
              tone: data.tone || data.emotionalTone || 'Peaceful',
              poeticNote: data.poeticNote,
              detectedScene: data.detectedScene
            });
          });
          setMoments(loaded);
        }
      } catch (err) {
        console.warn('Could not fetch moments from Firestore:', err);
      }
    };

    fetchMilestones();
    fetchMoments();
  }, [user]);

  // Save to localStorage as well
  useEffect(() => {
    try {
      localStorage.setItem('aura_milestones', JSON.stringify(milestones));
    } catch (e) {}
  }, [milestones]);

  // Synthesize Flashback Insight using Gemini
  const handleGenerateFlashback = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/flashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pastEntries: milestones,
          currentGoal: 'Seeking perspective on current pressure and honoring past growth.'
        })
      });

      if (!res.ok) throw new Error('Flashback request failed');
      const data = await res.json();
      setFlashbackSynthesis(data.flashback || '');
    } catch (err) {
      console.error(err);
      setFlashbackSynthesis(
        "Look how far you've come: 3 months ago you were overwhelmed by the fear of falling short, yet you adapted and proved your inner capacity. Whatever friction you face today, remember: you are already the person who conquered your earlier doubts."
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Add new milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    let computedTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (pastTimeframe === '1 month ago') computedTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (pastTimeframe === '3 months ago') computedTimestamp = Date.now() - 90 * 24 * 60 * 60 * 1000;
    if (pastTimeframe === '6 months ago') computedTimestamp = Date.now() - 180 * 24 * 60 * 60 * 1000;
    if (pastTimeframe === '1 year ago') computedTimestamp = Date.now() - 365 * 24 * 60 * 60 * 1000;

    const entry: MilestoneEntry = {
      id: `m-${Date.now()}`,
      userId: user?.uid || 'guest',
      title: sanitizeText(newTitle),
      summary: sanitizeText(newSummary),
      conqueredNote: sanitizeText(newConqueredNote) || 'Conquered with resilience and patience.',
      category: newCategory,
      timestamp: computedTimestamp
    };

    const updated = [entry, ...milestones];
    setMilestones(updated);

    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'milestones');
        await addDoc(col, stripUndefined({
          title: entry.title,
          summary: entry.summary,
          conqueredNote: entry.conqueredNote,
          category: entry.category,
          timestamp: serverTimestamp()
        }));
      } catch (err) {
        console.warn('Error saving milestone to Firestore:', err);
      }
    }

    setNewTitle('');
    setNewSummary('');
    setNewConqueredNote('');
    setShowAddModal(false);
  };

  // Delete past memory / milestone (Right to be Forgotten)
  const handleDeleteMilestone = async (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    setMilestones(updated);
    localStorage.setItem('aura_local_milestones', JSON.stringify(updated));

    if (user && user.uid !== 'guest-user') {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'milestones', id));
      } catch (err) {
        console.warn('Error deleting milestone from Firestore:', err);
      }
    }
  };

  // Delete past Polaroid moment (Right to be Forgotten)
  const handleDeleteMoment = async (id: string) => {
    const updated = moments.filter((m) => m.id !== id);
    setMoments(updated);
    localStorage.setItem(`aura_moments_${user?.uid || 'guest'}`, JSON.stringify(updated));

    if (user && user.uid !== 'guest-user') {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'moments', id));
      } catch (err) {
        console.warn('Error deleting moment from Firestore:', err);
      }
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diffDays = Math.round((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays < 30) return `${diffDays} days ago`;
    const months = Math.round(diffDays / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.round(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-indigo-900/30 border border-indigo-400/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-mono uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Perspective-Shift Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Playfair_Display']">
            On This Day: Look How Far You've Come
          </h2>
          <p className="text-sm text-indigo-100/80 mt-1.5 max-w-2xl leading-relaxed">
            When current challenges feel monumental, Aura reviews your past journal entries and milestones to reflect your proven resilience back to you.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            id="synthesize-flashback-btn"
            onClick={handleGenerateFlashback}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Generate Flashback Insight'}</span>
          </button>

          <button
            id="record-milestone-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-300" />
            <span>Log Milestone</span>
          </button>
        </div>
      </div>

      {/* Synthesized Flashback Card */}
      {flashbackSynthesis && (
        <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Award className="w-4 h-4" />
              <span>Aura's Perspective Shift Insight</span>
            </div>
            <span className="text-[10px] font-mono text-white/50">Grounded via Gemini</span>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-white whitespace-pre-wrap font-['Plus_Jakarta_Sans']">
            {flashbackSynthesis}
          </div>

          {onJumpToChatWithPrompt && (
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => onJumpToChatWithPrompt("Let's reflect deeper on how far I've come since my earlier obstacles.")}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors"
              >
                <span>Reflect on this growth in Sanctuary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Milestone & Polaroid Moments Growth Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              Past Reflections & Evidence of Resilience
            </h3>
          </div>

          {/* View Filter Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 text-xs">
            <button
              id="filter-all-memories-btn"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All ({milestones.length + moments.length})
            </button>
            <button
              id="filter-milestones-btn"
              onClick={() => setActiveTab('milestones')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                activeTab === 'milestones'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>Milestones ({milestones.length})</span>
            </button>
            <button
              id="filter-moments-btn"
              onClick={() => setActiveTab('moments')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                activeTab === 'moments'
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Camera className="w-3 h-3 text-cyan-300" />
              <span>Polaroids ({moments.length})</span>
            </button>
          </div>
        </div>

        {/* Polaroid Moments Grid (Visible if activeTab is 'all' or 'moments') */}
        {(activeTab === 'all' || activeTab === 'moments') && moments.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
              <Camera className="w-3.5 h-3.5" />
              <span>Multimodal Polaroid Moments</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {moments.map((mom) => (
                <div key={mom.id} className="relative">
                  <PolaroidCard
                    moment={mom}
                    onDelete={handleDeleteMoment}
                    showDelete={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones Grid (Visible if activeTab is 'all' or 'milestones') */}
        {(activeTab === 'all' || activeTab === 'milestones') && (
          <div className="space-y-3 pt-2">
            {activeTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
                <Flame className="w-3.5 h-3.5" />
                <span>Text Milestones & Stressors Conquered</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="group p-6 rounded-3xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full backdrop-blur-md bg-white/10 text-white/80 border border-white/20 font-mono text-[10px]">
                          {formatTimeAgo(m.timestamp)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-300">
                          {m.category}
                        </span>
                      </div>

                      <button
                        id={`delete-milestone-btn-${m.id}`}
                        onClick={() => handleDeleteMilestone(m.id)}
                        className="p-1.5 rounded-xl backdrop-blur-md bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all"
                        title="Delete this memory (Right to be Forgotten)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-semibold text-white text-base mb-3">{m.title}</h4>

                    {/* Stressed State */}
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/10 mb-3 text-xs text-white/70">
                      <div className="text-[10px] font-mono uppercase text-rose-300/90 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Past Friction:</span>
                      </div>
                      <p className="line-clamp-2 leading-relaxed">{m.summary}</p>
                    </div>

                    {/* Conquered Resolution */}
                    <div className="p-3 rounded-2xl bg-black/20 border border-emerald-400/30 text-xs text-emerald-200">
                      <div className="text-[10px] font-mono uppercase text-emerald-300 mb-1 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Conquered:</span>
                      </div>
                      <p className="line-clamp-2 leading-relaxed">{m.conqueredNote}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-lg backdrop-blur-2xl bg-black/70 rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Log a Milestone / Conquered Obstacle</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-medium mb-1.5">Obstacle or Doubt Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Terrified of public tech talk"
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-400/80"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1.5">What was stressing or blocking you?</label>
                <textarea
                  required
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="e.g. Kept dreading tripping on words and feeling unprepared..."
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-400/80 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1.5">How did you conquer or navigate it?</label>
                <textarea
                  required
                  rows={2}
                  value={newConqueredNote}
                  onChange={(e) => setNewConqueredNote(e.target.value)}
                  placeholder="e.g. Practiced 5 times, focused on helping 1 person, and delivered a clear keynote."
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-400/80 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/80 font-medium mb-1.5">When was this?</label>
                  <select
                    value={pastTimeframe}
                    onChange={(e) => setPastTimeframe(e.target.value)}
                    className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="1 month ago" className="bg-neutral-900 text-white">1 month ago</option>
                    <option value="3 months ago" className="bg-neutral-900 text-white">3 months ago</option>
                    <option value="6 months ago" className="bg-neutral-900 text-white">6 months ago</option>
                    <option value="1 year ago" className="bg-neutral-900 text-white">1 year ago</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 font-medium mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="challenge" className="bg-neutral-900 text-white">Challenge / Doubt</option>
                    <option value="breakthrough" className="bg-neutral-900 text-white">Breakthrough</option>
                    <option value="learning" className="bg-neutral-900 text-white">Lesson / Realization</option>
                    <option value="gratitude" className="bg-neutral-900 text-white">Gratitude</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
