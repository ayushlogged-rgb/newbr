
import React, { useEffect, useRef, useState } from 'react';
import { Player, Weapon, Bullet, Particle, Pickup, GameMode, GameSettings, Entity, Skin } from '../types';
import { WEAPONS, MAPS, BOT_NAMES, SKINS, GUN_GAME_ORDER, WEAPON_SKINS, DIFFICULTY_SETTINGS } from '../constants';

interface GameCanvasProps {
  mode: GameMode;
  mapId: string;
  settings: GameSettings;
  onGameEnd: (result: any) => void;
  updateHUD: (data: any) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ mode, mapId, settings, onGameEnd, updateHUD }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // React State for UI Overlays (Spectator)
  const [spectatorMode, setSpectatorMode] = useState<{active: boolean, targetId: string | null}>({ active: false, targetId: null });
  const [spectatorTargetName, setSpectatorTargetName] = useState("");

  // Game State
  const gameState = useRef({
    players: [] as Player[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    pickups: [] as Pickup[],
    camera: { x: 0, y: 0 },
    keys: {} as Record<string, boolean>,
    mouse: { x: 0, y: 0, down: false },
    touchMove: { x: 0, y: 0 },
    touchLook: { x: 0, y: 0, firing: false },
    lastTime: 0,
    map: MAPS[mapId],
    gameTime: mode === 'deathmatch' ? 600 : 300,
    safeZone: { x: 0, y: 0, radius: 2000, active: mode === 'battle' },
    frameCount: 0,
    lastFpsTime: 0,
    fps: 0,
    currency: 0,
    killFeed: [] as string[],
    difficulty: DIFFICULTY_SETTINGS[settings.difficulty || 'medium'],
    bombPlanted: false,
    bombTimer: 0,
    bombPosition: {x: 0, y: 0},
    roundOver: false
  });

  // Spectator controls
  const cycleSpectator = (direction: 1 | -1) => {
    const state = gameState.current;
    const alivePlayers = state.players.filter(p => p.health > 0);
    if (alivePlayers.length === 0) return;

    const currentIndex = alivePlayers.findIndex(p => p.id === spectatorMode.targetId);
    let nextIndex = currentIndex + direction;
    
    if (nextIndex >= alivePlayers.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = alivePlayers.length - 1;

    const nextPlayer = alivePlayers[nextIndex];
    setSpectatorMode({ active: true, targetId: nextPlayer.id });
    setSpectatorTargetName(nextPlayer.name);
  };

  // Initialize Game
  useEffect(() => {
    try {
      const state = gameState.current;
      state.map = MAPS[mapId];
      
      // Handle large map safe zone size
      state.safeZone = { 
        x: state.map.width / 2, 
        y: state.map.height / 2, 
        radius: state.map.width * 0.8, 
        active: mode === 'battle' || mode === 'battle' 
      };

      // Reset State
      state.gameTime = mode === 'deathmatch' ? 600 : 300;
      state.bombPlanted = false;
      state.roundOver = false;
      state.currency = 0;
      state.killFeed = [];

      // Player Init
      const spawn = state.map.spawns[Math.floor(Math.random() * state.map.spawns.length)];
      const startWeaponId = mode === 'gungame' ? GUN_GAME_ORDER[0] : 'pistol';

      const localPlayer: Player = {
        id: 'local',
        name: settings.playerName,
        x: spawn.x,
        y: spawn.y,
        radius: 22,
        color: '#00f3ff',
        angle: 0,
        health: 100,
        maxHealth: 100,
        shield: 0,
        maxShield: 100,
        currentWeapon: { ...WEAPONS[startWeaponId] },
        weaponIdx: 0,
        ammoInMag: WEAPONS[startWeaponId].magSize,
        reserveAmmo: WEAPONS[startWeaponId].reserveAmmo,
        kills: 0,
        deaths: 0,
        active: true,
        isBot: false,
        ping: Math.floor(Math.random() * 20) + 10,
        skinId: settings.selectedSkin,
        weaponSkinId: settings.selectedWeaponSkin,
        reloading: false,
        reloadTimer: 0,
        lastShot: 0,
        aiState: 'idle',
        aiReactionTimer: 0,
        aiStrafeDir: 1
      };

      // Bot Spawn Logic
      const botCount = mapId === 'titan_sector' ? 40 : (settings.controlType === 'touch' ? 8 : 15);
      const bots: Player[] = Array.from({ length: botCount }).map((_, i) => ({
        id: `bot_${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        x: Math.random() * state.map.width,
        y: Math.random() * state.map.height,
        radius: 22,
        color: '#ff00ff',
        angle: 0,
        health: 100,
        maxHealth: 100,
        shield: 0,
        maxShield: 100,
        currentWeapon: mode === 'gungame' ? { ...WEAPONS[GUN_GAME_ORDER[0]] } : { ...WEAPONS['smg'] },
        weaponIdx: 0,
        ammoInMag: 100,
        reserveAmmo: 1000,
        kills: 0,
        deaths: 0,
        active: true,
        isBot: true,
        ping: 0,
        targetX: Math.random() * state.map.width,
        targetY: Math.random() * state.map.height,
        skinId: Object.keys(SKINS)[Math.floor(Math.random() * Object.keys(SKINS).length)],
        weaponSkinId: Math.random() > 0.5 ? 'default' : Object.keys(WEAPON_SKINS)[Math.floor(Math.random() * Object.keys(WEAPON_SKINS).length)],
        reloading: false,
        reloadTimer: 0,
        lastShot: 0,
        aiState: 'idle',
        aiReactionTimer: 0,
        aiStrafeDir: Math.random() > 0.5 ? 1 : -1
      }));

      state.players = [localPlayer, ...bots];
      state.bullets = [];
      state.particles = [];
      state.pickups = [];

      // Initial Pickups (Scale with map size)
      if (mode !== 'gungame') {
        const pickupCount = mapId === 'titan_sector' ? 500 : 30;
        for(let i=0; i<pickupCount; i++) {
          spawnRandomPickup(state.map.width, state.map.height);
        }
      }

      state.lastTime = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);

      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    } catch (error) {
      console.error("Critical Game Init Error:", error);
    }
  }, [mode, mapId, settings]);

  // Input Listeners (PC)
  useEffect(() => {
    if (settings.controlType === 'touch') return;

    const handleKeyDown = (e: KeyboardEvent) => { 
      gameState.current.keys[e.code] = true; 
      if (e.code === 'KeyR') startReload(gameState.current.players[0]);
      if (e.code === 'ArrowRight' && spectatorMode.active) cycleSpectator(1);
      if (e.code === 'ArrowLeft' && spectatorMode.active) cycleSpectator(-1);
    };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.code] = false; };
    const handleMouseMove = (e: MouseEvent) => {
      gameState.current.mouse.x = e.clientX;
      gameState.current.mouse.y = e.clientY;
    };
    const handleMouseDown = () => { gameState.current.mouse.down = true; };
    const handleMouseUp = () => { gameState.current.mouse.down = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [settings.controlType, spectatorMode.active]);

  (window as any).mobileMove = (x: number, y: number) => { gameState.current.touchMove = {x, y} };
  (window as any).mobileLook = (x: number, y: number, firing: boolean) => { gameState.current.touchLook = {x, y, firing} };
  (window as any).mobileAction = (action: string) => { 
     if (action === 'reload') startReload(gameState.current.players[0]);
     if (action === 'spectate_next' && spectatorMode.active) cycleSpectator(1);
  };

  const startReload = (p: Player) => {
    if (p.reloading || p.ammoInMag === p.currentWeapon.magSize || p.reserveAmmo <= 0) return;
    p.reloading = true;
    p.reloadTimer = 0;
  };

  const spawnRandomPickup = (w: number, h: number) => {
    const state = gameState.current;
    const type = Math.random();
    let pickup: Pickup = {
      id: Math.random().toString(),
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 15,
      color: '#fff',
      angle: 0,
      active: true,
      type: 'ammo',
      value: 0,
      symbol: ''
    };

    if (type < 0.4) {
      pickup.type = 'health';
      pickup.value = 25;
      pickup.color = '#ef4444';
      pickup.symbol = '+';
    } else if (type < 0.7) {
      pickup.type = 'ammo';
      pickup.value = 50;
      pickup.color = '#eab308';
      pickup.symbol = '⚡';
    } else {
      pickup.type = 'shield';
      pickup.value = 25;
      pickup.color = '#3b82f6';
      pickup.symbol = '🛡';
    }
    state.pickups.push(pickup);
  };

  const spawnParticle = (x: number, y: number, color: string, count: number, type: 'explosion' | 'blood' | 'spark' = 'spark') => {
    if (!settings.showParticles) return;
    const state = gameState.current;
    // Cull distant particles
    if (Math.abs(x - state.camera.x) > 2000 || Math.abs(y - state.camera.y) > 2000) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (type === 'blood' ? 50 : 200);
      state.particles.push({
        id: Math.random().toString(),
        x, y, radius: Math.random() * 3 + 1, color, angle: 0, active: true,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        alpha: 1,
        size: type === 'explosion' ? Math.random() * 5 + 2 : Math.random() * 2 + 1,
        decay: Math.random() * 2 + 1
      });
    }
  };

  const checkCollision = (e: Entity, walls: any[]) => {
    for (let w of walls) {
      // Optimization: Only check nearby walls
      if (Math.abs(w.x - e.x) > 200 && Math.abs(w.y - e.y) > 200 && w.w < 1000 && w.h < 1000) continue;
      
      if (e.x + e.radius > w.x && e.x - e.radius < w.x + w.w &&
          e.y + e.radius > w.y && e.y - e.radius < w.y + w.h) {
        return true;
      }
    }
    return false;
  };

  // ---------------------------------------------
  // CORE GAME LOOP
  // ---------------------------------------------
  const gameLoop = (time: number) => {
    const state = gameState.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Handle resize
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let dt = (time - state.lastTime) / 1000;
    state.lastTime = time;
    if (dt > 0.1) dt = 0.1;

    // FPS
    state.frameCount++;
    if (time - state.lastFpsTime >= 1000) {
      state.fps = state.frameCount;
      state.frameCount = 0;
      state.lastFpsTime = time;
    }

    const localPlayer = state.players[0];
    const map = state.map;

    // 1. UPDATE LOGIC
    if (!state.roundOver) {
      state.gameTime -= dt;
    }

    // Safe Zone (Scale speed with map size)
    if (state.safeZone.active) {
      const shrinkSpeed = mapId === 'titan_sector' ? 10 : 30;
      state.safeZone.radius -= shrinkSpeed * dt;
      if (state.safeZone.radius < 0) state.safeZone.radius = 0;
      
      state.players.forEach(p => {
        if (p.health <= 0) return;
        const dist = Math.hypot(p.x - state.safeZone.x, p.y - state.safeZone.y);
        if (dist > state.safeZone.radius) p.health -= 5 * dt;
      });
    }

    // Local Player Logic
    if (localPlayer.health > 0) {
      let dx = 0, dy = 0;
      const speed = 350;

      if (settings.controlType === 'keyboard') {
        if (state.keys['KeyW']) dy -= 1;
        if (state.keys['KeyS']) dy += 1;
        if (state.keys['KeyA']) dx -= 1;
        if (state.keys['KeyD']) dx += 1;
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        localPlayer.angle = Math.atan2(state.mouse.y - cy, state.mouse.x - cx);
      } else {
        dx = state.touchMove.x;
        dy = state.touchMove.y;
        if (state.touchLook.x !== 0 || state.touchLook.y !== 0) {
           localPlayer.angle = Math.atan2(state.touchLook.y, state.touchLook.x);
        }
      }

      if (dx !== 0 || dy !== 0) {
        if (settings.controlType === 'keyboard') {
          const len = Math.sqrt(dx*dx + dy*dy);
          if (len > 0) { dx /= len; dy /= len; }
        }
        
        const nextX = localPlayer.x + dx * speed * dt;
        const nextY = localPlayer.y + dy * speed * dt;

        if (!checkCollision({ ...localPlayer, x: nextX }, map.walls)) localPlayer.x = nextX;
        if (!checkCollision({ ...localPlayer, y: nextY }, map.walls)) localPlayer.y = nextY;
      }

      // Map Bounds
      localPlayer.x = Math.max(20, Math.min(map.width - 20, localPlayer.x));
      localPlayer.y = Math.max(20, Math.min(map.height - 20, localPlayer.y));

      // Reload
      if (localPlayer.reloading) {
        localPlayer.reloadTimer += dt * 1000;
        if (localPlayer.reloadTimer >= localPlayer.currentWeapon.reloadTime) {
           const needed = localPlayer.currentWeapon.magSize - localPlayer.ammoInMag;
           const amount = Math.min(needed, localPlayer.reserveAmmo);
           localPlayer.ammoInMag += amount;
           localPlayer.reserveAmmo -= amount;
           localPlayer.reloading = false;
           localPlayer.reloadTimer = 0;
        }
      }

      // Shooting
      const isFiring = settings.controlType === 'keyboard' ? state.mouse.down : state.touchLook.firing;
      if (isFiring && !localPlayer.reloading) {
        const now = Date.now();
        if (now - localPlayer.lastShot > localPlayer.currentWeapon.fireRate) {
           if (localPlayer.ammoInMag > 0) {
             localPlayer.ammoInMag--;
             localPlayer.lastShot = now;
             const spread = (Math.random() - 0.5) * localPlayer.currentWeapon.spread;
             const angle = localPlayer.angle + spread;
             const bx = Math.cos(angle);
             const by = Math.sin(angle);
             
             state.bullets.push({
               id: Math.random().toString(),
               ownerId: localPlayer.id,
               x: localPlayer.x + bx * 30,
               y: localPlayer.y + by * 30,
               radius: 4,
               color: localPlayer.currentWeapon.color,
               angle: angle,
               vx: bx * localPlayer.currentWeapon.bulletSpeed * 60,
               vy: by * localPlayer.currentWeapon.bulletSpeed * 60,
               damage: localPlayer.currentWeapon.damage,
               life: 2.0,
               active: true,
               trail: []
             });
           } else {
             startReload(localPlayer);
           }
        }
      }
    } else if (!spectatorMode.active) {
      // Player died, enable spectator
      const killer = state.players.find(p => p.health > 0 && p.id !== 'local');
      const targetId = killer ? killer.id : state.players.find(p => p.health > 0)?.id || null;
      setSpectatorMode({ active: true, targetId });
    }

    // Bot Logic (Improved AI)
    state.players.forEach(p => {
      if (p.id === 'local' || p.health <= 0) return;
      
      // Determine target (closest active player)
      let target = localPlayer.health > 0 ? localPlayer : null;
      let minD = Infinity;
      
      if (!target || Math.random() < 0.2) {
         state.players.forEach(other => {
           if (other.id !== p.id && other.health > 0) {
             const d = Math.hypot(p.x - other.x, p.y - other.y);
             if (d < minD && d < 1000) { // Vision range
               minD = d;
               target = other;
             }
           }
         });
      }

      if (target) {
        p.aiState = 'chase';
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        let angle = Math.atan2(dy, dx);

        // Difficulty: Reaction Time
        if (p.aiReactionTimer > 0) {
           p.aiReactionTimer -= dt * 1000;
        } else {
           // Attack logic
           if (dist < 400) {
             // Strafe
             if (Math.random() < 0.05) p.aiStrafeDir *= -1;
             const strafeAngle = angle + (Math.PI / 2 * p.aiStrafeDir);
             p.x += Math.cos(strafeAngle) * 150 * dt;
             p.y += Math.sin(strafeAngle) * 150 * dt;
           } else {
             p.x += Math.cos(angle) * 280 * dt;
             p.y += Math.sin(angle) * 280 * dt;
           }
           
           p.angle = angle;

           // Shooting
           const now = Date.now();
           if (now - p.lastShot > p.currentWeapon.fireRate + state.difficulty.reactionTime) {
              // Aim Error based on difficulty
              const error = (Math.random() - 0.5) * state.difficulty.spreadMult;
              p.angle += error;

              state.bullets.push({
                 id: Math.random().toString(),
                 ownerId: p.id,
                 x: p.x, y: p.y, radius: 4, color: p.color, angle: p.angle,
                 vx: Math.cos(p.angle) * 800, vy: Math.sin(p.angle) * 800,
                 damage: 10, life: 2.0, active: true, trail: []
              });
              p.lastShot = now;
           }
        }
      } else {
        // Wander
        if (Math.random() < 0.01) {
           p.targetX = Math.random() * map.width;
           p.targetY = Math.random() * map.height;
        }
        if (p.targetX) {
           const angle = Math.atan2(p.targetY! - p.y, p.targetX! - p.x);
           p.x += Math.cos(angle) * 100 * dt;
           p.y += Math.sin(angle) * 100 * dt;
           p.angle = angle;
        }
      }
    });

    // Bullets & Collision
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      
      if (settings.graphicsQuality !== 'low') {
        b.trail.push({x: b.x, y: b.y});
        if (b.trail.length > 5) b.trail.shift();
      }

      if (b.life <= 0 || checkCollision(b, map.walls)) {
        b.active = false;
        spawnParticle(b.x, b.y, '#ffff00', 5, 'spark');
      }

      if (b.active) {
        for (let p of state.players) {
           if (p.id !== b.ownerId && p.health > 0) {
             if (Math.hypot(b.x - p.x, b.y - p.y) < p.radius + b.radius) {
               let damage = b.damage;
               if (p.shield > 0) {
                 const shieldDmg = Math.min(p.shield, damage);
                 p.shield -= shieldDmg;
                 damage -= shieldDmg;
                 spawnParticle(p.x, p.y, '#00f3ff', 5, 'spark');
               }
               if (damage > 0) {
                 p.health -= damage;
                 spawnParticle(p.x, p.y, '#ff0000', 8, 'blood');
               }
               b.active = false;
               
               if (p.health <= 0) {
                 const killer = state.players.find(k => k.id === b.ownerId);
                 if (killer) {
                   killer.kills++;
                   state.killFeed.unshift(`${killer.name} eliminated ${p.name}`);
                   if (state.killFeed.length > 4) state.killFeed.pop();
                   if (killer.id === 'local') {
                     state.currency += 50;
                     if (mode === 'gungame') {
                        killer.weaponIdx++;
                        if (killer.weaponIdx >= GUN_GAME_ORDER.length) onGameEnd({ winner: true });
                        else {
                           const newWep = GUN_GAME_ORDER[killer.weaponIdx];
                           killer.currentWeapon = {...WEAPONS[newWep]};
                           killer.ammoInMag = killer.currentWeapon.magSize;
                        }
                     }
                   }
                   spawnParticle(p.x, p.y, '#ff0000', 20, 'explosion');
                 }
                 // Respawn logic
                 if (mode === 'deathmatch' || mode === 'gungame') {
                    setTimeout(() => {
                       const s = map.spawns[Math.floor(Math.random() * map.spawns.length)];
                       p.x = s.x; p.y = s.y; p.health = 100; p.shield = 0;
                       // If spectating this bot, reset camera
                    }, 3000);
                 }
               }
               break;
             }
           }
        }
      }
      if (!b.active) state.bullets.splice(i, 1);
    }

    // Pickups
    state.pickups.forEach(p => {
       if (!p.active) return;
       if (Math.hypot(localPlayer.x - p.x, localPlayer.y - p.y) < localPlayer.radius + p.radius) {
         p.active = false;
         if (p.type === 'health') localPlayer.health = Math.min(100, localPlayer.health + p.value);
         if (p.type === 'shield') localPlayer.shield = Math.min(100, localPlayer.shield + p.value);
         if (p.type === 'ammo') localPlayer.reserveAmmo += 50;
       }
    });

    // Camera Logic
    let target = localPlayer;
    if (spectatorMode.active && spectatorMode.targetId) {
       const specTarget = state.players.find(p => p.id === spectatorMode.targetId);
       if (specTarget) {
         target = specTarget;
         if (spectatorTargetName !== specTarget.name) setSpectatorTargetName(specTarget.name);
       } else {
         // Target lost (disconnected or removed), find new
         const anyAlive = state.players.find(p => p.health > 0);
         if (anyAlive) {
           setSpectatorMode({active: true, targetId: anyAlive.id});
         }
       }
    }
    
    // Smooth Camera
    state.camera.x += (target.x - canvas.width / 2 - state.camera.x) * 0.1;
    state.camera.y += (target.y - canvas.height / 2 - state.camera.y) * 0.1;

    // 2. RENDER
    // Clear Background
    ctx.fillStyle = map.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);

    // Optimization: Viewport Culling
    const viewX = state.camera.x;
    const viewY = state.camera.y;
    const viewW = canvas.width;
    const viewH = canvas.height;

    // Grid (Optimized)
    ctx.strokeStyle = map.gridColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const gridSize = 100;
    const startX = Math.max(0, Math.floor(viewX / gridSize) * gridSize);
    const startY = Math.max(0, Math.floor(viewY / gridSize) * gridSize);
    const endX = Math.min(map.width, viewX + viewW);
    const endY = Math.min(map.height, viewY + viewH);

    for (let x = startX; x <= endX; x += gridSize) { ctx.moveTo(x, startY); ctx.lineTo(x, endY); }
    for (let y = startY; y <= endY; y += gridSize) { ctx.moveTo(startX, y); ctx.lineTo(endX, y); }
    ctx.stroke();

    // Safe Zone
    if (state.safeZone.active) {
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(state.safeZone.x, state.safeZone.y, state.safeZone.radius, 0, Math.PI*2);
      ctx.stroke();
    }

    // Objects
    state.pickups.forEach(p => {
      if (!p.active) return;
      if (p.x < viewX - 50 || p.x > viewX + viewW + 50 || p.y < viewY - 50 || p.y > viewY + viewH + 50) return;
      
      const pulse = 1 + Math.sin(time / 200) * 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, 0, 1);
      ctx.restore();
    });

    // Bullets
    state.bullets.forEach(b => {
      if (b.x < viewX - 50 || b.x > viewX + viewW + 50 || b.y < viewY - 50 || b.y > viewY + viewH + 50) return;
      
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      if (b.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for(let t of b.trail) ctx.lineTo(t.x, t.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
      ctx.fill();
    });

    // Players
    state.players.forEach(p => {
      if (p.health <= 0) return;
      if (p.x < viewX - 100 || p.x > viewX + viewW + 100 || p.y < viewY - 100 || p.y > viewY + viewH + 100) return;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      const skin = SKINS[p.skinId] || SKINS['default'];
      const weaponSkin = WEAPON_SKINS[p.weaponSkinId] || WEAPON_SKINS['default'];
      
      if (settings.graphicsQuality === 'high' || settings.graphicsQuality === 'ultra') {
         ctx.shadowBlur = 20;
         ctx.shadowColor = skin.glowColor;
      }

      ctx.fillStyle = skin.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI*2);
      ctx.fill();
      
      if (skin.type === 'epic' || skin.type === 'legendary') {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI*2);
        ctx.fill();
      }

      // Weapon
      if (weaponSkin.glowColor && (settings.graphicsQuality === 'high' || settings.graphicsQuality === 'ultra')) {
         ctx.shadowBlur = 10;
         ctx.shadowColor = weaponSkin.glowColor;
      }
      ctx.fillStyle = weaponSkin.primaryColor;
      ctx.fillRect(10, -6, 35, 12); 
      ctx.fillStyle = p.weaponSkinId === 'default' ? p.currentWeapon.color : weaponSkin.detailColor;
      ctx.fillRect(15, -2, 25, 4); 
      ctx.shadowBlur = 0;
      ctx.restore();

      // UI Overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(p.name, p.x, p.y - 40);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#374151';
      ctx.fillRect(p.x - 25, p.y - 35, 50, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(p.x - 25, p.y - 35, 50 * (p.health/p.maxHealth), 6);
      if (p.shield > 0) {
         ctx.fillStyle = '#3b82f6';
         ctx.fillRect(p.x - 25, p.y - 35, 50 * (p.shield/p.maxShield), 3);
      }
    });

    // Walls
    ctx.fillStyle = map.wallColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = map.wallColor;
    for(let w of map.walls) {
      if (w.x < viewX + viewW && w.x + w.w > viewX && w.y < viewY + viewH && w.y + w.h > viewY) {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(w.x, w.y, w.w, 5);
        ctx.fillStyle = map.wallColor;
      }
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // HUD Update
    updateHUD({
      player: { ...localPlayer },
      fps: state.fps,
      aliveCount: state.players.filter(p => p.health > 0).length,
      timeRemaining: Math.floor(state.gameTime),
      killFeed: [...state.killFeed],
      currency: state.currency
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full touch-none block" />
      
      {/* Spectator UI Overlay */}
      {spectatorMode.active && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-red-500/50 p-6 rounded-xl text-center pointer-events-auto">
          <div className="text-red-500 font-bold text-sm mb-2 animate-pulse">YOU ARE DEAD</div>
          <div className="text-white text-2xl font-bold mb-4">SPECTATING: <span className="text-neon-blue">{spectatorTargetName}</span></div>
          
          <div className="flex gap-4 justify-center">
            <button onClick={() => cycleSpectator(-1)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/20">PREV</button>
            <button onClick={() => cycleSpectator(1)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white border border-white/20">NEXT</button>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            {settings.controlType === 'keyboard' ? 'Use Arrow Keys to Cycle' : 'Tap buttons to Cycle'}
          </div>
          <button 
            onClick={() => onGameEnd({})} 
            className="mt-4 w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded font-bold"
          >
            RETURN TO MENU
          </button>
        </div>
      )}
    </>
  );
};

export default GameCanvas;
