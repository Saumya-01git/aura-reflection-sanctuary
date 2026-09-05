import React, { useMemo } from 'react';
import { WallpaperId } from '../types';

interface AmbientBackgroundProps {
  wallpaper: WallpaperId;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  twinkleDelay: number;
  color: string;
  hasHalo?: boolean;
}

interface SparkleStar {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ wallpaper }) => {
  const isCosmic = wallpaper === 'cosmic_starlight';
  const isSunset = wallpaper === 'sunset';
  const isEmerald = wallpaper === 'cyber_focus';
  const isMidnight = wallpaper === 'lofi_rain';
  const isTitanium = wallpaper === 'obsidian';

  // 130 deterministically placed celestial stars for Cosmic Starlight
  const stars = useMemo<Star[]>(() => {
    const list: Star[] = [];
    let seed = 42;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const colors = ['#ffffff', '#ffffff', '#e0e7ff', '#c084fc', '#38bdf8', '#fef08a'];

    for (let i = 0; i < 130; i++) {
      const sizeRandom = random();
      const size = sizeRandom > 0.88 ? 3.5 : sizeRandom > 0.65 ? 2.5 : sizeRandom > 0.35 ? 1.8 : 1.2;
      list.push({
        id: i,
        x: Math.round(random() * 990) / 10,
        y: Math.round(random() * 980) / 10,
        size,
        opacity: Math.round((0.45 + random() * 0.55) * 100) / 100,
        twinkleDuration: Math.round((2.5 + random() * 4.5) * 10) / 10,
        twinkleDelay: Math.round((random() * 6) * 10) / 10,
        color: colors[Math.floor(random() * colors.length)],
        hasHalo: size >= 2.5
      });
    }
    return list;
  }, []);

  // Prominent 4-point sparkle stars for Cosmic Starlight
  const sparkleStars = useMemo<SparkleStar[]>(() => [
    { id: 1, x: 14, y: 18, size: 18, delay: 0.2, duration: 4.5, color: '#e0e7ff' },
    { id: 2, x: 82, y: 15, size: 22, delay: 1.8, duration: 5.2, color: '#c084fc' },
    { id: 3, x: 26, y: 38, size: 14, delay: 2.6, duration: 4.0, color: '#38bdf8' },
    { id: 4, x: 74, y: 44, size: 16, delay: 0.9, duration: 4.8, color: '#ffffff' },
    { id: 5, x: 91, y: 68, size: 20, delay: 3.1, duration: 5.5, color: '#c084fc' },
    { id: 6, x: 8,  y: 72, size: 15, delay: 1.4, duration: 4.2, color: '#38bdf8' },
    { id: 7, x: 48, y: 22, size: 16, delay: 3.7, duration: 5.0, color: '#fef08a' },
    { id: 8, x: 62, y: 78, size: 18, delay: 2.1, duration: 4.6, color: '#e0e7ff' }
  ], []);

  // Floating warm sunset embers
  const sunsetEmbers = useMemo<Particle[]>(() => [
    { id: 1, x: 18, y: 82, size: 5, delay: 0.2, duration: 7.5, color: '#f59e0b' },
    { id: 2, x: 32, y: 88, size: 6, delay: 1.4, duration: 6.8, color: '#fb923c' },
    { id: 3, x: 45, y: 76, size: 4, delay: 3.1, duration: 8.2, color: '#f43f5e' },
    { id: 4, x: 58, y: 84, size: 5.5, delay: 0.8, duration: 7.0, color: '#fbbf24' },
    { id: 5, x: 70, y: 79, size: 4.5, delay: 2.3, duration: 8.5, color: '#f97316' },
    { id: 6, x: 82, y: 85, size: 6, delay: 4.2, duration: 6.5, color: '#fb7185' },
    { id: 7, x: 25, y: 92, size: 4, delay: 5.0, duration: 7.8, color: '#fde047' },
    { id: 8, x: 64, y: 90, size: 5, delay: 2.9, duration: 8.0, color: '#f43f5e' },
    { id: 9, x: 88, y: 80, size: 4.5, delay: 1.8, duration: 7.2, color: '#f59e0b' },
    { id: 10, x: 50, y: 86, size: 5, delay: 3.8, duration: 7.6, color: '#fb923c' }
  ], []);

  // Floating bioluminescent emerald spores
  const emeraldSpores = useMemo<Particle[]>(() => [
    { id: 1, x: 15, y: 35, size: 5, delay: 0.5, duration: 6.5, color: '#34d399' },
    { id: 2, x: 28, y: 62, size: 4.5, delay: 2.1, duration: 7.2, color: '#10b981' },
    { id: 3, x: 42, y: 25, size: 6, delay: 1.2, duration: 8.0, color: '#6ee7b7' },
    { id: 4, x: 60, y: 55, size: 4, delay: 3.4, duration: 6.8, color: '#2dd4bf' },
    { id: 5, x: 75, y: 30, size: 5.5, delay: 0.9, duration: 7.5, color: '#5eead4' },
    { id: 6, x: 85, y: 65, size: 4.5, delay: 4.0, duration: 8.2, color: '#34d399' },
    { id: 7, x: 35, y: 78, size: 5, delay: 2.8, duration: 7.0, color: '#a7f3d0' },
    { id: 8, x: 68, y: 82, size: 6, delay: 1.6, duration: 6.4, color: '#10b981' },
    { id: 9, x: 90, y: 40, size: 4, delay: 3.2, duration: 7.8, color: '#2dd4bf' }
  ], []);

  // Rain streaks for Midnight Sapphire
  const rainStreaks = useMemo(() => [
    { id: 1, x: 12, delay: 0.2, duration: 1.8, opacity: 0.45, height: 65 },
    { id: 2, x: 24, delay: 0.9, duration: 2.1, opacity: 0.35, height: 80 },
    { id: 3, x: 38, delay: 0.4, duration: 1.6, opacity: 0.5, height: 70 },
    { id: 4, x: 52, delay: 1.3, duration: 2.3, opacity: 0.4, height: 85 },
    { id: 5, x: 66, delay: 0.7, duration: 1.9, opacity: 0.45, height: 75 },
    { id: 6, x: 79, delay: 1.1, duration: 2.0, opacity: 0.35, height: 90 },
    { id: 7, x: 91, delay: 0.5, duration: 1.7, opacity: 0.5, height: 60 },
    { id: 8, x: 44, delay: 1.5, duration: 2.2, opacity: 0.4, height: 75 }
  ], []);

  // Determine the canvas radial background per theme
  const backgroundStyle = useMemo(() => {
    if (isCosmic) {
      return 'linear-gradient(135deg, #0e072b 0%, #1c0e44 25%, #2a135a 50%, #18093b 75%, #080318 100%)';
    }
    if (isSunset) {
      return 'linear-gradient(135deg, #2a0b1e 0%, #4a1329 25%, #6e1a37 50%, #3a0d24 75%, #160515 100%)';
    }
    if (isEmerald) {
      return 'linear-gradient(135deg, #022419 0%, #054832 25%, #086b4a 50%, #043d2a 75%, #01150e 100%)';
    }
    if (isTitanium) {
      return 'linear-gradient(135deg, #151a24 0%, #222b3a 25%, #303d52 50%, #1e2634 75%, #0c0f16 100%)';
    }
    // Default: isMidnight (lofi_rain)
    return 'linear-gradient(135deg, #04163a 0%, #0a2b6d 25%, #10429c 50%, #092c6e 75%, #030d22 100%)';
  }, [isCosmic, isSunset, isEmerald, isTitanium]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-700">
      {/* Primary Radiant Canvas Base */}
      <div 
        className="absolute inset-0 transition-all duration-700"
        style={{ background: backgroundStyle }}
      />

      {/* Characteristic Fine Dot Grid (Non-Cosmic Themes) */}
      {!isCosmic && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: isTitanium ? 0.45 : 0.35
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. 🌌 COSMIC STARLIGHT THEME: Starry Night Sky                            */}
      {/* ========================================================================= */}
      {isCosmic && (
        <>
          {/* Luminous Violet and Indigo Nebulae Clouds */}
          <div className="absolute top-1/4 left-1/6 w-[52rem] h-[52rem] bg-indigo-600/40 rounded-full blur-[110px] animate-celestial-nebula pointer-events-none" />
          <div className="absolute top-1/2 -right-16 w-[48rem] h-[48rem] bg-purple-600/40 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 left-1/4 w-[46rem] h-[46rem] bg-cyan-600/30 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-[42rem] h-[42rem] bg-fuchsia-700/30 rounded-full blur-[110px] pointer-events-none" />

          {/* Stardust Milky Way Ribbon */}
          <div 
            className="absolute -inset-x-20 inset-y-0 opacity-45 pointer-events-none transform -rotate-12"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.35) 0%, rgba(99, 102, 241, 0.20) 40%, transparent 70%)'
            }}
          />

          {/* Dense Field of 130 Twinkling Celestial Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  opacity: star.opacity,
                  boxShadow: star.hasHalo 
                    ? `0 0 ${star.size * 3}px ${star.color}, 0 0 ${star.size * 5}px rgba(255, 255, 255, 0.8)`
                    : `0 0 3px ${star.color}`,
                  animation: `cosmic-twinkle-subtle ${star.twinkleDuration}s ease-in-out infinite`,
                  animationDelay: `${star.twinkleDelay}s`
                }}
              />
            ))}
          </div>

          {/* Prominent 4-Point Shimmering Sparkle Stars */}
          <div className="absolute inset-0 pointer-events-none">
            {sparkleStars.map((s) => (
              <div
                key={s.id}
                className="absolute flex items-center justify-center animate-cosmic-sparkle"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.duration}s`
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                >
                  <path
                    d="M12 0C12 7 13.5 10.5 24 12C13.5 13.5 12 17 12 24C12 17 10.5 13.5 0 12C10.5 10.5 12 7 12 0Z"
                    fill={s.color}
                  />
                  <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                </svg>
              </div>
            ))}
          </div>

          {/* Shooting Stars */}
          <div className="absolute top-12 right-24 pointer-events-none">
            <div 
              className="w-36 h-[2px] rounded-full animate-shooting-star-1"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,1), rgba(167,139,250,0.9) 40%, transparent 100%)',
                boxShadow: '0 0 10px rgba(255,255,255,0.9)'
              }}
            />
          </div>

          <div className="absolute top-44 right-1/3 pointer-events-none">
            <div 
              className="w-44 h-[2px] rounded-full animate-shooting-star-2"
              style={{
                background: 'linear-gradient(90deg, #ffffff, rgba(56,189,248,1) 35%, transparent 100%)',
                boxShadow: '0 0 12px rgba(56,189,248,0.9)'
              }}
            />
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. 🌅 FROSTED SUNSET GLOW: Rich Sunset Orange, Coral & Rose Atmosphere     */}
      {/* ========================================================================= */}
      {isSunset && (
        <>
          {/* Luminous Glowing Amber/Orange Horizon Bloom at Bottom */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[68rem] h-[38rem] bg-gradient-to-t from-amber-500/60 via-orange-500/50 to-transparent rounded-full blur-[90px] pointer-events-none" />
          
          {/* Radiant Coral Peach Cloud */}
          <div className="absolute top-1/4 -right-16 w-[52rem] h-[52rem] bg-gradient-to-br from-rose-500/50 via-orange-500/40 to-transparent rounded-full blur-[100px] animate-pulse pointer-events-none" />
          
          {/* Dusk Royal Violet Cloud */}
          <div className="absolute -top-20 -left-16 w-[48rem] h-[48rem] bg-purple-700/50 rounded-full blur-[110px] pointer-events-none" />

          {/* Golden Horizon Glow Ribbon */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-amber-500/40 via-rose-500/25 to-transparent pointer-events-none" />

          {/* Radiant Amber Sun Orb Accent */}
          <div className="absolute bottom-20 left-1/3 w-[36rem] h-[32rem] bg-amber-400/40 rounded-full blur-[80px] pointer-events-none" />

          {/* Floating Warm Sunset Embers */}
          <div className="absolute inset-0 pointer-events-none">
            {sunsetEmbers.map((ember) => (
              <div
                key={ember.id}
                className="absolute rounded-full animate-sunset-ember"
                style={{
                  left: `${ember.x}%`,
                  top: `${ember.y}%`,
                  width: `${ember.size}px`,
                  height: `${ember.size}px`,
                  backgroundColor: ember.color,
                  boxShadow: `0 0 12px ${ember.color}, 0 0 24px rgba(251, 146, 60, 0.8)`,
                  animationDelay: `${ember.delay}s`,
                  animationDuration: `${ember.duration}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. 🌿 FROSTED EMERALD AURA: Aurora Borealis & Bioluminescent Jade          */}
      {/* ========================================================================= */}
      {isEmerald && (
        <>
          {/* Luminous Aurora Borealis Wave across Top Sky */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[70rem] h-[40rem] bg-gradient-to-b from-emerald-400/60 via-teal-400/45 to-transparent rounded-full blur-[90px] animate-aurora-wave pointer-events-none" />

          {/* Deep Sea Teal Wave */}
          <div className="absolute bottom-10 -left-20 w-[54rem] h-[48rem] bg-teal-500/45 rounded-full blur-[110px] pointer-events-none" />

          {/* Radiant Mint Green Sanctuary Light */}
          <div className="absolute top-1/2 -right-16 w-[48rem] h-[48rem] bg-emerald-400/45 rounded-full blur-[100px] animate-pulse pointer-events-none" />

          {/* Deep Forest Jade Highlights */}
          <div className="absolute -bottom-16 right-1/4 w-[42rem] h-[42rem] bg-lime-400/30 rounded-full blur-[100px] pointer-events-none" />

          {/* Floating Bioluminescent Emerald Spores */}
          <div className="absolute inset-0 pointer-events-none">
            {emeraldSpores.map((spore) => (
              <div
                key={spore.id}
                className="absolute rounded-full animate-sunset-ember"
                style={{
                  left: `${spore.x}%`,
                  top: `${spore.y}%`,
                  width: `${spore.size}px`,
                  height: `${spore.size}px`,
                  backgroundColor: spore.color,
                  boxShadow: `0 0 14px ${spore.color}, 0 0 24px rgba(52, 211, 153, 0.85)`,
                  animationDelay: `${spore.delay}s`,
                  animationDuration: `${spore.duration}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. 🌧️ MIDNIGHT SAPPHIRE GLASS: Deep Ocean Cobalt, Indigo & Gentle Rain     */}
      {/* ========================================================================= */}
      {isMidnight && (
        <>
          {/* Rich Royal Cobalt Blue Light Sphere */}
          <div className="absolute -top-24 -left-20 w-[56rem] h-[56rem] bg-blue-600/55 rounded-full blur-[100px] animate-pulse pointer-events-none" />

          {/* Deep Sapphire Lavender Mist */}
          <div className="absolute top-1/3 -right-16 w-[50rem] h-[50rem] bg-indigo-600/50 rounded-full blur-[110px] pointer-events-none" />

          {/* Electric Cyan Rainglow Puddle */}
          <div className="absolute -bottom-24 left-1/3 w-[48rem] h-[48rem] bg-cyan-500/40 rounded-full blur-[100px] pointer-events-none" />

          {/* Gentle Falling Rain Streaks Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {rainStreaks.map((rain) => (
              <div
                key={rain.id}
                className="absolute w-[1.5px] bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent"
                style={{
                  left: `${rain.x}%`,
                  top: '-10%',
                  height: `${rain.height}px`,
                  opacity: rain.opacity,
                  transform: 'rotate(-12deg)',
                  animation: `shooting-star-glide ${rain.duration}s linear infinite`,
                  animationDelay: `${rain.delay}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. ✨ MINIMAL FROSTED TITANIUM: Platinum Silver, Cool Slate & Onyx        */}
      {/* ========================================================================= */}
      {isTitanium && (
        <>
          {/* Silvery Platinum White Radiance */}
          <div className="absolute top-10 left-1/4 w-[54rem] h-[54rem] bg-slate-200/35 rounded-full blur-[110px] pointer-events-none" />

          {/* Cool Slate Titanium Orb */}
          <div className="absolute bottom-10 right-1/4 w-[48rem] h-[48rem] bg-slate-400/35 rounded-full blur-[120px] pointer-events-none" />

          {/* Subtle Diamond Prism Sheen */}
          <div className="absolute -top-16 -right-16 w-[42rem] h-[42rem] bg-indigo-300/25 rounded-full blur-[100px] pointer-events-none" />

          {/* Sleek Obsidian Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none" />
        </>
      )}
    </div>
  );
};
