import { useCallback } from 'react';

import { useSoundStore } from '../store/soundStore';
import { soundManager } from '../utils/sounds';
import type { SoundEffect } from '../utils/sounds';

export const useSound = () => {
  const { isSfxEnabled, sfxVolume } = useSoundStore();

  const playSound = useCallback(
    (effect: SoundEffect, customVolume?: number) => {
      if (isSfxEnabled) {
        soundManager.play(effect, customVolume ?? sfxVolume);
      }
    },
    [isSfxEnabled, sfxVolume]
  );

  return { playSound };
};
