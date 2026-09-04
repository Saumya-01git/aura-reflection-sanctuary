import { JournalSession, PersonaId, ChatMessage } from '../types';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { stripUndefined, sanitizeText } from './sanitize';

export const DEFAULT_JOURNAL_SESSIONS: JournalSession[] = [
  {
    id: 'session-today-sih',
    userId: 'default',
    dateKey: '2026-09-04',
    createdAt: new Date('2026-09-04T06:30:00').getTime(),
    updatedAt: new Date('2026-09-04T06:45:00').getTime(),
    title: 'Daily Reflection • Sep 4, 2026',
    preview: 'caravan of thoughts... time is a river that refuses to be dammed',
    personaId: 'shayari',
    moodBadge: '💡 Clarified',
    tags: ['sih', 'hackathon', 'career', 'resilience'],
    messages: [
      {
        id: 'msg-sih-1',
        sender: 'user',
        text: "I'm feeling anxious about making an uncertain career leap. We are preparing for the SIH hackathon sprint, but what if our team's architecture falls short?",
        timestamp: new Date('2026-09-04T06:30:00').getTime(),
        personaId: 'shayari'
      },
      {
        id: 'msg-sih-2',
        sender: 'gemini',
        text: 'Stay grounded in this stillness—it is where your truest wisdom resides. Uncertainty is not a verdict of inadequacy; it is the raw canvas from which technical mastery is forged.',
        couplet: 'caravan of thoughts\n(that defined who we were in a specific chapter. But time is a river that refuses to be dammed. By acknowledging that those specific states of "visaal" (union))',
        timestamp: new Date('2026-09-04T06:31:00').getTime(),
        personaId: 'shayari',
        modelUsed: 'gemini-3.6-flash'
      }
    ],
    moments: []
  },
  {
    id: 'session-yesterday-arch',
    userId: 'default',
    dateKey: '2026-09-03',
    createdAt: new Date('2026-09-03T21:15:00').getTime(),
    updatedAt: new Date('2026-09-03T21:40:00').getTime(),
    title: 'Late-Night Architecture & Career Leap',
    preview: 'Deconstructed the fear into a 3-step technical roadmap.',
    personaId: 'hackathon',
    moodBadge: '🔥 High Energy',
    tags: ['career', 'architecture', 'sih', 'cloud'],
    messages: [
      {
        id: 'msg-arch-1',
        sender: 'user',
        text: 'Breaking down our distributed event mesh before midnight. Need a tactical stress test on our error recovery.',
        timestamp: new Date('2026-09-03T21:15:00').getTime(),
        personaId: 'hackathon'
      },
      {
        id: 'msg-arch-2',
        sender: 'gemini',
        text: 'Focus on boundary isolation first. Build stateless services and let cache layers absorb spike volatility. You have prepared for this scale—ship the MVP and iterate with data.',
        timestamp: new Date('2026-09-03T21:16:00').getTime(),
        personaId: 'hackathon',
        modelUsed: 'gemini-3.6-flash'
      }
    ],
    moments: []
  },
  {
    id: 'session-earlier-stillness',
    userId: 'default',
    dateKey: '2026-09-01',
    createdAt: new Date('2026-09-01T18:00:00').getTime(),
    updatedAt: new Date('2026-09-01T18:25:00').getTime(),
    title: 'Loneliness in Crowded Spaces & Reclaiming Stillness',
    preview: 'The feeling of being alone among many is an invitation to inhabit your own center.',
    personaId: 'zen',
    moodBadge: '🌊 Grounded & Calm',
    tags: ['stillness', 'solitude', 'mindfulness'],
    messages: [
      {
        id: 'msg-zen-1',
        sender: 'user',
        text: 'Today felt lonely, even though I was surrounded by people at campus and team discussions.',
        timestamp: new Date('2026-09-01T18:00:00').getTime(),
        personaId: 'zen'
      },
      {
        id: 'msg-zen-2',
        sender: 'gemini',
        text: 'The crowd creates noise, but stillness lives within your breath. Solitude within a crowd is often the spirit asking you to return home to your own values rather than seek external validation.',
        timestamp: new Date('2026-09-01T18:01:00').getTime(),
        personaId: 'zen',
        modelUsed: 'gemini-3.6-flash'
      }
    ],
    moments: []
  },
  {
    id: 'session-prev-cloud',
    userId: 'default',
    dateKey: '2026-08-24',
    createdAt: new Date('2026-08-24T14:10:00').getTime(),
    updatedAt: new Date('2026-08-24T14:45:00').getTime(),
    title: 'Summer Breakthrough: Distributed Cloud Mesh',
    preview: 'Reflected on the milestone of deploying zero-downtime microservices.',
    personaId: 'journal',
    moodBadge: '✨ Inspired',
    tags: ['breakthrough', 'systems', 'growth'],
    messages: [
      {
        id: 'msg-prev-1',
        sender: 'user',
        text: 'Writing down reflections after deploying the first zero-downtime microservices release with the team.',
        timestamp: new Date('2026-08-24T14:10:00').getTime(),
        personaId: 'journal'
      },
      {
        id: 'msg-prev-2',
        sender: 'gemini',
        text: 'Documenting this triumph cements the cognitive leap: complexity surrendered to disciplined execution. Capture how it felt when the health checks turned green.',
        timestamp: new Date('2026-08-24T14:11:00').getTime(),
        personaId: 'journal',
        modelUsed: 'gemini-3.6-flash'
      }
    ],
    moments: []
  }
];

const LOCAL_STORAGE_KEY = 'aura_journal_sessions_';

/**
 * Load journal sessions from Firestore with localStorage & seeded fallback
 */
export async function loadJournalSessions(userId?: string): Promise<JournalSession[]> {
  const key = `${LOCAL_STORAGE_KEY}${userId || 'guest'}`;
  let localSessions: JournalSession[] = [];
  
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      localSessions = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to parse local sessions:', err);
  }

  // If user is authenticated, query Firestore
  if (userId) {
    try {
      const colRef = collection(db, 'users', userId, 'journal_sessions');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const firestoreSessions: JournalSession[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreSessions.push({
            id: docSnap.id,
            userId: d.userId || userId,
            dateKey: d.dateKey || new Date(d.createdAt || Date.now()).toISOString().split('T')[0],
            createdAt: d.createdAt || Date.now(),
            updatedAt: d.updatedAt || Date.now(),
            title: sanitizeText(d.title || 'Untitled Reflection'),
            preview: sanitizeText(d.preview || ''),
            personaId: d.personaId || 'shayari',
            moodBadge: d.moodBadge || '✨ Inspired',
            tags: d.tags || [],
            messages: d.messages || [],
            moments: d.moments || []
          });
        });

        // Cache into localStorage
        localStorage.setItem(key, JSON.stringify(firestoreSessions));
        return firestoreSessions;
      }
    } catch (fsErr) {
      console.warn('Firestore load sessions failed, falling back:', fsErr);
    }
  }

  // If local sessions exist, return them
  if (localSessions && localSessions.length > 0) {
    return localSessions;
  }

  // Seed default sessions tailored to the user
  const initial = DEFAULT_JOURNAL_SESSIONS.map((s) => ({
    ...s,
    userId: userId || 'guest'
  }));

  try {
    localStorage.setItem(key, JSON.stringify(initial));
    // If authenticated, persist seeded initial records to Firestore
    if (userId) {
      initial.forEach(async (sess) => {
        try {
          const docRef = doc(db, 'users', userId, 'journal_sessions', sess.id);
          await setDoc(docRef, stripUndefined(sess));
        } catch {
          // ignore
        }
      });
    }
  } catch (err) {
    console.warn('Error seeding initial sessions:', err);
  }

  return initial;
}

/**
 * Persist or update a journal session
 */
export async function saveJournalSession(session: JournalSession, userId?: string): Promise<void> {
  const key = `${LOCAL_STORAGE_KEY}${userId || 'guest'}`;
  try {
    const existingStr = localStorage.getItem(key);
    let sessions: JournalSession[] = existingStr ? JSON.parse(existingStr) : [];
    
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = { ...sessions[idx], ...session, updatedAt: Date.now() };
    } else {
      sessions = [session, ...sessions];
    }

    localStorage.setItem(key, JSON.stringify(sessions));

    if (userId) {
      const docRef = doc(db, 'users', userId, 'journal_sessions', session.id);
      await setDoc(docRef, stripUndefined({
        ...session,
        userId,
        updatedAt: Date.now()
      }));
    }
  } catch (err) {
    console.warn('Failed to save journal session:', err);
  }
}

/**
 * Create a new reflection session for today
 */
export function createNewJournalSession(personaId: PersonaId, userId?: string): JournalSession {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const id = `session-${Date.now()}`;

  const defaultWelcome: Record<PersonaId, { text: string; couplet?: string }> = {
    shayari: {
      text: 'The sanctuary is quiet. What truth or feeling seeks words within you today?',
      couplet: 'dil-e-nā-dān tujhe huā kyā hai\n(āḳhir is dard kī davā kyā hai)'
    },
    hackathon: {
      text: 'Session initiated. What problem, architecture, or breakthrough are we tackling right now?'
    },
    zen: {
      text: 'Breathe in, arrive here. Release what does not serve you. What is alive in your awareness?'
    },
    journal: {
      text: 'Welcome to your private page. Synthesize your day, untangle a conflict, or write freely.'
    }
  };

  const welcome = defaultWelcome[personaId] || defaultWelcome.shayari;

  return {
    id,
    userId: userId || 'guest',
    dateKey,
    createdAt: now.getTime(),
    updatedAt: now.getTime(),
    title: `Daily Reflection • ${dateFormatted}`,
    preview: welcome.text.slice(0, 90),
    personaId,
    moodBadge: '✨ Inspired',
    tags: ['new-entry'],
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'gemini',
        text: welcome.text,
        couplet: welcome.couplet,
        timestamp: now.getTime(),
        personaId
      }
    ],
    moments: []
  };
}

export interface GroupedJournalSessions {
  today: JournalSession[];
  yesterday: JournalSession[];
  earlierThisMonth: JournalSession[];
  previousMonths: JournalSession[];
}

/**
 * Chronologically group sessions into Today, Yesterday, Earlier this Month, and Previous Months
 */
export function groupSessionsByTime(sessions: JournalSession[]): GroupedJournalSessions {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(currentDate - 1);

  const groups: GroupedJournalSessions = {
    today: [],
    yesterday: [],
    earlierThisMonth: [],
    previousMonths: []
  };

  // Sort descending by createdAt
  const sorted = [...sessions].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  for (const session of sorted) {
    const sDate = new Date(session.createdAt);

    if (isSameDay(sDate, now)) {
      groups.today.push(session);
    } else if (isSameDay(sDate, yesterdayDate)) {
      groups.yesterday.push(session);
    } else if (sDate.getFullYear() === currentYear && sDate.getMonth() === currentMonth) {
      groups.earlierThisMonth.push(session);
    } else {
      groups.previousMonths.push(session);
    }
  }

  return groups;
}
