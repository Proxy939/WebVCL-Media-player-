import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  Maximize, Minimize, Settings as SettingsIcon, ChevronLeft, Globe, ArrowRight,
  Monitor, Gauge, Zap, Check, Sparkles, Palette, Sun, Keyboard, Activity, Bookmark, Flag, Upload, HelpCircle, AlertTriangle, Brain, Mic, Waves, ScanLine
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { MediaItem, MediaType, StorageSource } from '../types';
import { parseSRTtoVTT, EQ_FREQUENCIES } from '../utils/mediaHelpers';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../constants';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const VIDEO_FILTERS = {
  none: { label: 'Normal', value: 'none' },
  breeze: { label: 'Breeze', value: 'contrast(90%) brightness(110%) saturate(110%) hue-rotate(10deg)' },
  pulse: { label: 'Pulse', value: 'contrast(120%) saturate(140%)' },
  crystal: { label: 'Crystal', value: 'contrast(110%) brightness(115%) saturate(90%)' },
  shiver: { label: 'Shiver', value: 'sepia(20%) hue-rotate(180deg) saturate(90%)' },
  chill: { label: 'Chill', value: 'saturate(80%) hue-rotate(10deg) brightness(105%)' },
  glow: { label: 'Glow', value: 'brightness(120%) contrast(90%) saturate(110%)' },
  amber: { label: 'Amber', value: 'sepia(40%) hue-rotate(-10deg) saturate(150%)' },
  sunbeam: { label: 'Sunbeam', value: 'brightness(115%) sepia(20%) contrast(105%)' },
  shadow: { label: 'Shadow', value: 'brightness(90%) contrast(130%)' },
  shade: { label: 'Shade', value: 'grayscale(40%) contrast(90%)' },
  sunshine: { label: 'Sunshine', value: 'saturate(160%) brightness(105%) contrast(105%)' },
  nostalgia: { label: 'Nostalgia', value: 'sepia(50%) contrast(90%)' },
  lavender: { label: 'Lavender', value: 'sepia(10%) hue-rotate(220deg) saturate(120%)' },
  fc12: { label: 'FC-12', value: 'contrast(130%) saturate(80%) sepia(10%)' },
};

export const Player: React.FC = () => {
  const { 
    currentMedia, isPlaying, volume, queue, history,
    togglePlay, setIsPlaying, setVolume, playNext, playPrevious, playMedia 
  } = usePlayer();
  const { updateProgress, isInWatchLater, getSavedProgress } = useWatchLater();
  const { settings, updateSettings } = useSettings();
  const { addBookmark, getBookmarksByMediaId } = useBookmarks();
  
  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null); // Native player
  const playerRef = useRef<any>(null); // ReactPlayer
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqFiltersRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumePoint, setResumePoint] = useState<number | null>(null);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [activeFilter, setActiveFilter] = useState<keyof typeof VIDEO_FILTERS>('none');
  const [hdrMode, setHdrMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagnostics
  const [diagStats, setDiagStats] = useState({
    resolution: 'N/A',
    droppedFrames: 0,
    buffered: 0,
    bandwidth: 'Local'
  });

  // URL Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const navigate = useNavigate();
  const bookmarks = currentMedia ? getBookmarksByMediaId(currentMedia.id) : [];

  // Determine Player Engine
  const isWebStream = useMemo(() => {
    if (!currentMedia) return false;
    if (currentMedia.source === StorageSource.NETWORK) {
       const isDirectFile = /\.(mp4|webm|ogg|mp3|wav|m4a|m3u8)$/i.test(currentMedia.url);
       const isKnownProvider = /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|soundcloud\.com|facebook\.com|streamable\.com|wistia\.com|mixcloud\.com|vidyard\.com/.test(currentMedia.url);
       return isKnownProvider || !isDirectFile;
    }
    return false;
  }, [currentMedia]);

  // --- Audio Graph (Native Only) ---
  const initAudioGraph = () => {
    if (!mediaRef.current || audioContextRef.current || isWebStream) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(mediaRef.current);
      sourceNodeRef.current = source;

      // EQ Filters
      const filters = EQ_FREQUENCIES.map(freq => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
      });
      eqFiltersRef.current = filters;

      // Pre-Amp
      const gainNode = ctx.createGain();
      gainNode.gain.value = settings.audio.preAmpVolume / 100;
      gainNodeRef.current = gainNode;

      // Connect Graph
      let currentNode: AudioNode = source;
      filters.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      currentNode.connect(gainNode);
      gainNode.connect(ctx.destination);
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
  };

  // Audio Processing Effect (EQ + AI Voice Isolation)
  useEffect(() => {
    if (eqFiltersRef.current.length > 0 && !isWebStream) {
      if (settings.ai?.voiceIsolation) {
        // AI Voice Isolation: Boost Mid Freqs (Human Voice ~300Hz - 3.4kHz), Cut High/Low noise
        const isolationCurve = [-10, -5, 8, 5, -5]; // Attenuate 60Hz, Boost 910Hz & 4kHz
        eqFiltersRef.current.forEach((filter, i) => {
          filter.gain.setTargetAtTime(isolationCurve[i], audioContextRef.current?.currentTime || 0, 0.1);
        });
      } else {
        // Standard EQ
        eqFiltersRef.current.forEach((filter, i) => {
          const val = settings.audio.equalizer?.[i] || 0;
          filter.gain.setTargetAtTime(val, audioContextRef.current?.currentTime || 0, 0.1);
        });
      }
    }
    if (gainNodeRef.current) gainNodeRef.current.gain.value = settings.audio.preAmpVolume / 100;
  }, [settings.audio, settings.ai, isWebStream]);

  // --- Diagnostics Loop ---
  useEffect(() => {
     if (!showDiagnostics || !mediaRef.current || !(mediaRef.current instanceof HTMLVideoElement) || isWebStream) return;
     const interval = setInterval(() => {
        const video = mediaRef.current as HTMLVideoElement;
        const quality = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : null;
        let bufferEnd = 0;
        if (video.buffered.length > 0) bufferEnd = video.buffered.end(video.buffered.length - 1);

        setDiagStats({
           resolution: `${video.videoWidth}x${video.videoHeight}`,
           droppedFrames: quality ? quality.droppedVideoFrames : 0,
           buffered: Math.round(bufferEnd - video.currentTime),
           bandwidth: currentMedia?.source === StorageSource.LOCAL ? 'Direct Disk' : 'Network'
        });
     }, 1000);
     return () => clearInterval(interval);
  }, [showDiagnostics, currentMedia, isWebStream]);

  // --- Unified Controls ---
  const unifiedSeek = (time: number) => {
     if (isWebStream && playerRef.current) {
        playerRef.current.seekTo(time);
     } else if (mediaRef.current) {
        mediaRef.current.currentTime = time;
     }
     setCurrentTime(time);
     if (currentMedia && isInWatchLater(currentMedia.id)) {
        updateProgress(currentMedia.id, time);
     }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current && !isWebStream) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };
  
  const handleProgress = (state: { playedSeconds: number, loadedSeconds: number }) => {
     setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (d: number) => {
     setDuration(d);
  };

  // --- Effects ---
  useEffect(() => {
    if (currentMedia) {
      setPlaybackRate(1);
      setActiveFilter('none');
      setHdrMode(false);
      setSubtitleUrl(null);
      setError(null);
      
      if (isInWatchLater(currentMedia.id)) {
        const saved = getSavedProgress(currentMedia.id);
        if (saved > 0) {
           setResumePoint(saved);
           setTimeout(() => unifiedSeek(saved), 500);
        } else setResumePoint(null);
      } else setResumePoint(null);
    }
  }, [currentMedia?.id]);

  useEffect(() => {
    if (!isWebStream && mediaRef.current) {
      if (isPlaying) {
        initAudioGraph();
        if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
        mediaRef.current.play().catch(e => console.error("Native Playback error", e));
      } else {
        mediaRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia, isWebStream]);

  useEffect(() => {
    if (!isWebStream && mediaRef.current) {
      mediaRef.current.volume = volume;
    }
  }, [volume, isWebStream]);
  
  useEffect(() => {
    if (!isWebStream && mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isWebStream]);

  // Watch Later Sync
  useEffect(() => {
    if (!isPlaying || !currentMedia) return;
    const interval = setInterval(() => {
      const time = isWebStream && playerRef.current ? playerRef.current.getCurrentTime() : mediaRef.current?.currentTime;
      if (time && isInWatchLater(currentMedia.id)) {
        updateProgress(currentMedia.id, time);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, currentMedia, isWebStream]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (!currentMedia) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          setShowControls(true);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          unifiedSeek(Math.min(currentTime + 10, duration));
          setShowControls(true);
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          unifiedSeek(Math.max(currentTime - 10, 0));
          setShowControls(true);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          setShowControls(true);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          setShowControls(true);
          break;
        case 'm':
          e.preventDefault();
          setVolume(volume === 0 ? 1 : 0);
          setShowControls(true);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'b':
          addBookmark(currentMedia.id, currentTime);
          setShowControls(true);
          break;
        case 'd':
          setShowDiagnostics(prev => !prev);
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
        case 'escape':
          if (showSettings) setShowSettings(false);
          else if (showShortcuts) setShowShortcuts(false);
          else if (showAiPanel) setShowAiPanel(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, currentTime, duration, showSettings, showAiPanel, isWebStream]);

  const toggleFullscreen = useCallback(() => {
    const container = document.getElementById('player-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showSettings && !showAiPanel && !isDragging) setShowControls(false);
    }, 3000);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const type = /\.(mp3|wav|ogg|flac|m4a)$/i.test(urlInput) ? MediaType.AUDIO : MediaType.VIDEO;
    const newItem: MediaItem = {
      id: `stream-${Date.now()}`,
      title: urlInput.split('/').pop() || 'Network Stream',
      duration: 0,
      url: urlInput,
      type: type,
      source: StorageSource.NETWORK,
    };
    playMedia(newItem);
    setShowUrlInput(false);
    setUrlInput('');
  };

  const getCombinedFilter = () => {
    let filterString = VIDEO_FILTERS[activeFilter].value === 'none' ? '' : VIDEO_FILTERS[activeFilter].value;
    if (hdrMode) filterString += ' brightness(110%) contrast(115%) saturate(115%)';
    if (settings.ai?.smartContrast) filterString += ' contrast(110%) brightness(105%) saturate(105%)';
    return filterString.trim();
  };

  const controlBtnClass = "p-3 rounded-full text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 active:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-vlc-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const subtitleStyles = `
    ::cue {
      background-color: rgba(0, 0, 0, ${settings.subtitles.backgroundOpacity});
      color: ${settings.subtitles.color === 'yellow' ? '#facc15' : settings.subtitles.color === 'light' ? '#e4e4e7' : '#ffffff'};
      opacity: ${settings.subtitles.textOpacity};
      font-size: ${settings.subtitles.size === 'small' ? '0.8em' : settings.subtitles.size === 'large' ? '1.5em' : '1.2em'};
    }
  `;

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.srt') || file.name.endsWith('.vtt'))) {
       const text = await file.text();
       const vttText = file.name.endsWith('.srt') ? parseSRTtoVTT(text) : text;
       const blob = new Blob([vttText], { type: 'text/vtt' });
       setSubtitleUrl(URL.createObjectURL(blob));
    }
  };

  if (!currentMedia) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-fade-in p-6">
        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse border border-white/5">
           <Play size={40} className="text-white/20" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ready to Play</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">Select media from your library, open a local file, or stream directly from a URL.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
           <button onClick={() => navigate(APP_ROUTES.HOME)} className="px-6 py-2 bg-vlc-orange text-black font-bold rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-900/20">Go Home</button>
           <button onClick={() => navigate(APP_ROUTES.LIBRARY)} className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition">Open Library</button>
           {!showUrlInput ? (
             <button onClick={() => setShowUrlInput(true)} className="px-6 py-2 bg-white/5 text-gray-300 font-medium rounded-lg hover:bg-white/10 transition border border-white/5 flex items-center gap-2">
               <Globe size={16} /> Stream URL
             </button>
           ) : (
             <form onSubmit={handleUrlSubmit} className="flex items-center gap-2 animate-fade-in">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Paste URL..." 
                  className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:border-vlc-orange focus:outline-none w-64"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button type="submit" className="p-2 bg-white/10 hover:bg-vlc-orange hover:text-black rounded-lg transition-colors text-white"><ArrowRight size={16} /></button>
             </form>
           )}
        </div>
      </div>
    );
  }

  const hasNext = queue.length > 0;
  const hasPrevious = history.length > 0 || currentTime > 3;

  return (
    <div className="h-full flex flex-col lg:flex-row bg-black overflow-hidden relative select-none">
      <style>{subtitleStyles}</style>

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 z-30 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-vlc-orange"
        title="Go Back"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Diagnostics Panel */}
      {showDiagnostics && !isWebStream && (
         <div className="absolute top-6 left-20 z-30 p-4 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-xs font-mono text-gray-300 shadow-xl pointer-events-none animate-fade-in">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Activity size={12} className="text-vlc-orange" /> Diagnostics</h4>
            <div className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-1">
               <span className="text-gray-500">Resolution</span> <span>{diagStats.resolution}</span>
               <span className="text-gray-500">Dropped</span> <span className={diagStats.droppedFrames > 0 ? 'text-red-400' : ''}>{diagStats.droppedFrames}</span>
               <span className="text-gray-500">Buffered</span> <span>{diagStats.buffered}s</span>
               <span className="text-gray-500">Source</span> <span>{diagStats.bandwidth}</span>
               <span className="text-gray-500">Time</span> <span>{currentTime.toFixed(2)} / {duration.toFixed(2)}</span>
            </div>
         </div>
      )}

      {/* Shortcuts Overlay */}
      {showShortcuts && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setShowShortcuts(false)}>
           <div className="bg-zinc-900 p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Keyboard size={20} className="text-vlc-orange"/> Shortcuts</h3>
                <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-white"><Zap size={20} className="rotate-45" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex justify-between text-gray-400 border-b border-white/5 pb-2"><span>Play/Pause</span> <span className="text-white font-mono bg-white/10 px-2 rounded">Space</span></div>
                 <div className="flex justify-between text-gray-400 border-b border-white/5 pb-2"><span>Fullscreen</span> <span className="text-white font-mono bg-white/10 px-2 rounded">F</span></div>
                 <div className="flex justify-between text-gray-400 border-b border-white/5 pb-2"><span>Seek</span> <span className="text-white font-mono bg-white/10 px-2 rounded">←/→</span></div>
                 <div className="flex justify-between text-gray-400 border-b border-white/5 pb-2"><span>Volume</span> <span className="text-white font-mono bg-white/10 px-2 rounded">↑/↓</span></div>
              </div>
           </div>
        </div>
      )}

      {/* Main Player Area */}
      <div 
        id="player-container" 
        className="flex-1 flex flex-col bg-black relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && !showSettings && !showAiPanel && setShowControls(false)}
        onDoubleClick={toggleFullscreen}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
           <div className="absolute inset-0 z-50 bg-vlc-orange/20 border-4 border-dashed border-vlc-orange flex items-center justify-center backdrop-blur-sm pointer-events-none">
              <div className="bg-black/80 p-6 rounded-2xl flex flex-col items-center">
                 <Upload size={48} className="text-vlc-orange mb-2" />
                 <h3 className="text-xl font-bold text-white">Drop Subtitles</h3>
                 <p className="text-sm text-gray-400">.SRT or .VTT files supported</p>
              </div>
           </div>
        )}

        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
          {isWebStream ? (
             <ReactPlayer
                ref={playerRef}
                url={currentMedia.url}
                playing={isPlaying}
                volume={volume}
                playbackRate={playbackRate}
                width="100%"
                height="100%"
                controls={false}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onEnded={() => hasNext ? playNext() : setIsPlaying(false)}
                onError={(e) => setError("Stream Error")}
                config={{
                   file: { 
                      attributes: { 
                         crossOrigin: "anonymous",
                         style: { filter: getCombinedFilter(), objectFit: fitMode }
                      },
                      tracks: subtitleUrl ? [{ kind: 'subtitles', src: subtitleUrl, srcLang: 'en', label: 'English', default: true }] : []
                   },
                   youtube: { playerVars: { showinfo: 0, controls: 0, modestbranding: 1, rel: 0 } }
                }}
             />
          ) : (
            currentMedia.type === MediaType.VIDEO ? (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={currentMedia.url}
                  crossOrigin="anonymous"
                  className={`w-full h-full object-${fitMode}`}
                  style={{ filter: getCombinedFilter() }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onEnded={() => hasNext ? playNext() : setIsPlaying(false)}
                  onClick={togglePlay}
                >
                  {subtitleUrl && <track label="English" kind="subtitles" srcLang="en" src={subtitleUrl} default />}
                </video>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   {currentMedia.thumbnailUrl && (
                     <div 
                        className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125"
                        style={{ backgroundImage: `url(${currentMedia.thumbnailUrl})` }}
                     />
                   )}
                   <audio
                    ref={mediaRef as React.RefObject<HTMLAudioElement>}
                    src={currentMedia.url}
                    crossOrigin="anonymous"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onEnded={() => hasNext ? playNext() : setIsPlaying(false)}
                  />
                  <div className="relative z-10 text-center p-8">
                    <div className="w-64 h-64 mx-auto bg-black/50 rounded-2xl shadow-2xl mb-8 flex items-center justify-center overflow-hidden border border-white/10 animate-fade-in">
                       {currentMedia.thumbnailUrl ? 
                          <img src={currentMedia.thumbnailUrl} alt="Album Art" className="w-full h-full object-cover" /> :
                          <div className="text-gray-600 text-6xl">♫</div>
                       }
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{currentMedia.title}</h2>
                    <p className="text-gray-400 text-xl font-medium">{currentMedia.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
              )
          )}

          {error && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                <div className="flex flex-col items-center text-red-500">
                   <AlertTriangle size={48} className="mb-2" />
                   <p className="font-bold">Playback Error</p>
                   <p className="text-sm text-gray-400">Could not play stream.</p>
                </div>
             </div>
          )}
          
          {!isPlaying && showControls && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-24 h-24 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200 border border-white/10 shadow-2xl">
                <Play size={48} fill="white" className="ml-2 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls Bar */}
        <div className={`
          absolute bottom-0 left-0 right-0 p-6 pt-32
          bg-gradient-to-t from-black via-black/80 to-transparent
          transition-all duration-500 ease-out z-30
          ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}>
          
          {/* Progress Bar */}
          <div className="relative group/progress h-1.5 hover:h-3 transition-all bg-white/20 rounded-full mb-6 cursor-pointer">
            {resumePoint !== null && duration > 0 && (
                <div 
                    className="absolute top-0 bottom-0 w-0.5 h-full bg-white z-20 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ left: `${(resumePoint / duration) * 100}%` }}
                />
            )}
            {bookmarks.map(bm => (
                <div 
                    key={bm.id}
                    className="absolute top-0 bottom-0 w-1 h-full bg-vlc-orange hover:bg-white z-20 pointer-events-none"
                    style={{ left: `${(bm.time / (duration || 1)) * 100}%` }}
                    title={bm.label}
                />
            ))}
            <div 
              className="absolute top-0 left-0 h-full bg-vlc-orange rounded-full relative"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform"></div>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => unifiedSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              
              <div className="flex items-center gap-4">
                  <button onClick={() => { unifiedSeek(0); if (hasPrevious) playPrevious(); }} className={controlBtnClass} title="Previous">
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button onClick={togglePlay} className="p-4 rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 active:bg-gray-300 transition-all shadow-lg shadow-white/10" title="Play/Pause">
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
                  <button onClick={playNext} disabled={!hasNext} className={controlBtnClass} title="Next">
                    <SkipForward size={24} fill="currentColor" />
                  </button>
              </div>
              
              <div className="flex items-center gap-3 group/volume border-l border-white/10 pl-6">
                <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className={controlBtnClass} title="Mute">
                   {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out">
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
              </div>

              <span className="text-sm font-medium text-gray-300 select-none font-mono tracking-wide">
                {formatTime(currentTime)} <span className="text-gray-600 mx-1">/</span> {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-gray-300 relative">
               
               {/* AI Features Button */}
               <div className="relative">
                 <button 
                    onClick={() => { setShowAiPanel(!showAiPanel); setShowSettings(false); }}
                    className={`${controlBtnClass} ${showAiPanel ? 'text-cyan-400 bg-cyan-900/30 ring-2 ring-cyan-500/50' : 'text-cyan-200/70 hover:text-cyan-400'}`}
                    title="AI Lab Features"
                 >
                    <Brain size={20} />
                 </button>

                 {/* AI Features Menu */}
                 {showAiPanel && (
                    <div className="absolute bottom-16 right-0 w-72 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.1)] z-50 animate-fade-in">
                       <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-2">
                          <h3 className="text-cyan-400 font-bold flex items-center gap-2 text-sm shadow-cyan-500/50 drop-shadow-sm">
                             <Brain size={16} /> Neural Engine
                          </h3>
                          <button onClick={() => setShowAiPanel(false)} className="text-gray-500 hover:text-white"><Zap size={14} /></button>
                       </div>

                       <div className="space-y-4">
                          {/* Voice Isolation */}
                          <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-200 flex items-center gap-1"><Mic size={12} className="text-cyan-400"/> Voice Isolation</span>
                                <span className="text-[10px] text-gray-500">Boosts speech, cuts noise</span>
                             </div>
                             <button 
                                onClick={() => updateSettings('ai', 'voiceIsolation', !settings.ai?.voiceIsolation)}
                                className={`w-10 h-6 rounded-full transition-colors relative ${settings.ai?.voiceIsolation ? 'bg-cyan-500' : 'bg-gray-800'}`}
                             >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.ai?.voiceIsolation ? 'translate-x-4' : 'translate-x-0'}`} />
                             </button>
                          </div>

                          {/* Smart Contrast */}
                          <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-200 flex items-center gap-1"><ScanLine size={12} className="text-cyan-400"/> Smart Contrast</span>
                                <span className="text-[10px] text-gray-500">Dynamic range enhancement</span>
                             </div>
                             <button 
                                onClick={() => updateSettings('ai', 'smartContrast', !settings.ai?.smartContrast)}
                                className={`w-10 h-6 rounded-full transition-colors relative ${settings.ai?.smartContrast ? 'bg-cyan-500' : 'bg-gray-800'}`}
                             >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.ai?.smartContrast ? 'translate-x-4' : 'translate-x-0'}`} />
                             </button>
                          </div>

                           {/* Auto Captions (Mock) */}
                           <div className="flex items-center justify-between opacity-80">
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-200 flex items-center gap-1"><Waves size={12} className="text-cyan-400"/> Auto-Captions</span>
                                <span className="text-[10px] text-gray-500">Generate subs (Beta)</span>
                             </div>
                             <button 
                                onClick={() => {
                                   const nextState = !settings.ai?.autoCaptions;
                                   updateSettings('ai', 'autoCaptions', nextState);
                                   if(nextState) alert("AI Caption generation started (Simulated)");
                                }}
                                className={`w-10 h-6 rounded-full transition-colors relative ${settings.ai?.autoCaptions ? 'bg-cyan-500' : 'bg-gray-800'}`}
                             >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.ai?.autoCaptions ? 'translate-x-4' : 'translate-x-0'}`} />
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
               </div>

               <button onClick={() => { setShowSettings(!showSettings); setShowAiPanel(false); }} className={`${controlBtnClass} ${showSettings ? 'bg-vlc-orange text-white' : ''}`} title="Settings"><SettingsIcon size={20} /></button>
               
               {/* Settings Menu (Simplified from previous) */}
               {showSettings && (
                    <div className="absolute bottom-16 right-0 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 animate-fade-in text-gray-200">
                      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                           <SettingsIcon size={16} className="text-vlc-orange" /> Playback Options
                        </h3>
                        <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><Zap size={14} /></button>
                      </div>
                      
                      <div className="mb-5">
                         <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-3"><div className="flex items-center gap-2"><Gauge size={14} /> Speed</div><span className="text-vlc-orange bg-vlc-orange/10 px-2 py-0.5 rounded">{playbackRate}x</span></div>
                         <div className="relative h-6 flex items-center">
                            <input type="range" min="0.5" max="2" step="0.25" value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-vlc-orange z-10 relative" />
                         </div>
                      </div>

                      <div className="mb-5">
                         <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3"><Monitor size={14} /> Aspect Ratio</div>
                         <div className="grid grid-cols-3 gap-2">
                            {[{ id: 'contain', label: 'Fit' }, { id: 'cover', label: 'Crop' }, { id: 'fill', label: 'Stretch' }].map((mode) => (
                               <button key={mode.id} onClick={() => setFitMode(mode.id as any)} className={`flex items-center justify-center py-2 text-[10px] font-bold uppercase rounded-lg transition-all border ${fitMode === mode.id ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'}`}>
                                 {fitMode === mode.id && <Check size={10} className="mr-1" />} {mode.label}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="mb-4">
                         <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-3">
                            <div className="flex items-center gap-2"><Palette size={14} /> Visual Enhancements</div>
                            <button onClick={() => setHdrMode(!hdrMode)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all ${hdrMode ? 'bg-white text-black' : 'bg-white/10 text-gray-400 hover:text-white'}`}><Sun size={10} /><span className="text-[10px] font-bold">HDR</span></button>
                         </div>
                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {Object.entries(VIDEO_FILTERS).map(([key, filter]) => (
                               <button key={key} onClick={() => setActiveFilter(key as keyof typeof VIDEO_FILTERS)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${activeFilter === key ? 'bg-vlc-orange text-white border-vlc-orange' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'}`}>
                                 {key === 'none' && <Sparkles size={10} className="inline mr-1" />} {filter.label}
                               </button>
                            ))}
                         </div>
                      </div>

                      {bookmarks.length > 0 && (
                          <div className="mb-4 pt-4 border-t border-white/10">
                              <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2"><Flag size={12}/> Bookmarks</div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                  {bookmarks.map(bm => (
                                      <button key={bm.id} onClick={() => unifiedSeek(bm.time)} className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded flex justify-between">
                                          <span>{bm.label}</span><span className="font-mono">{formatTime(bm.time)}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                      <button onClick={() => navigate(APP_ROUTES.SETTINGS)} className="w-full mt-2 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors border border-dashed border-white/10 hover:border-white/20">All Settings <ArrowRight size={12} /></button>
                    </div>
               )}

               <button onClick={toggleFullscreen} className={controlBtnClass}>
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};