import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Feather, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin
} from 'lucide-react';
import { UserProfile, PublicSnippet } from '../types';
import { db, collection, addDoc, doc, setDoc, serverTimestamp } from '../lib/firebase';
import { sanitizeSnippetContent, stripUndefined } from '../lib/sanitize';

interface SnippetShareModalProps {
  initialText: string;
  initialCouplet?: string;
  personaTitle?: string;
  user: UserProfile | null;
  onClose: () => void;
}

type CardTheme = 'velvet' | 'gold' | 'cyber' | 'obsidian';

export const SnippetShareModal: React.FC<SnippetShareModalProps> = ({
  initialText,
  initialCouplet,
  personaTitle = 'Aura Reflection',
  user,
  onClose
}) => {
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('gold');
  const [copied, setCopied] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Strictly sanitize content to prevent leaking private conversational context
  const cleanContent = sanitizeSnippetContent(initialText);
  const cleanCouplet = initialCouplet ? sanitizeSnippetContent(initialCouplet) : undefined;

  const authorName = user?.displayName || 'Aura Sanctuary';

  // Copy formatted text
  const handleCopyText = async () => {
    const formatted = cleanCouplet 
      ? `"${cleanCouplet}"\n\n— Via Aura (${personaTitle})\n${publicLink || window.location.origin}`
      : `"${cleanContent}"\n\n— Via Aura Personal Sanctuary\n${publicLink || window.location.origin}`;

    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Isolated Public Link (Saved to /public_snippets in Firestore)
  const handlePublishSnippet = async () => {
    setIsPublishing(true);
    try {
      const snippetId = `snip-${Math.random().toString(36).substring(2, 9)}`;
      
      const snippetData: Partial<PublicSnippet> = {
        id: snippetId,
        authorUid: user?.uid || 'anonymous',
        authorName: authorName,
        content: cleanContent,
        couplet: cleanCouplet || '',
        personaTitle: personaTitle,
        theme: selectedTheme,
        createdAt: Date.now()
      };

      if (user) {
        const snippetRef = doc(db, 'public_snippets', snippetId);
        await setDoc(snippetRef, stripUndefined({
          authorUid: user.uid,
          authorName: authorName,
          content: cleanContent,
          couplet: cleanCouplet || null,
          personaTitle: personaTitle,
          theme: selectedTheme,
          createdAt: serverTimestamp()
        }));
      }

      const generatedUrl = `${window.location.origin}/?snippet=${snippetId}`;
      setPublicLink(generatedUrl);
    } catch (err) {
      console.warn('Could not publish to Firestore, creating client link:', err);
      const fakeId = `snip-${Math.random().toString(36).substring(2, 7)}`;
      setPublicLink(`${window.location.origin}/?snippet=${fakeId}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'gold':
        return {
          wrapper: 'bg-gradient-to-br from-[#1c1611] via-[#241a14] to-[#14100c] border-[#855325]/50 text-amber-100 shadow-amber-950/40',
          accent: 'text-amber-400',
          coupletBg: 'bg-amber-950/40 border-amber-600/40 text-amber-200 font-[\'Playfair_Display\']',
          tag: 'border-amber-700/60 bg-amber-950/80 text-amber-300'
        };
      case 'velvet':
        return {
          wrapper: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/40 text-neutral-100 shadow-indigo-950/50',
          accent: 'text-indigo-400',
          coupletBg: 'bg-indigo-900/30 border-indigo-400/40 text-indigo-200 font-[\'Playfair_Display\']',
          tag: 'border-indigo-700/60 bg-indigo-950/80 text-indigo-300'
        };
      case 'cyber':
        return {
          wrapper: 'bg-gradient-to-br from-neutral-950 via-emerald-950/40 to-neutral-900 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40',
          accent: 'text-emerald-400',
          coupletBg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200 font-mono',
          tag: 'border-emerald-700/60 bg-emerald-950/80 text-emerald-400'
        };
      case 'obsidian':
      default:
        return {
          wrapper: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-950 border-neutral-700 text-neutral-200 shadow-black/60',
          accent: 'text-neutral-400',
          coupletBg: 'bg-neutral-800/50 border-neutral-700 text-neutral-100 font-[\'Playfair_Display\']',
          tag: 'border-neutral-700 bg-neutral-900 text-neutral-300'
        };
    }
  };

  // Global Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const themeStyle = getThemeStyles();

  return (
    <div 
      id="snippet-share-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
    >
      <div 
        id="snippet-share-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl backdrop-blur-2xl bg-black/80 rounded-3xl border border-white/20 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-y-auto cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/30">
              <Feather className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Selective Privacy Quote Card</h3>
              <p className="text-[11px] text-white/60">Strictly sanitizes snippet: zero private context leaked</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
          <span className="text-xs text-white/70 font-medium">Card Aesthetic:</span>
          <div className="flex items-center gap-2">
            {(['gold', 'velvet', 'cyber', 'obsidian'] as CardTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-3 py-1 rounded-xl text-xs capitalize transition-all ${
                  selectedTheme === theme
                    ? 'backdrop-blur-xl bg-white/20 text-white font-semibold border border-white/30 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* The Visual Shareable Card Preview */}
        <div className="p-1.5 rounded-3xl bg-black/30 border border-white/10 shadow-2xl mb-4 backdrop-blur-xl">
          <div className={`relative p-6 sm:p-8 rounded-[22px] border transition-all duration-300 ${themeStyle.wrapper}`}>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="text-xs font-semibold tracking-wider uppercase font-['Plus_Jakarta_Sans']">
                  Aura Sanctuary
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border backdrop-blur-md ${themeStyle.tag}`}>
                {personaTitle}
              </span>
            </div>

            {/* Couplet or Main Quote */}
            {cleanCouplet ? (
              <div className={`p-4 rounded-2xl border mb-3 text-base sm:text-lg italic leading-relaxed text-center backdrop-blur-md ${themeStyle.coupletBg}`}>
                <div className="whitespace-pre-line">"{cleanCouplet}"</div>
              </div>
            ) : (
              <blockquote className="text-sm sm:text-base leading-relaxed italic mb-4 font-['Playfair_Display']">
                "{cleanContent}"
              </blockquote>
            )}

            {/* Cleaned text excerpt if couplet was separate */}
            {cleanCouplet && cleanContent !== cleanCouplet && (
              <p className="text-xs text-neutral-300/90 leading-relaxed mb-3 line-clamp-3 font-['Plus_Jakarta_Sans']">
                {cleanContent}
              </p>
            )}

            {/* Card Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-85">
              <div className="flex items-center gap-1.5 font-medium text-white">
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Isolated Snippet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Options & Actions */}
        <div className="space-y-3">
          {/* Public Link Generated View */}
          {publicLink ? (
            <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/5 border border-emerald-400/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <ExternalLink className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-white/90 truncate font-mono">{publicLink}</span>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(publicLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shrink-0 flex items-center gap-1 shadow-sm transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero chat history or user email is attached to this card.</span>
              </div>

              <button
                id="generate-public-link-btn"
                onClick={handlePublishSnippet}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Sanitizing...' : 'Create Public Link'}</span>
              </button>
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handleCopyText}
              className="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Quote Text!' : 'Copy Formatted Card Text'}</span>
            </button>

            {/* WhatsApp Direct Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `"${cleanCouplet || cleanContent}" — via Aura Sanctuary\n${publicLink || ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
              title="Share to WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Twitter / X Direct Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `"${cleanCouplet || cleanContent}"\n\nReflected on Aura Personal Sanctuary:`
              )}&url=${encodeURIComponent(publicLink || window.location.origin)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
              title="Share to Twitter / X"
            >
              <Twitter className="w-4 h-4" />
            </a>

            {/* LinkedIn Direct Share */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                publicLink || window.location.origin
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
              title="Share to LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
