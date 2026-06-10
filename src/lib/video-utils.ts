/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${mins}:${pad(secs)}`;
}

/**
 * Get video quality from bitrate
 */
export function getQualityLabel(bitrate?: number): string {
  if (!bitrate) return "Auto";
  if (bitrate >= 5000) return "4K";
  if (bitrate >= 2500) return "1080p";
  if (bitrate >= 1500) return "720p";
  if (bitrate >= 800) return "480p";
  return "360p";
}

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}
