import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn, getCategoryColor, getCategoryLightColor } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "latest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
];

const DATE_FILTERS = [
  { value: "all", label: "Tüm Tarihler" },
  { value: "today", label: "Bugün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("latest");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: category } = trpc.categories.bySlug.useQuery({ slug: slug ?? "" });
  const { data: articles, isLoading } = trpc.articles.byCategory.useQuery(
    { categoryId: category?.id ?? 0, limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { enabled: !!category?.id }
  );
  const { data: totalCount } = trpc.articles.countByCategory.useQuery(
    { categoryId: category?.id ?? 0 },
    { enabled: !!category?.id }
  );

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);
  const color = getCategoryColor(slug ?? "");
  const lightColor = getCategoryLightColor(slug ?? "");

  const filteredArticles = articles ? articles.filter((a) => {
    if (dateFilter === "all") return true;
    const now = new Date();
    const pubDate = new Date(a.publishedAt);
    if (dateFilter === "today") {
      return pubDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return pubDate >= weekAgo;
    }
    if (dateFilter === "month") {
      return pubDate.getMonth() === now.getMonth() && pubDate.getFullYear() === now.getFullYear();
    }
    return true;
  }) : [];

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sort === "oldest") return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Category Hero — Liquid Glass */}
      <div className="relative py-12 md:py-14 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="container relative">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Ana Sayfa
          </Link>
          <div className="flex items-center gap-4">
            <div className={cn("w-1 h-12 rounded-full", color.bg)} />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                {category?.name ?? slug}
              </h1>
              {totalCount !== undefined && (
                <p className="text-muted-foreground text-sm mt-1">{totalCount} haber</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {/* Filters — Liquid Glass bar */}
        <div className="flex items-center justify-between mb-7 liquid-glass rounded-2xl px-5 py-3">
          <p className="text-sm text-muted-foreground relative z-10">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount ?? 0)} / {totalCount ?? 0} haber
          </p>
          <div className="flex items-center gap-3 relative z-10">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
              className="text-sm bg-transparent border-none rounded-xl px-2 py-1.5 text-foreground focus:outline-none cursor-pointer"
            >
              {DATE_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="w-px h-4 bg-border/30" />
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="text-sm bg-transparent border-none rounded-xl px-2 py-1.5 text-foreground focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] bg-muted/30 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted/30 rounded-full w-1/3" />
                  <div className="h-4 bg-muted/30 rounded-full" />
                  <div className="h-4 bg-muted/30 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                categorySlug={slug ?? ""}
                categoryName={category?.name ?? ""}
                variant="default"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-6 h-6 opacity-25" />
            </div>
            <p className="text-lg font-serif">Bu kategoride henüz haber yok.</p>
          </div>
        )}

        {/* Pagination — Liquid Glass pills */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-full border border-border/30 hover:bg-foreground/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "w-10 h-10 rounded-full text-sm font-semibold transition-all",
                  i === page
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border border-border/30 hover:bg-foreground/[0.04] text-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-full border border-border/30 hover:bg-foreground/[0.04] disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
