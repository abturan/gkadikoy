import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, Clock, Eye, Tag, Share2, BookOpen,
  Twitter, Facebook, Copy, CheckCircle,
  ChevronRight, User, X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import ReadingControls from "@/components/ReadingControls";
import CommentsSection from "@/components/CommentsSection";

function estimateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const wordCount = text.split(" ").length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  const { data: article, isLoading } = trpc.articles.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const incrementView = trpc.articles.incrementView.useMutation();

  useEffect(() => {
    if (article?.id) incrementView.mutate({ id: article.id });
  }, [article?.id]);

  const { data: categories } = trpc.categories.list.useQuery();
  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));
  const cat = article ? catMap[article.categoryId] : null;

  const { data: related } = trpc.articles.related.useQuery(
    { categoryId: article?.categoryId ?? 0, excludeId: article?.id ?? 0, limit: 4 },
    { enabled: !!article }
  );

  const { data: author } = trpc.authors.byId.useQuery(
    { id: article?.authorId ?? 0 },
    { enabled: !!article?.authorId }
  );

  const { data: authorArticles } = trpc.authors.articles.useQuery(
    { authorId: article?.authorId ?? 0, limit: 4 },
    { enabled: !!article?.authorId }
  );

  const { data: articleTags } = trpc.tags.byArticle.useQuery(
    { articleId: article?.id ?? 0 },
    { enabled: !!article?.id }
  );

  const readingTime = useMemo(() => {
    if (!article?.content) return 0;
    return estimateReadingTime(article.content);
  }, [article?.content]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title ?? "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-14">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="h-4 bg-muted w-1/4 animate-shimmer" />
            <div className="h-12 bg-muted animate-shimmer" />
            <div className="h-8 bg-muted w-3/4 animate-shimmer" />
            <div className="aspect-[16/9] bg-muted animate-shimmer" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-24 text-center">
          <div className="w-14 h-14 bg-muted flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-6 h-6 opacity-40" />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-3">Haber Bulunamadı</h1>
          <p className="text-muted-foreground mb-6 font-reading">Aradığınız haber mevcut değil veya arşivden kaldırılmış olabilir.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-press font-ui font-bold uppercase tracking-wider text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const otherAuthorArticles = authorArticles?.filter((a) => a.id !== article.id).slice(0, 3) ?? [];

  // ══ Reading mode: minimal chrome, wide typography ══
  if (readingMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Floating exit bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-3xl mx-auto px-6 flex items-center justify-between h-14">
            <button
              onClick={() => setReadingMode(false)}
              className="flex items-center gap-2 text-sm font-ui font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-4 h-4" />
              Okuma Modundan Çık
            </button>
            <div className="kicker text-muted-foreground">Okuma Modu · {cat?.name ?? ""}</div>
          </div>
        </div>

        <main className="pt-12 pb-20">
          <article className="max-w-3xl mx-auto px-6">
            {cat && <div className="kicker text-press mb-4">{cat.name}</div>}
            <h1 className="headline-xl text-[2.25rem] md:text-[3rem] text-foreground leading-[0.98] mb-6">
              {article.title}
            </h1>
            {article.summary && (
              <p className="dek text-[1.3rem] leading-[1.45] text-foreground/75 mb-8">
                {article.summary}
              </p>
            )}
            {author && (
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border">
                <div className="w-12 h-12 overflow-hidden border border-border">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center font-display text-lg">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="kicker text-muted-foreground mb-0.5">Yazan</div>
                  <div className="font-serif font-bold text-base">{author.name}</div>
                </div>
                <div className="ml-auto byline text-right">
                  <div>{formatDate(article.publishedAt)}</div>
                  <div>{readingTime} dk okuma</div>
                </div>
              </div>
            )}

            <ReadingControls
              articleTitle={article.title}
              articleContent={article.content}
              readingTime={readingTime}
              readingMode={readingMode}
              onToggleReadingMode={() => setReadingMode(!readingMode)}
            />

            {article.imageUrl && (
              <figure className="my-10">
                <img src={article.imageUrl} alt={article.title} className="w-full border-y border-border" />
              </figure>
            )}

            <div
              className="article-content text-[1.125rem] leading-[1.85]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="max-w-[68rem] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-ui mb-8" aria-label="Breadcrumb">
            <Link href="/" className="text-muted-foreground hover:text-press transition-colors uppercase tracking-wider">Ana Sayfa</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            {cat && (
              <>
                <Link href={`/kategori/${cat.slug}`} className="text-press font-bold uppercase tracking-wider hover:underline">
                  {cat.name}
                </Link>
                <ChevronRight className="w-3 h-3 opacity-40" />
              </>
            )}
            <span className="text-muted-foreground/60 truncate max-w-xs">{article.title}</span>
          </nav>

          <article>
            {/* ══ Story masthead ══ */}
            <div className="border-t-2 border-primary pt-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                {article.isBreaking && (
                  <span className="kicker bg-press text-primary-foreground px-2.5 py-1 animate-pulse-glow">
                    Son Dakika
                  </span>
                )}
                {cat && (
                  <Link href={`/kategori/${cat.slug}`} className="kicker text-press hover:underline">
                    {cat.name}
                  </Link>
                )}
                <span className="kicker text-muted-foreground">{formatDate(article.publishedAt)}</span>
              </div>

              <h1 className="headline-xl text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] text-foreground leading-[0.98] max-w-[24ch]">
                {article.title}
              </h1>

              {/* Dek / summary */}
              {article.summary && (
                <p className="dek text-[1.25rem] md:text-[1.4rem] mt-6 leading-[1.4] max-w-[62ch] text-foreground/80">
                  {article.summary}
                </p>
              )}

              {/* Byline row */}
              <div className="flex flex-wrap items-center gap-5 mt-7 pt-5 border-t border-border">
                {author && (
                  <Link href={`/yazar/${author.id}`} className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 overflow-hidden flex-shrink-0 border border-border grayscale group-hover:grayscale-0 transition-all">
                      {author.avatarUrl ? (
                        <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-foreground text-sm font-display">
                          {author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="kicker text-muted-foreground text-[0.6rem]">Yazan</div>
                      <div className="font-serif text-sm font-bold text-foreground group-hover:text-press transition-colors">{author.name}</div>
                    </div>
                  </Link>
                )}
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="flex flex-wrap items-center gap-4 byline">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {readingTime} dk okuma
                  </span>
                  {article.viewCount !== null && article.viewCount !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewCount.toLocaleString("tr-TR")} görüntülenme
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reading controls */}
            <div className="mb-8">
              <ReadingControls
                articleTitle={article.title}
                articleContent={article.content}
                readingTime={readingTime}
                readingMode={readingMode}
                onToggleReadingMode={() => setReadingMode(!readingMode)}
              />
            </div>

            {/* Cover image — full bleed */}
            {article.imageUrl && (
              <figure className="mb-10 border-y border-border">
                <div className="aspect-[16/9]">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.summary && (
                  <figcaption className="byline italic text-center py-3 border-t border-border bg-muted/40">
                    {article.summary.slice(0, 120)}{article.summary.length > 120 ? "..." : ""}
                  </figcaption>
                )}
              </figure>
            )}

            {/* ══ Article body + sidebar ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left: share rail (desktop) */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 flex flex-col gap-2">
                  <div className="kicker text-muted-foreground border-b border-border pb-2 mb-1 writing-vertical">Paylaş</div>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-10 h-10 bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-press hover:border-press transition-colors"
                    title="Twitter'da paylaş"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-10 h-10 bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-press hover:border-press transition-colors"
                    title="Facebook'ta paylaş"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="w-10 h-10 bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-press hover:border-press transition-colors"
                    title="WhatsApp'ta paylaş"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "w-10 h-10 bg-card border flex items-center justify-center transition-colors",
                      copied
                        ? "text-press border-press"
                        : "border-border text-foreground/70 hover:text-press hover:border-press"
                    )}
                    title="Linki kopyala"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main content */}
              <div className="lg:col-span-11">
                <div
                  className="article-content max-w-[64ch]"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
                {articleTags && articleTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-12 pt-6 border-t-2 border-double border-primary">
                    <Tag className="w-4 h-4 text-press mr-1" />
                    <span className="kicker text-muted-foreground mr-2">Etiketler</span>
                    {articleTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs font-ui font-medium px-2.5 py-1 bg-muted text-muted-foreground hover:bg-press hover:text-primary-foreground transition-colors cursor-default"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mobile share bar */}
                <div className="flex lg:hidden items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
                  <span className="flex items-center gap-2 kicker text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                    Paylaş
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-9 h-9 border border-border flex items-center justify-center text-foreground/70 hover:text-press hover:border-press transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-9 h-9 border border-border flex items-center justify-center text-foreground/70 hover:text-press hover:border-press transition-colors"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "w-9 h-9 border flex items-center justify-center transition-colors",
                        copied ? "text-press border-press" : "border-border text-foreground/70 hover:text-press hover:border-press"
                      )}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ══ Author Box ══ */}
          {author && (
            <div className="mt-14 border-t-2 border-double border-primary pt-8 bg-muted/40 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href={`/yazar/${author.id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 overflow-hidden border border-border grayscale hover:grayscale-0 transition-all">
                    {author.avatarUrl ? (
                      <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-card flex items-center justify-center text-foreground text-3xl font-display">
                        {author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="kicker text-press mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Yazar
                  </div>
                  <Link href={`/yazar/${author.id}`}>
                    <h3 className="font-display text-2xl text-foreground hover:text-press transition-colors">
                      {author.name}
                    </h3>
                  </Link>
                  {author.bio && (
                    <p className="font-reading text-[0.95rem] text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {author.bio}
                    </p>
                  )}
                  {otherAuthorArticles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="kicker text-muted-foreground mb-2">Diğer Yazıları</p>
                      <ul className="space-y-1.5">
                        {otherAuthorArticles.map((a) => (
                          <li key={a.id}>
                            <Link
                              href={`/haber/${a.slug}`}
                              className="font-serif text-sm font-semibold text-foreground hover:text-press transition-colors line-clamp-1"
                            >
                              → {a.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href={`/yazar/${author.id}`}
                    className="inline-flex items-center gap-1.5 mt-4 kicker text-press hover:underline"
                  >
                    Tüm Yazıları <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ══ Error report ══ */}
          <div className="mt-8 text-center">
            <a
              href={`mailto:hata@gazetekadikoy.com.tr?subject=${encodeURIComponent(`Hata Bildirimi: ${article.title}`)}&body=${encodeURIComponent(`Haber başlığı: ${article.title}\nHaber linki: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nHata açıklaması:\n`)}`}
              className="inline-flex items-center gap-2 byline hover:text-press transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="hover:underline">Bu haberde hata mı var? Bildirin</span>
            </a>
          </div>

          {/* ══ Comments ══ */}
          <CommentsSection articleId={article.id} />

          {/* ══ Related ══ */}
          {related && related.length > 0 && (
            <section className="mt-14">
              <div className="flex items-baseline justify-between pb-2 border-b-2 border-primary mb-6">
                <h2 className="font-display text-[1.75rem] text-primary leading-none">İlgili Haberler</h2>
                <div className="kicker text-muted-foreground">{cat?.name ?? ""}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((rel) => (
                  <ArticleCard
                    key={rel.id}
                    article={rel}
                    categorySlug={cat?.slug ?? ""}
                    categoryName={cat?.name ?? ""}
                    variant="default"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
