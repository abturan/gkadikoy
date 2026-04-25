import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn, formatDate } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LightboxProps {
  photos: { id: number; imageUrl: string; caption?: string | null }[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
      >
        <X className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div
        className="max-w-5xl max-h-[85vh] w-full mx-16 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo?.imageUrl}
          alt={photo?.caption ?? ""}
          className="max-h-[75vh] max-w-full object-contain rounded-3xl"
        />
        {photo?.caption && (
          <p className="text-white/60 text-sm text-center max-w-xl font-reading">{photo.caption}</p>
        )}
        <p className="text-white/30 text-xs">{idx + 1} / {photos.length}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function PhotoGalleryPage() {
  const [selectedGallery, setSelectedGallery] = useState<number | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ photos: any[]; index: number } | null>(null);

  const { data: galleries, isLoading } = trpc.photoGalleries.list.useQuery({ limit: 50 });
  const { data: galleryPhotos } = trpc.photoGalleries.photos.useQuery(
    { galleryId: selectedGallery ?? 0 },
    { enabled: !!selectedGallery }
  );

  const activeGallery = galleries?.find((g) => g.id === selectedGallery);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="relative py-12 md:py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Foto Galeri</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Kadıköy'den kareler</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {selectedGallery ? (
          <div>
            <button
              onClick={() => setSelectedGallery(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Tüm Galeriler
            </button>

            <div className="mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{activeGallery?.title}</h2>
              {activeGallery?.description && (
                <p className="text-muted-foreground mt-2 font-reading">{activeGallery.description}</p>
              )}
              {activeGallery?.publishedAt && (
                <p className="text-sm text-muted-foreground mt-2">{formatDate(activeGallery.publishedAt)}</p>
              )}
            </div>

            {galleryPhotos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryPhotos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightboxPhoto({ photos: galleryPhotos, index: i })}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-muted/20 ring-1 ring-border/20"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption ?? ""}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted/20 rounded-2xl animate-shimmer" />
                ))}
              </div>
            )}
          </div>
        ) : (
          isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] bg-muted/20 animate-shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted/20 rounded-full" />
                    <div className="h-3 bg-muted/20 rounded-full w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleries?.map((gallery) => (
                <button
                  key={gallery.id}
                  onClick={() => setSelectedGallery(gallery.id)}
                  className="group liquid-glass-elevated rounded-2xl overflow-hidden text-left"
                >
                  <div className="aspect-[4/3] overflow-hidden relative bg-muted/20">
                    {gallery.coverImageUrl ? (
                      <img
                        src={gallery.coverImageUrl}
                        alt={gallery.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60" />
                    <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                      <Camera className="w-3 h-3" />
                      Galeri
                    </div>
                  </div>
                  <div className="p-5 relative z-10">
                    <h3 className="font-serif text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {gallery.title}
                    </h3>
                    {gallery.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-reading">{gallery.description}</p>
                    )}
                    {gallery.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/20">{formatDate(gallery.publishedAt)}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </main>

      {lightboxPhoto && (
        <Lightbox
          photos={lightboxPhoto.photos}
          initialIndex={lightboxPhoto.index}
          onClose={() => setLightboxPhoto(null)}
        />
      )}

      <Footer />
    </div>
  );
}
