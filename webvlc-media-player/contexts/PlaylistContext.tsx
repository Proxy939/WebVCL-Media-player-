import React, { createContext, useContext, useState } from 'react';
import { Playlist } from '../types';
import { MOCK_PLAYLISTS } from '../constants';

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, mediaId: string) => void;
  removeFromPlaylist: (playlistId: string, mediaId: string) => void;
  moveItem: (playlistId: string, fromIndex: number, direction: 'up' | 'down') => void;
}

const PlaylistContext = createContext<PlaylistContextType>({} as any);

export const usePlaylist = () => useContext(PlaylistContext);

export const PlaylistProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `p-${Date.now()}`,
      name,
      itemIds: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  const addToPlaylist = (playlistId: string, mediaId: string) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId && !p.itemIds.includes(mediaId)) {
        return { ...p, itemIds: [...p.itemIds, mediaId] };
      }
      return p;
    }));
  };

  const removeFromPlaylist = (playlistId: string, mediaId: string) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, itemIds: p.itemIds.filter(id => id !== mediaId) };
      }
      return p;
    }));
  };

  const moveItem = (playlistId: string, index: number, direction: 'up' | 'down') => {
    setPlaylists(playlists.map(p => {
      if (p.id !== playlistId) return p;
      
      const newItems = [...p.itemIds];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newItems.length) {
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      }

      return { ...p, itemIds: newItems };
    }));
  };

  return (
    <PlaylistContext.Provider value={{ 
      playlists, 
      createPlaylist, 
      deletePlaylist, 
      addToPlaylist, 
      removeFromPlaylist,
      moveItem
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};