import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  UserPlus, 
  LogOut, 
  MessageSquare, 
  ShieldCheck, 
  Bot,
  Feather,
  Zap,
  Radio
} from 'lucide-react';
import { DuoRoom, ChatMessage, UserProfile, PersonaId } from '../types';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  orderBy 
} from '../lib/firebase';
import { stripUndefined, sanitizeText, formatTimeSafe } from '../lib/sanitize';
import { PERSONAS } from '../lib/personas';

interface DuoCompanionRoomProps {
  user: UserProfile | null;
  onSignIn: () => void;
}

export const DuoCompanionRoom: React.FC<DuoCompanionRoomProps> = ({ user, onSignIn }) => {
  const [currentRoom, setCurrentRoom] = useState<DuoRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('hackathon');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  // Listen to messages in active room
  useEffect(() => {
    if (!currentRoom) return;

    const messagesCol = collection(db, 'duo_rooms', currentRoom.id, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loaded.push({
          id: doc.id,
          sender: data.sender || 'user',
          senderName: data.senderName,
          senderPhoto: data.senderPhoto,
          text: data.text || '',
          timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
          modelUsed: data.modelUsed
        });
      });

      if (loaded.length > 0) {
        setMessages(loaded);
      }
    }, (err) => {
      console.warn('Firestore Duo Room snapshot error:', err);
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  // Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    setErrorStatus(null);

    const roomCode = `AUR-${Math.floor(100 + Math.random() * 900)}`;
    const roomId = `room-${Date.now()}`;
    const title = newRoomTitle.trim() || 'Collaborative Sprint & Reflection';

    const roomData: DuoRoom = {
      id: roomId,
      roomCode,
      title,
      creatorUid: user.uid,
      creatorName: user.displayName || 'Teammate A',
      participantUids: [user.uid],
      participantNames: { [user.uid]: user.displayName || 'Teammate A' },
      participantPhotos: { [user.uid]: user.photoURL || '' },
      createdAt: Date.now(),
      lastActive: Date.now(),
      activePersona: selectedPersona
    };

    try {
      await setDoc(doc(db, 'duo_rooms', roomId), stripUndefined({
        id: roomId,
        roomCode,
        title,
        creatorUid: user.uid,
        creatorName: user.displayName || 'Teammate A',
        participantUids: [user.uid],
        participantNames: { [user.uid]: user.displayName || 'Teammate A' },
        participantPhotos: { [user.uid]: user.photoURL || '' },
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        activePersona: selectedPersona
      }));

      // Initial welcome message from Aura
      const welcomeMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: 'gemini',
        senderName: 'Aura Companion',
        text: `Welcome to the "${title}" collaborative space! Share your thoughts, debates, or bottlenecks. I will help both teammates synthesize clarity and maintain momentum.`,
        timestamp: Date.now(),
        modelUsed: 'gemini-2.5-flash'
      };

      await addDoc(collection(db, 'duo_rooms', roomId, 'messages'), stripUndefined({
        sender: 'gemini',
        senderName: 'Aura Companion',
        text: welcomeMsg.text,
        timestamp: serverTimestamp(),
        modelUsed: 'gemini-2.5-flash'
      }));

      setCurrentRoom(roomData);
      setMessages([welcomeMsg]);
    } catch (err: any) {
      console.error('Error creating duo room:', err);
      // Fallback local room for preview testing
      setCurrentRoom(roomData);
      setMessages([{
        id: `sys-${Date.now()}`,
        sender: 'gemini',
        senderName: 'Aura Companion',
        text: `Welcome to the "${title}" collaborative space! (Local session ready)`,
        timestamp: Date.now()
      }]);
    }
  };

  // Join Room by Code
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onSignIn();
      return;
    }
    setErrorStatus(null);
    const targetCode = joinCodeInput.trim().toUpperCase();
    if (!targetCode) return;

    try {
      const q = query(collection(db, 'duo_rooms'), where('roomCode', '==', targetCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        setErrorStatus(`Room code "${targetCode}" not found. Please verify with your teammate.`);
        return;
      }

      const roomDoc = snap.docs[0];
      const roomData = roomDoc.data() as DuoRoom;

      // Enforce Squad / Circle Room 5-member capacity limit
      if (roomData.participantUids && roomData.participantUids.length >= 5 && !roomData.participantUids.includes(user.uid)) {
        setErrorStatus(`Squad Room "${targetCode}" is full (maximum 5 teammates).`);
        return;
      }

      // Add user to participants if not already
      const updatedUids = Array.from(new Set([...(roomData.participantUids || []), user.uid]));
      const updatedNames = { ...(roomData.participantNames || {}), [user.uid]: user.displayName || 'Teammate' };
      const updatedPhotos = { ...(roomData.participantPhotos || {}), [user.uid]: user.photoURL || '' };

      await updateDoc(doc(db, 'duo_rooms', roomDoc.id), stripUndefined({
        participantUids: updatedUids,
        participantNames: updatedNames,
        participantPhotos: updatedPhotos,
        lastActive: serverTimestamp()
      }));

      // Announce join
      await addDoc(collection(db, 'duo_rooms', roomDoc.id, 'messages'), stripUndefined({
        sender: 'system',
        senderName: 'System',
        text: `${user.displayName || 'A new teammate'} joined the squad room (${updatedUids.length}/5 members).`,
        timestamp: serverTimestamp()
      }));

      setCurrentRoom({
        ...roomData,
        id: roomDoc.id,
        participantUids: updatedUids,
        participantNames: updatedNames,
        participantPhotos: updatedPhotos
      });
    } catch (err: any) {
      console.warn('Error joining room:', err);
      setErrorStatus(err?.message || 'Failed to join room.');
    }
  };

  // Send Message in Duo Room
  const handleSendMessage = async () => {
    if (!input.trim() || !currentRoom) return;

    const text = sanitizeText(input);
    setInput('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: user?.displayName || 'Teammate',
      senderPhoto: user?.photoURL || undefined,
      text,
      timestamp: Date.now()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);

    // Save to Firestore
    try {
      await addDoc(collection(db, 'duo_rooms', currentRoom.id, 'messages'), stripUndefined({
        sender: 'user',
        senderName: user?.displayName || 'Teammate',
        senderPhoto: user?.photoURL || null,
        text,
        timestamp: serverTimestamp()
      }));
    } catch (e) {
      console.warn('Local fallback message write:', e);
    }

    // If message includes @aura or triggers AI companion
    const shouldTriggerAi = text.toLowerCase().includes('@aura') || text.toLowerCase().includes('aura') || messages.length % 4 === 0;
    if (shouldTriggerAi) {
      triggerAiCompanion(updated);
    }
  };

  // Trigger Gemini to reflect on the joint conversation
  const triggerAiCompanion = async (currentMessages = messages) => {
    if (!currentRoom || isLoadingAi) return;
    setIsLoadingAi(true);

    try {
      const res = await fetch('/api/duo/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTitle: currentRoom.title,
          messages: currentMessages.slice(-10),
          activePersona: currentRoom.activePersona || 'hackathon'
        })
      });

      if (!res.ok) throw new Error('Duo reflection failed');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'gemini',
        senderName: 'Aura Companion',
        text: data.reply || 'Let us keep building with focus.',
        timestamp: data.timestamp || Date.now(),
        modelUsed: data.modelUsed
      };

      setMessages((prev) => [...prev, aiMsg]);

      await addDoc(collection(db, 'duo_rooms', currentRoom.id, 'messages'), stripUndefined({
        sender: 'gemini',
        senderName: 'Aura Companion',
        text: aiMsg.text,
        timestamp: serverTimestamp(),
        modelUsed: data.modelUsed || 'gemini'
      }));
    } catch (err) {
      console.error('Duo AI response error:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const copyRoomCode = async () => {
    if (!currentRoom) return;
    await navigator.clipboard.writeText(currentRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // If not currently in a room, display the Lobby
  if (!currentRoom) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-3xl backdrop-blur-xl bg-emerald-950/25 border border-emerald-400/30 shadow-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-1.5">
            <Users className="w-4 h-4" />
            <span>Collaborative Squad & Circle Space (Up to 5 Teammates)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Playfair_Display']">
            Squad / Circle Room
          </h2>
          <p className="text-sm text-emerald-100/80 mt-1.5 max-w-2xl leading-relaxed">
            Reflect, brainstorm, and debug with your hackathon pod, sprint team, or study circle (up to 5 members). Gemini joins the room as an active mediator to synthesize consensus, overcome blockers, and keep team momentum high.
          </p>
        </div>

        {errorStatus && (
          <div className="p-4 rounded-2xl backdrop-blur-md bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs shadow-md flex items-center justify-between">
            <span>{errorStatus}</span>
            <button onClick={() => setErrorStatus(null)} className="text-white/60 hover:text-white ml-2 text-xs">Dismiss</button>
          </div>
        )}

        {/* Lobby Actions: Create or Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>Create Squad Room (Up to 5 Members)</span>
            </h3>
            <p className="text-xs text-white/60">
              Instantly generate an invite code for your hackathon pod, co-builders, or circle of friends.
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/80 font-medium mb-1.5">Squad Room Title</label>
                <input
                  type="text"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="e.g. Hackathon AI Pod / Architecture Sprint"
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-black/30 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-white/80 font-medium mb-1.5">Squad AI Companion Persona</label>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value as PersonaId)}
                  className="w-full p-3 rounded-2xl backdrop-blur-md bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-emerald-400/50"
                >
                  <option value="hackathon">⚡ Hackathon Coach / Tough Love (Sprint Focus)</option>
                  <option value="zen">🧘 Mindful Zen Sanctuary (Calm & Focus)</option>
                  <option value="shayari">📜 Shayari & Poetic Soul (Creative Harmony)</option>
                  <option value="journal">🎙️ Structured Journal & Debrief (Clear Action Items)</option>
                </select>
              </div>

              <button
                type="submit"
                id="create-squad-room-btn"
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold shadow-[0_0_15px_rgba(52,211,153,0.35)] active:scale-95 transition-all"
              >
                Create Squad Room
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="p-6 sm:p-7 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
                <UserPlus className="w-4 h-4 text-teal-300" />
                <span>Join Squad with Invite Code</span>
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Enter the room code shared by your teammate (rooms support up to 5 teammates).
              </p>

              <form onSubmit={handleJoinRoom} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/80 font-medium mb-1.5">Squad Invite Code</label>
                  <input
                    type="text"
                    required
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AUR-742"
                    className="w-full p-3 rounded-2xl backdrop-blur-md bg-black/30 border border-white/10 text-white font-mono tracking-widest uppercase focus:outline-none focus:border-teal-400/50 text-center text-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="join-squad-room-btn"
                  className="w-full py-3 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 active:scale-95 transition-all"
                >
                  Join Teammates' Squad
                </button>
              </form>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-[11px] text-white/50 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Squad rooms enforce member isolation: only the up to 5 verified participant UIDs can read or post.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Squad Room View
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-5.5rem)] pb-3 animate-in fade-in duration-200">
      {/* Room Header */}
      <div className="px-5 py-3.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30">
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base text-white">{currentRoom.title}</h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full backdrop-blur-md bg-white/10 text-white/80 border border-white/20">
                {PERSONAS[currentRoom.activePersona]?.badge || '⚡ Squad Room'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {currentRoom.participantUids?.length || 1}/5 Members
              </span>
            </div>
            {/* Teammate Pills */}
            <div className="flex items-center gap-2 text-[11px] text-white/60 mt-1 flex-wrap">
              <span>Code: <strong className="font-mono text-emerald-300">{currentRoom.roomCode}</strong></span>
              <span>•</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(currentRoom.participantUids || []).map((uid) => {
                  const name = currentRoom.participantNames?.[uid] || 'Teammate';
                  const isUser = user?.uid === uid;
                  return (
                    <span
                      key={uid}
                      className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                        isUser 
                          ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-200 font-medium'
                          : 'bg-white/10 border-white/15 text-white/70'
                      }`}
                    >
                      {name} {isUser && '(You)'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Code */}
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 transition-all shadow-sm"
            title="Copy room code"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedCode ? 'Copied' : 'Invite Code'}</span>
          </button>

          {/* Trigger Aura */}
          <button
            onClick={() => triggerAiCompanion()}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-xs text-neutral-950 font-semibold transition-all shadow-sm"
            title="Ask Aura to synthesize conversation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Aura</span>
          </button>

          {/* Leave Room */}
          <button
            onClick={() => setCurrentRoom(null)}
            className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-rose-300 transition-colors"
            title="Leave Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 backdrop-blur-xl bg-black/30 border border-white/15 rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-2xl flex flex-col">
        {messages.map((msg) => {
          const isMe = msg.sender === 'user' && msg.senderName === (user?.displayName || 'Teammate');
          const isAi = msg.sender === 'gemini';
          const isSys = msg.sender === 'system';

          if (isSys) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="text-[11px] font-mono text-white/60 px-3.5 py-1 rounded-full backdrop-blur-md bg-white/10 border border-white/15">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${
                isMe ? 'ml-auto flex-row-reverse' : isAi ? 'mr-auto' : 'mr-auto'
              }`}
            >
              <div className="shrink-0 mt-1">
                {isAi ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-300" />
                  </div>
                ) : msg.senderPhoto ? (
                  <img
                    src={msg.senderPhoto}
                    alt={msg.senderName}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {msg.senderName ? msg.senderName[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              <div
                className={`rounded-2xl p-4 shadow-md backdrop-blur-md ${
                  isMe
                    ? 'bg-emerald-600/80 text-white rounded-tr-sm border border-emerald-400/30'
                    : isAi
                    ? 'bg-white/10 text-white rounded-tl-sm border border-emerald-400/30'
                    : 'bg-white/5 text-white/90 rounded-tl-sm border border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-80 pb-1 border-b border-white/10">
                  <span className="font-semibold">{msg.senderName || (isAi ? 'Aura Companion' : 'Teammate')}</span>
                  <span className="text-[10px] font-mono">
                    {formatTimeSafe(msg.timestamp)}
                  </span>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-wrap font-['Plus_Jakarta_Sans']">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoadingAi && (
          <div className="flex gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/10 text-xs text-white/75 border border-white/15 flex items-center gap-2">
              <span>Aura is analyzing the collaborative discussion...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 p-2.5 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or debate topic (mention @Aura to prompt companion)..."
            className="flex-1 bg-black/25 border border-white/10 text-white placeholder:text-white/40 text-xs sm:text-sm rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-400/50"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-neutral-950 font-medium transition-all shadow-[0_0_12px_rgba(52,211,153,0.3)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
