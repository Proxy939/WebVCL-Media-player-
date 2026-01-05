import React from 'react';
import { Play, Clock, Trash2, Calendar, Film, Music, PlayCircle, XCircle } from 'lucide-react';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants';
import { MediaType } from '../types';

export const WatchLater: React.FC = () => {
  const { items, removeFromWatchLater, clearWatchLater } = useWatchLater();
  const { playMedia, addToQueue } = usePlayer();
  const navigate = useNavigate();

  const handleResume = (media: any) => {
    playMedia(media);
    navigate(APP_ROUTES.PLAYER);
  };

  const handlePlayAll = () => {
    if (items.length === 0) return;
    playMedia(items[0].media);
    // Add rest to queue
    items.slice(1).forEach(item => addToQueue(item.media));
    navigate(APP_ROUTES.PLAYER);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your Watch Later list?')) {
      clearWatchLater();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (saved: number, total: number) => {
    if (!total) return 0;
    return Math.min(100, (saved / total) * 100);
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-vlc-orange/10 rounded-2xl text-vlc-orange shadow-lg shadow-orange-900/10">
            <Clock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Watch Later</h1>
            <p className="text-gray-400 font-medium">{items.length} items saved</p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
             <button 
                onClick={handlePlayAll}
                className="px-5 py-2.5 bg-vlc-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20 flex items-center gap-2"
             >
                <PlayCircle size={18} fill="currentColor" className="text-white/20" />
                Play All
             </button>
             <button 
                onClick={handleClearAll}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 font-bold rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors flex items-center gap-2"
             >
                <XCircle size={18} />
                Clear List
             </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/5 rounded-3xl bg-black/20 m-4">
          <Clock size={64} className="mb-6 opacity-20" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">List is Empty</h2>
          <p className="max-w-xs text-center text-gray-500">Add videos or audio from your Library to watch them later.</p>
          <button 
            onClick={() => navigate(APP_ROUTES.LIBRARY)}
            className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 hover:border-white/10 font-medium"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {items.map(({ media, savedPosition, addedAt }) => (
            <div key={media.id} className="group bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col shadow-lg">
              {/* Thumbnail Area */}
              <div className="aspect-video relative bg-gray-900 group-hover:opacity-90 transition-opacity">
                {media.thumbnailUrl ? (
                  <img src={media.thumbnailUrl} alt={media.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                    {media.type === MediaType.VIDEO ? <Film size={32} className="text-gray-600" /> : <Music size={32} className="text-gray-600" />}
                  </div>
                )}
                
                {/* Play Overlay */}
                <div 
                  onClick={() => handleResume(media)}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                >
                  <div className="w-14 h-14 bg-vlc-orange rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                    <Play size={24} fill="white" className="ml-1 text-white" />
                  </div>
                </div>

                {/* Progress Bar Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                  <div 
                    className="h-full bg-vlc-orange transition-all duration-300" 
                    style={{ width: `${getProgressPercentage(savedPosition, media.duration)}%` }}
                  />
                </div>
                
                {/* Time Badge */}
                 <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md text-[10px] font-bold text-white rounded">
                    {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
                  </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-white truncate text-sm leading-tight group-hover:text-vlc-orange transition-colors" title={media.title}>{media.title}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchLater(media.id);
                    }}
                    className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded p-1 transition-colors -mt-1 -mr-1"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-4 font-medium uppercase tracking-wide">
                  <span>{media.artist || (media.type === MediaType.VIDEO ? 'Video' : 'Audio')}</span>
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <div className="text-vlc-orange font-bold flex items-center gap-1">
                     {savedPosition > 0 ? (
                       <>Resume {formatTime(savedPosition)}</>
                     ) : (
                       <>Start</>
                     )}
                  </div>
                  <div className="text-gray-600 flex items-center gap-1 font-medium" title={`Added ${new Date(addedAt).toLocaleDateString()}`}>
                    <Calendar size={10} />
                    {new Date(addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};