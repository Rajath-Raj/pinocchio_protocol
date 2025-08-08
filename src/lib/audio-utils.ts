/**
 * Checks if the browser supports the MediaRecorder API.
 * @returns {boolean} True if audio recording is supported, otherwise false.
 */
export function isAudioRecordingSupported(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window;
}

/**
 * Finds a supported MIME type for audio recording from a list of candidates.
 * @returns {string | null} The first supported MIME type, or null if none are supported.
 */
export function getSupportedMimeType(): string | null {
  if (!isAudioRecordingSupported()) {
    return null;
  }

  const mimeTypes = [
    'audio/webm;codecs=opus', // Preferred for quality and compatibility on Chrome/Firefox
    'audio/webm',
    'audio/mp4', // Fallback for Safari
    'audio/ogg;codecs=opus',
  ];

  for (const type of mimeTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return null;
}
