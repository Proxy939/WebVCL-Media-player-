import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bookmark } from '../types';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (mediaId: string, time: number, label?: string) => void;
  removeBookmark: (bookmarkId: string) => void;
  getBookmarksByMediaId: (mediaId: string) => Bookmark[];
}

const BookmarkContext = createContext<BookmarkContextType>({} as any);

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('webvlc_bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load bookmarks', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('webvlc_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (mediaId: string, time: number, label?: string) => {
    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      mediaId,
      time,
      label: label || `Chapter ${Math.floor(time)}s`,
      createdAt: new Date().toISOString()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const getBookmarksByMediaId = (mediaId: string) => {
    return bookmarks.filter(b => b.mediaId === mediaId).sort((a, b) => a.time - b.time);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, getBookmarksByMediaId }}>
      {children}
    </BookmarkContext.Provider>
  );
};