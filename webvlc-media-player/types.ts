export enum MediaType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export enum StorageSource {
  LOCAL = 'LOCAL',
  CLOUD = 'CLOUD',
  NETWORK = 'NETWORK',
}

export interface MediaItem {
  id: string;
  title: string;
  artist?: string; // For audio
  duration: number; // in seconds
  thumbnailUrl?: string;
  url: string; // Blob URL for local, https for cloud
  type: MediaType;
  source: StorageSource;
  uploadDate?: string;
  size?: string;
  providerId?: string; // ID of the cloud provider if applicable
}

export interface Playlist {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
}

export interface Bookmark {
  id: string;
  mediaId: string;
  time: number;
  label: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
}

export interface PlayerState {
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  volume: number;
  progress: number; // 0-100 percentage or current time
  isMuted: boolean;
  isFullscreen: boolean;
  queue: MediaItem[];
  history: MediaItem[];
}

export interface CloudProvider {
  id: string;
  name: string;
  description: string;
  iconColor: string;
}

export interface AppSettings {
  audio: {
    outputDevice: string;
    preAmpVolume: number; // 100-150%
    passthrough: boolean;
    equalizer: number[]; // 5 bands: 60, 230, 910, 4k, 14k
    balance: number; // -1 (Left) to 1 (Right)
  };
  video: {
    hardwareAcceleration: boolean;
    deinterlacing: 'auto' | 'off' | 'on';
    postProcessing: number; // 0-100
    colorScheme: string;
    enableDiagnostics: boolean;
  };
  subtitles: {
    autoLoad: boolean;
    language: string;
    size: 'small' | 'medium' | 'large';
    color: 'white' | 'yellow' | 'light';
    delay: number; // in seconds
    backgroundOpacity: number; // 0-1
    textOpacity: number; // 0-1
  };
  ai: {
    enabled: boolean;
    voiceIsolation: boolean; // Boosts vocal frequencies
    smartContrast: boolean; // Dynamic contrast adjustment
    motionSmoothing: boolean; // Simulated high frame rate
    autoCaptions: boolean; // Mock auto-caption generation
  };
  appearance: {
    theme: 'dark' | 'light'; // For future use
  };
}