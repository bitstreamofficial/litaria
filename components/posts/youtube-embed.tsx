'use client';

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

export function YouTubeEmbed({ url, className = "" }: YouTubeEmbedProps) {
  // Extract video ID from various YouTube URL formats
  const getYouTubeVideoId = (url: string): string | null => {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center p-8 rounded-lg ${className}`}>
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-lg"
      />
    </div>
  );
}