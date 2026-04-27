import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn, timeAgo } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type AuthorPreview = {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
};

type ArticlePreview = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  imageUrl?: string | null;
  categoryId: number;
  authorId?: number | null;
  publishedAt: Date;
  isBreaking?: boolean | null;
};

function uniqueById<T extends { id: number }>(items: T[]) {
  return items.filter(
    (item, index, arr) =>
      arr.findIndex(candidate => candidate.id === item.id) === index
  );
}

const TR_MONTHS = [
  "OCAK",
  "ŞUBAT",
  "MART",
  "NİSAN",
  "MAYIS",
  "HAZİRAN",
  "TEMMUZ",
  "AĞUSTOS",
  "EYLÜL",
  "EKİM",
  "KASIM",
  "ARALIK",
];

function formatDateTr(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function ArrowBadge({
  large = false,
  className,
}: {
  large?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "ink-arrow-badge",
        large && "ink-arrow-badge-lg",
        className
      )}
    >
      <ArrowUpRight className={cn("h-4.5 w-4.5", large && "h-6 w-6")} />
    </span>
  );
}

function StoryMeta({
  article,
  authorMap,
  light = false,
}: {
  article: ArticlePreview;
  authorMap: Record<number, AuthorPreview>;
  light?: boolean;
}) {
  const author = article.authorId ? authorMap[article.authorId] : undefined;

  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2 text-[0.75rem] font-ui",
        light ? "text-white/72" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border",
          light
            ? "border-white/16 bg-white/10"
            : "border-border bg-background/70"
        )}
      >
        {author?.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[0.62rem] font-semibold uppercase">
            {(author?.name ?? "GK").slice(0, 2)}
          </span>
        )}
      </span>
      <span className="font-medium">{author?.name ?? "Editör Masası"}</span>
      <span className="h-1 w-1 rounded-full bg-current/40" />
      <span>{timeAgo(article.publishedAt)}</span>
    </div>
  );
}

function SearchForm({
  onSearch,
  dark = false,
  compact = false,
}: {
  onSearch: (query: string) => void;
  dark?: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!query.trim()) return;
        onSearch(query.trim());
        setQuery("");
      }}
      className={cn(
        "mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border px-3 py-2 backdrop-blur-sm",
        dark
          ? "border-white/12 bg-white/8"
          : "border-border/80 bg-white/70 shadow-[0_12px_32px_rgba(19,19,19,0.05)]",
        compact ? "max-w-xl" : ""
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          dark
            ? "bg-white/10 text-white/72"
            : "bg-background text-muted-foreground"
        )}
      >
        <Search className="h-4.5 w-4.5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Haber, konu ya da semt ara"
        className={cn(
          "min-w-0 flex-1 bg-transparent font-ui text-sm outline-none",
          dark
            ? "text-white placeholder:text-white/45"
            : "text-foreground placeholder:text-muted-foreground"
        )}
      />
      <button type="submit" className="ink-cta shrink-0">
        Haberde Ara
      </button>
    </form>
  );
}

function SectionHeader({
  title,
  cta,
  dark = false,
}: {
  title: string;
  cta?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2
        className={cn(
          "font-ui text-[1.55rem] font-bold tracking-[-0.04em]",
          dark ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {cta ? (
        <span className="ink-cta hidden sm:inline-flex">
          {cta} <ArrowUpRight className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}

function HeroLeadCard({
  article,
  category,
  authorMap,
}: {
  article: ArticlePreview;
  category?: Category;
  authorMap: Record<number, AuthorPreview>;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className="group block">
      <article className="relative">
        <div className="relative overflow-hidden rounded-[0.2rem] bg-[#0f1722]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[1.25/1] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[1.25/1] bg-[#0f1722]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            {category && <div className="ink-chip">{category.name}</div>}
            <h2 className="mt-4 max-w-[14ch] font-ui text-[2rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-white md:text-[2.5rem]">
              {article.title}
            </h2>
            {article.summary && (
              <p className="mt-3 max-w-[32rem] font-ui text-[0.96rem] leading-[1.65] text-white/78 line-clamp-3">
                {article.summary}
              </p>
            )}
            <StoryMeta article={article} authorMap={authorMap} light />
          </div>
        </div>
      </article>
    </Link>
  );
}

function HeroSideCard({
  article,
  category,
  authorMap,
}: {
  article: ArticlePreview;
  category?: Category;
  authorMap: Record<number, AuthorPreview>;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className="group block">
      <article className="grid gap-4 rounded-[0.2rem] border border-border/80 bg-white/78 p-3 shadow-[0_10px_28px_rgba(19,19,19,0.05)] backdrop-blur-sm sm:grid-cols-[170px_1fr]">
        <div className="relative overflow-hidden rounded-[0.2rem] bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[1.25/1] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="aspect-[1.25/1] bg-muted" />
          )}
        </div>
        <div className="min-w-0 self-center pr-1">
          {category && (
            <div className="text-[0.68rem] font-ui font-bold uppercase tracking-[0.15em] text-press">
              {category.name}
            </div>
          )}
          <h3 className="mt-2 font-ui text-[1.15rem] font-extrabold leading-[1.14] tracking-[-0.04em] text-foreground transition-colors group-hover:text-press">
            {article.title}
          </h3>
          {article.summary && (
            <p className="mt-2 font-ui text-[0.88rem] leading-[1.55] text-muted-foreground line-clamp-3">
              {article.summary}
            </p>
          )}
          <StoryMeta article={article} authorMap={authorMap} />
        </div>
      </article>
    </Link>
  );
}

function Ticker({ items }: { items: ArticlePreview[] }) {
  if (!items.length) return null;

  return (
    <div className="ink-surface mt-6 overflow-hidden rounded-full px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-[#171717] px-4 py-2 text-[0.68rem] font-ui font-semibold uppercase tracking-[0.14em] text-white">
          Akışta
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="animate-ticker items-center">
            {[...items, ...items].map((article, index) => (
              <Link
                key={`${article.id}-${index}`}
                href={`/haber/${article.slug}`}
                className="inline-flex items-center gap-3 whitespace-nowrap text-[0.8rem] font-ui font-medium text-foreground/72 hover:text-press"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-press/85" />
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsCard({
  article,
  category,
  authorMap,
}: {
  article: ArticlePreview;
  category?: Category;
  authorMap: Record<number, AuthorPreview>;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className="group block">
      <article className="min-w-0">
        <div className="relative overflow-hidden rounded-[0.2rem] bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[1.28/1] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="aspect-[1.28/1] bg-muted" />
          )}
        </div>
        {category && (
          <div className="mt-4 text-[0.68rem] font-ui font-bold uppercase tracking-[0.15em] text-press">
            {category.name}
          </div>
        )}
        <h3 className="mt-2 font-ui text-[1.08rem] font-extrabold leading-[1.2] tracking-[-0.04em] text-foreground transition-colors group-hover:text-press">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-2 font-ui text-[0.86rem] leading-[1.55] text-muted-foreground line-clamp-3">
            {article.summary}
          </p>
        )}
        <StoryMeta article={article} authorMap={authorMap} />
      </article>
    </Link>
  );
}

function LatestNewsCard({
  article,
  category,
  authorMap,
}: {
  article: ArticlePreview;
  category?: Category;
  authorMap: Record<number, AuthorPreview>;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className="group block">
      <article className="grid h-full gap-4 rounded-[0.2rem] border border-border/75 bg-white/74 p-3 shadow-[0_12px_30px_rgba(21,21,21,0.05)] backdrop-blur-sm sm:grid-cols-[155px_1fr]">
        <div className="relative overflow-hidden rounded-[0.2rem] bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[1.12/1] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="aspect-[1.12/1] bg-muted" />
          )}
        </div>

        <div className="min-w-0 self-center">
          {category && (
            <div className="text-[0.66rem] font-ui font-bold uppercase tracking-[0.15em] text-press">
              {category.name}
            </div>
          )}
          <h3 className="mt-2 font-ui text-[1.04rem] font-extrabold leading-[1.16] tracking-[-0.04em] text-foreground transition-colors group-hover:text-press">
            {article.title}
          </h3>
          {article.summary && (
            <p className="mt-2 font-ui text-[0.84rem] leading-[1.55] text-muted-foreground line-clamp-3">
              {article.summary}
            </p>
          )}
          <StoryMeta article={article} authorMap={authorMap} />
        </div>
      </article>
    </Link>
  );
}

function PopularMiniCard({
  article,
  authorMap,
  tiltClass,
}: {
  article: ArticlePreview;
  authorMap: Record<number, AuthorPreview>;
  tiltClass?: string;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className={cn("group block", tiltClass)}>
      <article className="grid gap-3 rounded-[0.8rem] border-4 border-black bg-[repeating-linear-gradient(45deg,#f9ff4f_0px,#f9ff4f_10px,#ff6bcb_10px,#ff6bcb_20px)] p-2 shadow-[8px_8px_0_#0048ff] transition-all duration-200 sm:grid-cols-[124px_1fr] group-hover:-translate-y-1">
        <div className="relative overflow-hidden border-2 border-black bg-white ring-2 ring-[#18ff00]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-square h-full w-full object-cover saturate-200 contrast-125 transition-transform duration-300 group-hover:scale-[1.08]"
            />
          ) : (
            <div className="aspect-square bg-[#d1d5db]" />
          )}
        </div>
        <div className="min-w-0 rounded-[0.45rem] border-2 border-black bg-[#00d4ff] p-2 ring-2 ring-black/40">
          <h4 className="font-mono text-[0.9rem] font-black leading-[1.15] uppercase tracking-[-0.01em] text-black transition-colors group-hover:text-[#7300ff]">
            {article.title}
          </h4>
          <StoryMeta article={article} authorMap={authorMap} />
        </div>
      </article>
    </Link>
  );
}

function HighlightLead({
  article,
  category,
  authorMap,
}: {
  article: ArticlePreview;
  category?: Category;
  authorMap: Record<number, AuthorPreview>;
}) {
  return (
    <Link href={`/haber/${article.slug}`} className="group block">
      <article className="relative">
        <div className="relative overflow-hidden rounded-[0.2rem] bg-[#101112]">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[2.2/1] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[2.2/1] bg-[#101112]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/26 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            {category && <div className="ink-chip">{category.name}</div>}
            <h3 className="mt-4 max-w-[18ch] font-ui text-[1.95rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-white md:text-[2.45rem]">
              {article.title}
            </h3>
            {article.summary && (
              <p className="mt-3 max-w-[46rem] font-ui text-[0.94rem] leading-[1.62] text-white/76 line-clamp-3">
                {article.summary}
              </p>
            )}
            <StoryMeta article={article} authorMap={authorMap} light />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { data: featured } = trpc.articles.featured.useQuery({ limit: 8 });
  const { data: latest } = trpc.articles.latest.useQuery({ limit: 32 });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: authors } = trpc.authors.list.useQuery();
  const { data: mostRead } = trpc.mostRead.list.useQuery({ limit: 4 });
  const { data: breaking } = trpc.articles.breaking.useQuery({ limit: 8 });

  if (!categories) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <div className="h-20 w-72 animate-shimmer rounded-full bg-muted/70" />
          <div className="mt-8 aspect-[16/9] animate-shimmer rounded-[0.2rem] bg-muted/70" />
        </div>
        <Footer />
      </div>
    );
  }

  const categoryMap = Object.fromEntries(
    categories.map((category: Category) => [category.id, category])
  ) as Record<number, Category>;
  const authorMap = Object.fromEntries(
    (authors ?? []).map((author: AuthorPreview) => [author.id, author])
  ) as Record<number, AuthorPreview>;

  const feed = uniqueById([
    ...(featured ?? []),
    ...(latest ?? []),
  ]) as ArticlePreview[];
  const bannerArticle = feed[0];
  const heroLead = feed[1];
  const heroSide = feed.slice(2, 5);
  const latestCards = feed.slice(5, 9);

  const usedTopIds = new Set(
    [
      bannerArticle?.id,
      heroLead?.id,
      ...heroSide.map(article => article.id),
      ...latestCards.map(article => article.id),
    ].filter(Boolean)
  );

  const popularPool = uniqueById([
    ...((mostRead ?? []) as ArticlePreview[]),
    ...feed,
  ]).filter(article => !usedTopIds.has(article.id));
  const popularLead = popularPool[0];
  const popularCards = popularPool.slice(1, 4);

  const trendingItems = uniqueById([
    ...((mostRead ?? []) as ArticlePreview[]),
    ...feed,
  ]).slice(0, 5);

  const kulturSanatCategory = categories.find(
    (c: Category) => c.slug === "kultur-sanat"
  );
  const kulturSanatPool = kulturSanatCategory
    ? feed.filter(article => article.categoryId === kulturSanatCategory.id)
    : [];
  const kulturLead = kulturSanatPool[0] ?? popularLead;
  const kulturCards = (
    kulturSanatPool.length >= 4 ? kulturSanatPool.slice(1, 4) : popularCards
  );

  const usedHighlightIds = new Set(
    [
      heroLead?.id,
      ...heroSide.map(article => article.id),
      ...latestCards.map(article => article.id),
      popularLead?.id,
      ...popularCards.map(article => article.id),
    ].filter(Boolean)
  );
  const highlightPool = feed.filter(
    article => !usedHighlightIds.has(article.id)
  );
  const highlightLead = highlightPool[0];
  const highlightCards = highlightPool.slice(1, 5);
  const kulturLeadAuthor = kulturLead?.authorId
    ? authorMap[kulturLead.authorId]
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="relative z-10 overflow-hidden">
        <div className="container pb-10 md:pb-12">
          <section className="pt-8 pb-10">
            {bannerArticle && (
              <Link
                href={`/haber/${bannerArticle.slug}`}
                className="group block"
              >
                <article className="grid overflow-hidden border border-foreground/85 bg-card md:grid-cols-[1.05fr_1fr]">
                  <div className="flex min-h-[18rem] flex-col justify-center p-6 sm:p-9 md:p-12 lg:p-14">
                    <div className="flex items-center gap-3">
                      <span className="h-[2px] w-10 bg-press" />
                      <span className="font-ui text-[0.7rem] font-bold uppercase tracking-[0.22em] text-press">
                        {categoryMap[bannerArticle.categoryId]?.name ?? "Manşet"}
                      </span>
                    </div>
                    <h1 className="mt-5 font-headline text-[2rem] leading-[1.04] tracking-[-0.02em] text-foreground sm:text-[2.6rem] md:text-[3rem] lg:text-[3.4rem]">
                      {bannerArticle.title}
                    </h1>
                    {bannerArticle.summary && (
                      <p className="mt-5 max-w-[36rem] font-serif text-[1rem] leading-[1.6] text-foreground/72 md:text-[1.08rem]">
                        {bannerArticle.summary}
                      </p>
                    )}
                    <div className="mt-8 flex items-center justify-between gap-4 border-t border-foreground/15 pt-5">
                      <span className="font-ui text-[0.7rem] font-bold uppercase tracking-[0.2em] text-foreground/55">
                        {formatDateTr(bannerArticle.publishedAt)}
                      </span>
                      <span className="inline-flex items-center gap-2 font-serif italic text-[0.95rem] text-foreground transition-colors group-hover:text-press">
                        Devamını oku
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="order-first overflow-hidden bg-muted md:order-last">
                    {bannerArticle.imageUrl ? (
                      <img
                        src={bannerArticle.imageUrl}
                        alt={bannerArticle.title}
                        className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] md:aspect-auto md:min-h-[26rem]"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-muted md:aspect-auto md:min-h-[26rem]" />
                    )}
                  </div>
                </article>
              </Link>
            )}

            <div className="mt-8">
              <SearchForm
                onSearch={query =>
                  navigate(`/arama?q=${encodeURIComponent(query)}`)
                }
              />
            </div>

            {heroLead ? (
              <div className="mt-10 grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(0,0.94fr)]">
                <HeroLeadCard
                  article={heroLead}
                  category={categoryMap[heroLead.categoryId]}
                  authorMap={authorMap}
                />

                <div className="grid gap-4">
                  {heroSide.map(article => (
                    <HeroSideCard
                      key={article.id}
                      article={article}
                      category={categoryMap[article.categoryId]}
                      authorMap={authorMap}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <Ticker
              items={((breaking ?? feed.slice(0, 8)) as ArticlePreview[]).slice(
                0,
                8
              )}
            />
          </section>

          {(!!latestCards.length || !!trendingItems.length) && (
            <section className="pb-12">
              <div className="grid gap-12 lg:grid-cols-2">
                {!!latestCards.length && (
                  <div>
                    <div className="border-b border-border/70 pb-3">
                      <h2 className="font-ui text-[0.78rem] font-semibold uppercase tracking-[0.32em] text-foreground/72">
                        Latest
                      </h2>
                    </div>
                    <ul className="divide-y divide-border/70">
                      {latestCards.map(article => {
                        const category = categoryMap[article.categoryId];
                        return (
                          <li key={article.id} className="py-7">
                            <Link
                              href={`/haber/${article.slug}`}
                              className="group grid gap-5 sm:grid-cols-[210px_1fr]"
                            >
                              {article.imageUrl ? (
                                <div className="overflow-hidden rounded-[0.2rem] bg-muted">
                                  <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-[4/3] w-full rounded-[0.2rem] bg-muted" />
                              )}
                              <div className="min-w-0 self-center">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] font-ui font-bold uppercase tracking-[0.18em]">
                                  {category && (
                                    <span className="text-press">
                                      {category.name}
                                    </span>
                                  )}
                                  <span className="text-muted-foreground/80">
                                    {formatDateTr(article.publishedAt)}
                                  </span>
                                </div>
                                <h3 className="mt-2 font-serif text-[1.55rem] font-semibold leading-[1.12] tracking-[-0.025em] text-foreground transition-colors group-hover:text-press">
                                  {article.title}
                                </h3>
                                {article.summary && (
                                  <p className="mt-3 font-ui text-[0.95rem] leading-[1.6] text-muted-foreground line-clamp-2">
                                    {article.summary}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {!!trendingItems.length && (
                  <div>
                    <div className="border-b border-border/70 pb-3">
                      <h2 className="font-ui text-[0.78rem] font-semibold uppercase tracking-[0.32em] text-foreground/72">
                        Trending
                      </h2>
                    </div>
                    <ol className="divide-y divide-border/70">
                      {trendingItems.map((article, idx) => (
                        <li key={article.id} className="py-6">
                          <Link
                            href={`/haber/${article.slug}`}
                            className="group grid grid-cols-[3.4rem_1fr] items-start gap-4"
                          >
                            <span className="font-ui text-[2.4rem] font-extrabold leading-none tracking-[-0.04em] text-muted-foreground/35">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[0.7rem] font-ui font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
                                {formatDateTr(article.publishedAt)}
                              </div>
                              <h3 className="mt-1 font-serif text-[1.05rem] font-semibold leading-[1.18] tracking-[-0.02em] text-foreground transition-colors group-hover:text-press">
                                {article.title}
                              </h3>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </section>
          )}

          {kulturLead ? (
            <section className="mb-12 overflow-hidden rounded-[1.2rem] border-4 border-black bg-[repeating-linear-gradient(135deg,#ff006e_0px,#ff006e_12px,#ffe600_12px,#ffe600_24px,#00e5ff_24px,#00e5ff_36px,#7fff00_36px,#7fff00_48px)] px-4 py-5 shadow-[0_0_0_4px_#0015ff] md:px-6 md:py-6">
              <div className="mb-4 overflow-hidden border-2 border-black bg-[#adff2f]">
                <p className="whitespace-nowrap px-3 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-black animate-pulse">
                  Dikkat: Bu blok bilinçli olarak göz yorar. Renk dengesi kapatıldı.
                </p>
              </div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="bg-black px-3 py-2 font-mono text-[0.82rem] font-black uppercase tracking-[0.24em] text-[#fff056] sm:text-[1.05rem]">
                  Kültür Sanat / Kadıköy Etkinlikleri / Aşırı Doygun Mod
                </h2>
                <Link
                  href="/etkinlikler"
                  className="inline-flex items-center gap-2 border-2 border-black bg-[#fffb00] px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#651fff] hover:text-white"
                >
                  Tüm Etkinlikler <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <Link
                href={`/haber/${kulturLead.slug}`}
                className="group block"
              >
                <article className="grid gap-4 rounded-[0.9rem] border-4 border-black bg-[#ff6464] p-3 shadow-[10px_10px_0_#1f1147] md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
                  <div className="overflow-hidden border-4 border-black bg-[#fff15f]">
                    {kulturLead.imageUrl ? (
                      <img
                        src={kulturLead.imageUrl}
                        alt={kulturLead.title}
                        className="aspect-[4/3] h-full w-full object-cover saturate-200 contrast-125 brightness-110 transition-transform duration-300 group-hover:scale-[1.08]"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-[#fff15f]" />
                    )}
                  </div>

                  <div className="min-w-0 rounded-[0.7rem] border-4 border-black bg-[#3cf2ff] p-4 ring-2 ring-[#ff00a8]">
                    <div className="inline-flex items-center gap-2 border-2 border-black bg-[#ffe800] px-3 py-1 font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-black animate-pulse">
                      Kültür Sanat
                    </div>
                    <h3 className="mt-3 font-mono text-[1.4rem] font-black leading-[1.05] uppercase tracking-[-0.025em] text-black sm:text-[1.7rem] xl:text-[1.95rem]">
                      {kulturLead.title}
                    </h3>
                    {kulturLead.summary && (
                      <p className="mt-3 font-serif text-[0.95rem] leading-[1.35] tracking-[0.01em] text-black/88 line-clamp-3">
                        {kulturLead.summary}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-black pt-3 font-mono text-[0.66rem] font-bold uppercase tracking-[0.08em] text-black">
                      <span className="bg-black px-2 py-1 text-[#adff2f]">
                        {kulturLeadAuthor?.name ?? "Editör Masası"}
                      </span>
                      <span className="bg-white/80 px-2 py-1">{formatDateTr(kulturLead.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              </Link>

              {!!kulturCards.length && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {kulturCards.map((article, idx) => (
                    <PopularMiniCard
                      key={article.id}
                      article={article}
                      authorMap={authorMap}
                      tiltClass={
                        idx % 3 === 0
                          ? "rotate-1"
                          : idx % 3 === 1
                            ? "-rotate-2"
                            : "rotate-2"
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {highlightLead ? (
            <section className="pb-12">
              <SectionHeader title="Öne Çıkan" cta="Daha Fazla Haber" />
              <HighlightLead
                article={highlightLead}
                category={categoryMap[highlightLead.categoryId]}
                authorMap={authorMap}
              />

              {!!highlightCards.length && (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {highlightCards.map(article => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      category={categoryMap[article.categoryId]}
                      authorMap={authorMap}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <section className="py-12">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/60 px-4 py-2 text-[0.72rem] font-ui font-semibold uppercase tracking-[0.14em] text-foreground/62 shadow-[0_10px_24px_rgba(19,19,19,0.04)]">
                <Sparkles className="h-3.5 w-3.5 text-press" />
                Yeni arayüz
              </div>
              <h2 className="mx-auto mt-7 max-w-[12ch] font-ui text-[2.35rem] font-extrabold leading-[1] tracking-[-0.06em] text-foreground sm:text-[3.5rem]">
                Gündemi daha akıcı keşfet
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-ui text-[1rem] leading-[1.7] text-muted-foreground">
                Büyük manşetler, daha güçlü görsel hiyerarşi ve temiz keşif
                bloklarıyla ana sayfa yeniden kuruldu.
              </p>
            </div>

            <div className="mt-8">
              <SearchForm
                onSearch={query =>
                  navigate(`/arama?q=${encodeURIComponent(query)}`)
                }
                compact
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
