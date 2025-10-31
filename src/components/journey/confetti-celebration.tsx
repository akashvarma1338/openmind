'use client';

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

type ConfettiCelebrationProps = {
    active: boolean;
    onComplete: () => void;
}

export function ConfettiCelebration({ active, onComplete }: ConfettiCelebrationProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!active) {
    return null;
  }

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={500}
      tweenDuration={5000}
      onConfettiComplete={onComplete}
      className="!fixed"
    />
  );
}
