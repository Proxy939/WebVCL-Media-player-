import React, { createContext, useContext, useState } from 'react';
import { MediaItem, PlayerState } from '../types';

interface PlayerContextType extends PlayerState {
  playMedia: (item: MediaItem) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  addToQueue: (item: MediaItem) => void;
  stop: () => void;
  setIsPlaying: (playing: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType>({} as any);

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<PlayerState>({
    currentMedia: null,
    isPlaying: false,
    volume: 1,
    progress: 0,
    isMuted: false,
    isFullscreen: false,
    queue: [],
    history: []
  });

  const playMedia = (item: MediaItem) => {
    setState(prev => ({ 
      ...prev, 
      currentMedia: item, 
      isPlaying: true,
      progress: 0,
      // We optionally keep queue or clear it. Here we keep it as per existing behavior,
      // but we push current media to history if it exists? 
      // Usually playMedia starts a new context, so we might want to clear history or keep it.
      // For simplicity in a single session, we keep history.
      history: prev.currentMedia ? [...prev.history, prev.currentMedia] : prev.history
    }));
  };

  const togglePlay = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const setIsPlaying = (playing: boolean) => {
    setState(prev => ({ ...prev, isPlaying: playing }));
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
  };

  const addToQueue = (item: MediaItem) => {
    setState(prev => ({ ...prev, queue: [...prev.queue, item] }));
  };

  const stop = () => {
     setState(prev => ({ ...prev, isPlaying: false, currentMedia: null, progress: 0 }));
  };

  const playNext = () => {
    setState(prev => {
      if (prev.queue.length === 0) {
        // Option: Loop or stop. Here we stop.
        return { ...prev, isPlaying: false, progress: 0 };
      }
      
      const nextMedia = prev.queue[0];
      const newQueue = prev.queue.slice(1);
      const newHistory = prev.currentMedia ? [...prev.history, prev.currentMedia] : prev.history;

      return {
        ...prev,
        currentMedia: nextMedia,
        queue: newQueue,
        history: newHistory,
        isPlaying: true,
        progress: 0
      };
    });
  };

  const playPrevious = () => {
    setState(prev => {
      if (prev.history.length === 0) return prev;

      const previousMedia = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      // Push current back to queue to allow "Next" to go back to it
      const newQueue = prev.currentMedia ? [prev.currentMedia, ...prev.queue] : prev.queue;

      return {
        ...prev,
        currentMedia: previousMedia,
        history: newHistory,
        queue: newQueue,
        isPlaying: true,
        progress: 0
      };
    });
  };

  return (
    <PlayerContext.Provider value={{ 
      ...state, 
      playMedia, 
      togglePlay, 
      setVolume, 
      addToQueue, 
      stop, 
      setIsPlaying,
      playNext,
      playPrevious
    }}>
      {children}
    </PlayerContext.Provider>
  );
};