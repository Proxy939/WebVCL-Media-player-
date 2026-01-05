import React, { useState, useMemo, useEffect } from 'react';
import { 
  ListMusic, Plus, Trash2, Play, Music, MoreVertical, 
  ArrowUp, ArrowDown, X, Check, Search, Clock, Calendar, Hash
} from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getCloudLibrary } from '../services/storageService';
import { MediaItem } from '../types';

export const Playlists: React.FC = () => {
  const { playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, moveItem } = usePlaylist();
  const { playMedia, addToQueue } = usePlayer();
  
  const [selectedId, setSelectedId] = useState<string | null>(playlists.length > 0 ? playlists[0].id : null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [library, setLibrary] = useState<MediaItem[]>([]);

  // Fetch full library data to include uploaded files
  useEffect(() => {
    getCloudLibrary().then(data => setLibrary(data));
  }, []);

  const selectedPlaylist = playlists.find(p => p.id === selectedId);

  // Helper to resolve media items using the dynamic library
  const playlistItems = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.itemIds
      .map(id => library.find(m => m.id === id))
      .filter(Boolean) as MediaItem[];
  }, [selectedPlaylist, library]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return playlistItems.reduce((acc, item) => acc + item.duration, 0);
  }, [playlistItems]);

  const formatTotalDuration = (seconds: number) => {
    if (!seconds) return '0 min';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h} hr`);
    if (m > 0 || h > 0) parts.push(`${m} min`);
    if (h === 0 && m === 0) parts.push(`${s} sec`);
    
    return parts.join(' ') || '0 sec';
  };

  // Generate dynamic cover art from first 4 items
  const coverImages = useMemo(() => {
    return playlistItems
      .map(item => item.thumbnailUrl)
      .filter(Boolean)
      .slice(0, 4);
  }, [playlistItems]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handlePlayPlaylist = () => {
    if (playlistItems.length > 0) {
      playMedia(playlistItems[0]);
      playlistItems.slice(1).forEach(item => addToQueue(item));
    }
  };

  const filteredLibrary = library.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 p-6 overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-full md:w-80 flex flex-col bg-black/20 backdrop-blur-lg rounded-2xl border border-white/5 h-full flex-shrink-0 shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <ListMusic size={20} className="text-vlc-orange" />
            Playlists
          </h2>
          <button 
            onClick={() => setIsCreating(true)} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="Create Playlist"
          >
            <Plus size={20} />
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 bg-white/5 border-b border-white/5">
            <input 
              autoFocus
              type="text" 
              placeholder="Playlist Name" 
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-vlc-orange outline-none mb-3 transition-colors"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-gray-400 hover:text-white px-2">Cancel</button>
              <button type="submit" className="text-xs bg-vlc-orange text-black px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600 transition-colors">Create</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => setSelectedId(playlist.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all text-left group
                ${selectedId === playlist.id 
                  ? 'bg-white/10 text-white font-semibold shadow-inner' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <div className="truncate flex-1 pr-2">{playlist.name}</div>
              <span className={`text-xs opacity-50 ${selectedId === playlist.id ? 'text-white' : ''}`}>
                {playlist.itemIds.length}
              </span>
            </button>
          ))}
          {playlists.length === 0 && !isCreating && (
             <div className="text-center py-12 text-gray-600 text-xs">
               No playlists yet.<br/>Click + to create one.
             </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-lg rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl">
        {selectedPlaylist ? (
          <>
            {/* Enhanced Header */}
            <div className="relative p-8 flex flex-col md:flex-row items-end gap-8 border-b border-white/5">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
              
              {/* Dynamic Cover Art */}
              <div className="relative z-10 w-48 h-48 bg-black/50 rounded-lg shadow-2xl overflow-hidden flex-shrink-0 border border-white/10 group">
                {coverImages.length > 0 ? (
                  coverImages.length >= 4 ? (
                    <div className="grid grid-cols-2 h-full w-full">
                      {coverImages.map((url, i) => (
                         <img key={i} src={url} className="w-full h-full object-cover" alt="" />
                      ))}
                    </div>
                  ) : (
                    <img src={coverImages[0]} className="w-full h-full object-cover" alt="Playlist cover" />
                  )
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <Music size={64} className="text-zinc-700" />
                   </div>
                )}
                
                {/* Overlay Play Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[1px]" onClick={handlePlayPlaylist}>
                   <div className="p-4 bg-vlc-orange rounded-full text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={32} fill="currentColor" className="ml-1" />
                   </div>
                </div>
              </div>

              {/* Playlist Metadata */}
              <div className="relative z-10 flex-1 min-w-0 pb-1 w-full">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Playlist</span>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if(confirm('Delete this playlist?')) {
                            deletePlaylist(selectedPlaylist.id);
                            setSelectedId(null);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Delete Playlist"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 truncate leading-tight tracking-tight">
                  {selectedPlaylist.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 font-medium">
                   <div className="flex items-center gap-2">
                      <Hash size={16} className="text-gray-500" />
                      <span className="text-gray-300">{playlistItems.length} items</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-gray-300">{formatTotalDuration(totalDuration)}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-gray-300">
                        {new Date(selectedPlaylist.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                   </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                    <button 
                      onClick={handlePlayPlaylist}
                      disabled={playlistItems.length === 0}
                      className="px-8 py-3 bg-vlc-orange text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Play size={20} fill="currentColor" />
                      Play All
                    </button>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setIsPickerOpen(true);
                      }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
                    >
                      <Plus size={20} />
                      Add Songs
                    </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {playlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Music size={48} className="mb-4 opacity-20" />
                  <p>This playlist is empty.</p>
                  <button onClick={() => setIsPickerOpen(true)} className="text-vlc-orange hover:underline mt-2 text-sm font-medium">Add tracks from your library</button>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/40 text-xs text-gray-500 uppercase sticky top-0 backdrop-blur-md z-10 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center font-medium">#</th>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Artist</th>
                      <th className="px-6 py-4 text-right font-medium">Duration</th>
                      <th className="px-6 py-4 w-32 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {playlistItems.map((item, idx) => (
                      <tr key={`${item.id}-${idx}`} className="hover:bg-white/5 group transition-colors">
                        <td className="px-6 py-3 text-center text-sm text-gray-500 group-hover:text-vlc-orange cursor-pointer" onClick={() => playMedia(item)}>
                           <span className="group-hover:hidden">{idx + 1}</span>
                           <Play size={12} className="hidden group-hover:inline" fill="currentColor" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-gray-200 text-sm font-medium truncate max-w-[200px] md:max-w-xs">{item.title}</div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-400">{item.artist || '-'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 text-right font-mono">
                          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => moveItem(selectedPlaylist.id, idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:text-white text-gray-500 disabled:opacity-30 transition-colors"
                                title="Move Up"
                             >
                                <ArrowUp size={16} />
                             </button>
                             <button 
                                onClick={() => moveItem(selectedPlaylist.id, idx, 'down')}
                                disabled={idx === playlistItems.length - 1}
                                className="p-1 hover:text-white text-gray-500 disabled:opacity-30 transition-colors"
                                title="Move Down"
                             >
                                <ArrowDown size={16} />
                             </button>
                             <button 
                                onClick={() => removeFromPlaylist(selectedPlaylist.id, item.id)}
                                className="p-1 hover:text-red-500 text-gray-500 transition-colors"
                                title="Remove from playlist"
                             >
                                <X size={16} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <ListMusic size={40} className="opacity-40" />
             </div>
             <h3 className="text-xl font-bold text-gray-300 mb-2">No Playlist Selected</h3>
             <p className="text-sm">Select a playlist from the sidebar or create a new one.</p>
          </div>
        )}

        {/* Media Picker Modal */}
        {isPickerOpen && selectedPlaylist && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[80%] max-h-[600px]">
               <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">Add to <span className="text-vlc-orange">{selectedPlaylist.name}</span></h3>
                  <button onClick={() => setIsPickerOpen(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
               </div>
               
               <div className="p-4 border-b border-white/5 bg-black/20">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search by title or artist..." 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-vlc-orange transition-all" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                 {filteredLibrary.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No matching media found.</p>
                    </div>
                 ) : (
                    filteredLibrary.map(media => {
                        const isAdded = selectedPlaylist.itemIds.includes(media.id);
                        return (
                          <div key={media.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl group transition-colors">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-12 h-12 bg-black rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                                  {media.thumbnailUrl ? <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover"/> : <Music size={20} className="text-gray-600"/>}
                              </div>
                              <div className="min-w-0">
                                  <div className="text-sm font-bold text-white truncate">{media.title}</div>
                                  <div className="text-xs text-gray-500 truncate">{media.artist || 'Unknown'} • {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => isAdded ? removeFromPlaylist(selectedPlaylist.id, media.id) : addToPlaylist(selectedPlaylist.id, media.id)}
                              className={`ml-3 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isAdded 
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/50 hover:bg-orange-500/20' 
                                : 'bg-white/10 text-white hover:bg-white/20 border border-transparent'
                              }`}
                            >
                              {isAdded ? <Check size={14} /> : <Plus size={14} />}
                              {isAdded ? 'Added' : 'Add'}
                            </button>
                          </div>
                        )
                    })
                 )}
               </div>
               
               <div className="p-4 border-t border-white/5 flex justify-end bg-zinc-900 rounded-b-2xl">
                  <button 
                    onClick={() => setIsPickerOpen(false)} 
                    className="px-6 py-2 bg-vlc-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                  >
                    Done
                  </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};