import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Share2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import { UserProfile, PublicSnippet } from '../types';
import { db, collection, query, where, getDocs, doc, deleteDoc, orderBy } from '../lib/firebase';

interface ActiveSharesModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onViewSnippet: (snippetId: string) => void;
}

export const ActiveSharesModal: React.FC<ActiveSharesModalProps> = ({
  user,
  onClose,
  onViewSnippet
}) => {
  const [snippets, setSnippets] = useState<PublicSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Click-Outside & Escape Key Dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchUserSnippets = async () => {
    setLoading(true);
    const loaded: PublicSnippet[] = [];

    // 1. Check localStorage for any snippets created on this browser
    const localSnippetIds: string[] = JSON.parse(localStorage.getItem('aura_my_snippets') || '[]');

    if (user && user.uid !== 'guest-user') {
      try {
        const q = query(
          collection(db, 'public_snippets'),
          where('authorUid', '==', user.uid)
        );
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            authorUid: data.authorUid,
            authorName: data.authorName || 'Seeker',
            content: data.content || '',
            couplet: data.couplet || undefined,
            personaTitle: data.personaTitle || 'Aura Sanctuary',
            theme: data.theme || 'gold',
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
          });
        });
      } catch (err) {
        console.warn('Error fetching user snippets from Firestore:', err);
      }
    }

    // Also include any local ones if not already present
    if (localSnippetIds.length > 0) {
      for (const id of localSnippetIds) {
        if (!loaded.some((s) => s.id === id)) {
          try {
            const snap = await getDocs(query(collection(db, 'public_snippets'), where('__name__', '==', id)));
            snap.forEach((d) => {
              const data = d.data();
              loaded.push({
                id: d.id,
                authorUid: data.authorUid,
                authorName: data.authorName || 'Seeker',
                content: data.content || '',
                couplet: data.couplet || undefined,
                personaTitle: data.personaTitle || 'Aura Sanctuary',
                theme: data.theme || 'gold',
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now())
              });
            });
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // Sort by timestamp desc
    loaded.sort((a, b) => b.createdAt - a.createdAt);
    setSnippets(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchUserSnippets();
  }, [user?.uid]);

  const handleCopy = async (snippetId: string) => {
    const url = `${window.location.origin}/?snippet=${snippetId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Revoke & Delete link from Firestore
  const handleRevokeSnippet = async (snippetId: string) => {
    setRevokingId(snippetId);
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'public_snippets', snippetId));

      // 2. Remove from local tracking
      const localSnippetIds: string[] = JSON.parse(localStorage.getItem('aura_my_snippets') || '[]');
      const filtered = localSnippetIds.filter((id) => id !== snippetId);
      localStorage.setItem('aura_my_snippets', JSON.stringify(filtered));

      // 3. Update state
      setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
      setConfirmRevokeId(null);
      setToastMessage('Public link permanently revoked and deleted.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error('Error revoking snippet:', err);
      // Even if Firestore fails (e.g. guest mode), remove from local
      setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
      setConfirmRevokeId(null);
      setToastMessage('Link removed from your active shares.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl backdrop-blur-2xl bg-black/80 rounded-3xl border border-white/20 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30">
              <Share2 className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-white font-['Playfair_Display']">
                Active Shares & Revocation Vault
              </h3>
              <p className="text-xs text-white/60">
                Right to be Forgotten: Manage and permanently delete your public quote cards anytime
              </p>
            </div>
          </div>
          <button
            id="close-active-shares-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-start gap-2.5 mb-4">
          <Lock className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Every quote card you share contains an isolated snippet strictly stripped of private journal history. Clicking <strong className="text-white">Revoke / Delete Link</strong> purges the document from Firestore so the link immediately ceases to exist.
          </p>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-white/50 flex flex-col items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-spin" />
              <span>Scanning active quote links...</span>
            </div>
          ) : snippets.length === 0 ? (
            <div className="py-14 text-center text-xs text-white/50 flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-white/5 border border-white/10">
                <Share2 className="w-5 h-5 text-white/40" />
              </div>
              <p className="max-w-xs text-white/70">
                No active public quote links found. When you share selective quotes from the Sanctuary, they will appear here.
              </p>
            </div>
          ) : (
            snippets.map((snip) => {
              const url = `${window.location.origin}/?snippet=${snip.id}`;
              const isConfirming = confirmRevokeId === snip.id;

              return (
                <div
                  key={snip.id}
                  className="p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                          {snip.personaTitle || 'Sanctuary Quote'}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">
                          Theme: {snip.theme}
                        </span>
                      </div>
                      <blockquote className="text-xs italic text-white/90 line-clamp-2 font-['Playfair_Display']">
                        "{snip.couplet || snip.content}"
                      </blockquote>
                    </div>

                    <button
                      onClick={() => onViewSnippet(snip.id)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="Preview card"
                    >
                      <ExternalLink className="w-4 h-4 text-indigo-300" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-white/60 truncate max-w-sm">
                      <span className="truncate">{url}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(snip.id)}
                        className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-all"
                      >
                        {copiedId === snip.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            disabled={revokingId === snip.id}
                            onClick={() => handleRevokeSnippet(snip.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{revokingId === snip.id ? 'Revoking...' : 'Confirm Revoke'}</span>
                          </button>
                          <button
                            onClick={() => setConfirmRevokeId(null)}
                            className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-white/60 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRevokeId(snip.id)}
                          className="px-3 py-1.5 rounded-xl backdrop-blur-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-medium flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke / Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
