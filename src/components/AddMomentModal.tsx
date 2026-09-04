import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  X, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PolaroidMoment } from '../types';
import { Toast, ToastData } from './Toast';

interface AddMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onMomentSaved: (moment: PolaroidMoment) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const AddMomentModal: React.FC<AddMomentModalProps> = ({
  isOpen,
  onClose,
  userId,
  onMomentSaved,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Validate and process image file
  const processImageFile = (file: File) => {
    // 1. File Type Validation
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || 
      file.name.match(/\.(jpeg|jpg|png)$/i);

    if (!isMimeAllowed) {
      const msg = 'Invalid file format. Please upload a valid JPEG or PNG photo.';
      setErrorMsg(msg);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Unsupported File Format',
        message: msg
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. File Size Validation (< 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `Photo is ${fileSizeMb}MB, exceeding the 5MB maximum limit. Please select a smaller image.`;
      setErrorMsg(msg);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'File Size Exceeded',
        message: msg
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMsg(null);
    setToast(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoDataUrl(compressed);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSubmit = async () => {
    if (!photoDataUrl) {
      setErrorMsg('Please upload a photo first.');
      setToast({
        id: Date.now().toString(),
        type: 'warning',
        title: 'Photo Required',
        message: 'Please choose or drop a photo before submitting.'
      });
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Call server-side Gemini Vision
      const response = await fetch('/api/analyze-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoDataUrl,
          mimeType: 'image/jpeg',
          caption: caption.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Vision analysis failed. Please try again.');
      }

      const visionData = await response.json();

      const momentId = 'mom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newMoment: PolaroidMoment = {
        id: momentId,
        userId: userId || 'anonymous',
        photoDataUrl,
        caption: caption.trim() || 'A frozen memory in the sanctuary.',
        visualAnalysis: visionData.visualAnalysis || 'A quiet pause captured in soft light.',
        evocativeTitle: visionData.evocativeTitle || 'Moment of Reflection',
        emotionalTone: visionData.emotionalTone || 'Contemplative Calm',
        timestamp: Date.now(),
      };

      // Persist to Firestore if user is authenticated
      if (userId && userId !== 'anonymous') {
        try {
          const docRef = doc(db, 'users', userId, 'moments', momentId);
          await setDoc(docRef, newMoment);
        } catch (dbErr) {
          console.warn('Firestore write fallback to local storage:', dbErr);
        }
      }

      // Save to local storage as client-side fallback
      try {
        const key = `aura_moments_${userId || 'guest'}`;
        const existing = localStorage.getItem(key);
        const moments = existing ? JSON.parse(existing) : [];
        moments.unshift(newMoment);
        localStorage.setItem(key, JSON.stringify(moments.slice(0, 30)));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }

      onMomentSaved(newMoment);
      onClose();
    } catch (err: any) {
      console.error('Moment submission error:', err);
      const msg = err.message || 'Error analyzing photo moment. Please retry.';
      setErrorMsg(msg);
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Analysis Error',
        message: msg
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <div 
        id="add-moment-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-200"
      >
        <div 
          id="add-moment-modal-container"
          className="relative w-full max-w-lg rounded-3xl backdrop-blur-2xl bg-neutral-900/90 border border-cyan-400/30 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Playfair_Display']">
                  Capture Polaroid Moment
                </h3>
                <p className="text-xs text-cyan-200/70">
                  Gemini Vision analyzes visual scene, emotional tone &amp; title
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isAnalyzing}
              className="p-2 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Zone */}
          {!photoDataUrl ? (
            <div
              id="moment-drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/60 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all bg-white/5 hover:bg-white/10 group"
            >
              <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">
                  Drop your photo here, or <span className="text-cyan-400 underline">browse</span>
                </div>
                <div className="text-[11px] text-white/50">
                  Strictly JPEG or PNG • Max 5MB file size
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 max-h-56 bg-black flex items-center justify-center group">
                <img
                  src={photoDataUrl}
                  alt="Selected moment"
                  className="w-full h-full object-cover max-h-56"
                />
                <button
                  onClick={() => {
                    setPhotoDataUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isAnalyzing}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-all shadow-md cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="text-xs text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                >
                  Replace photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
              <span>Your Personal Reflection Note (Optional)</span>
              <span className="text-[10px] text-white/40">{caption.length}/200</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 200))}
              placeholder="What context or thought does this photo bring to mind? (e.g. A solitary coffee before the hackathon sprint)"
              rows={2}
              maxLength={200}
              disabled={isAnalyzing}
              className="w-full px-3.5 py-2 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-polaroid-moment-btn"
              onClick={handleSubmit}
              disabled={isAnalyzing || !photoDataUrl}
              className="px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-white/10 disabled:text-white/40 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Scene with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Develop Polaroid</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};
