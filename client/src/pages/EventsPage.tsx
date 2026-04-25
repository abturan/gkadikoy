import { useState } from "react";
import { Calendar, MapPin, Clock, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EVENT_CATEGORIES = [
  { value: "all", label: "Tümü" },
  { value: "konser", label: "Konser" },
  { value: "sergi", label: "Sergi" },
  { value: "tiyatro", label: "Tiyatro" },
  { value: "festival", label: "Festival" },
  { value: "sinema", label: "Sinema" },
  { value: "spor", label: "Spor" },
  { value: "diger", label: "Diğer" },
];

const CATEGORY_COLORS: Record<string, string> = {
  konser: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  sergi: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  tiyatro: "bg-red-500/10 text-red-600 dark:text-red-400",
  festival: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  sinema: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  spor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  diger: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

function EventCard({ event }: { event: any }) {
  const catColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.diger;
  const eventDate = new Date(event.eventDate);
  const isToday = new Date().toDateString() === eventDate.toDateString();
  const isPast = eventDate < new Date();

  return (
    <div className={cn(
      "liquid-glass-elevated rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-2px]",
      isPast && "opacity-50"
    )}>
      {event.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden img-zoom">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 relative z-10">
        {/* Date badge + category */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-2xl p-2.5 text-center min-w-[3.5rem]">
            <div className="text-2xl font-bold leading-none font-serif">{eventDate.getDate()}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.15em] opacity-80 mt-0.5">
              {eventDate.toLocaleDateString("tr-TR", { month: "short" })}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
            {event.category && (
              <span className={cn("inline-flex items-center gap-1 text-[0.65rem] font-bold px-2.5 py-1 rounded-full", catColor)}>
                <Tag className="w-3 h-3" />
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </span>
            )}
            {isToday && (
              <span className="inline-flex items-center text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse-glow">
                Bugün
              </span>
            )}
          </div>
        </div>

        <h3 className="font-serif text-lg font-bold text-card-foreground leading-tight mb-2.5">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-reading">{event.description}</p>
        )}

        <div className="space-y-2 text-sm text-muted-foreground pt-3 border-t border-border/20">
          {event.location && (
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span>
              {eventDate.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: events, isLoading } = trpc.events.all.useQuery({ limit: 50 });

  const filtered = events?.filter((e: any) => {
    if (selectedCategory === "all") return true;
    return e.category === selectedCategory;
  }) ?? [];

  const now = new Date();
  const thisWeek = filtered.filter((e: any) => {
    const d = new Date(e.eventDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= -1 && diff <= 7;
  });
  const upcoming = filtered.filter((e: any) => {
    const d = new Date(e.eventDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  });
  const past = filtered.filter((e: any) => {
    const d = new Date(e.eventDate);
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < -1;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header — Liquid Glass */}
      <div className="relative py-14 md:py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-primary/[0.03] rounded-full blur-[80px]" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-11 h-11 rounded-2xl liquid-glass-subtle flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Bu Hafta Ne Yapmalı?</h1>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-[3.625rem]">
            <div className="w-8 h-px bg-primary/30" />
            <p className="text-muted-foreground text-sm md:text-base">Kadıköy'deki bu haftanın etkinlikleri</p>
          </div>
        </div>
      </div>

      <main className="container py-10">
        {/* Category Filter — Liquid Glass pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "liquid-glass-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] bg-muted/30 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted/30 rounded-full w-1/3" />
                  <div className="h-5 bg-muted/30 rounded-full" />
                  <div className="h-4 bg-muted/30 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-7 h-7 opacity-25" />
            </div>
            <p className="text-lg font-serif">Bu kategoride etkinlik bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {thisWeek.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-7 rounded-full bg-primary" />
                  <h2 className="font-serif text-2xl font-bold text-foreground">Bu Hafta</h2>
                  <div className="w-8 h-px bg-primary/20" />
                  <span className="text-sm text-muted-foreground">{thisWeek.length} etkinlik</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {thisWeek.map((event: any) => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-7 rounded-full bg-muted-foreground/50" />
                  <h2 className="font-serif text-2xl font-bold text-foreground">Yaklaşan Etkinlikler</h2>
                  <div className="w-8 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">{upcoming.length} etkinlik</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((event: any) => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-7 rounded-full bg-border" />
                  <h2 className="font-serif text-xl font-bold text-muted-foreground">Geçmiş Etkinlikler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((event: any) => <EventCard key={event.id} event={event} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
