import React, { useEffect, useState } from 'react';
import { Feather, ShieldCheck, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { PublicSnippet } from '../types';
import { db, doc, getDoc } from '../lib/firebase';

interface PublicSnippetViewProps {
  snippetId: string;
  onEnterSanctuary: () => void;
}

export const PublicSnippetView: React.FC<PublicSnippetViewProps> = ({
  snippetId,
  onEnterSanctuary
}) => {
  const [snippet, setSnippet] = useState<PublicSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'public_snippets', snippetId));
        if (snap.exists()) {
          setSnippet(snap.data() as PublicSnippet);
        } else {
          // Fallback demo snippet
          setSnippet({
            id: snippetId,
            authorUid: 'aura',
            authorName: 'Aura Sanctuary',
            content: 'सितारों की चमक भी धुंधली लगे जब मन में अंधेरा हो,\nमगर एक सच का दीया हर रात को सवेरा कर दे।',
            couplet: 'Even stars feel dim when the mind is shadowed,\nYet a single lamp of self-truth turns any midnight into dawn.',
            personaTitle: 'Shayari & Poetic Soul',
            theme: 'gold',
            createdAt: Date.now()
          });
        }
      } catch (e) {
        console.warn('Error reading snippet from Firestore:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippet();
  }, [snippetId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-neutral-400">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span>Opening Reflection Snippet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Privacy Notice Pill */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-xs text-white/80 mb-6 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
        <span>Isolated Public Reflection • Zero Chat Context Leaked</span>
      </div>

      {/* Quote Card */}
      <div className="w-full p-1.5 rounded-3xl bg-black/40 shadow-2xl border border-white/15 mb-6 backdrop-blur-xl">
        <div className="relative p-6 sm:p-8 rounded-[22px] bg-gradient-to-br from-[#241a14]/90 via-[#1c1611]/80 to-[#14100c]/90 border border-amber-500/30 text-amber-100 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-400/30">
                <Feather className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase font-['Plus_Jakarta_Sans']">Aura Sanctuary</span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-950/60 text-amber-300 backdrop-blur-md">
              {snippet?.personaTitle || 'Reflection'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-400/30 text-amber-200 font-['Playfair_Display'] text-base sm:text-lg italic leading-relaxed text-center mb-4 backdrop-blur-md">
            <div className="whitespace-pre-line">"{snippet?.couplet || snippet?.content}"</div>
          </div>

          {snippet?.couplet && snippet.content && snippet.content !== snippet.couplet && (
            <p className="text-xs text-neutral-300/90 leading-relaxed mb-4 font-['Plus_Jakarta_Sans']">
              {snippet.content}
            </p>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-90">
            <span className="font-medium text-amber-300">— {snippet?.authorName || 'Anonymous Seeker'}</span>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md transition-all ${
                liked 
                  ? 'text-rose-300 bg-rose-950/60 border border-rose-500/40 shadow-sm' 
                  : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'Resonated' : 'Resonate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action: Enter Personal Sanctuary */}
      <div className="text-center space-y-3.5">
        <p className="text-xs text-white/70">
          Reflect with emotional nuance, philosophical depth, and personalized guidance.
        </p>
        <button
          onClick={onEnterSanctuary}
          className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
        >
          <span>Enter Your Personal Sanctuary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
