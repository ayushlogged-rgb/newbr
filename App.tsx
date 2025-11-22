
import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/UI/MainMenu';
import LoginMenu from './components/UI/LoginMenu';
import HUD from './components/UI/HUD';
import MobileControls from './components/UI/MobileControls';
import { GameMode, MapType, GameSettings, Player } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'menu' | 'game'>('login');
  const [gameConfig, setGameConfig] = useState<{mode: GameMode, map: MapType}>({ mode: 'battle', map: 'neon_city' });
  
  // Persistent Settings State
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('neon_warfare_settings_v2');
    if (saved) return JSON.parse(saved);
    
    return {
      graphicsQuality: 'medium',
      fpsLimit: 60,
      resolutionScale: 1,
      showParticles: true,
      showShadows: true,
      volumeMaster: 1.0,
      volumeSfx: 0.8,
      volumeMusic: 0.5,
      controlType: 'keyboard',
      sensitivity: 1.5,
      mobileSensitivity: 1.0,
      autoShoot: false,
      showFps: true,
      showPing: true,
      hudScale: 1.0,
      playerName: '',
      selectedSkin: 'default',
      selectedWeaponSkin: 'default',
      ownedSkins: ['default'],
      ownedWeaponSkins: ['default'],
      currency: 1000,
      difficulty: 'medium',
      stats: {
        kills: 0,
        deaths: 0,
        wins: 0,
        gamesPlayed: 0,
        damageDealt: 0
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('neon_warfare_settings_v2', JSON.stringify(settings));
  }, [settings]);

  // Initialize view based on saved player name
  useEffect(() => {
    if (settings.playerName) {
      setView('menu');
    }
  }, []);

  const [hudState, setHudState] = useState<{
    player: Player | null,
    fps: number,
    aliveCount: number,
    timeRemaining: number,
    killFeed: string[],
    currency: number
  }>({
    player: null, fps: 0, aliveCount: 0, timeRemaining: 0, killFeed: [], currency: 0
  });

  const handleLogin = (name: string) => {
    setSettings(prev => ({ ...prev, playerName: name }));
    setView('menu');
  };

  const handleStartGame = (mode: GameMode, map: MapType) => {
    setGameConfig({ mode, map });
    setView('game');
  };

  const handleGameEnd = (result: { winner?: boolean }) => {
    // Update Stats
    setSettings(prev => ({
      ...prev,
      currency: prev.currency + (hudState.currency || 0),
      stats: {
        ...prev.stats,
        gamesPlayed: prev.stats.gamesPlayed + 1,
        kills: prev.stats.kills + (hudState.player?.kills || 0),
        deaths: prev.stats.deaths + (hudState.player?.health && hudState.player.health <= 0 ? 1 : 0),
        wins: prev.stats.wins + (result.winner ? 1 : 0)
      }
    }));
    setView('menu');
  };

  const exitGame = () => {
    handleGameEnd({});
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black text-white font-display select-none">
      {view === 'login' && (
        <LoginMenu onLogin={handleLogin} settings={settings} />
      )}

      {view === 'menu' && (
        <MainMenu 
          onStart={handleStartGame} 
          settings={settings}
          onUpdateSettings={setSettings}
          onLogout={() => {
             setSettings(s => ({...s, playerName: ''}));
             setView('login');
          }}
        />
      )}

      {view === 'game' && (
        <div className="relative w-full h-full">
          <GameCanvas 
            mode={gameConfig.mode}
            mapId={gameConfig.map}
            settings={settings}
            onGameEnd={handleGameEnd}
            updateHUD={setHudState}
          />
          
          {/* Only show HUD if player is alive or we want spectator stats */}
          {hudState.player && hudState.player.health > 0 && (
            <HUD 
              player={hudState.player}
              gameMode={gameConfig.mode}
              fps={hudState.fps}
              ping={hudState.player.ping}
              aliveCount={hudState.aliveCount}
              timeRemaining={hudState.timeRemaining}
              killFeed={hudState.killFeed}
              currency={hudState.currency}
            />
          )}

          {settings.controlType === 'touch' && hudState.player && hudState.player.health > 0 && (
            <MobileControls 
              onMove={(x, y) => (window as any).mobileMove?.(x, y)}
              onLook={(x, y, f) => (window as any).mobileLook?.(x, y, f)}
              onAction={(a) => (window as any).mobileAction?.(a)}
              autoShoot={settings.autoShoot}
            />
          )}

          {/* Pause/Exit Overlay - Always available */}
          <div className="absolute top-4 right-4 z-[60] flex gap-2">
            <button 
              onClick={exitGame}
              className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded backdrop-blur-sm border border-red-400 font-bold text-sm pointer-events-auto shadow-lg"
            >
              EXIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
