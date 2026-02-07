/**
 * Convert various YouTube URL formats to embedded iframe URL
 * Supports:
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID (already embed format)
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 */
export const convertToYouTubeEmbed = (url) => {
  if (!url) return '';

  // Already in embed format
  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  let videoId = '';

  // Handle youtu.be short links
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  // Handle youtube.com/watch?v= links
  else if (url.includes('youtube.com/watch')) {
    const params = new URLSearchParams(url.split('?')[1]);
    videoId = params.get('v') || '';
  }
  // Handle youtube.com/embed/ links
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
  }

  // If not a YouTube URL, return as-is
  return url;
};

/**
 * Check if a URL is a YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};
