// Utility to convert SRT subtitle content to WebVTT format
export const parseSRTtoVTT = (srtContent: string): string => {
  // Normalize line endings
  let vtt = "WEBVTT\n\n" + srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Regex to match SRT time format: 00:00:00,000
  const srtTimeRegex = /(\d{2}:\d{2}:\d{2}),(\d{3})/g;
  
  // Convert comma to dot for VTT: 00:00:00.000
  vtt = vtt.replace(srtTimeRegex, '$1.$2');
  
  return vtt;
};

// Format bytes to human readable string
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Get audio frequency labels for 5-band EQ
export const EQ_FREQUENCIES = [60, 230, 910, 4000, 14000];
export const EQ_LABELS = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];
