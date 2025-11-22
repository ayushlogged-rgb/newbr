
export type GameMode = 'battle' | 'deathmatch' | 'survival' | 'king' | 'gungame' | 'bomb_defuse';
export type MapType = 'neon_city' | 'cyber_forest' | 'martian_outpost' | 'titan_sector' | 'factory_zero';
export type ControlType = 'keyboard' | 'touch';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  angle: number;
  active: boolean;
}

export interface Skin {
  id: string;
  name: string;
  price: number;
  color: string;
  glowColor: string;
  type: 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface WeaponSkin {
  id: string;
  name: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  primaryColor: string;
  detailColor: string;
  glowColor?: string;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  bulletSpeed: number;
  spread: number;
  magSize: number;
  reserveAmmo: number;
  reloadTime: number;
  color: string;
  automatic: boolean;
  price: number;
  particles?: 'standard' | 'plasma' | 'fire' | 'laser';
}

export interface Player extends Entity {
  name: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  currentWeapon: Weapon;
  weaponIdx: number;
  ammoInMag: number;
  reserveAmmo: number;
  kills: number;
  deaths: number;
  isBot: boolean;
  ping: number;
  targetX?: number;
  targetY?: number;
  skinId: string;
  weaponSkinId: string;
  reloading: boolean;
  reloadTimer: number;
  lastShot: number;
  // AI Specific
  aiState: 'idle' | 'chase' | 'attack' | 'flee';
  aiReactionTimer: number;
  aiStrafeDir: number;
}

export interface Bullet extends Entity {
  ownerId: string;
  vx: number;
  vy: number;
  damage: number;
  life: number;
  trail: Vector2[];
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
  decay: number;
}

export interface Pickup extends Entity {
  type: 'health' | 'ammo' | 'shield' | 'weapon';
  value: number;
  weaponId?: string;
  symbol: string;
}

export interface MapConfig {
  id: MapType;
  name: string;
  width: number;
  height: number;
  walls: { x: number; y: number; w: number; h: number }[];
  spawns: Vector2[];
  bgColor: string;
  wallColor: string;
  gridColor: string;
  bombSites?: Vector2[]; // For bomb defuse
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  wins: number;
  gamesPlayed: number;
  damageDealt: number;
}

export interface GameSettings {
  // Graphics
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  fpsLimit: number;
  resolutionScale: number;
  showParticles: boolean;
  showShadows: boolean;
  
  // Audio
  volumeMaster: number;
  volumeSfx: number;
  volumeMusic: number;
  
  // Controls
  controlType: ControlType;
  sensitivity: number;
  mobileSensitivity: number;
  autoShoot: boolean;
  
  // Gameplay
  difficulty: Difficulty;

  // UI
  showFps: boolean;
  showPing: boolean;
  hudScale: number;
  
  // Account
  playerName: string;
  selectedSkin: string;
  selectedWeaponSkin: string;
  ownedSkins: string[];
  ownedWeaponSkins: string[];
  currency: number;
  stats: PlayerStats;
}
