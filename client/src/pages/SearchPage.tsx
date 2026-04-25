import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { Search, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

export default function SearchPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialQuery = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: categories } = trpc.categories.list.useQuery();
  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  const { data: results, isLoading } = trpc.articles.search.useQuery(
    { query: debouncedQuery, limit: 30 },
    { enabled: debouncedQuery.length >= 2 }
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        {/* Search Box — Liquid Glass */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Haber Ara</h1>
            <p className="text-sm text-muted-foreground">Kadıköy'den tüm haberleri arayın</p>
          </div>
          <div className="relative">
            <div className="liquid-glass-elevated rounded-2xl overflow-hidden">
              <div className="relative z-10 flex items-center">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Haber başlığı veya içeriğinde ara..."
                  className="w-full pl-14 pr-14 py-4.5 bg-transparent text-foreground text-base focus:outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-foreground/[0.05] hover:bg-foreground/[0.1] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {debouncedQuery.length >= 2 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Aranıyor...
                </span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">&ldquo;{debouncedQuery}&rdquo;</span> için {results?.length ?? 0} sonuç bulundu
                </>
              )}
            </p>
          )}
        </div>

        {/* Results */}
        {debouncedQuery.length < 2 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-lg font-serif">Aramak için en az 2 karakter girin</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] bg-muted/20 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted/20 rounded-full w-1/3" />
                  <div className="h-4 bg-muted/20 rounded-full" />
                  <div className="h-4 bg-muted/20 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((article) => {
              const cat = catMap[article.categoryId];
              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  categorySlug={cat?.slug ?? ""}
                  categoryName={cat?.name ?? ""}
                  variant="default"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-lg font-serif font-medium">Sonuç bulunamadı</p>
            <p className="text-sm mt-2">&ldquo;{debouncedQuery}&rdquo; için herhangi bir haber bulunamadı.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
