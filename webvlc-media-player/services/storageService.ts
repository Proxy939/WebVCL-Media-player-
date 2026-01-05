import { MediaItem, MediaType, StorageSource } from '../types';
import { MOCK_CLOUD_MEDIA } from '../constants';

const STORAGE_KEY = 'webvlc_cloud_library';
const DELETED_IDS_KEY = 'webvlc_deleted_ids';

// In a real app, this would interface with S3, Firebase, etc.
// Here we simulate async operations.

export const uploadFile = async (file: File): Promise<MediaItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const type = file.type.startsWith('video') ? MediaType.VIDEO : MediaType.AUDIO;
      resolve({
        id: `local-${Date.now()}`,
        title: file.name,
        duration: 0, // In real app, we'd extract metadata
        thumbnailUrl: '',
        url: URL.createObjectURL(file), // Create blob URL for session playback
        type: type,
        source: StorageSource.LOCAL, // Marked as local session file
        uploadDate: new Date().toISOString(),
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
    }, 1500); // Simulate network delay
  });
};

export const uploadToCloudProvider = async (file: File, providerId: string): Promise<MediaItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const type = file.type.startsWith('video') ? MediaType.VIDEO : MediaType.AUDIO;
            const newItem: MediaItem = {
                id: `cloud-${Date.now()}`,
                title: file.name,
                duration: 0,
                thumbnailUrl: '', // Placeholder
                url: URL.createObjectURL(file), // In a real app this would be a remote URL
                type: type,
                source: StorageSource.CLOUD,
                uploadDate: new Date().toISOString(),
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                providerId: providerId
            };
            
            // Persist to local storage simulation
            const currentLib = getStoredLibrary();
            const updatedLib = [newItem, ...currentLib];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLib));

            resolve(newItem);
        }, 2000); // Simulate upload time
    });
};

export const deleteMediaItem = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Remove from local storage library
            const currentLib = getStoredLibrary();
            const updatedLib = currentLib.filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLib));

            // Add to deleted IDs (to hide mock items or persistent deletion)
            const deletedIds = getDeletedIds();
            if (!deletedIds.includes(id)) {
                deletedIds.push(id);
                localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(deletedIds));
            }
            resolve();
        }, 300);
    });
};

const getStoredLibrary = (): MediaItem[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

const getDeletedIds = (): string[] => {
    try {
        const stored = localStorage.getItem(DELETED_IDS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export const getCloudLibrary = async (): Promise<MediaItem[]> => {
    // Merge Mock data with Local Storage "Cloud" data
    const storedItems = getStoredLibrary();
    const deletedIds = getDeletedIds();
    
    // De-duplicate based on ID if necessary, though IDs should be unique
    const merged = [...storedItems, ...MOCK_CLOUD_MEDIA];
    
    // Filter deleted
    const active = merged.filter(item => !deletedIds.includes(item.id));
    
    return new Promise((resolve) => {
        setTimeout(() => resolve(active), 500);
    });
};