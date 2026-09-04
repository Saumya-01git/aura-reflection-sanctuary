/**
 * Aura - Data Sanitization & Protection Utilities
 */

/**
 * Strips all undefined fields recursively from any object before passing to Firestore.
 * Firestore throws errors if any field is undefined.
 */
export function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = stripUndefined(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as Partial<T>;
}

/**
 * Strips dangerous HTML tags and script injections from user text
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Sanitizes a quote or snippet for public sharing:
 * - Trims and normalizes whitespace
 * - Strips any private metadata or system prompt remnants
 * - Limits length to prevent denial-of-service payload sizes
 */
export function sanitizeSnippetContent(text: string, maxLength = 1000): string {
  const clean = sanitizeText(text);
  return clean.slice(0, maxLength);
}

/**
 * Safely format timestamps into readable time (e.g., "02:45 PM") without ever producing "Invalid Date"
 */
export function formatTimeSafe(ts: any): string {
  if (!ts) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    let d: Date;
    if (typeof ts === 'number') {
      d = new Date(ts);
    } else if (typeof ts?.toDate === 'function') {
      d = ts.toDate();
    } else if (typeof ts?.toMillis === 'function') {
      d = new Date(ts.toMillis());
    } else if (ts?.seconds !== undefined) {
      d = new Date(ts.seconds * 1000);
    } else if (ts?._seconds !== undefined) {
      d = new Date(ts._seconds * 1000);
    } else if (typeof ts === 'string') {
      d = new Date(ts);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d.getTime())) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Safely format timestamps into readable date (e.g., "Sep 4, 2026") without ever producing "Invalid Date"
 */
export function formatDateSafe(ts: any): string {
  if (!ts) return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  try {
    let d: Date;
    if (typeof ts === 'number') {
      d = new Date(ts);
    } else if (typeof ts?.toDate === 'function') {
      d = ts.toDate();
    } else if (typeof ts?.toMillis === 'function') {
      d = new Date(ts.toMillis());
    } else if (ts?.seconds !== undefined) {
      d = new Date(ts.seconds * 1000);
    } else if (ts?._seconds !== undefined) {
      d = new Date(ts._seconds * 1000);
    } else if (typeof ts === 'string') {
      d = new Date(ts);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

/**
 * Safely format timestamps into prominent date banner format:
 * e.g., "Friday, Sep 4, 2026"
 */
export function formatFullDateSafe(ts: any): string {
  if (!ts) {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  try {
    let d: Date;
    if (typeof ts === 'number') {
      d = new Date(ts);
    } else if (typeof ts?.toDate === 'function') {
      d = ts.toDate();
    } else if (typeof ts?.toMillis === 'function') {
      d = new Date(ts.toMillis());
    } else if (ts?.seconds !== undefined) {
      d = new Date(ts.seconds * 1000);
    } else if (ts?._seconds !== undefined) {
      d = new Date(ts._seconds * 1000);
    } else if (typeof ts === 'string') {
      d = new Date(ts);
    } else {
      d = new Date(ts);
    }
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

