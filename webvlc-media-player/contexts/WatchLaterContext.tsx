import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem } from '../types';

export interface WatchLaterItem {
  media: MediaItem;
  savedPosition: number; // in seconds
  addedAt: string;
}

interface WatchLaterContextType {
  items: WatchLaterItem[];
  addToWatchLater: (media: MediaItem) => void;
  removeFromWatchLater: (mediaId: string) => void;
  clearWatchLater: () => void;
  updateProgress: (mediaId: string, time: number) => void;
  isInWatchLater: (mediaId: string) => boolean;
  getSavedProgress: (mediaId: string) => number;
}

const WatchLaterContext = createContext<WatchLaterContextType>({} as any);

export const useWatchLater = () => useContext(WatchLaterContext);

export const WatchLaterProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<WatchLaterItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('webvlc_watch_later');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load watch later list', e);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('webvlc_watch_later', JSON.stringify(items));
  }, [items]);

  const addToWatchLater = (media: MediaItem) => {
    setItems(prev => {
      if (prev.some(item => item.media.id === media.id)) return prev;
      return [
        { media, savedPosition: 0, addedAt: new Date().toISOString() },
        ...prev
      ];
    });
  };

  const removeFromWatchLater = (mediaId: string) => {
    setItems(prev => prev.filter(item => item.media.id !== mediaId));
  };

  const clearWatchLater = () => {
    setItems([]);
  };

  const updateProgress = (mediaId: string, time: number) => {
    setItems(prev => prev.map(item => {
      if (item.media.id === mediaId) {
        return { ...item, savedPosition: time };
      }
      return item;
    }));
  };

  const isInWatchLater = (mediaId: string) => {
    return items.some(item => item.media.id === mediaId);
  };

  const getSavedProgress = (mediaId: string) => {
    const item = items.find(i => i.media.id === mediaId);
    return item ? item.savedPosition : 0;
  };

  return (
    <WatchLaterContext.Provider value={{ 
      items, 
      addToWatchLater, 
      removeFromWatchLater, 
      clearWatchLater,
      updateProgress,
      isInWatchLater,
      getSavedProgress
    }}>
      {children}
    </WatchLaterContext.Provider>
  );
};