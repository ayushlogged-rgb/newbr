
import React, { useRef, useEffect } from 'react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onLook: (x: number, y: number, firing: boolean) => void;
  onAction: (action: 'reload' | 'jump') => void;
  autoShoot: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onMove, onLook, onAction, autoShoot }) => {
  const leftJoyRef = useRef<HTMLDivElement>(null);
  const rightJoyRef = useRef<HTMLDivElement>(null);
  const leftTouchId = useRef<number | null>(null);
  const rightTouchId = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (side === 'left') leftTouchId.current = touch.identifier;
    else rightTouchId.current = touch.identifier;
    updateJoystick(touch, side);
  };

  const handleTouchMove = (e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if ((side === 'left' && touch.identifier === leftTouchId.current) || 
          (side === 'right' && touch.identifier === rightTouchId.current)) {
        updateJoystick(touch, side);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if ((side === 'left' && e.changedTouches[i].identifier === leftTouchId.current) ||
          (side === 'right' && e.changedTouches[i].identifier === rightTouchId.current)) {
        
        if (side === 'left') {
          leftTouchId.current = null;
          onMove(0, 0);
          if (leftJoyRef.current) leftJoyRef.current.style.transform = `translate(0px, 0px)`;
        } else {
          rightTouchId.current = null;
          onLook(0, 0, false);
          if (rightJoyRef.current) rightJoyRef.current.style.transform = `translate(0px, 0px)`;
        }
      }
    }
  };

  const updateJoystick = (touch: React.Touch, side: 'left' | 'right') => {
    const zone = side === 'left' ? document.getElementById('joy-zone-left') : document.getElementById('joy-zone-right');
    const stick = side === 'left' ? leftJoyRef.current : rightJoyRef.current;
    if (!zone || !stick) return;

    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDist = 40;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    stick.style.transform = `translate(${dx}px, ${dy}px)`;

    const normalizedX = dx / maxDist;
    const normalizedY = dy / maxDist;

    if (side === 'left') {
      onMove(normalizedX, normalizedY);
    } else {
      // If moved significantly, consider it firing/aiming
      const isFiring = dist > 10;
      onLook(normalizedX, normalizedY, isFiring);
    }
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Left Joystick Zone (Movement) */}
      <div 
        id="joy-zone-left"
        className="absolute bottom-16 left-16 w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 pointer-events-auto backdrop-blur-sm"
        onTouchStart={(e) => handleTouchStart(e, 'left')}
        onTouchMove={(e) => handleTouchMove(e, 'left')}
        onTouchEnd={(e) => handleTouchEnd(e, 'left')}
      >
        <div ref={leftJoyRef} className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 bg-neon-blue/50 rounded-full shadow-[0_0_15px_#00f3ff] transition-transform duration-75 ease-linear" />
      </div>

      {/* Right Joystick Zone (Aim/Fire) */}
      <div 
        id="joy-zone-right"
        className="absolute bottom-16 right-16 w-32 h-32 bg-white/10 rounded-full border-2 border-white/20 pointer-events-auto backdrop-blur-sm"
        onTouchStart={(e) => handleTouchStart(e, 'right')}
        onTouchMove={(e) => handleTouchMove(e, 'right')}
        onTouchEnd={(e) => handleTouchEnd(e, 'right')}
      >
         <div ref={rightJoyRef} className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 bg-red-500/50 rounded-full shadow-[0_0_15px_#ff0000] transition-transform duration-75 ease-linear" />
      </div>

      {/* Action Buttons */}
      <button 
        className="absolute bottom-48 right-8 w-16 h-16 bg-yellow-500/50 rounded-full border border-yellow-400 pointer-events-auto flex items-center justify-center text-white font-bold text-xs"
        onTouchStart={() => onAction('reload')}
      >
        RELOAD
      </button>
    </div>
  );
};

export default MobileControls;
