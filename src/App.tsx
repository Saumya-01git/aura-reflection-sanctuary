/**
 * Aura - Personal Reflection Sanctuary & Collaborative AI Companion
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PersonaId, 
  WallpaperId, 
  UserProfile,
  JournalSession,
  ChatMessage,
  PolaroidMoment
} from './types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  firebaseSignOut, 
  onAuthStateChanged,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from './lib/firebase';
import { stripUndefined } from './lib/sanitize';
import { 
  loadJournalSessions, 
  saveJournalSession, 
  createNewJournalSession 
} from './lib/journalStorage';
import { AmbientBackground } from './components/AmbientBackground';
import { Navbar } from './components/Navbar';
import { PersonalSanctuary } from './components/PersonalSanctuary';
import { PerspectiveFlashback } from './components/PerspectiveFlashback';
import { DuoCompanionRoom } from './components/DuoCompanionRoom';
import { TimeCapsuleModal } from './components/TimeCapsuleModal';
import { AdminTelemetryModal } from './components/AdminTelemetryModal';
import { SnippetShareModal } from './components/SnippetShareModal';
import { PublicSnippetView } from './components/PublicSnippetView';
import { LandingHero } from './components/LandingHero';
import { Sidebar, MobileBottomNav } from './components/Sidebar';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<PersonaId>('shayari');
  const [wallpaper, setWallpaper] = useState<WallpaperId>('lofi_rain');
  const [activeTab, setActiveTab] = useState<'sanctuary' | 'flashback' | 'duo' | 'timecapsule' | 'telemetry'>('sanctuary');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('aura_guest_mode') !== 'false';
  });

  // Public snippet query param check
  const [publicSnippetId, setPublicSnippetId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('snippet');
    }
    return null;
  });

  // Snippet Share Modal state
  const [snippetModal, setSnippetModal] = useState<{
    isOpen: boolean;
    text: string;
    couplet?: string;
    personaTitle?: string;
  }>({
    isOpen: false,
    text: '',
    couplet: undefined,
    personaTitle: undefined
  });

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsGuestMode(false);
        localStorage.removeItem('aura_guest_mode');

        // Fetch or create user document in Firestore (/users/{userId})
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Seeker',
              photoURL: firebaseUser.photoURL,
              statusBadge: data.statusBadge || '🌌 Deep in contemplation',
              preferredPersona: data.preferredPersona || 'shayari',
              preferredWallpaper: data.preferredWallpaper || 'lofi_rain',
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
            };
            setUser(profile);
            if (data.preferredPersona) setPersona(data.preferredPersona);
            if (data.preferredWallpaper) setWallpaper(data.preferredWallpaper);
          } else {
            // New user setup
            const initialProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Seeker',
              photoURL: firebaseUser.photoURL,
              statusBadge: '🌌 Deep in contemplation',
              preferredPersona: 'shayari',
              preferredWallpaper: 'lofi_rain',
              createdAt: Date.now()
            };

            await setDoc(userDocRef, stripUndefined({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Seeker',
              photoURL: firebaseUser.photoURL,
              statusBadge: '🌌 Deep in contemplation',
              preferredPersona: 'shayari',
              preferredWallpaper: 'lofi_rain',
              createdAt: serverTimestamp()
            }));

            setUser(initialProfile);
          }
        } catch (err) {
          console.warn('Firestore user profile sync error:', err);
          // Fallback in-memory profile
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Seeker',
            photoURL: firebaseUser.photoURL,
            statusBadge: '🌌 Deep in contemplation',
            createdAt: Date.now()
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.warn('Google Sign-In Popup error:', error);
      // If popup was blocked or denied, enable guest mode seamlessly
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        enableGuest();
      }
    }
  };

  // Guest Sanctuary Mode
  const enableGuest = () => {
    setIsGuestMode(true);
    localStorage.setItem('aura_guest_mode', 'true');
    setUser({
      uid: 'guest-user',
      email: null,
      displayName: 'Guest Seeker',
      photoURL: null,
      statusBadge: '🧘 Seeking grounded clarity',
      createdAt: Date.now()
    });
  };

  // Journal Sessions Engine (History & Archive)
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load journal sessions from local cache and Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchSessions = async () => {
      try {
        const loaded = await loadJournalSessions(user?.uid);
        if (isMounted) {
          setSessions(loaded);
          if (loaded.length > 0 && !activeSessionId) {
            setActiveSessionId(loaded[0].id);
            if (loaded[0].personaId) {
              setPersona(loaded[0].personaId);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load journal sessions:', err);
      }
    };

    fetchSessions();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  // Start fresh reflection session
  const handleNewReflection = () => {
    const newSession = createNewJournalSession(persona, user?.uid);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveTab('sanctuary');
    saveJournalSession(newSession, user?.uid);
  };

  // Select historical reflection
  const handleSelectSession = (session: JournalSession) => {
    setActiveSessionId(session.id);
    if (session.personaId) {
      setPersona(session.personaId);
    }
    setActiveTab('sanctuary');
  };

  // Sync conversation / moments back to the active session
  const handleUpdateSessionMessages = (
    updatedMessages: ChatMessage[],
    updatedMoments?: PolaroidMoment[],
    firstUserPrompt?: string
  ) => {
    if (!activeSessionId) return;

    setSessions((prev) => {
      return prev.map((s) => {
        if (s.id !== activeSessionId) return s;

        let newTitle = s.title;
        // If prompt is entered, we can enrich title e.g. "Daily Reflection • Sep 4: Topic" or preserve date
        if (firstUserPrompt && (s.title.startsWith("Today's Reflection") || s.title.startsWith("Fresh Reflection"))) {
          const trimmed = firstUserPrompt.trim();
          newTitle = trimmed.length > 40 ? `${trimmed.slice(0, 37)}...` : trimmed;
        }

        const lastMsg = updatedMessages[updatedMessages.length - 1];
        const newPreview = lastMsg ? (lastMsg.text || '').slice(0, 90) : s.preview;

        const updatedSession: JournalSession = {
          ...s,
          title: newTitle,
          preview: newPreview,
          messages: updatedMessages,
          moments: updatedMoments || s.moments || [],
          updatedAt: Date.now()
        };

        saveJournalSession(updatedSession, user?.uid);
        return updatedSession;
      });
    });
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setIsGuestMode(false);
      localStorage.removeItem('aura_guest_mode');
      setUser(null);
    } catch (e) {
      setUser(null);
      setIsGuestMode(false);
    }
  };

  // Update Status Badge
  const handleUpdateStatusBadge = async (badge: string) => {
    if (!user) return;
    const updated = { ...user, statusBadge: badge };
    setUser(updated);

    if (user.uid !== 'guest-user') {
      try {
        await updateDoc(doc(db, 'users', user.uid), { statusBadge: badge });
      } catch (err) {
        console.warn('Could not update status badge in Firestore:', err);
      }
    }
  };

  // Update Preferred Wallpaper
  const handleSetWallpaper = async (w: WallpaperId) => {
    setWallpaper(w);
    if (user && user.uid !== 'guest-user') {
      try {
        await updateDoc(doc(db, 'users', user.uid), { preferredWallpaper: w });
      } catch (e) {}
    }
  };

  // Update Preferred Persona
  const handleSetPersona = async (p: PersonaId) => {
    setPersona(p);
    if (user && user.uid !== 'guest-user') {
      try {
        await updateDoc(doc(db, 'users', user.uid), { preferredPersona: p });
      } catch (e) {}
    }
  };

  // Open Snippet Share Modal
  const handleOpenSnippetShare = (text: string, couplet?: string, personaTitle?: string) => {
    setSnippetModal({
      isOpen: true,
      text,
      couplet,
      personaTitle
    });
  };

  // If visiting an isolated public snippet URL (?snippet=...)
  if (publicSnippetId) {
    return (
      <div className="min-h-screen text-neutral-100 relative">
        <AmbientBackground wallpaper={wallpaper} />
        <PublicSnippetView
          snippetId={publicSnippetId}
          onEnterSanctuary={() => {
            setPublicSnippetId(null);
            window.history.replaceState({}, '', window.location.pathname);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-neutral-100 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Dynamic Ambient Background Mesh */}
      <AmbientBackground wallpaper={wallpaper} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        persona={persona}
        setPersona={handleSetPersona}
        wallpaper={wallpaper}
        setWallpaper={handleSetWallpaper}
        user={user}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onUpdateStatusBadge={handleUpdateStatusBadge}
        onUpdateUser={(updated) => setUser((prev) => prev ? { ...prev, ...updated } : null)}
      />

      {/* Main Sanctuary Body with Frosted Glass Left Sidebar */}
      <div className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 flex flex-col ${
        activeTab === 'sanctuary' ? 'py-3 h-[calc(100vh-4.25rem)] overflow-hidden' : 'py-3 sm:py-4 pb-24 md:pb-4'
      }`}>
        {!user && !isGuestMode ? (
          <LandingHero
            onSignIn={handleGoogleSignIn}
            onEnterGuest={enableGuest}
            currentPersona={persona}
            setPersona={handleSetPersona}
            wallpaper={wallpaper}
            setWallpaper={handleSetWallpaper}
          />
        ) : (
          <div className={`flex-1 flex gap-4 lg:gap-5 w-full items-stretch min-h-0 ${activeTab === 'sanctuary' ? 'h-full overflow-hidden' : ''}`}>
            {/* Elegant Left Sidebar Navigation & Journal Archive */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              persona={persona}
              user={user}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onNewReflection={handleNewReflection}
              onSelectSession={handleSelectSession}
            />

            {/* Main Content Pane */}
            <main className="flex-1 min-w-0 flex flex-col w-full h-full min-h-0">
              {activeTab === 'sanctuary' && (
                <PersonalSanctuary
                  persona={persona}
                  setPersona={handleSetPersona}
                  wallpaper={wallpaper}
                  user={user}
                  activeSession={activeSession}
                  onUpdateSessionMessages={handleUpdateSessionMessages}
                  onOpenSnippetShare={handleOpenSnippetShare}
                  onOpenFlashback={() => setActiveTab('flashback')}
                />
              )}

              {activeTab === 'flashback' && (
                <PerspectiveFlashback
                  user={user}
                  onJumpToChatWithPrompt={(_prompt) => {
                    setActiveTab('sanctuary');
                  }}
                />
              )}

              {activeTab === 'duo' && (
                <DuoCompanionRoom
                  user={user}
                  onSignIn={handleGoogleSignIn}
                />
              )}

              {activeTab === 'timecapsule' && (
                <TimeCapsuleModal
                  user={user}
                  onSignIn={handleGoogleSignIn}
                />
              )}

              {activeTab === 'telemetry' && (
                <AdminTelemetryModal
                  user={user}
                />
              )}
            </main>

            {/* Mobile Bottom Floating Navigation Bar */}
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </div>

      {/* Selective Privacy Snippet Share Modal */}
      {snippetModal.isOpen && (
        <SnippetShareModal
          initialText={snippetModal.text}
          initialCouplet={snippetModal.couplet}
          personaTitle={snippetModal.personaTitle}
          user={user}
          onClose={() => setSnippetModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
