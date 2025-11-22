
import React, { useState } from 'react';
import { GameSettings } from '../../types';

interface LoginMenuProps {
  onLogin: (name: string) => void;
  settings: GameSettings;
}

const LoginMenu: React.FC<LoginMenuProps> = ({ onLogin, settings }) => {
  const [name, setName] = useState(settings.playerName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center font-display">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black" />
        <div className="grid grid-cols-[repeat(20,1fr)] h-full w-full opacity-20">
           {Array.from({ length: 200 }).map((_, i) => (
             <div key={i} className="border border-neon-blue/10" />
           ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        <h1 className="text-6xl font-black text-center mb-2 text-white tracking-tighter italic">
          NEON
          <span className="text-neon-blue block">WARFARE</span>
        </h1>
        <p className="text-center text-gray-400 mb-12 tracking-widest text-sm">TACTICAL SHOOTER SIMULATION</p>

        <form onSubmit={handleSubmit} className="space-y-6 backdrop-blur-md bg-white/5 p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
          <div>
            <label className="block text-xs font-bold text-neon-blue uppercase tracking-wider mb-2">Operative Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter codename..."
              className="w-full bg-black/50 border-2 border-white/20 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none transition-all text-lg text-center"
              maxLength={15}
            />
          </div>
          
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-neon-blue text-black font-bold py-4 rounded-lg hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
          >
            INITIALIZE SYSTEM
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-600">
          VER 2.5.0 // SYSTEM READY
        </div>
      </div>
    </div>
  );
};

export default LoginMenu;
