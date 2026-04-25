import { useState } from "react";
import { X, Play, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface VideoModalProps {
  video: { title: string; videoUrl: string; description?: string | null };
  onClose: () => void;
}

function VideoModal({ video, onClose }: VideoModalProps) {
  const isYoutube = video.videoUrl.includes("youtube.com") || video.videoUrl.includes("youtu.be");
  let embedUrl = video.videoUrl;
  if (isYoutube) {
    const videoId = video.videoUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
          {isYoutube ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <video src={video.videoUrl} controls autoPlay className="w-full h-full" />
          )}
        </div>
        <div className="mt-5">
          <h3 className="font-serif text-xl font-bold text-white">{video.title}</h3>
          {video.description && (
            <p className="text-white/50 text-sm mt-2 font-reading">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoGalleryPage() {
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const { data: videos, isLoading } = trpc.videoGalleries.list.useQuery({ limit: 50 });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="relative py-12 md:py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Video Galeri</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Kadıköy'den video haberler ve belgeseller</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                <div className="aspect-video bg-muted/20 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted/20 rounded-full" />
                  <div className="h-3 bg-muted/20 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group liquid-glass-elevated rounded-2xl overflow-hidden text-left"
              >
                <div className="aspect-video relative overflow-hidden bg-muted/20">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/[0.03] flex items-center justify-center">
                      <Video className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-all duration-500 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-xl backdrop-blur-sm">
                      <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="p-5 relative z-10">
                  <h3 className="font-serif text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-reading">{video.description}</p>
                  )}
                  {video.publishedAt && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/20">{formatDate(video.publishedAt)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-lg font-serif">Henüz video eklenmemiş.</p>
          </div>
        )}
      </main>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      <Footer />
    </div>
  );
}
