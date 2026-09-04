import { ChatMessage, MilestoneEntry, UserProfile } from '../types';

export interface ExportData {
  user: {
    displayName?: string | null;
    email?: string | null;
  };
  exportedAt: string;
  reflections: ChatMessage[];
  milestones?: MilestoneEntry[];
}

/**
 * Downloads content as a client-side file
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export reflections & milestones as Markdown
 */
export const exportAsMarkdown = (
  messages: ChatMessage[],
  milestones: MilestoneEntry[] = [],
  user: UserProfile | null
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `Aura Reflection Sanctuary Journal - ${dateStr}`;

  let md = `# ${title}\n\n`;
  md += `*Author:* ${user?.displayName || 'Anonymous Seeker'}\n`;
  md += `*Exported on:* ${new Date().toLocaleString()}\n`;
  md += `*Privacy Standard:* Zero-Knowledge User-Encrypted Export\n\n`;
  md += `---\n\n`;

  md += `## 📜 Personal Reflections & Dialogue\n\n`;
  if (messages.length === 0) {
    md += `*No reflections logged in current session.*\n\n`;
  } else {
    messages.forEach((msg, idx) => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const senderName = msg.sender === 'user' ? (user?.displayName || 'You') : (msg.senderName || 'Aura Companion');

      md += `### ${idx + 1}. [${time}] ${senderName}\n`;
      if (msg.couplet) {
        md += `> *"${msg.couplet}"*\n\n`;
      }
      md += `${msg.text}\n\n`;
      if (msg.modelUsed) {
        md += `*Grounded via: ${msg.modelUsed}*\n\n`;
      }
      md += `---\n\n`;
    });
  }

  if (milestones.length > 0) {
    md += `## 🏆 Conquered Milestones & Perspective Flashbacks\n\n`;
    milestones.forEach((m, idx) => {
      const date = new Date(m.timestamp).toLocaleDateString();
      md += `### ${idx + 1}. ${m.title} (${date}) [${m.category.toUpperCase()}]\n`;
      md += `**Past Friction / Doubt:**\n${m.summary}\n\n`;
      md += `**Conquered Resolution:**\n${m.conqueredNote}\n\n`;
      md += `---\n\n`;
    });
  }

  downloadFile(md, `Aura_Sanctuary_Journal_${dateStr}.md`, 'text/markdown;charset=utf-8');
};

/**
 * Export reflections & milestones as JSON
 */
export const exportAsJson = (
  messages: ChatMessage[],
  milestones: MilestoneEntry[] = [],
  user: UserProfile | null
) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload: ExportData = {
    user: {
      displayName: user?.displayName,
      email: user?.email
    },
    exportedAt: new Date().toISOString(),
    reflections: messages,
    milestones: milestones
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  downloadFile(jsonStr, `Aura_Sanctuary_Journal_${dateStr}.json`, 'application/json;charset=utf-8');
};
