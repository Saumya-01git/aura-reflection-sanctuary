import React, { useState } from 'react';
import { PolaroidMoment } from '../types';
import { 
  Maximize2, 
  Trash2, 
  Sparkles, 
  Calendar, 
  X, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface PolaroidCardProps {
  moment: PolaroidMoment;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  moment,
  onDelete,
  showDelete = true,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formattedDate = new Date(moment.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${moment.evocativeTitle}. ${moment.caption}. Visual perspective: ${moment.visualAnalysis}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <div className="group relative rounded-3xl backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 hover:border-cyan-400/50 shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
        {/* Top Polaroid Photo Canvas */}
        <div className="p-3 sm:p-3.5 pb-2">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-inner group/photo">
            <img
              src={moment.photoDataUrl}
              alt={moment.evocativeTitle}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => setIsZoomed(true)}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-lg"
                title="Zoom photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSpeech}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                  isSpeaking ? 'bg-cyan-500 text-neutral-950' : 'bg-black/60 hover:bg-black/90 text-white'
                }`}
                title="Read moment reflection"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Emotional Tone Pill */}
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2.5 py-0.5 rounded-full backdrop-blur-md bg-black/60 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono tracking-wider uppercase font-medium">
                {moment.emotionalTone || 'Serene'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Polaroid Diary Content */}
        <div className="p-4 sm:p-5 pt-2 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400/70" />
                {formattedDate}
              </span>
              <span className="text-cyan-300/80">Gemini Vision</span>
            </div>

            <h4 className="text-sm font-bold text-white font-['Playfair_Display'] leading-snug">
              {moment.evocativeTitle}
            </h4>

            {moment.caption && (
              <p className="text-xs text-white/90 italic line-clamp-2 leading-relaxed">
                "{moment.caption}"
              </p>
            )}

            <p className="text-[11px] text-cyan-100/70 line-clamp-2 leading-relaxed pt-1 border-t border-white/10">
              {moment.visualAnalysis}
            </p>
          </div>

          {/* Delete Action (Right to be Forgotten) */}
          {showDelete && onDelete && (
            <div className="flex items-center justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => onDelete(moment.id)}
                className="text-[11px] text-white/40 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Delete moment"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-black/85 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col rounded-3xl backdrop-blur-2xl bg-neutral-900/95 border border-cyan-400/30 shadow-2xl p-4 sm:p-6 overflow-hidden space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-['Playfair_Display']">
                  {moment.evocativeTitle}
                </h3>
                <span className="text-xs text-cyan-300 font-mono">
                  {moment.emotionalTone} • {formattedDate}
                </span>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center rounded-2xl bg-black/50 border border-white/10">
              <img
                src={moment.photoDataUrl}
                alt={moment.evocativeTitle}
                className="max-h-[60vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2 text-xs text-white/80">
              {moment.caption && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="font-semibold text-white">Your Note: </span>
                  <span className="italic">"{moment.caption}"</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-400/20 text-cyan-100/80">
                <span className="font-semibold text-cyan-300">Gemini Vision Observation: </span>
                <span>{moment.visualAnalysis}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
