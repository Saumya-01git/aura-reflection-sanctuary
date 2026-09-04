import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Sparkles, 
  Calendar, 
  User, 
  Check, 
  Palette,
  Loader2,
  FileDown,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChatMessage } from '../types';

interface KeepsakeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessage | null;
  userName?: string | null;
}

export const KeepsakeCardModal: React.FC<KeepsakeCardModalProps> = ({
  isOpen,
  onClose,
  message,
  userName,
}) => {
  const [theme, setTheme] = useState<'frosted-gold' | 'velvet-night' | 'cyan-glass' | 'obsidian'>('frosted-gold');
  const [downloadedHtml, setDownloadedHtml] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !message) return null;

  const formattedDate = new Date(message.timestamp).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const authorName = userName || 'Aura Seeker';

  // Robust Print & PDF Export (Supports both iframe and standalone modes)
  const handlePrintOrPdf = async () => {
    if (!cardRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setStatusNotice(null);

    try {
      // 1. Direct PDF Generation using html2canvas & jsPDF
      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution crisp text
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = 160; // Leave 25mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = Math.max(25, (pageHeight - imgHeight) / 3);

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      const filename = `Aura-Keepsake-${message.id.slice(0, 8)}.pdf`;
      pdf.save(filename);

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);

      // 2. Attempt native browser window.print()
      let printTriggered = false;
      try {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          // In some browsers or iframe sandboxes, window.print() will be silently ignored or throw
          window.print();
          printTriggered = true;
        }
      } catch (printError) {
        console.warn('Native window.print() blocked by iframe sandbox:', printError);
      }

      if (printTriggered) {
        setStatusNotice('PDF downloaded! Print dialog launched.');
      } else {
        setStatusNotice('Keepsake PDF saved to your downloads folder.');
      }
    } catch (err) {
      console.error('Error generating PDF, falling back to printable HTML:', err);
      handleDownloadHtml();
      setStatusNotice('Downloaded printable HTML keepsake file.');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setStatusNotice(null), 6000);
    }
  };

  // Download standalone printable HTML keepsake file
  const handleDownloadHtml = () => {
    const cardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Aura Keepsake — ${authorName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
    body {
      margin: 0;
      padding: 40px;
      background: #0a0a0c;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #f1f5f9;
    }
    .card {
      width: 540px;
      padding: 48px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 215, 0, 0.4);
      border-radius: 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      text-align: center;
      backdrop-filter: blur(20px);
    }
    .brand {
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #fbbf24;
      margin-bottom: 24px;
    }
    .couplet {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-style: italic;
      color: #fef08a;
      line-height: 1.6;
      margin-bottom: 24px;
      white-space: pre-line;
    }
    .divider {
      width: 60px;
      height: 1px;
      background: rgba(251, 191, 36, 0.4);
      margin: 0 auto 24px auto;
    }
    .reflection {
      font-size: 14px;
      line-height: 1.7;
      color: #cbd5e1;
      margin-bottom: 32px;
      white-space: pre-line;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
    @media print {
      body { background: #ffffff; color: #000000; }
      .card { border: 1px solid #000000; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">✦ Aura Reflection Sanctuary ✦</div>
    ${message.couplet ? `<div class="couplet">"${message.couplet}"</div><div class="divider"></div>` : ''}
    <div class="reflection">${message.text}</div>
    <div class="footer">
      <span>Dedicated to: ${authorName}</span>
      <span>${formattedDate}</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([cardHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aura-Keepsake-${message.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedHtml(true);
    setTimeout(() => setDownloadedHtml(false), 2000);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'frosted-gold':
        return 'bg-gradient-to-b from-amber-500/15 via-black/60 to-amber-950/40 border-amber-400/40 text-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.15)]';
      case 'velvet-night':
        return 'bg-gradient-to-b from-purple-500/15 via-black/60 to-purple-950/40 border-purple-400/40 text-purple-100 shadow-[0_0_40px_rgba(168,85,247,0.15)]';
      case 'cyan-glass':
        return 'bg-gradient-to-b from-cyan-500/15 via-black/60 to-cyan-950/40 border-cyan-400/40 text-cyan-100 shadow-[0_0_40px_rgba(6,182,212,0.15)]';
      case 'obsidian':
        return 'bg-neutral-900/90 border-white/20 text-neutral-100 shadow-2xl';
    }
  };

  return (
    <div 
      id="keepsake-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-200"
    >
      <div 
        id="keepsake-modal-container"
        className="relative w-full max-w-xl flex flex-col rounded-3xl backdrop-blur-2xl bg-neutral-900/90 border border-white/20 shadow-2xl p-6 space-y-5 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Playfair_Display']">
                Aesthetic Keepsake Card
              </h3>
              <p className="text-xs text-white/60">
                High-craft printable keepsake formatted for journaling &amp; export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Palette Bar */}
        <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-white/10 text-xs no-print">
          <span className="text-white/50 text-[11px] font-mono px-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            Card Theme:
          </span>
          <div className="flex items-center gap-1">
            {(['frosted-gold', 'velvet-night', 'cyan-glass', 'obsidian'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] capitalize transition-all cursor-pointer ${
                  theme === t 
                    ? 'bg-white/20 text-white font-semibold border border-white/30 shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Keepsake Card */}
        <div 
          id="keepsake-printable-card"
          ref={cardRef}
          className={`p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl transition-all space-y-6 text-center relative overflow-hidden ${getThemeClasses()}`}
        >
          {/* Header Brand */}
          <div className="text-[10px] tracking-[0.25em] font-mono uppercase text-white/60 flex items-center justify-center gap-2">
            <span>✦</span>
            <span>Aura Reflection Sanctuary</span>
            <span>✦</span>
          </div>

          {/* Couplet Section */}
          {message.couplet && (
            <div className="space-y-3">
              <p className="font-['Playfair_Display'] text-lg sm:text-xl font-bold tracking-wide italic leading-relaxed">
                "{message.couplet}"
              </p>
              <div className="w-12 h-px bg-white/30 mx-auto" />
            </div>
          )}

          {/* Main Body */}
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans text-left sm:text-center whitespace-pre-line">
            {message.text}
          </p>

          {/* Footer with Metadata */}
          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-white/40" />
              <span>{authorName}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span>{formattedDate}</span>
            </span>
          </div>
        </div>

        {/* Status Toast / Alert if triggered */}
        {statusNotice && (
          <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2 no-print animate-in fade-in duration-200">
            <Info className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 no-print">
          <button
            onClick={handleDownloadHtml}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15 cursor-pointer"
            title="Download portable standalone HTML file"
          >
            {downloadedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloadedHtml ? 'Saved HTML' : 'Save Keepsake File'}</span>
          </button>

          <button
            id="print-save-pdf-btn"
            onClick={handlePrintOrPdf}
            disabled={isExportingPdf}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all active:scale-95 cursor-pointer disabled:opacity-75"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-950" />
                <span>PDF Saved!</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
