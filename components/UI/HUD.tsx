
import React from 'react';
import { Player, GameMode } from '../../types';
import { GUN_GAME_ORDER } from '../../constants';

interface HUDProps {
  player: Player;
  gameMode: GameMode;
  timeRemaining: number;
  fps: number;
  ping: number;
  aliveCount: number;
  killFeed: string[];
  currency: number;
}

const HUD: React.FC<HUDProps> = ({
  player,
  gameMode,
  timeRemaining,
  fps,
  ping,
  aliveCount,
  killFeed,
  currency
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const hpPercent = (player.health / player.maxHealth) * 100;
  const shieldPercent = (player.shield / player.maxShield) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-display">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
        {/* Performance Stats */}
        <div className="flex flex-col space-y-2">
          <div className="bg-black/40 backdrop-blur-md border border-neon-blue/30 p-2 rounded-lg text-neon-blue font-mono text-xs md:text-sm">
            <div className="flex gap-4">
              <span>FPS: <span className="text-white">{fps}</span></span>
              <span className="hidden md:inline">PING: <span className="text-white">{ping}ms</span></span>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-neon-purple/30 p-2 rounded-lg text-white">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] text-neon-purple uppercase">Alive</span>
                 <span className="text-xl font-bold leading-none">{aliveCount}</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col">
                 <span className="text-[10px] text-neon-pink uppercase">Kills</span>
                 <span className="text-xl font-bold leading-none">{player.kills}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timer/Objective */}
        <div className="flex flex-col items-center">
           <div className="bg-black/60 backdrop-blur-lg border-b-2 border-neon-blue px-8 py-2 rounded-b-xl shadow-[0_0_20px_rgba(0,243,255,0.2)]">
             <div className="text-3xl font-bold text-white font-mono tracking-wider">
               {formatTime(timeRemaining)}
             </div>
           </div>
           {gameMode === 'gungame' && (
             <div className="mt-2 bg-black/60 px-4 py-1 rounded-full border border-yellow-500 text-yellow-400 text-xs font-bold">
                WEAPON {player.weaponIdx + 1} / {GUN_GAME_ORDER.length}
             </div>
           )}
        </div>

        {/* Killfeed */}
        <div className="flex flex-col gap-1 items-end w-64 pt-2">
          {killFeed.map((msg, idx) => (
            <div key={idx} className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded animate-[pulse-fast_0.2s_ease-out] border-r-2 border-neon-pink shadow-lg">
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bars */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 md:scale-100 scale-90 origin-bottom-left">
        {/* Shield */}
        <div className="flex items-center gap-2">
           <div className="text-neon-blue font-bold w-8 text-right">{Math.ceil(player.shield)}</div>
           <div className="relative w-48 md:w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"
                style={{ width: `${shieldPercent}%`, transition: 'width 0.2s' }}
              />
           </div>
        </div>
        {/* Health */}
        <div className="flex items-center gap-2">
           <div className="text-red-500 font-bold w-8 text-right">{Math.ceil(player.health)}</div>
           <div className="relative w-48 md:w-64 h-4 bg-gray-800 rounded skew-x-12 border border-white/10 overflow-hidden">
             <div 
               className="absolute h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(255,0,0,0.5)]"
               style={{ width: `${hpPercent}%`, transition: 'width 0.2s' }}
             />
           </div>
        </div>
        
        <div className="mt-2 text-neon-pink font-mono text-sm flex items-center gap-2">
          <span>CREDITS:</span>
          <span className="text-white font-bold">${currency}</span>
        </div>
      </div>

      {/* Weapon Info */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2 md:scale-100 scale-90 origin-bottom-right">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{player.currentWeapon.name}</h2>
          <div className="text-neon-blue text-xs tracking-[0.2em]">{player.currentWeapon.automatic ? 'AUTOMATIC' : 'SEMI-AUTO'}</div>
        </div>
        
        <div className="flex items-end gap-2">
          <div className={`text-6xl font-bold font-mono ${player.ammoInMag === 0 ? 'text-red-500' : 'text-white'}`}>
            {player.ammoInMag}
          </div>
          <div className="text-xl text-gray-400 font-mono mb-2">/ {player.reserveAmmo}</div>
        </div>

        {/* Reload Indicator */}
        {player.reloading && (
          <div className="relative w-32 h-2 bg-gray-700 rounded mt-2">
             <div 
               className="absolute left-0 top-0 h-full bg-yellow-400 animate-pulse"
               style={{ width: `${(player.reloadTimer / player.currentWeapon.reloadTime) * 100}%` }}
             />
             <div className="absolute -top-6 right-0 text-yellow-400 font-bold text-sm">RELOADING...</div>
          </div>
        )}
        
        {!player.reloading && player.ammoInMag === 0 && (
           <div className="text-red-500 font-bold animate-pulse border border-red-500 px-2 rounded bg-red-500/20">
             PRESS R TO RELOAD
           </div>
        )}
      </div>

      {/* Hit Marker / Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-1 h-1 bg-neon-green rounded-full shadow-[0_0_5px_#0aff0a]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/40 rounded-full transition-transform duration-100" 
             style={{ transform: `translate(-50%, -50%) scale(${1 + (player.currentWeapon.spread * 5)})`}}
        />
      </div>
    </div>
  );
};

export default HUD;
