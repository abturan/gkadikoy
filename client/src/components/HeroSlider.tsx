import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  imageUrl?: string | null;
  categoryId: number;
  publishedAt: Date;
  isBreaking?: boolean | null;
}

interface HeroSliderProps {
  articles: Article[];
  categories: Array<{ id: number; name: string; slug: string }>;
  autoAdvanceMs?: number;
  className?: string;
}

export default function HeroSlider({
  articles,
  categories,
  autoAdvanceMs = 7000,
  className,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const go = useCallback((idx: number) => {
    setCurrent(((idx % articles.length) + articles.length) % articles.length);
  }, [articles.length]);

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Auto-advance
  useEffect(() => {
    if (paused || articles.length <= 1) return;
    timerRef.current = setTimeout(next, autoAdvanceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, next, autoAdvanceMs, articles.length]);

  // Keyboard navigation when slider focused
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 40) {
      if (delta > 0) prev();
      else next();
    }
    setTouchStart(null);
  };

  if (!articles.length) return null;

  return (
    <div
      ref={sliderRef}
      className={cn("relative w-full overflow-hidden group", className)}
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Öne çıkan haberler"
    >
      {/* Slides — all rendered, cross-fade */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        {articles.map((article, i) => {
          const cat = catMap[article.categoryId];
          const active = i === current;
          return (
            <div
              key={article.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
              aria-hidden={!active}
            >
              {/* Background image with Ken Burns zoom on active slide */}
              <div className="absolute inset-0 overflow-hidden">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform ease-out",
                      active ? "scale-105 duration-[8000ms]" : "scale-100 duration-0"
                    )}
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <Link
                href={`/haber/${article.slug}`}
                className="relative z-10 h-full flex items-end"
              >
                <div className="container pb-16 md:pb-20 lg:pb-24">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-5">
                      {article.isBreaking && (
                        <span className="kicker bg-press text-primary-foreground px-3 py-1.5 animate-pulse-glow">
                          ● Son Dakika
                        </span>
                      )}
                      {cat && (
                        <span className="kicker bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground px-3 py-1.5 border border-primary-foreground/20">
                          {cat.name}
                        </span>
                      )}
                      <span className="kicker text-primary-foreground/70">
                        {timeAgo(article.publishedAt)}
                      </span>
                    </div>

                    <h1 className={cn(
                      "font-display text-primary-foreground leading-[0.95] tracking-[-0.025em]",
                      "text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4.5rem]",
                      "transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}>
                      {article.title}
                    </h1>

                    {article.summary && (
                      <p className={cn(
                        "dek text-[1.05rem] md:text-[1.2rem] text-primary-foreground/85 mt-5 max-w-2xl leading-[1.45] hidden md:block",
                        "transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-150",
                        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      )}>
                        {article.summary}
                      </p>
                    )}

                    <div className={cn(
                      "mt-6 inline-flex items-center gap-2 text-primary-foreground kicker border-b border-primary-foreground/60 pb-1 transition-all duration-[1500ms] delay-200",
                      active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}>
                      Habere Git <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      {articles.length > 1 && (
        <>
          {/* Prev */}
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary text-primary-foreground backdrop-blur-md border border-primary-foreground/30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Önceki haber"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary text-primary-foreground backdrop-blur-md border border-primary-foreground/30 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label="Sonraki haber"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pause/Play */}
          <button
            onClick={(e) => { e.preventDefault(); setPaused((p) => !p); }}
            className="absolute top-5 right-5 md:top-6 md:right-6 z-20 w-9 h-9 bg-primary-foreground/10 hover:bg-primary-foreground/25 backdrop-blur-md border border-primary-foreground/30 text-primary-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={paused ? "Otomatik geçişi başlat" : "Otomatik geçişi durdur"}
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Dots + progress */}
          <div className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); go(i); }}
                className={cn(
                  "h-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  i === current
                    ? "w-10 bg-primary-foreground"
                    : "w-5 bg-primary-foreground/35 hover:bg-primary-foreground/60"
                )}
                aria-label={`${i + 1}. habere git`}
                aria-current={i === current}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute bottom-5 md:bottom-7 right-5 md:right-7 z-20 kicker text-primary-foreground/80">
            {String(current + 1).padStart(2, "0")} / {String(articles.length).padStart(2, "0")}
          </div>
        </>
      )}
    </div>
  );
}
