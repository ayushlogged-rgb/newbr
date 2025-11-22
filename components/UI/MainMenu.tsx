
import React, { useState } from 'react';
import { GameMode, MapType, GameSettings } from '../../types';
import { MAPS, SKINS, WEAPON_SKINS } from '../../constants';

interface MainMenuProps {
  onStart: (mode: GameMode, map: MapType) => void;
  settings: GameSettings;
  onUpdateSettings: (s: GameSettings) => void;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, settings, onUpdateSettings, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'loadout' | 'shop' | 'profile' | 'settings'>('play');
  const [selectedMode, setSelectedMode] = useState<GameMode>('battle');
  const [selectedMap, setSelectedMap] = useState<MapType>('neon_city');
  const [settingsCategory, setSettingsCategory] = useState<'graphics' | 'controls' | 'gameplay'>('graphics');
  const [shopCategory, setShopCategory] = useState<'character' | 'weapon'>('character');

  const MODES: { id: GameMode; label: string; desc: string }[] = [
    { id: 'battle', label: 'Battle Royale', desc: 'Be the last one standing. Zone shrinks.' },
    { id: 'deathmatch', label: 'Deathmatch', desc: 'Infinite respawns. First to 50 kills wins.' },
    { id: 'bomb_defuse', label: 'Bomb Defuse', desc: 'Tactical 5v5. Plant or Defuse.' },
    { id: 'survival', label: 'Zombie Survival', desc: 'Survive waves of AI enemies.' },
    { id: 'gungame', label: 'Gun Game', desc: 'Upgrade weapon on every kill.' },
  ];

  const buySkin = (skinId: string, type: 'character' | 'weapon') => {
    const skin = type === 'character' ? SKINS[skinId] : WEAPON_SKINS[skinId];
    const owned = type === 'character' ? settings.ownedSkins : settings.ownedWeaponSkins;
    
    if (settings.currency >= skin.price && !owned.includes(skinId)) {
      onUpdateSettings({
        ...settings,
        currency: settings.currency - skin.price,
        ownedSkins: type === 'character' ? [...settings.ownedSkins, skinId] : settings.ownedSkins,
        ownedWeaponSkins: type === 'weapon' ? [...settings.ownedWeaponSkins, skinId] : settings.ownedWeaponSkins
      });
    }
  };

  const equipSkin = (skinId: string, type: 'character' | 'weapon') => {
    const owned = type === 'character' ? settings.ownedSkins : settings.ownedWeaponSkins;
    if (owned.includes(skinId)) {
      onUpdateSettings({ 
        ...settings, 
        selectedSkin: type === 'character' ? skinId : settings.selectedSkin,
        selectedWeaponSkin: type === 'weapon' ? skinId : settings.selectedWeaponSkin
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center flex items-center justify-center font-display">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-7xl h-[90vh] bg-black/90 border border-neon-blue/30 rounded-2xl flex overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)]">
        
        {/* Sidebar */}
        <div className="w-64 bg-black/50 border-r border-white/10 p-6 flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-8 italic drop-shadow-lg leading-none">
            NEON<br/>WARFARE
          </h1>
          
          {['play', 'loadout', 'shop', 'profile', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`p-4 text-left uppercase tracking-widest font-bold transition-all duration-200 hover:pl-6 ${
                activeTab === tab 
                  ? 'text-neon-blue bg-neon-blue/10 border-l-4 border-neon-blue shadow-[inset_10px_0_20px_rgba(0,243,255,0.1)]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}

          <div className="mt-auto border-t border-white/10 pt-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-white font-bold truncate">{settings.playerName}</span>
                <button onClick={onLogout} className="text-red-500 text-xs hover:underline">LOGOUT</button>
             </div>
             <div className="text-xl text-yellow-400 font-bold font-mono flex items-center gap-2 bg-black/50 p-2 rounded">
                <span>$</span> {settings.currency.toLocaleString()}
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'play' && (
            <div className="space-y-8 animate-pulse-fast animation-once">
              <div>
                <h2 className="text-2xl text-white font-bold mb-4 tracking-widest border-b border-white/10 pb-2">SELECT MODE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-6 rounded-xl border text-left transition-all duration-300 ${
                        selectedMode === mode.id
                          ? 'bg-neon-purple/20 border-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)] scale-[1.02]'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-xl font-bold text-white mb-1">{mode.label}</div>
                      <div className="text-sm text-gray-400">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl text-white font-bold mb-4 tracking-widest border-b border-white/10 pb-2">SELECT MAP</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {Object.values(MAPS).map((map) => (
                    <button
                      key={map.id}
                      onClick={() => setSelectedMap(map.id as MapType)}
                      className={`min-w-[240px] h-40 rounded-lg border relative overflow-hidden group transition-all ${
                        selectedMap === map.id ? 'border-neon-green shadow-[0_0_15px_rgba(10,255,10,0.5)] scale-105' : 'border-white/10 hover:scale-105'
                      }`}
                    >
                      <div className={`absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity`} style={{ backgroundColor: map.bgColor }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="relative z-10 text-white font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase text-center px-2">
                           {map.name}
                           <span className="block text-xs font-normal mt-1 opacity-80">{map.width}x{map.height}m</span>
                         </span>
                      </div>
                      {map.id === 'titan_sector' && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">LARGE SCALE</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
                 <div className="text-white font-bold">DIFFICULTY</div>
                 <div className="flex gap-2">
                    {['easy', 'medium', 'hard', 'expert'].map((diff) => (
                       <button 
                         key={diff}
                         onClick={() => onUpdateSettings({...settings, difficulty: diff as any})}
                         className={`px-4 py-1 rounded uppercase text-xs font-bold transition-all ${
                           settings.difficulty === diff 
                             ? 'bg-neon-blue text-black' 
                             : 'bg-black text-gray-500 hover:bg-white/10'
                         }`}
                       >
                         {diff}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => onStart(selectedMode, selectedMap)}
                  className="px-16 py-6 bg-neon-blue text-black font-black text-2xl rounded skew-x-[-10deg] hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_#00f3ff]"
                >
                  DEPLOY
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="h-full flex flex-col animate-fadeIn">
               <div className="flex items-center gap-8 mb-12">
                  <div 
                    className="w-32 h-32 rounded-full border-4 border-neon-blue shadow-[0_0_30px_#00f3ff] bg-gray-800 flex items-center justify-center text-4xl"
                  >
                    {settings.playerName.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-4xl font-bold text-white mb-2">{settings.playerName}</h2>
                     <div className="text-neon-purple font-mono">LVL {Math.floor(settings.stats.gamesPlayed / 5) + 1} OPERATIVE</div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                     <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Kills / Deaths</div>
                     <div className="text-3xl font-mono text-white">
                        {settings.stats.kills} <span className="text-gray-600">/</span> {settings.stats.deaths}
                        <span className="text-sm ml-2 text-neon-green">
                           KD: {(settings.stats.kills / (settings.stats.deaths || 1)).toFixed(2)}
                        </span>
                     </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                     <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Win Rate</div>
                     <div className="text-3xl font-mono text-white">
                        {settings.stats.wins} <span className="text-gray-600">/</span> {settings.stats.gamesPlayed}
                        <span className="text-sm ml-2 text-neon-pink">
                           {((settings.stats.wins / (settings.stats.gamesPlayed || 1)) * 100).toFixed(1)}%
                        </span>
                     </div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 col-span-2">
                     <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Total Damage Dealt</div>
                     <div className="text-3xl font-mono text-yellow-400">
                        {settings.stats.damageDealt.toLocaleString()}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-4 mb-6 border-b border-white/10 pb-1">
                {['graphics', 'controls', 'gameplay'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSettingsCategory(cat as any)}
                    className={`px-4 py-2 uppercase font-bold text-sm transition-all ${
                      settingsCategory === cat ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-6 text-white overflow-y-auto pr-4 h-full pb-20">
                {settingsCategory === 'graphics' && (
                  <>
                     <div className="setting-row">
                        <label>Quality Preset</label>
                        <select 
                           value={settings.graphicsQuality}
                           onChange={(e) => onUpdateSettings({...settings, graphicsQuality: e.target.value as any})}
                           className="input-dark"
                        >
                          <option value="low">Low (Performance)</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="ultra">Ultra (Best Visuals)</option>
                        </select>
                     </div>
                     <div className="setting-row">
                        <label>FPS Limit</label>
                        <select 
                           value={settings.fpsLimit}
                           onChange={(e) => onUpdateSettings({...settings, fpsLimit: parseInt(e.target.value)})}
                           className="input-dark"
                        >
                          <option value={0}>Unlimited</option>
                          <option value={30}>30 FPS</option>
                          <option value={60}>60 FPS</option>
                          <option value={144}>144 FPS</option>
                        </select>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded">
                        <span>Show FPS Counter</span>
                        <input type="checkbox" checked={settings.showFps} onChange={(e) => onUpdateSettings({...settings, showFps: e.target.checked})} className="toggle-checkbox"/>
                     </div>
                  </>
                )}

                {settingsCategory === 'controls' && (
                  <>
                    <div className="setting-row">
                      <label>Input Method</label>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => onUpdateSettings({...settings, controlType: 'keyboard'})}
                          className={`flex-1 py-3 rounded border ${settings.controlType === 'keyboard' ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'bg-black/40 border-white/10'}`}
                        >
                          Keyboard & Mouse
                        </button>
                        <button 
                          onClick={() => onUpdateSettings({...settings, controlType: 'touch'})}
                          className={`flex-1 py-3 rounded border ${settings.controlType === 'touch' ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' : 'bg-black/40 border-white/10'}`}
                        >
                          Touch (Mobile)
                        </button>
                      </div>
                    </div>
                    
                    <div className="setting-row">
                      <label>Sensitivity</label>
                      <input 
                        type="range" min="0.1" max="5.0" step="0.1"
                        value={settings.sensitivity}
                        onChange={(e) => onUpdateSettings({...settings, sensitivity: parseFloat(e.target.value)})}
                        className="slider"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded">
                        <span>Auto-Shoot (Mobile)</span>
                        <input type="checkbox" checked={settings.autoShoot} onChange={(e) => onUpdateSettings({...settings, autoShoot: e.target.checked})} className="toggle-checkbox"/>
                     </div>
                  </>
                )}
                 {settingsCategory === 'gameplay' && (
                  <>
                    <div className="setting-row">
                      <label>HUD Scale</label>
                      <input 
                        type="range" min="0.5" max="1.5" step="0.1"
                        value={settings.hudScale}
                        onChange={(e) => onUpdateSettings({...settings, hudScale: parseFloat(e.target.value)})}
                        className="slider"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'shop' || activeTab === 'loadout') && (
            <div>
              <div className="flex gap-4 mb-6">
                 <button 
                   onClick={() => setShopCategory('character')}
                   className={`px-6 py-2 rounded-full font-bold uppercase ${shopCategory === 'character' ? 'bg-neon-pink text-white' : 'bg-white/10 text-gray-400'}`}
                 >
                   Character Skins
                 </button>
                 <button 
                   onClick={() => setShopCategory('weapon')}
                   className={`px-6 py-2 rounded-full font-bold uppercase ${shopCategory === 'weapon' ? 'bg-neon-blue text-black' : 'bg-white/10 text-gray-400'}`}
                 >
                   Weapon Skins
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {shopCategory === 'character' ? (
                  Object.values(SKINS).map(skin => {
                    const owned = settings.ownedSkins.includes(skin.id);
                    const equipped = settings.selectedSkin === skin.id;
                    
                    return (
                      <div key={skin.id} className={`bg-black/40 border rounded-xl p-4 flex flex-col items-center gap-4 transition-all ${equipped ? 'border-neon-green shadow-[0_0_15px_rgba(10,255,10,0.3)]' : 'border-white/10'}`}>
                        <div 
                          className="w-24 h-24 rounded-full border-4 shadow-[0_0_20px_currentColor]"
                          style={{ backgroundColor: skin.color, borderColor: skin.glowColor, color: skin.glowColor }} 
                        />
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{skin.name}</div>
                          <div className={`text-xs uppercase font-bold ${skin.type === 'legendary' || skin.type === 'mythic' ? 'text-yellow-400' : skin.type === 'epic' ? 'text-purple-400' : 'text-blue-400'}`}>
                            {skin.type}
                          </div>
                        </div>
                        
                        <div className="mt-auto w-full">
                          {owned ? (
                            <button 
                              onClick={() => equipSkin(skin.id, 'character')}
                              className={`w-full py-2 rounded font-bold uppercase ${equipped ? 'bg-neon-green text-black cursor-default' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                              {equipped ? 'Equipped' : 'Equip'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => buySkin(skin.id, 'character')}
                              className={`w-full py-2 rounded font-bold uppercase flex items-center justify-center gap-2 ${settings.currency >= skin.price ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            >
                              <span>Buy</span>
                              <span>${skin.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  Object.values(WEAPON_SKINS).map(skin => {
                    const owned = settings.ownedWeaponSkins.includes(skin.id);
                    const equipped = settings.selectedWeaponSkin === skin.id;
                    
                    return (
                      <div key={skin.id} className={`bg-black/40 border rounded-xl p-4 flex flex-col items-center gap-4 transition-all ${equipped ? 'border-neon-green shadow-[0_0_15px_rgba(10,255,10,0.3)]' : 'border-white/10'}`}>
                        <div className="w-32 h-24 flex items-center justify-center relative">
                          <div className="w-24 h-8 rounded relative" style={{ backgroundColor: skin.primaryColor }}>
                             <div className="absolute top-1 left-4 right-2 h-2" style={{ backgroundColor: skin.detailColor }}></div>
                             {skin.glowColor && <div className="absolute inset-0 shadow-[0_0_15px_currentColor]" style={{ color: skin.glowColor }}></div>}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{skin.name}</div>
                          <div className={`text-xs uppercase font-bold ${skin.rarity === 'legendary' ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {skin.rarity}
                          </div>
                        </div>
                        
                        <div className="mt-auto w-full">
                          {owned ? (
                            <button 
                              onClick={() => equipSkin(skin.id, 'weapon')}
                              className={`w-full py-2 rounded font-bold uppercase ${equipped ? 'bg-neon-green text-black cursor-default' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            >
                              {equipped ? 'Equipped' : 'Equip'}
                            </button>
                          ) : (
                            <button 
                              onClick={() => buySkin(skin.id, 'weapon')}
                              className={`w-full py-2 rounded font-bold uppercase flex items-center justify-center gap-2 ${settings.currency >= skin.price ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            >
                              <span>Buy</span>
                              <span>${skin.price}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
