import React, { useRef, useState } from 'react';
import { Upload, FolderOpen, PlayCircle, ShieldCheck, ChevronRight, Zap, Cloud, Globe, X, Link } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants';
import { uploadFile } from '../services/storageService';
import { usePlayer } from '../contexts/PlayerContext';
import { MediaItem, MediaType, StorageSource } from '../types';

export const Landing: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { playMedia } = usePlayer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const mediaItem = await uploadFile(file);
        playMedia(mediaItem);
        navigate(APP_ROUTES.PLAYER);
      } catch (error) {
        console.error("Error opening file", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const newItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: streamUrl.split('/').pop() || 'Network Stream',
      duration: 0,
      url: streamUrl,
      type: MediaType.VIDEO, // Default to video for streams
      source: StorageSource.NETWORK,
    };

    playMedia(newItem);
    navigate(APP_ROUTES.PLAYER);
  };

  return (
    <div className="h-full relative overflow-hidden flex flex-col items-center justify-center p-6">
       
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-400 mb-8 animate-fade-in">
           <Zap size={12} fill="currentColor" /> v2.0 Web Player
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight animate-slide-up">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-vlc-orange to-orange-400">Universal</span> <br/>
          Media Experience.
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Play local files instantly or stream your cloud library in a privacy-focused, cinema-grade web environment.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Local File */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="group flex-1 h-20 sm:h-24 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-white/5"
          >
            {isProcessing ? (
               <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
               <FolderOpen size={24} className="group-hover:scale-110 transition-transform text-vlc-orange" />
            )}
            <div className="flex flex-col items-center sm:items-start leading-tight">
              <span>Open Local File</span>
              <span className="text-xs font-normal opacity-60">No upload required</span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*,audio/*"
            onChange={handleFileSelect}
          />

          {/* Network Stream */}
          <button 
            onClick={() => setIsStreamModalOpen(true)}
            className="group flex-1 h-20 sm:h-24 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all backdrop-blur-md"
          >
            <Globe size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
             <div className="flex flex-col items-center sm:items-start leading-tight">
              <span>Network Stream</span>
              <span className="text-xs font-normal opacity-60 text-gray-400">URL / HLS / MP4</span>
            </div>
          </button>

          {/* Cloud Library */}
          {!user ? (
            <button 
              onClick={() => navigate(APP_ROUTES.LOGIN)}
              className="group flex-1 h-20 sm:h-24 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-lg transition-all backdrop-blur-md"
            >
              <Cloud size={24} className="text-vlc-orange group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center sm:items-start leading-tight">
                <span>Sign In</span>
                <span className="text-xs font-normal opacity-60 text-gray-400">Access Cloud Library</span>
              </div>
            </button>
          ) : (
            <button 
              onClick={() => navigate(APP_ROUTES.LIBRARY)}
              className="group flex-1 h-20 sm:h-24 flex flex-col sm:flex-row items-center justify-center gap-3 bg-vlc-orange text-white hover:bg-orange-600 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-orange-900/20"
            >
              <PlayCircle size={24} className="group-hover:scale-110 transition-transform" fill="currentColor" />
              <div className="flex flex-col items-center sm:items-start leading-tight">
                <span>Open Library</span>
                <span className="text-xs font-normal opacity-80">Cloud Storage</span>
              </div>
            </button>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {[
            { title: "Privacy First", desc: "No data collection. Playback happens locally in your browser.", icon: ShieldCheck },
            { title: "Cloud Sync", desc: "Connect your storage to stream your personal library anywhere.", icon: Cloud },
            { title: "Format Support", desc: "Advanced support for modern web video and audio formats.", icon: Zap },
          ].map((item, i) => (
             <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors">
                <item.icon className="text-gray-400 mb-4" size={24} />
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
             </div>
          ))}
        </div>
      </div>

      {/* Network Stream Modal */}
      {isStreamModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
             <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Globe size={20} className="text-vlc-orange" />
                  Open Network Stream
                </h3>
                <button onClick={() => setIsStreamModalOpen(false)}><X size={20} className="text-gray-400 hover:text-white" /></button>
             </div>
             
             <form onSubmit={handleStreamSubmit} className="p-6">
                <div className="mb-6">
                   <label className="block text-sm font-medium text-gray-400 mb-2">Network Protocol / URL</label>
                   <div className="relative">
                      <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input 
                        autoFocus
                        type="url" 
                        placeholder="https://example.com/stream.m3u8" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-vlc-orange transition-all placeholder-gray-600" 
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        required
                      />
                   </div>
                   <p className="text-xs text-gray-500 mt-2">Supports HLS (.m3u8), MP4, WebM, and MP3.</p>
                </div>

                <div className="flex justify-end gap-3">
                   <button 
                     type="button" 
                     onClick={() => setIsStreamModalOpen(false)} 
                     className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="px-6 py-2 bg-vlc-orange text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                   >
                     Play
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};