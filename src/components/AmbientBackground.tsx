import React from 'react';
import { WallpaperId } from '../types';

interface AmbientBackgroundProps {
  wallpaper: WallpaperId;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ wallpaper }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-all duration-700">
      {/* Primary Frosted Glass Radial Canvas from Design HTML */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at top left, #2D1B69 0%, #110C1B 50%, #3D1C3C 100%)'
        }}
      />

      {/* Characteristic 0.5px Star / Dot Grid from Design HTML */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Atmospheric Light Spheres for Frosted Glass Refraction */}
      <div className="absolute -top-24 -left-24 w-[36rem] h-[36rem] bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute top-1/3 -right-20 w-[32rem] h-[32rem] bg-purple-600/20 rounded-full blur-[140px]" />
      <div className="absolute -bottom-24 left-1/4 w-[40rem] h-[40rem] bg-pink-600/15 rounded-full blur-[150px]" />

      {/* Dynamic Accent Layers per Selected Theme */}
      {wallpaper === 'sunset' && (
        <div className="absolute top-10 right-1/4 w-[30rem] h-[30rem] bg-amber-500/15 rounded-full blur-[120px]" />
      )}

      {wallpaper === 'cyber_focus' && (
        <div className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-emerald-500/15 rounded-full blur-[120px]" />
      )}

      {wallpaper === 'obsidian' && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      )}
    </div>
  );
};
