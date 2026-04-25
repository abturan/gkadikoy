import { Link } from "wouter";
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

interface ArticleCardProps {
  article: Article;
  categorySlug?: string;
  categoryName?: string;
  variant?: "hero" | "medium" | "brief" | "horizontal" | "overlay" | "default";
  className?: string;
}

function Meta({
  name,
  breaking,
}: {
  name?: string;
  breaking?: boolean | null;
}) {
  if (!name && !breaking) return null;
  return (
    <div className="flex items-center gap-3">
      {breaking && <span className="kicker text-press">● Son Dakika</span>}
      {name && <span className="kicker text-press">{name}</span>}
    </div>
  );
}

export default function ArticleCard({
  article,
  categorySlug = "",
  categoryName = "",
  variant = "medium",
  className,
}: ArticleCardProps) {
  // ── HERO: Front-page main story ──
  if (variant === "hero") {
    return (
      <Link
        href={`/haber/${article.slug}`}
        className={cn("group block", className)}
      >
        {article.imageUrl && (
          <div className="mb-6 aspect-[16/9] overflow-hidden rounded-[0.2rem] img-zoom">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <Meta name={categoryName} breaking={article.isBreaking} />
        <h1 className="headline-xl text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4rem] text-foreground group-hover:text-press transition-colors mt-3 max-w-[22ch]">
          {article.title}
        </h1>
        {article.summary && (
          <p className="dek text-[1.1rem] md:text-[1.2rem] mt-4 leading-[1.45] max-w-[60ch]">
            {article.summary}
          </p>
        )}
        <p className="byline mt-5">{timeAgo(article.publishedAt)}</p>
      </Link>
    );
  }

  // ── OVERLAY: Image-heavy card with text over image ──
  if (variant === "overlay") {
    return (
      <Link
        href={`/haber/${article.slug}`}
        className={cn(
          "group relative block overflow-hidden rounded-[0.2rem]",
          className
        )}
      >
        <div className="aspect-[4/5] relative img-zoom bg-muted">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 gradient-overlay" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {(article.isBreaking || categoryName) && (
            <div className="flex items-center gap-3 mb-2">
              {article.isBreaking && (
                <span className="kicker text-white">● Son Dakika</span>
              )}
              {categoryName && (
                <span className="kicker text-white/85">{categoryName}</span>
              )}
            </div>
          )}
          <h3 className="headline text-[1.25rem] md:text-[1.5rem] text-white leading-[1.1] line-clamp-3">
            {article.title}
          </h3>
          <p className="byline text-white/60 mt-2">
            {timeAgo(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  // ── BRIEF: Headline-only list item ──
  if (variant === "brief") {
    return (
      <Link
        href={`/haber/${article.slug}`}
        className={cn("group block", className)}
      >
        <Meta name={categoryName} breaking={article.isBreaking} />
        <h4 className="font-serif text-[0.95rem] font-bold text-foreground group-hover:text-press transition-colors line-clamp-3 leading-[1.3] mt-1.5">
          {article.title}
        </h4>
        <p className="byline mt-2">{timeAgo(article.publishedAt)}</p>
      </Link>
    );
  }

  // ── HORIZONTAL: Small image + title row ──
  if (variant === "horizontal") {
    return (
      <Link
        href={`/haber/${article.slug}`}
        className={cn("group flex gap-4 items-start", className)}
      >
        {article.imageUrl && (
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-[0.2rem] img-zoom">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Meta name={categoryName} breaking={article.isBreaking} />
          <h4 className="font-serif text-[0.95rem] font-bold text-foreground group-hover:text-press transition-colors line-clamp-3 leading-snug mt-1.5">
            {article.title}
          </h4>
          <p className="byline mt-1.5">{timeAgo(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  // ── MEDIUM (default): Standard card with image ──
  return (
    <Link
      href={`/haber/${article.slug}`}
      className={cn("group block", className)}
    >
      {article.imageUrl && (
        <div className="mb-4 aspect-[16/10] overflow-hidden rounded-[0.2rem] img-zoom">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <Meta name={categoryName} breaking={article.isBreaking} />
      <h3 className="headline text-[1.2rem] md:text-[1.35rem] text-foreground group-hover:text-press transition-colors mt-1.5 line-clamp-3">
        {article.title}
      </h3>
      {article.summary && (
        <p className="font-reading text-[0.95rem] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
      )}
      <p className="byline mt-3">{timeAgo(article.publishedAt)}</p>
    </Link>
  );
}
