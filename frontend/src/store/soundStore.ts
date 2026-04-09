import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  isMusicEnabled: boolean;
  isSfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isMusicEnabled: false, // Default to off to avoid auto-play issues
      isSfxEnabled: true,
      musicVolume: 0.3,
      sfxVolume: 0.5,
      toggleMusic: () => set((state) => ({ isMusicEnabled: !state.isMusicEnabled })),
      toggleSfx: () => set((state) => ({ isSfxEnabled: !state.isSfxEnabled })),
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      setSfxVolume: (volume) => set({ sfxVolume: volume }),
    }),
    {
      name: 'freezino-sound-settings',
    }
  )
);
