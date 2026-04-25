import { useParams, Link } from "wouter";
import { ArrowLeft, Mail, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const authorId = parseInt(id ?? "0");

  const { data: author, isLoading: authorLoading } = trpc.authors.byId.useQuery(
    { id: authorId },
    { enabled: !!authorId }
  );

  const { data: articles, isLoading: articlesLoading } = trpc.authors.articles.useQuery(
    { authorId, limit: 20 },
    { enabled: !!authorId }
  );

  const { data: categories } = trpc.categories.list.useQuery();
  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  if (authorLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-7 mb-10">
              <div className="w-24 h-24 rounded-full bg-muted/20 flex-shrink-0 animate-shimmer" />
              <div className="flex-1 space-y-4">
                <div className="h-7 bg-muted/20 rounded-full w-1/3 animate-shimmer" />
                <div className="h-4 bg-muted/20 rounded-full w-full animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-5">
            <Users className="w-6 h-6 opacity-20" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Yazar bulunamadı</h1>
          <Link href="/yazarlar" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Yazarlara dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Author Hero — Liquid Glass */}
      <div className="relative py-12 md:py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="container relative">
          <Link href="/yazarlar" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Yazarlar
          </Link>

          <div className="liquid-glass-elevated rounded-3xl p-7 md:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-3 ring-border/30 shadow-lg">
                {author.avatarUrl ? (
                  <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold font-serif">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{author.name}</h1>
                {author.bio && (
                  <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed font-reading">{author.bio}</p>
                )}
                {author.email && (
                  <a href={`mailto:${author.email}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mt-3 font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    {author.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-1 h-6 rounded-full bg-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {author.name} Yazıları
          </h2>
          {articles && (
            <span className="text-muted-foreground text-sm ml-2">{articles.length} yazı</span>
          )}
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] bg-muted/20 animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted/20 rounded-full w-1/3" />
                  <div className="h-4 bg-muted/20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => {
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
            <p className="text-lg font-serif">Bu yazara ait henüz yazı yok.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
