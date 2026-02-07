import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MusicTrack } from '@/types';

interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  queue: MusicTrack[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  isExpanded: boolean;

  // Actions
  setCurrentTrack: (track: MusicTrack | null) => void;
  addToQueue: (track: MusicTrack) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setQueue: (tracks: MusicTrack[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      volume: 0.7,
      progress: 0,
      duration: 0,
      repeat: 'off',
      shuffle: false,
      isExpanded: false,

      setCurrentTrack: (track) => set({ currentTrack: track, progress: 0 }),
      
      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),
      
      removeFromQueue: (trackId) =>
        set((state) => ({
          queue: state.queue.filter((t) => t.id !== trackId),
        })),
      
      clearQueue: () => set({ queue: [] }),
      
      setQueue: (tracks) => set({ queue: tracks }),
      
      play: () => set({ isPlaying: true }),
      
      pause: () => set({ isPlaying: false }),
      
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setVolume: (volume) => set({ volume }),
      
      setProgress: (progress) => set({ progress }),
      
      setDuration: (duration) => set({ duration }),
      
      nextTrack: () => {
        const { queue, currentTrack, shuffle, repeat } = get();
        if (queue.length === 0) return;

        const currentIndex = currentTrack
          ? queue.findIndex((t) => t.id === currentTrack.id)
          : -1;

        let nextIndex: number;
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex === queue.length - 1) {
          nextIndex = repeat === 'all' ? 0 : currentIndex;
        } else {
          nextIndex = currentIndex + 1;
        }

        set({ currentTrack: queue[nextIndex], progress: 0 });
      },
      
      prevTrack: () => {
        const { queue, currentTrack, progress } = get();
        if (queue.length === 0) return;

        // If more than 3 seconds in, restart current track
        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        const currentIndex = currentTrack
          ? queue.findIndex((t) => t.id === currentTrack.id)
          : 0;

        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
        set({ currentTrack: queue[prevIndex], progress: 0 });
      },
      
      toggleRepeat: () =>
        set((state) => ({
          repeat:
            state.repeat === 'off'
              ? 'all'
              : state.repeat === 'all'
              ? 'one'
              : 'off',
        })),
      
      toggleShuffle: () =>
        set((state) => ({ shuffle: !state.shuffle })),
      
      setExpanded: (expanded) => set({ isExpanded: expanded }),
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
      }),
    }
  )
);
