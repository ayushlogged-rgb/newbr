
import { Weapon, MapConfig, Skin, WeaponSkin } from './types';

export const SKINS: Record<string, Skin> = {
  default: { id: 'default', name: 'Recruit', price: 0, color: '#00f3ff', glowColor: '#00f3ff', type: 'rare' },
  crimson: { id: 'crimson', name: 'Crimson Guard', price: 500, color: '#ff0055', glowColor: '#ff0000', type: 'rare' },
  midas: { id: 'midas', name: 'Midas Touch', price: 1500, color: '#ffd700', glowColor: '#ffff00', type: 'epic' },
  void: { id: 'void', name: 'Void Walker', price: 2500, color: '#b026ff', glowColor: '#ff00ff', type: 'epic' },
  stealth: { id: 'stealth', name: 'Ghost Ops', price: 3000, color: '#1a1a1a', glowColor: '#ffffff', type: 'legendary' },
  neon_god: { id: 'neon_god', name: 'Neon God', price: 10000, color: '#0aff0a', glowColor: '#ccff00', type: 'legendary' },
  phantom: { id: 'phantom', name: 'Phantom', price: 5000, color: '#ffffff', glowColor: '#aaddff', type: 'legendary' },
  glitch_lord: { id: 'glitch_lord', name: 'Glitch Lord', price: 20000, color: '#ff00ff', glowColor: '#00ffff', type: 'mythic' },
};

export const WEAPON_SKINS: Record<string, WeaponSkin> = {
  default: { id: 'default', name: 'Factory Standard', price: 0, rarity: 'common', primaryColor: '#1f2937', detailColor: '#4b5563' },
  arctic: { id: 'arctic', name: 'Arctic Camo', price: 500, rarity: 'common', primaryColor: '#e5e7eb', detailColor: '#9ca3af' },
  gold: { id: 'gold', name: 'Gold Plated', price: 2000, rarity: 'epic', primaryColor: '#ffd700', detailColor: '#b45309', glowColor: '#f59e0b' },
  cyber: { id: 'cyber', name: 'Cyberframe', price: 1200, rarity: 'rare', primaryColor: '#111827', detailColor: '#00f3ff', glowColor: '#00f3ff' },
  magma: { id: 'magma', name: 'Magma Flow', price: 1800, rarity: 'epic', primaryColor: '#450a0a', detailColor: '#ef4444', glowColor: '#f87171' },
  matrix: { id: 'matrix', name: 'The Matrix', price: 2500, rarity: 'legendary', primaryColor: '#000000', detailColor: '#22c55e', glowColor: '#4ade80' },
  galaxy: { id: 'galaxy', name: 'Galaxy', price: 5000, rarity: 'legendary', primaryColor: '#1e1b4b', detailColor: '#c084fc', glowColor: '#e879f9' },
};

export const WEAPONS: Record<string, Weapon> = {
  pistol: {
    id: 'pistol', name: 'Viper Pistol', damage: 20, fireRate: 250, bulletSpeed: 15, spread: 0.02,
    magSize: 15, reserveAmmo: 999, reloadTime: 1000, color: '#fbbf24', automatic: false, price: 0, particles: 'standard'
  },
  magnum: {
    id: 'magnum', name: 'Deagle .50', damage: 45, fireRate: 400, bulletSpeed: 20, spread: 0.01,
    magSize: 7, reserveAmmo: 35, reloadTime: 1500, color: '#e5e7eb', automatic: false, price: 800, particles: 'standard'
  },
  smg: {
    id: 'smg', name: 'Vector SMG', damage: 12, fireRate: 60, bulletSpeed: 18, spread: 0.15,
    magSize: 40, reserveAmmo: 240, reloadTime: 1200, color: '#34d399', automatic: true, price: 1200, particles: 'standard'
  },
  rifle: {
    id: 'rifle', name: 'Pulse Rifle', damage: 25, fireRate: 150, bulletSpeed: 22, spread: 0.05,
    magSize: 30, reserveAmmo: 150, reloadTime: 2000, color: '#60a5fa', automatic: true, price: 2500, particles: 'plasma'
  },
  shotgun: {
    id: 'shotgun', name: 'Breacher', damage: 15, fireRate: 900, bulletSpeed: 18, spread: 0.3,
    magSize: 8, reserveAmmo: 40, reloadTime: 2500, color: '#f472b6', automatic: false, price: 2000, particles: 'fire'
  },
  sniper: {
    id: 'sniper', name: 'Railgun', damage: 105, fireRate: 1500, bulletSpeed: 45, spread: 0.001,
    magSize: 5, reserveAmmo: 20, reloadTime: 3000, color: '#c084fc', automatic: false, price: 4500, particles: 'laser'
  },
  minigun: {
    id: 'minigun', name: 'Obliterator', damage: 10, fireRate: 30, bulletSpeed: 20, spread: 0.2,
    magSize: 200, reserveAmmo: 600, reloadTime: 4000, color: '#ef4444', automatic: true, price: 6000, particles: 'fire'
  },
  laser: {
    id: 'laser', name: 'Photon Beam', damage: 35, fireRate: 200, bulletSpeed: 35, spread: 0,
    magSize: 20, reserveAmmo: 100, reloadTime: 1800, color: '#0aff0a', automatic: true, price: 3500, particles: 'plasma'
  }
};

export const GUN_GAME_ORDER = [
  'pistol', 'smg', 'shotgun', 'rifle', 'magnum', 'sniper', 'laser', 'minigun'
];

export const DIFFICULTY_SETTINGS = {
  easy: { reactionTime: 800, spreadMult: 2.0, strafeChance: 0.1 },
  medium: { reactionTime: 400, spreadMult: 1.0, strafeChance: 0.3 },
  hard: { reactionTime: 150, spreadMult: 0.5, strafeChance: 0.6 },
  expert: { reactionTime: 0, spreadMult: 0.2, strafeChance: 0.9 }
};

export const MAPS: Record<string, MapConfig> = {
  neon_city: {
    id: 'neon_city', name: 'Neon City', width: 3000, height: 3000,
    bgColor: '#050510', wallColor: '#00f3ff', gridColor: 'rgba(0, 243, 255, 0.1)',
    walls: [
      { x: 0, y: 0, w: 3000, h: 50 }, { x: 0, y: 0, w: 50, h: 3000 },
      { x: 2950, y: 0, w: 50, h: 3000 }, { x: 0, y: 2950, w: 3000, h: 50 },
      { x: 500, y: 500, w: 200, h: 200 }, { x: 1500, y: 1500, w: 300, h: 50 },
      { x: 1625, y: 1350, w: 50, h: 350 }, { x: 2200, y: 800, w: 400, h: 400 },
      { x: 800, y: 2000, w: 50, h: 600 }, { x: 600, y: 2300, w: 450, h: 50 }
    ],
    spawns: [{ x: 200, y: 200 }, { x: 2800, y: 2800 }, { x: 2800, y: 200 }, { x: 200, y: 2800 }]
  },
  titan_sector: {
    id: 'titan_sector', name: 'Titan Sector (Large)', width: 15000, height: 15000,
    bgColor: '#0a0505', wallColor: '#ff0000', gridColor: 'rgba(255, 0, 0, 0.05)',
    walls: [
      { x: 0, y: 0, w: 15000, h: 100 }, { x: 0, y: 0, w: 100, h: 15000 },
      { x: 14900, y: 0, w: 100, h: 15000 }, { x: 0, y: 14900, w: 15000, h: 100 },
      // Massive Central Structure
      { x: 7000, y: 7000, w: 1000, h: 1000 },
      // Scattered Outposts
      { x: 2000, y: 2000, w: 500, h: 500 }, { x: 12000, y: 2000, w: 500, h: 500 },
      { x: 2000, y: 12000, w: 500, h: 500 }, { x: 12000, y: 12000, w: 500, h: 500 },
      // Random Obstacles (Procedurally placed in spirit)
      { x: 5000, y: 3000, w: 200, h: 800 }, { x: 9000, y: 10000, w: 800, h: 200 }
    ],
    spawns: [{ x: 500, y: 500 }, { x: 14500, y: 14500 }, { x: 14500, y: 500 }, { x: 500, y: 14500 }]
  },
  factory_zero: {
    id: 'factory_zero', name: 'Factory Zero', width: 2000, height: 2000,
    bgColor: '#080808', wallColor: '#ffd700', gridColor: 'rgba(255, 215, 0, 0.1)',
    walls: [
      { x: 0, y: 0, w: 2000, h: 50 }, { x: 0, y: 0, w: 50, h: 2000 },
      { x: 1950, y: 0, w: 50, h: 2000 }, { x: 0, y: 1950, w: 2000, h: 50 },
      { x: 800, y: 800, w: 400, h: 400 }, { x: 200, y: 900, w: 300, h: 50 },
      { x: 1500, y: 900, w: 300, h: 50 }
    ],
    spawns: [{ x: 100, y: 1000 }, { x: 1900, y: 1000 }],
    bombSites: [{ x: 1000, y: 1000 }, { x: 1000, y: 500 }]
  },
  cyber_forest: {
    id: 'cyber_forest', name: 'Cyber Forest', width: 4000, height: 4000,
    bgColor: '#051005', wallColor: '#0aff0a', gridColor: 'rgba(10, 255, 10, 0.1)',
    walls: [
      { x: 0, y: 0, w: 4000, h: 50 }, { x: 0, y: 0, w: 50, h: 4000 },
      { x: 3950, y: 0, w: 50, h: 4000 }, { x: 0, y: 3950, w: 4000, h: 50 },
      { x: 400, y: 400, w: 100, h: 100 }, { x: 800, y: 800, w: 100, h: 100 },
      { x: 1200, y: 1200, w: 100, h: 100 }, { x: 2000, y: 2000, w: 200, h: 200 },
      { x: 3000, y: 500, w: 150, h: 150 }, { x: 500, y: 3000, w: 150, h: 150 }
    ],
    spawns: [{ x: 100, y: 100 }, { x: 3900, y: 3900 }]
  },
  martian_outpost: {
    id: 'martian_outpost', name: 'Martian Outpost', width: 2500, height: 2500,
    bgColor: '#1a0505', wallColor: '#ff4400', gridColor: 'rgba(255, 68, 0, 0.1)',
    walls: [
      { x: 0, y: 0, w: 2500, h: 50 }, { x: 0, y: 0, w: 50, h: 2500 },
      { x: 2450, y: 0, w: 50, h: 2500 }, { x: 0, y: 2450, w: 2500, h: 50 },
      { x: 1000, y: 1000, w: 500, h: 500 }, { x: 1100, y: 1100, w: 300, h: 300 }
    ],
    spawns: [{ x: 150, y: 150 }, { x: 2350, y: 2350 }]
  }
};

export const BOT_NAMES = [
  'X-77', 'NeonRider', 'Glitch', 'CyberPunk', 'Vortex', 'Zero', 'Pixel', 'Kilo',
  'Mega', 'Giga', 'Tera', 'Nano', 'Pico', 'Exo', 'Droid', 'Synth', 'Vector', 'Prime',
  'Omega', 'Alpha', 'Zeta', 'Sigma', 'Delta', 'Echo', 'Foxtrot', 'Tango'
];
