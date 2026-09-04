import React, { useEffect } from 'react';
import { ShieldCheck, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-400/40',
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-200',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/80',
          text: 'text-rose-200',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-amber-400/50',
          bg: 'bg-amber-950/80',
          text: 'text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'info':
      default:
        return {
          border: 'border-cyan-400/40',
          bg: 'bg-cyan-950/80',
          text: 'text-cyan-200',
          icon: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div 
      id="aura-frosted-toast"
      className="fixed bottom-6 right-6 z-[100] max-w-sm w-full p-4 rounded-3xl backdrop-blur-2xl border shadow-[0_10px_35px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-3 duration-200"
      style={{
        backgroundColor: 'rgba(12, 12, 18, 0.88)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
          {style.icon}
        </div>
        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <h4 className="text-xs font-bold text-white font-['Plus_Jakarta_Sans'] mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className={`text-xs ${style.text} leading-relaxed font-sans`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
