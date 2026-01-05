import React, { useEffect, useState } from 'react';
import { Play, MoreVertical, Clock, Music, Film, Search, Filter, Cloud, Check, Trash2 } from 'lucide-react';
import { MediaItem, MediaType, StorageSource } from '../types';
import { getCloudLibrary, deleteMediaItem } from '../services/storageService';
import { CLOUD_PROVIDERS } from '../constants';
import { usePlayer } from '../contexts/PlayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants';
import { useAuth } from '../contexts/AuthContext';

export const Library: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | MediaType>('ALL');
  const { playMedia } = usePlayer();
  const { addToWatchLater, isInWatchLater } = useWatchLater();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(true);
      refreshLibrary();
    } else {
        setLoading(false);
    }
  }, [user]);

  const refreshLibrary = () => {
    getCloudLibrary().then(data => {
        setMedia(data);
        setLoading(false);
      });
  }

  const handlePlay = (item: MediaItem) => {
    playMedia(item);
    navigate(APP_ROUTES.PLAYER);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media?')) {
        // Optimistically remove from UI or show loading?
        // Let's keep it simple: call delete then refresh
        await deleteMediaItem(id);
        refreshLibrary();
    }
  };

  const getProviderName = (id?: string) => {
    if (!id) return null;
    return CLOUD_PROVIDERS.find(p => p.id === id)?.name || id;
  };

  const filteredMedia = media.filter(item => filter === 'ALL' || item.type === filter);

  if (!user) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
              <div className="bg-vlc-panel/50 backdrop-blur-xl p-10 rounded-3xl border border-white/5 max-w-md shadow-2xl">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Music size={32} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Library Locked</h2>
                  <p className="text-gray-400 mb-8">Sign in to access your synchronized cloud library across all devices.</p>
                  <button 
                      onClick={() => navigate(APP_ROUTES.LOGIN)}
                      className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                  >
                      Sign In Now
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Library</h1>
          <p className="text-gray-400 font-medium">{media.length} items collected</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-1 flex border border-white/5">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'ALL' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter(MediaType.VIDEO)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === MediaType.VIDEO ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
            >
              Video
            </button>
            <button 
              onClick={() => setFilter(MediaType.AUDIO)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === MediaType.AUDIO ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
            >
              Audio
            </button>
          </div>
          
          <div className="relative group">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
             <input 
                type="text" 
                placeholder="Search library..." 
                className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-black/60 w-full md:w-64 placeholder-gray-600 transition-all"
             />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-vlc-orange border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">Syncing Cloud...</p>
          </div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/5 rounded-3xl bg-black/20">
          <Film size={48} className="mb-4 opacity-20" />
          <p>No media found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 pb-10">
          {filteredMedia.map(item => {
            const inWatchLater = isInWatchLater(item.id);
            return (
              <div 
                key={item.id}
                className="group relative flex flex-col gap-3 cursor-pointer"
              >
                <div 
                  className="aspect-video relative overflow-hidden rounded-xl bg-gray-900 shadow-xl shadow-black/50 ring-1 ring-white/5 group-hover:ring-white/20 transition-all duration-300 group-hover:-translate-y-1"
                  onClick={() => handlePlay(item)}
                >
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                      <Music size={32} className="text-gray-600" />
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <Play size={20} fill="black" className="ml-1 text-black" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md text-[10px] font-bold text-white rounded">
                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                  </div>
                  
                  {item.providerId && (
                     <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-vlc-orange/90 backdrop-blur-md text-[10px] font-bold text-black rounded flex items-center gap-1">
                        <Cloud size={10} /> {getProviderName(item.providerId)}
                     </div>
                  )}
                </div>

                <div className="px-1 relative">
                  <div className="pr-16">
                     <h3 className="font-semibold text-white truncate text-base group-hover:text-vlc-orange transition-colors" title={item.title}>{item.title}</h3>
                     <div className="flex items-center justify-between mt-1">
                       <p className="text-xs text-gray-500 truncate max-w-[70%]">{item.artist || 'Unknown Artist'}</p>
                       <p className="text-[10px] text-gray-600 border border-gray-800 px-1 rounded uppercase">{item.type === MediaType.VIDEO ? 'VID' : 'AUD'}</p>
                     </div>
                  </div>
                  
                  <div className="absolute top-0 right-0 flex items-center gap-1">
                    {/* Watch Later Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchLater(item);
                      }}
                      disabled={inWatchLater}
                      className={`p-1.5 rounded-full transition-colors ${inWatchLater ? 'text-vlc-orange bg-orange-900/20' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                      title={inWatchLater ? "Added to Watch Later" : "Watch Later"}
                    >
                      {inWatchLater ? <Check size={16} /> : <Clock size={16} />}
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};