import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Feather, 
  Zap, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Play,
  Pause,
  Square,
  Share2, 
  RefreshCw, 
  Lock, 
  CornerDownLeft,
  Flame,
  Info,
  SlidersHorizontal,
  Trash2,
  Download,
  FileText,
  Check,
  ShieldCheck,
  AlertCircle,
  Camera,
  Mic,
  MicOff,
  Image as ImageIcon,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { PersonaId, WallpaperId, ChatMessage, UserProfile, PolaroidMoment, JournalSession } from '../types';
import { PERSONAS, WALLPAPERS } from '../lib/personas';
import { db, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, deleteDoc } from '../lib/firebase';
import { stripUndefined, sanitizeText, formatTimeSafe, formatFullDateSafe } from '../lib/sanitize';
import { exportAsMarkdown, exportAsJson } from '../lib/exportJournal';
import { ActiveSharesModal } from './ActiveSharesModal';
import { AddMomentModal } from './AddMomentModal';
import { DailyEpiphanyBanner } from './DailyEpiphanyBanner';
import { KeepsakeCardModal } from './KeepsakeCardModal';
import { PolaroidCard } from './PolaroidCard';
import { renderUserAvatar } from '../utils/avatarHelper';
import { Toast, ToastData } from './Toast';

interface PersonalSanctuaryProps {
  persona: PersonaId;
  setPersona: (p: PersonaId) => void;
  wallpaper: WallpaperId;
  user: UserProfile | null;
  onOpenSnippetShare: (text: string, couplet?: string, personaTitle?: string) => void;
  onOpenFlashback: () => void;
  activeSession?: JournalSession | null;
  onUpdateSessionMessages?: (messages: ChatMessage[], moments?: PolaroidMoment[], firstUserPrompt?: string) => void;
}

const DEFAULT_WELCOME_MESSAGES: Record<PersonaId, ChatMessage> = {
  shayari: {
    id: 'welcome-shayari',
    sender: 'gemini',
    text: "Aadaab & welcome to your evening sanctuary. What unspoken emotions or thoughts carry weight in your heart today?",
    couplet: "सितारों की चमक भी धुंधली लगे जब मन में अंधेरा हो,\nमगर एक सच का दीया हर रात को सवेरा कर दे।\n(Even stars feel dim when the mind feels shadowed,\nYet a single lamp of self-truth turns any midnight into dawn.)",
    timestamp: Date.now(),
    personaId: 'shayari',
    modelUsed: 'gemini-2.5-flash'
  },
  hackathon: {
    id: 'hackathon-welcome',
    sender: 'gemini',
    text: "Welcome to the war room. Stop fighting yesterday's backlog in your head. What is the single biggest blocker or source of friction in front of you right now?",
    timestamp: Date.now(),
    personaId: 'hackathon',
    modelUsed: 'gemini-2.5-flash'
  },
  zen: {
    id: 'zen-welcome',
    sender: 'gemini',
    text: "Take a slow, deep breath in... and let your shoulders drop as you exhale. There is nothing you need to fix or perform in this quiet sanctuary. What does your mind need to release today?",
    timestamp: Date.now(),
    personaId: 'zen',
    modelUsed: 'gemini-2.5-flash'
  },
  journal: {
    id: 'journal-welcome',
    sender: 'gemini',
    text: "Ready for your structured debrief. Tell me about the events, mental patterns, or decisions you'd like to synthesize today.",
    timestamp: Date.now(),
    personaId: 'journal',
    modelUsed: 'gemini-2.5-flash'
  }
};

const SUGGESTED_PROMPTS: Record<PersonaId, string[]> = {
  shayari: [
    "I'm feeling anxious about making an uncertain career leap.",
    "Today felt lonely, even though I was surrounded by people.",
    "Write a couplet about resilience after an unexpected failure."
  ],
  hackathon: [
    "I'm procrastinating on my MVP launch because of minor UI flaws.",
    "My co-founder and I have differing opinions on our roadmap.",
    "Give me a 20-minute reality check to stop overthinking."
  ],
  zen: [
    "My mind is racing with tomorrow's deadlines.",
    "Guide me through a brief somatic grounding exercise.",
    "How do I let go of irritation with things beyond my control?"
  ],
  journal: [
    "Synthesize my day: high productivity but low emotional satisfaction.",
    "Help me analyze my recurring fear of public speaking.",
    "Debrief a difficult conversation I had with my manager."
  ]
};

export const PersonalSanctuary: React.FC<PersonalSanctuaryProps> = ({
  persona,
  setPersona,
  wallpaper,
  user,
  onOpenSnippetShare,
  onOpenFlashback,
  activeSession,
  onUpdateSessionMessages
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (activeSession?.messages && activeSession.messages.length > 0) {
      return activeSession.messages;
    }
    const saved = localStorage.getItem(`aura_sanctuary_msgs_${persona}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [DEFAULT_WELCOME_MESSAGES[persona] || DEFAULT_WELCOME_MESSAGES.shayari];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechState, setSpeechState] = useState<{
    msgId: string | null;
    status: 'idle' | 'playing' | 'paused';
  }>({ msgId: null, status: 'idle' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [showActiveShares, setShowActiveShares] = useState(false);
  const [showAddMomentModal, setShowAddMomentModal] = useState(false);
  const [selectedKeepsakeMessage, setSelectedKeepsakeMessage] = useState<ChatMessage | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const [recentMoments, setRecentMoments] = useState<PolaroidMoment[]>(() => {
    if (activeSession?.moments) {
      return activeSession.moments;
    }
    try {
      const key = `aura_moments_${user?.uid || 'guest'}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTranscriptRef = useRef<string>('');

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

  // Synchronize when activeSession changes from sidebar
  useEffect(() => {
    if (activeSession) {
      if (activeSession.messages && activeSession.messages.length > 0) {
        setMessages(activeSession.messages);
      }
      if (activeSession.moments) {
        setRecentMoments(activeSession.moments);
      }
      if (activeSession.personaId && activeSession.personaId !== persona) {
        setPersona(activeSession.personaId);
      }
    }
  }, [activeSession?.id]);

  // Speech-to-Text Voice Dictation with Live Transcription and Pulse Wave Animation
  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToastData({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Voice Dictation Unavailable',
        message: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      });
      return;
    }

    if (isDictating && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      baseTranscriptRef.current = input;

      recognition.onstart = () => {
        setIsDictating(true);
        setToastData({
          id: Date.now().toString(),
          type: 'info',
          title: 'Voice Input Active',
          message: 'Listening... speak your reflection into the microphone.'
        });
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const base = baseTranscriptRef.current.trim();
        const combined = [base, final, interim].filter(Boolean).join(' ');
        setInput(combined);

        if (final) {
          baseTranscriptRef.current = [base, final].filter(Boolean).join(' ');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
        setIsDictating(false);
        if (e.error !== 'no-speech') {
          setToastData({
            id: Date.now().toString(),
            type: 'error',
            title: 'Microphone Error',
            message: `Voice recognition ended: ${e.error || 'Please check microphone permissions'}.`
          });
        }
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to initialize:', err);
      setIsDictating(false);
    }
  };

  const handleMomentSaved = (moment: PolaroidMoment) => {
    const updated = [moment, ...recentMoments];
    setRecentMoments(updated);
    try {
      const key = `aura_moments_${user?.uid || 'guest'}`;
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    if (onUpdateSessionMessages) {
      onUpdateSessionMessages(messages, updated);
    }
    setToastData({
      id: Date.now().toString(),
      type: 'success',
      title: 'Polaroid Developed',
      message: `Preserved "${moment.evocativeTitle}" in your sanctuary moments.`
    });
  };

  const activePersonaConfig = PERSONAS[persona] || PERSONAS.shayari;
  const activeWallpaperConfig = WALLPAPERS[wallpaper] || WALLPAPERS.lofi_rain;

  // Clear conversation & purge from local and cloud storage (Right to be Forgotten)
  const handleClearConversation = async () => {
    setIsClearing(true);
    try {
      const defaultWelcome = DEFAULT_WELCOME_MESSAGES[persona] || DEFAULT_WELCOME_MESSAGES.shayari;
      setMessages([defaultWelcome]);
      localStorage.removeItem(`aura_sanctuary_msgs_${persona}`);
      if (onUpdateSessionMessages) {
        onUpdateSessionMessages([defaultWelcome], recentMoments);
      }

      if (user && user.uid !== 'guest-user') {
        const ref = collection(db, 'users', user.uid, 'reflections');
        const snap = await getDocs(ref);
        const deletePromises: Promise<void>[] = [];
        snap.forEach((d) => {
          deletePromises.push(deleteDoc(doc(db, 'users', user.uid, 'reflections', d.id)));
        });
        await Promise.all(deletePromises);
      }

      setShowClearModal(false);
      setToastData({
        id: Date.now().toString(),
        type: 'success',
        title: 'Vault Purged',
        message: 'Conversation cleared & private vault purged (Right to be Forgotten).'
      });
    } catch (err) {
      console.warn('Error clearing reflections:', err);
      setShowClearModal(false);
      setToastData({
        id: Date.now().toString(),
        type: 'info',
        title: 'Local Reset',
        message: 'Conversation reset locally.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Export Journal
  const handleExportJournal = (format: 'md' | 'json') => {
    setShowToolsMenu(false);
    if (format === 'md') {
      exportAsMarkdown(messages, [], user);
      setToastData({
        id: Date.now().toString(),
        type: 'success',
        title: 'Export Downloaded',
        message: 'Exported reflections as Markdown (.md).'
      });
    } else {
      exportAsJson(messages, [], user);
      setToastData({
        id: Date.now().toString(),
        type: 'success',
        title: 'Export Downloaded',
        message: 'Exported reflections as JSON (.json).'
      });
    }
  };

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`aura_sanctuary_msgs_${persona}`, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages, persona]);

  // Load user's previous Firestore reflections if signed in
  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      try {
        const ref = collection(db, 'users', user.uid, 'reflections');
        const q = query(ref, orderBy('timestamp', 'asc'), limit(20));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const loaded: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              sender: data.sender || 'gemini',
              text: data.text || '',
              couplet: data.couplet,
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              personaId: data.personaId || persona,
              modelUsed: data.modelUsed
            });
          });
          if (loaded.length > 0) {
            setMessages(loaded);
          }
        }
      } catch (err) {
        console.warn('Could not load user reflections from Firestore:', err);
      }
    };
    fetchRecent();
  }, [user]);

  // Text-to-Speech Voice Output Controls (Play, Pause, Stop) with Calming Warm Cadence
  const handleStartSpeech = (msg: ChatMessage) => {
    if (!window.speechSynthesis) {
      setToastData({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Speech Synthesis Unavailable',
        message: 'Your browser does not support the Web Speech Synthesis API.'
      });
      return;
    }

    // If already playing this message, toggle pause
    if (speechState.msgId === msg.id && speechState.status === 'playing') {
      window.speechSynthesis.pause();
      setSpeechState({ msgId: msg.id, status: 'paused' });
      return;
    }

    // If paused on this message, resume
    if (speechState.msgId === msg.id && speechState.status === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState({ msgId: msg.id, status: 'playing' });
      return;
    }

    // Otherwise, start fresh recitation
    window.speechSynthesis.cancel();
    const readText = msg.couplet ? `${msg.text}. ... ${msg.couplet}` : msg.text;
    const utterance = new SpeechSynthesisUtterance(readText);

    // Calming warm cadence tuning
    utterance.rate = persona === 'zen' ? 0.84 : persona === 'shayari' ? 0.88 : 0.92;
    utterance.pitch = 0.98;

    // Pick a warm, natural English voice if available
    try {
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find((v) => 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Serena')) &&
        v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    } catch (e) {
      // voice selection fallback
    }

    utterance.onend = () => {
      setSpeechState({ msgId: null, status: 'idle' });
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setSpeechState({ msgId: null, status: 'idle' });
    };

    setSpeechState({ msgId: msg.id, status: 'playing' });
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setSpeechState((prev) => ({ ...prev, status: 'paused' }));
    }
  };

  const handleResumeSpeech = (msg: ChatMessage) => {
    if (window.speechSynthesis) {
      if (speechState.msgId === msg.id) {
        window.speechSynthesis.resume();
        setSpeechState({ msgId: msg.id, status: 'playing' });
      } else {
        handleStartSpeech(msg);
      }
    }
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeechState({ msgId: null, status: 'idle' });
    }
  };

  // Submit User Reflection
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || input;
    const cleanedText = sanitizeText(rawText);
    if (!cleanedText || isLoading) return;

    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanedText,
      timestamp: Date.now(),
      personaId: persona
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-8),
          persona,
          userStatus: user?.statusBadge || ''
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Reflection failed');
      }

      const data = await res.json();
      const replyText = data.reply || '';

      // Extract couplet if present in shayari reply
      let extractedCouplet: string | undefined = undefined;
      if (persona === 'shayari' && (replyText.includes('(') || replyText.includes('\n'))) {
        const coupletMatch = replyText.match(/["“]([^"”]+)["”]\s*\(?([^)]*)\)?/);
        if (coupletMatch) {
          extractedCouplet = `${coupletMatch[1]}\n${coupletMatch[2] ? `(${coupletMatch[2]})` : ''}`;
        }
      }

      const aiMsg: ChatMessage = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: replyText,
        couplet: extractedCouplet,
        timestamp: data.timestamp || Date.now(),
        personaId: persona,
        modelUsed: data.modelUsed
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      if (onUpdateSessionMessages) {
        onUpdateSessionMessages(finalMessages, recentMoments, cleanedText);
      }

      // Persist to Firestore if user is authenticated (using stripUndefined for safety)
      if (user) {
        try {
          const reflectionsCol = collection(db, 'users', user.uid, 'reflections');
          await addDoc(reflectionsCol, stripUndefined({
            sender: 'gemini',
            userPrompt: cleanedText,
            text: replyText,
            couplet: extractedCouplet || null,
            personaId: persona,
            modelUsed: data.modelUsed || 'gemini',
            timestamp: serverTimestamp()
          }));
        } catch (dbErr) {
          console.warn('Firestore write warning:', dbErr);
        }
      }
    } catch (err: any) {
      console.error('Reflection request error:', err);
      setErrorMessage(err?.message || 'Failed to connect to Aura companion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full min-h-0">
      {/* Main Conversation Canvas (Glassmorphic WhatsApp-style Card Container with expanded vertical canvas) */}
      <div 
        className="flex-1 flex flex-col rounded-[32px] border border-white/15 shadow-2xl overflow-hidden backdrop-blur-xl bg-black/25 transition-all duration-500 min-h-0"
      >
        {/* Sanctuary Header Sub-Bar */}
        <div className="px-5 py-3 backdrop-blur-md bg-white/5 border-b border-white/10 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse shrink-0" />
            <span className="font-semibold text-white shrink-0">{activePersonaConfig.name}</span>
            {activeSession ? (
              <>
                <span className="text-white/30 shrink-0">•</span>
                <span className="text-indigo-200/90 font-medium truncate max-w-[140px] sm:max-w-xs flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-300 shrink-0" />
                  <span className="truncate">{activeSession.title}</span>
                </span>
                {activeSession.moodBadge && (
                  <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10 font-medium shrink-0">
                    {activeSession.moodBadge}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-white/30">•</span>
                <span className="text-white/70 hidden sm:inline truncate">{activePersonaConfig.tagline}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end shrink-0">
            {/* Primary Action 1: Photo Moment */}
            <button
              id="add-photo-moment-header-btn"
              onClick={() => setShowAddMomentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/30 transition-all shadow-sm cursor-pointer"
              title="Upload photo moment analyzed by Gemini Vision"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[11px] font-medium hidden sm:inline">Photo Moment</span>
            </button>

            {/* Primary Action 2: On This Day */}
            <button
              id="sanctuary-on-this-day-btn"
              onClick={onOpenFlashback}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/30 transition-all shadow-sm cursor-pointer"
              title="View your growth perspective shift"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-medium hidden sm:inline">On This Day</span>
            </button>

            {/* Streamlined Tools Dropdown Menu (Active Shares, Export, Clear Chat) */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                id="sanctuary-tools-dropdown-btn"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer border ${
                  showToolsMenu
                    ? 'bg-white/20 text-white border-white/40 ring-1 ring-white/30'
                    : 'bg-white/10 hover:bg-white/15 text-white/90 border-white/20'
                }`}
                title="Workspace tools, shares, exports, and chat settings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-[11px] font-medium hidden sm:inline">Tools</span>
                <ChevronDown className={`w-3 h-3 text-white/60 transition-transform duration-200 ${showToolsMenu ? 'rotate-180' : ''}`} />
              </button>

              {showToolsMenu && (
                <div 
                  id="sanctuary-tools-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl backdrop-blur-2xl bg-neutral-950/95 border border-white/20 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40 border-b border-white/10 flex items-center justify-between">
                    <span>Workspace Tools</span>
                    <span className="text-emerald-400 font-medium">Private Vault</span>
                  </div>

                  {/* Active Shares & Revocation Drawer Toggle */}
                  <button
                    id="active-shares-drawer-toggle-btn"
                    onClick={() => {
                      setShowToolsMenu(false);
                      setShowActiveShares(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Active Shares</div>
                      <div className="text-[10px] text-white/50 truncate">Manage shared quote cards</div>
                    </div>
                  </button>

                  {/* Export as Markdown */}
                  <button
                    id="export-journal-markdown-btn"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleExportJournal('md');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Export Markdown (.md)</div>
                      <div className="text-[10px] text-white/50 truncate">Formatted journal document</div>
                    </div>
                  </button>

                  {/* Export as JSON */}
                  <button
                    id="export-journal-json-btn"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleExportJournal('json');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Export JSON Archive</div>
                      <div className="text-[10px] text-white/50 truncate">Full session backup</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  {/* Clear Chat & Purge Private Vault */}
                  <button
                    id="clear-conversation-btn"
                    onClick={() => {
                      setShowToolsMenu(false);
                      setShowClearModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs">Clear Chat</div>
                      <div className="text-[10px] text-rose-300/70 truncate">Purge conversation & vault</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prominent Frosted Date Banner at Top of Daily Reflection */}
        <div 
          id="daily-reflection-date-banner"
          className="px-4 py-2 backdrop-blur-xl bg-white/[0.04] border-b border-white/10 flex items-center justify-center text-center shadow-sm shrink-0"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-2xl bg-indigo-500/15 border border-indigo-400/30 shadow-[0_2px_12px_rgba(99,102,241,0.2)] text-xs font-medium text-white transition-all hover:bg-indigo-500/25">
            <span className="text-sm select-none">📅</span>
            <span className="font-semibold text-white tracking-wide">
              {formatFullDateSafe(activeSession?.createdAt || Date.now())}
            </span>
            <span className="text-indigo-300/60">•</span>
            <span className="text-indigo-200 font-medium">Daily Reflection</span>
          </div>
        </div>

        {/* Sleek Compact Sher of the Day Banner */}
        <div className="px-4 py-1.5 border-b border-white/5 bg-black/10 shrink-0">
          <DailyEpiphanyBanner
            userName={user?.displayName}
            onReflectOnEpiphany={(epiphanyPrompt) => handleSendMessage(epiphanyPrompt)}
          />
        </div>

        {/* Message Thread (Pure conversation viewport, takes full vertical height) */}
        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* Quick Carousel of Recent Polaroid Moments if any */}
          {recentMoments.length > 0 && (
            <div className="p-3.5 rounded-3xl bg-cyan-950/20 border border-cyan-400/20 backdrop-blur-md mb-2">
              <div className="flex items-center justify-between mb-2 px-1 text-xs">
                <span className="font-semibold text-cyan-200 flex items-center gap-1.5 font-['Playfair_Display']">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent Polaroid Moments ({recentMoments.length})</span>
                </span>
                <button
                  onClick={() => setShowAddMomentModal(true)}
                  className="text-[11px] text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1"
                >
                  + Add Moment
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {recentMoments.slice(0, 4).map((m) => (
                  <div key={m.id} className="w-48 sm:w-56 shrink-0">
                    <PolaroidCard
                      moment={m}
                      showDelete={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThisMsgActive = speechState.msgId === msg.id && speechState.status !== 'idle';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className="shrink-0 mt-1">
                  {isUser ? (
                    renderUserAvatar(user, 'w-7 h-7')
                  ) : (
                    <div className="w-7 h-7 rounded-full backdrop-blur-md bg-white/15 border border-white/20 flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`group relative rounded-2xl p-4 transition-all shadow-lg backdrop-blur-md ${
                    isUser
                      ? 'bg-indigo-600/35 border border-indigo-400/40 text-white rounded-tr-sm'
                      : 'bg-white/10 border border-white/20 text-indigo-100 rounded-tl-sm'
                  }`}
                >
                  {/* Sender Name & Model */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[11px] text-white/60">
                      <span className="font-semibold text-white">Aura</span>
                      {msg.modelUsed && (
                        <span className="font-mono text-[9px] text-white/50">{msg.modelUsed}</span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans']">
                    {msg.text}
                  </div>

                  {/* Poetry / Couplet Callout Card (For Shayari & Quotes) */}
                  {msg.couplet && (
                    <div className="mt-3 p-3.5 rounded-xl backdrop-blur-md bg-white/5 border border-white/15 font-['Playfair_Display'] italic text-amber-200 text-sm tracking-wide">
                      <div className="whitespace-pre-line leading-relaxed">{msg.couplet}</div>
                    </div>
                  )}

                  {/* Message Action Footer: Recite, Quote Card & Aesthetic Keepsake Export */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] text-white/60">
                    <span className="text-[10px] text-white/50 font-mono">
                      {formatTimeSafe(msg.timestamp)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Recitation (Read Aloud with Play, Pause & Stop controls) */}
                      {!isUser && (
                        isThisMsgActive ? (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-xl backdrop-blur-md bg-amber-400/20 border border-amber-400/40 text-amber-200 shadow-sm animate-in fade-in duration-150">
                            {/* Animated sound wave bars */}
                            <div className="flex items-end gap-0.5 h-3 mr-1">
                              <span
                                className={`w-0.5 bg-amber-300 rounded-full transition-all ${
                                  speechState.status === 'playing' ? 'animate-[bounce_0.8s_ease-in-out_infinite]' : 'h-1.5'
                                }`}
                                style={{ height: speechState.status === 'playing' ? '80%' : '30%' }}
                              />
                              <span
                                className={`w-0.5 bg-amber-400 rounded-full transition-all ${
                                  speechState.status === 'playing' ? 'animate-[bounce_0.6s_ease-in-out_infinite_0.15s]' : 'h-2.5'
                                }`}
                                style={{ height: speechState.status === 'playing' ? '100%' : '50%' }}
                              />
                              <span
                                className={`w-0.5 bg-amber-300 rounded-full transition-all ${
                                  speechState.status === 'playing' ? 'animate-[bounce_0.75s_ease-in-out_infinite_0.3s]' : 'h-1.5'
                                }`}
                                style={{ height: speechState.status === 'playing' ? '60%' : '30%' }}
                              />
                            </div>

                            {/* Play / Pause Toggle */}
                            {speechState.status === 'playing' ? (
                              <button
                                id={`audio-pause-btn-${msg.id}`}
                                onClick={handlePauseSpeech}
                                className="p-1 rounded-lg hover:bg-amber-400/30 text-amber-200 transition-colors cursor-pointer"
                                title="Pause reading"
                              >
                                <Pause className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                id={`audio-resume-btn-${msg.id}`}
                                onClick={() => handleResumeSpeech(msg)}
                                className="p-1 rounded-lg hover:bg-amber-400/30 text-amber-200 transition-colors cursor-pointer"
                                title="Resume reading"
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            )}

                            {/* Stop Button */}
                            <button
                              id={`audio-stop-btn-${msg.id}`}
                              onClick={handleStopSpeech}
                              className="p-1 rounded-lg hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                              title="Stop reading"
                            >
                              <Square className="w-2.5 h-2.5 fill-current" />
                            </button>

                            <span className="text-[10px] font-mono text-amber-200/90 font-medium">
                              {speechState.status === 'playing' ? 'Reading' : 'Paused'}
                            </span>
                          </div>
                        ) : (
                          <button
                            id={`audio-listen-btn-${msg.id}`}
                            onClick={() => handleStartSpeech(msg)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-white/5 hover:bg-white/15 text-white/75 hover:text-white border border-white/10 transition-colors cursor-pointer group"
                            title="Listen / Read Aloud with warm cadence"
                          >
                            <Volume2 className="w-3 h-3 text-amber-300 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium">Listen</span>
                          </button>
                        )
                      )}

                      {/* Aesthetic Keepsake Card / PDF Export */}
                      {!isUser && (
                        <button
                          id={`keepsake-card-btn-${msg.id}`}
                          onClick={() => setSelectedKeepsakeMessage(msg)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-200 border border-amber-400/30 transition-colors"
                          title="Generate printable aesthetic keepsake card / PDF"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span className="text-[10px]">Keepsake</span>
                        </button>
                      )}

                      {/* Selective Privacy Share Button */}
                      <button
                        id={`share-snippet-btn-${msg.id}`}
                        onClick={() => onOpenSnippetShare(msg.couplet || msg.text, msg.couplet, activePersonaConfig.badge)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-colors"
                        title="Generate shareable quote card"
                      >
                        <Share2 className="w-3 h-3" />
                        <span className="text-[10px]">Quote Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full backdrop-blur-md bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-2xl rounded-tl-sm p-3.5 border border-white/20 flex items-center gap-2 shadow-lg">
                <span className="text-xs text-white/80 font-medium">{activePersonaConfig.name} is reflecting</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {/* Error Toast Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl backdrop-blur-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shrink-0 shadow-sm transition-all"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 backdrop-blur-md bg-white/5 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-mono tracking-wider text-white/50 shrink-0">
            Prompts:
          </span>
          {(SUGGESTED_PROMPTS[persona] || SUGGESTED_PROMPTS.shayari).map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs whitespace-nowrap px-3.5 py-1 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 transition-all shrink-0 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 backdrop-blur-xl bg-black/30 border-t border-white/10">
          {/* Live Voice Dictation Pulse Wave Animation */}
          {isDictating && (
            <div className="mb-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
                <span className="text-xs font-semibold text-white">Voice Dictation Active</span>
                <span className="text-[11px] text-rose-300/80 font-mono hidden sm:inline">Transcribing your speech in real-time...</span>
              </div>

              {/* Sound wave oscillator bars */}
              <div className="flex items-end gap-1 h-5 px-2">
                <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '45%' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" style={{ height: '95%' }} />
                <span className="w-1 bg-rose-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s]" style={{ height: '70%' }} />
                <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.15s]" style={{ height: '100%' }} />
                <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.65s_ease-in-out_infinite_0.05s]" style={{ height: '55%' }} />
                <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.45s_ease-in-out_infinite_0.25s]" style={{ height: '85%' }} />
              </div>

              <button
                type="button"
                onClick={toggleDictation}
                className="px-2.5 py-1 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 text-rose-100 text-xs font-medium transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-2 focus-within:border-indigo-400/70 focus-within:ring-1 focus-within:ring-indigo-400/40 transition-all shadow-lg"
          >
            <textarea
              id="reflection-input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={
                isDictating 
                  ? 'Listening to your voice... (say your reflection)' 
                  : `Reflect with ${activePersonaConfig.name}... (Enter to send, Shift+Enter for newline)`
              }
              className={`w-full bg-transparent text-white placeholder:text-white/40 text-sm resize-none focus:outline-none px-2 py-1 leading-relaxed max-h-32 min-h-[38px] ${
                isDictating ? 'placeholder:text-amber-300 animate-pulse' : ''
              }`}
            />

            <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">
              {/* Quick Upload Photo Moment in Input Bar */}
              <button
                type="button"
                id="add-photo-moment-input-btn"
                onClick={() => setShowAddMomentModal(true)}
                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white/15 text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
                title="Add Photo Moment (Gemini Vision)"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Voice Dictation (Speech-to-Text) Button */}
              <button
                type="button"
                id="voice-dictation-btn"
                onClick={toggleDictation}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isDictating
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)] ring-2 ring-rose-500/40'
                    : 'hover:bg-white/15 text-white/70 hover:text-white'
                }`}
                title={isDictating ? 'Stop listening' : 'Dictate reflection with voice'}
              >
                {isDictating ? (
                  <div className="flex items-center gap-1">
                    <MicOff className="w-4 h-4" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Submit Reflection Button */}
              <button
                type="submit"
                id="submit-reflection-btn"
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/5 disabled:text-white/20 text-white font-medium transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)] active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
                title="Send reflection"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Privacy Footnote */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50 px-1">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-white/60" />
              Isolated in your private vault. Strictly zero journal text sent to telemetry sinks.
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-white/60">
              {user ? `Authenticated as ${user.displayName || 'User'}` : 'Guest Preview'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Frosted Glass Toast Notification */}
      <Toast toast={toastData} onClose={() => setToastData(null)} />

      {/* Clear Conversation Confirmation Modal (Right to be Forgotten) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-2xl bg-black/85 rounded-3xl border border-rose-500/30 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-300">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white">Clear Conversation & Purge Chat?</h3>
                <p className="text-xs text-rose-200/70 font-mono">Right to be Forgotten Guarantee</p>
              </div>
            </div>

            <p className="text-xs text-white/75 leading-relaxed">
              This will permanently delete all conversational reflection logs from this session and purge them from your private Firestore vault. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-clear-conversation-btn"
                disabled={isClearing}
                onClick={handleClearConversation}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Purging Vault...' : 'Yes, Delete Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Shares & Revocation Drawer Modal */}
      {showActiveShares && (
        <ActiveSharesModal
          user={user}
          onClose={() => setShowActiveShares(false)}
          onViewSnippet={(snipId) => {
            setShowActiveShares(false);
            window.location.search = `?snippet=${snipId}`;
          }}
        />
      )}

      {/* Multimodal Add Polaroid Moment Modal */}
      {showAddMomentModal && (
        <AddMomentModal
          isOpen={showAddMomentModal}
          onClose={() => setShowAddMomentModal(false)}
          userId={user?.uid}
          onMomentSaved={handleMomentSaved}
        />
      )}

      {/* Aesthetic Keepsake Card & PDF Export Modal */}
      {selectedKeepsakeMessage && (
        <KeepsakeCardModal
          isOpen={!!selectedKeepsakeMessage}
          onClose={() => setSelectedKeepsakeMessage(null)}
          message={selectedKeepsakeMessage}
          userName={user?.displayName}
        />
      )}
    </div>
  );
};
