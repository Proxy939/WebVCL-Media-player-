import { MediaItem, MediaType, Playlist, StorageSource, CloudProvider, AppSettings } from './types';

export const MOCK_CLOUD_MEDIA: MediaItem[] = [
  {
    id: 'c1',
    title: 'Big Buck Bunny',
    duration: 596,
    thumbnailUrl: 'https://picsum.photos/seed/bunny/320/180',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: MediaType.VIDEO,
    source: StorageSource.CLOUD,
    uploadDate: '2023-10-15',
    size: '150 MB',
    providerId: 'google-drive'
  },
  {
    id: 'c2',
    title: 'Elephant Dream',
    duration: 653,
    thumbnailUrl: 'https://picsum.photos/seed/elephant/320/180',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    type: MediaType.VIDEO,
    source: StorageSource.CLOUD,
    uploadDate: '2023-11-02',
    size: '120 MB',
    providerId: 'dropbox'
  },
  {
    id: 'c3',
    title: 'Ambient Forest Sounds',
    artist: 'Nature Sounds',
    duration: 300,
    thumbnailUrl: 'https://picsum.photos/seed/forest/320/180',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', // Using a reliable video file as audio source for demo stability
    type: MediaType.AUDIO,
    source: StorageSource.CLOUD,
    uploadDate: '2023-12-10',
    size: '15 MB',
    providerId: 'soundcloud'
  }
];

export const CLOUD_PROVIDERS: CloudProvider[] = [
  { id: 'google-drive', name: 'Google Drive', description: 'Seamless Google Docs integration', iconColor: 'text-blue-500' },
  { id: 'icloud', name: 'iCloud', description: 'Best for Apple ecosystem', iconColor: 'text-blue-400' },
  { id: 'dropbox', name: 'Dropbox', description: 'Reliable team sync', iconColor: 'text-blue-600' },
  { id: 'onedrive', name: 'OneDrive', description: 'Microsoft 365 integration', iconColor: 'text-blue-700' },
  { id: 'mega', name: 'MEGA', description: '50GB Free storage', iconColor: 'text-red-600' },
  { id: 'pcloud', name: 'pCloud', description: 'Secure lifetime storage', iconColor: 'text-blue-500' },
  { id: 'koofr', name: 'Koofr', description: 'Multi-cloud management', iconColor: 'text-cyan-500' },
  { id: 'jottacloud', name: 'Jottacloud', description: 'Unlimited backup', iconColor: 'text-green-500' },
  { id: 'terabox', name: 'TeraBox', description: '1024GB Free storage', iconColor: 'text-blue-400' },
  { id: 'proton', name: 'Proton Drive', description: 'Swiss privacy focused', iconColor: 'text-purple-500' },
  { id: 'tresorit', name: 'Tresorit', description: 'End-to-end encrypted', iconColor: 'text-teal-600' },
  { id: 'icedrive', name: 'Icedrive', description: 'Twofish encryption', iconColor: 'text-blue-300' },
  { id: 'sync', name: 'Sync.com', description: 'Zero-knowledge privacy', iconColor: 'text-red-500' },
  { id: 'filecloud', name: 'FileCloud', description: 'Enterprise file sharing', iconColor: 'text-orange-500' },
  { id: 'backblaze', name: 'Backblaze', description: 'Simple unlimited backup', iconColor: 'text-red-600' },
  { id: 'spideroak', name: 'SpiderOak', description: 'No-knowledge privacy', iconColor: 'text-orange-600' },
  { id: 'synology', name: 'Synology C2', description: 'NAS integrated cloud', iconColor: 'text-gray-400' },
  { id: 'wasabi', name: 'Wasabi', description: 'Hot cloud storage', iconColor: 'text-green-400' },
  { id: 'r2', name: 'Cloudflare R2', description: 'Egress-free storage', iconColor: 'text-orange-400' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  audio: {
    outputDevice: 'default',
    preAmpVolume: 100,
    passthrough: false,
    equalizer: [0, 0, 0, 0, 0], // Flat EQ
    balance: 0
  },
  video: {
    hardwareAcceleration: true,
    deinterlacing: 'auto',
    postProcessing: 50,
    colorScheme: 'none',
    enableDiagnostics: false
  },
  subtitles: {
    autoLoad: true,
    language: 'en',
    size: 'medium',
    color: 'white',
    delay: 0,
    backgroundOpacity: 0,
    textOpacity: 1
  },
  ai: {
    enabled: true,
    voiceIsolation: false,
    smartContrast: false,
    motionSmoothing: false,
    autoCaptions: false
  },
  appearance: {
    theme: 'dark'
  }
};

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'p1',
    name: 'Favorites',
    itemIds: ['c1', 'c2'],
    createdAt: '2023-01-01'
  },
  {
    id: 'p2',
    name: 'Study Music',
    itemIds: ['c3'],
    createdAt: '2023-05-20'
  }
];

export const APP_ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  PLAYER: '/player',
  PLAYLISTS: '/playlists',
  UPLOAD: '/upload',
  SETTINGS: '/settings',
  LOGIN: '/login',
  WATCH_LATER: '/watch-later'
};