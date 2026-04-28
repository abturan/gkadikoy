import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  CircleDollarSign,
  CloudSun,
  Cpu,
  Globe,
  MessageSquare,
  Newspaper,
  Palette,
  Play,
  PenTool,
  Search,
  Trophy,
  User,
} from "lucide-react";
import kadikoyLogoUrl from "../../assets/logo.png";
import { trpc } from "@/lib/trpc";
import { cn, timeAgo } from "@/lib/utils";

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
  publishedAt: Date | string;
  isBreaking?: boolean | null;
  commentCount?: number | null;
};

type VideoPreview = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  duration?: string | null;
  publishedAt: Date | string;
};

type PhotoGalleryPreview = {
  id: number;
  title: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  publishedAt?: Date | string | null;
};

type NewspaperIssuePreview = {
  id: number;
  issueNumber: number;
  title?: string | null;
  publishDate: Date | string;
  coverImageUrl?: string | null;
  pdfUrl: string;
};

const TR_MONTHS_SHORT = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

const MARKET_ITEMS = [
  { name: "USD/TRY", value: "32,19", change: "+0,13" },
  { name: "EUR/TRY", value: "34,74", change: "+0,21" },
  { name: "BIST 100", value: "10.240", change: "+0,28" },
  { name: "Gram Altın", value: "2.410,80", change: "-0,12" },
];

const FORECAST = [
  { hour: "13:00", temp: "22°" },
  { hour: "16:00", temp: "23°" },
  { hour: "19:00", temp: "21°" },
  { hour: "22:00", temp: "20°" },
];

const THIS_WEEK_TIMELINE = [
  {
    day: "21 Nisan 1967",
    title: "Kadıköy kıyı hattı modern ulaşım planına alındı",
    detail: "İlçenin sahil-kent bağlantısını güçlendiren karar bu hafta alınmıştı.",
  },
  {
    day: "23 Nisan 1985",
    title: "Gençlik ve kültür merkezi ilk kez kapılarını açtı",
    detail: "Bölgede kültür-sanat etkinliklerinin düzenli hale gelmesinde dönüm noktası oldu.",
  },
  {
    day: "25 Nisan 1999",
    title: "Mahalle ölçekli gönüllü dayanışma ağı başlatıldı",
    detail: "Eğitim ve sosyal destek çalışmalarını bir araya getiren model yaygınlaştı.",
  },
  {
    day: "27 Nisan 2012",
    title: "Yerel medya arşivi dijital yayına taşındı",
    detail: "Basılı sayıların dijital erişimiyle kent hafızası daha görünür hale geldi.",
  },
];
const KADIKOY_BLUE = "var(--kadikoy-blue)";

function dedupeById<T extends { id: number }>(items: T[]) {
  return items.filter(
    (item, index, arr) =>
      arr.findIndex(candidate => candidate.id === item.id) === index
  );
}

function toDate(value: Date | string | undefined | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatClock(value: Date | string | undefined | null) {
  const date = toDate(value);
  if (!date) return "--:--";
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatDayMonth(value: Date | string | undefined | null) {
  const date = toDate(value);
  if (!date) return "";
  return `${date.getDate()} ${TR_MONTHS_SHORT[date.getMonth()]}`;
}

function formatBannerDate(value: Date | string | undefined | null) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function bannerBadgeColor(categoryName?: string, slot = 0) {
  const normalized = (categoryName ?? "").toLocaleLowerCase("tr-TR");
  if (normalized.includes("spor")) return "#44ad39";
  if (normalized.includes("ekonomi")) return "#de0f17";
  if (normalized.includes("dünya") || normalized.includes("dunya")) return "#de0f17";
  if (normalized.includes("politika")) return "#de0f17";
  return ["#de0f17", "#de0f17", "#de0f17", "#44ad39"][slot % 4];
}

function getCommentCount(article: ArticlePreview, seed = 0) {
  if (typeof article.commentCount === "number" && Number.isFinite(article.commentCount)) {
    return article.commentCount;
  }
  return (article.id % 21) + 12 + (seed % 5);
}

function Logo24({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex", compact ? "items-center" : "flex-col gap-0.5")}>
      <img
        src={kadikoyLogoUrl}
        alt="Gazete Kadıköy"
        className={cn("w-auto object-contain", compact ? "h-12 md:h-[52px]" : "h-9 md:h-10")}
      />
      {!compact ? (
        <span className="text-[0.7rem] text-zinc-500">Kadıköy Belediyesi Haber Portalı</span>
      ) : null}
    </Link>
  );
}

function BlueMenuBar({
  items,
  currentPath,
}: {
  items: Array<{ label: string; href: string }>;
  currentPath: string;
}) {
  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  const iconForLabel = (label: string) => {
    const normalized = label.toLocaleLowerCase("tr-TR");
    if (normalized.includes("gündem") || normalized.includes("gundem")) return Newspaper;
    if (normalized.includes("dünya") || normalized.includes("dunya")) return Globe;
    if (normalized.includes("ekonomi")) return CircleDollarSign;
    if (normalized.includes("teknoloji")) return Cpu;
    if (normalized.includes("spor")) return Trophy;
    if (normalized.includes("kültür") || normalized.includes("kultur")) return Palette;
    if (normalized.includes("video")) return Play;
    if (normalized.includes("yazar")) return PenTool;
    return ArrowRight;
  };

  return (
    <div
      className="border-b border-black/10"
      style={{
        background:
          "linear-gradient(90deg, var(--kadikoy-blue-dark) 0%, var(--kadikoy-blue) 56%, color-mix(in oklch, var(--kadikoy-blue) 74%, var(--press) 26%) 100%)",
      }}
    >
      <div className="container">
        <nav className="ml-auto flex w-full items-center justify-end gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map(item => {
            const Icon = iconForLabel(item.label);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2.5 py-1 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] transition-colors",
                  isActive(item.href)
                    ? "bg-white text-[var(--kadikoy-blue)]"
                    : "text-white/92 hover:bg-white/14 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function BreakingBar({ items }: { items: ArticlePreview[] }) {
  const lead = items[0];
  if (!lead) return null;

  return (
    <div className="border-t border-b border-zinc-200 bg-zinc-50">
      <div className="container flex items-center gap-2 py-2">
        <span className="inline-flex rounded-[2px] bg-[#de0f17] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white">
          Son Dakika
        </span>
        <span className="text-[0.78rem] font-bold text-zinc-700">
          {formatClock(lead.publishedAt)}
        </span>
        <Link
          href={`/haber/${lead.slug}`}
          className="line-clamp-1 min-w-0 flex-1 text-[0.82rem] text-zinc-700 hover:text-[#de0f17]"
        >
          {lead.title}
        </Link>
        <Link
          href="/arama?q=son%20dakika"
          className="hidden items-center gap-1 text-[0.76rem] font-semibold text-zinc-600 hover:text-[#de0f17] md:inline-flex"
        >
          Tüm son dakika haberleri <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SectionHead({
  title,
  accent,
  href,
}: {
  title: string;
  accent: string;
  href: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="h-4 w-1.5 rounded-full" style={{ background: accent }} />
        <h2 className="font-extrabold uppercase tracking-[0.03em] text-zinc-900" style={{ fontSize: "1.46rem", lineHeight: "1" }}>
          <span>{title}</span>
        </h2>
      </div>
      <Link
        href={href}
        aria-label={`Tüm ${title} Haberleri`}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-[var(--kadikoy-blue)] hover:text-[var(--kadikoy-blue)]"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function TopHero({
  article,
  categoryName,
}: {
  article?: ArticlePreview;
  categoryName?: string;
}) {
  if (!article) {
    return <div className="aspect-[16/8.8] xl:h-full xl:aspect-auto animate-shimmer rounded-[8px] bg-zinc-200" />;
  }

  return (
    <Link href={`/haber/${article.slug}`} className="group block h-full">
      <article className="relative h-full overflow-hidden rounded-[8px] border border-zinc-300/80 bg-zinc-200 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
        <div className="relative">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="aspect-[16/8.8] xl:h-full xl:aspect-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="aspect-[16/8.8] xl:h-full xl:aspect-auto w-full bg-zinc-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/24 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 pb-10 text-white md:p-6 md:pb-11">
            <span
              className="inline-flex rounded-[4px] px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
              style={{ background: bannerBadgeColor(categoryName, 0) }}
            >
              {categoryName ?? "Gündem"}
            </span>
            <h1 className="mt-2 max-w-[19ch] font-extrabold leading-[1.06] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem,3.25vw,4rem)" }}>
              {article.title}
            </h1>
            {article.summary ? (
              <p className="mt-2 max-w-[56ch] text-[0.9rem] leading-[1.45] text-white/90 line-clamp-2">
                {article.summary}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between text-[0.88rem] font-semibold text-white/88">
              <p>
                {formatBannerDate(article.publishedAt)} <span className="mx-1.5 text-white/60">•</span> {formatClock(article.publishedAt)}
              </p>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5" />
                {getCommentCount(article, 3)}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            <span className="h-2.5 w-8 rounded-full bg-[#de0f17] shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
          </div>
        </div>
      </article>
    </Link>
  );
}

function TopMiniBannerCard({
  article,
  categoryName,
  slot,
  layout = "wide",
}: {
  article: ArticlePreview;
  categoryName?: string;
  slot: number;
  layout?: "tall" | "wide";
}) {
  const isTall = layout === "tall";
  return (
    <Link href={`/haber/${article.slug}`} className="group block h-full">
      <article className="relative h-full overflow-hidden rounded-[8px] border border-zinc-300/80 bg-zinc-200 shadow-[0_8px_24px_rgba(0,0,0,0.09)]">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className={cn(
              "w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]",
              isTall
                ? "h-full min-h-[260px] md:min-h-[360px]"
                : "aspect-[16/7.2] md:h-full md:aspect-auto"
            )}
          />
        ) : (
          <div
            className={cn(
              "w-full bg-zinc-200",
              isTall
                ? "h-full min-h-[260px] md:min-h-[360px]"
                : "aspect-[16/7.2] md:h-full md:aspect-auto"
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/28 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white md:p-4">
          <span
            className="inline-flex rounded-[4px] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
            style={{ background: bannerBadgeColor(categoryName, slot + 1) }}
          >
            {categoryName ?? "Gündem"}
          </span>
          <h3
            className={cn(
              "mt-2 font-bold leading-[1.18] text-white transition-colors group-hover:text-white/90 line-clamp-3",
              isTall ? "text-[2rem]" : "text-[1.82rem]"
            )}
            style={{ fontSize: isTall ? "clamp(1.85rem, 2.2vw, 2.7rem)" : "clamp(1.15rem, 1.45vw, 1.9rem)" }}
          >
            {article.title}
          </h3>
          <div className={cn("mt-2 flex items-center justify-between font-semibold text-white/88", isTall ? "text-[0.92rem]" : "text-[0.84rem]")}>
            <p>
              {formatBannerDate(article.publishedAt)} <span className="mx-1.5 text-white/60">•</span> {formatClock(article.publishedAt)}
            </p>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              {getCommentCount(article, slot)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function TopNewsPulse({
  items,
  categoryName,
}: {
  items: ArticlePreview[];
  categoryName: (article?: ArticlePreview | null) => string | undefined;
}) {
  const tiles = items.slice(0, 3);
  if (!tiles.length) {
    return <div className="h-full min-h-[320px] animate-shimmer rounded-[8px] bg-zinc-200" />;
  }

  const lead = tiles[0];
  const top = tiles[1];
  const bottom = tiles[2];

  return (
    <aside className="grid h-full gap-2.5 md:grid-cols-[0.92fr_1.08fr] md:grid-rows-2">
      {lead ? (
        <div className="h-full md:row-span-2">
          <TopMiniBannerCard
            article={lead}
            categoryName={categoryName(lead)}
            slot={0}
            layout="tall"
          />
        </div>
      ) : null}
      {top ? (
        <div className="h-full">
          <TopMiniBannerCard
            article={top}
            categoryName={categoryName(top)}
            slot={1}
            layout="wide"
          />
        </div>
      ) : null}
      {bottom ? (
        <div className="h-full">
          <TopMiniBannerCard
            article={bottom}
            categoryName={categoryName(bottom)}
            slot={2}
            layout="wide"
          />
        </div>
      ) : null}
    </aside>
  );
}

function TwoColumnSection({
  title,
  accent,
  href,
  lead,
  list,
}: {
  title: string;
  accent: string;
  href: string;
  lead?: ArticlePreview | null;
  list: ArticlePreview[];
}) {
  const leadItem = lead ?? list[0] ?? null;
  const sideList = lead ? list : list.slice(1);

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title={title} accent={accent} href={href} />
      <div className="grid flex-1 gap-3 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="h-full">
          {leadItem ? (
            <Link href={`/haber/${leadItem.slug}`} className="group flex h-full flex-col">
              <div className="overflow-hidden rounded-[10px] bg-zinc-200">
                {leadItem.imageUrl ? (
                  <img
                    src={leadItem.imageUrl}
                    alt={leadItem.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-200" />
                )}
              </div>
              <h3 className="mt-2 text-[1.18rem] font-bold leading-[1.24] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-3">
                {leadItem.title}
              </h3>
              <div className="mt-1 flex-1 space-y-2">
                {leadItem.summary ? (
                  <p className="text-[0.82rem] leading-[1.5] text-zinc-600 line-clamp-4">{leadItem.summary}</p>
                ) : null}
                {sideList.length ? (
                  <ul className="space-y-1">
                    {sideList.slice(0, 2).map(item => (
                      <li key={item.id} className="flex items-start gap-1.5 text-[0.78rem] leading-[1.4] text-zinc-600">
                        <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                        <span className="line-clamp-1">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="mt-auto pt-2 text-[0.72rem] font-medium text-zinc-500">{timeAgo(leadItem.publishedAt)}</p>
            </Link>
          ) : (
            <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
          )}
        </div>
        <ul className="space-y-2">
          {sideList.map(item => (
            <li key={item.id}>
              <Link href={`/haber/${item.slug}`} className="group grid grid-cols-[90px_1fr] items-start gap-2.5 rounded-[10px] border border-zinc-100 bg-zinc-50/75 p-2 transition-colors hover:border-zinc-200 hover:bg-zinc-50">
                <div className="h-[58px] w-full shrink-0 overflow-hidden rounded-[8px] bg-zinc-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : null}
                </div>
                <span className="min-w-0">
                  <span className="block text-[0.92rem] font-semibold leading-[1.3] text-zinc-800 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                    {item.title}
                  </span>
                  <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-medium text-zinc-500">
                    {timeAgo(item.publishedAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ThreeColumnSection({
  title,
  accent,
  href,
  lead,
  list,
}: {
  title: string;
  accent: string;
  href: string;
  lead?: ArticlePreview | null;
  list: ArticlePreview[];
}) {
  const leadItem = lead ?? list[0] ?? null;
  const sideList = lead ? list : list.slice(1);

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title={title} accent={accent} href={href} />
      {leadItem ? (
        <Link href={`/haber/${leadItem.slug}`} className="group block">
          <div className="overflow-hidden rounded-[10px] bg-zinc-200">
            {leadItem.imageUrl ? (
              <img
                src={leadItem.imageUrl}
                alt={leadItem.title}
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="aspect-[16/9] w-full bg-zinc-200" />
            )}
          </div>
          <h3 className="mt-2 truncate text-[1.2rem] font-semibold leading-[1.22] text-zinc-900 transition-colors group-hover:text-[#de0f17]">
            {leadItem.title}
          </h3>
          <p className="mt-1.5 text-[0.72rem] font-medium text-zinc-500">{timeAgo(leadItem.publishedAt)}</p>
        </Link>
      ) : (
        <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
      )}
      <ul className="mt-2 space-y-2 border-t border-zinc-100 pt-2.5">
        {sideList.map(item => (
          <li key={item.id} className="rounded-[8px] border border-zinc-100 bg-zinc-50/70 px-2.5 py-2">
            <Link
              href={`/haber/${item.slug}`}
              className="flex items-center gap-2 text-[0.9rem] font-medium leading-[1.32] text-zinc-700 hover:text-[#de0f17]"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--kadikoy-blue)]" />
              <span className="min-w-0 truncate">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MostRead({ items }: { items: ArticlePreview[] }) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title="En Çok Okunanlar" accent="#de0f17" href="/arama?q=çok%20okunan" />
      <ol className="flex h-full flex-1 flex-col gap-2.5">
        {items.map((article, idx) => (
          <li key={article.id} className="grid flex-1 grid-cols-[2rem_1fr] items-start gap-2.5 rounded-[10px] border border-zinc-100 bg-zinc-50/75 px-2.5 py-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[1.35rem] font-extrabold leading-none text-[#de0f17] shadow-[inset_0_0_0_1px_rgba(220,38,38,0.15)]">
              {idx + 1}
            </span>
            <div>
              <Link
                href={`/haber/${article.slug}`}
                className="text-[0.95rem] font-semibold leading-[1.3] text-zinc-800 hover:text-[#de0f17] line-clamp-2"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-[0.7rem] font-medium text-zinc-500">{timeAgo(article.publishedAt)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function NewsletterWidget({
  email,
  message,
  pending,
  onEmail,
  onSubmit,
}: {
  email: string;
  message: string;
  pending: boolean;
  onEmail: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#de0f17]/20 bg-[linear-gradient(100deg,color-mix(in_oklch,#de0f17_18%,white_82%)_0%,white_48%,color-mix(in_oklch,#de0f17_12%,white_88%)_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#de0f17]">
            Haber Bülteni
          </p>
          <h3 className="mt-1 text-[1.18rem] font-extrabold leading-[1.2] text-zinc-900">
            Günün öne çıkan haberleri her sabah e-posta kutunuzda.
          </h3>
          <p className="mt-1 text-[0.78rem] text-zinc-600">{message}</p>
        </div>

        <form onSubmit={onSubmit} className="flex w-full max-w-[540px] gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={event => onEmail(event.target.value)}
            placeholder="E-posta adresiniz"
            className="h-11 min-w-0 flex-1 rounded-[11px] border-2 border-[#de0f17]/70 bg-white px-3 text-[0.86rem] outline-none focus:border-[#de0f17] focus:ring-2 focus:ring-[#de0f17]/15"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-[11px] bg-[#de0f17] px-4 text-[0.82rem] font-semibold text-white transition-colors hover:bg-[#b90c12] disabled:opacity-60"
          >
            {pending ? "..." : "Abone Ol"}
          </button>
        </form>
      </div>
    </section>
  );
}

function MarketsWidget() {
  return (
    <section className="rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title="Piyasalar" accent="#0f60d8" href="/arsiv" />
      <ul className="space-y-2">
        {MARKET_ITEMS.map(item => (
          <li
            key={item.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-[10px] border border-zinc-100 bg-zinc-50/75 px-2.5 py-2 last:border-zinc-100"
          >
            <span className="text-[0.82rem] text-zinc-700">{item.name}</span>
            <span className="text-[0.82rem] font-semibold text-zinc-900">{item.value}</span>
            <span
              className={cn(
                "text-[0.72rem] font-semibold",
                item.change.startsWith("-") ? "text-[#de0f17]" : "text-emerald-600"
              )}
            >
              %{item.change}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.68rem] text-zinc-500">Veriler 12:50 itibarıyla</p>
    </section>
  );
}

function WeatherWidget() {
  const now = new Date();
  const hour = now.getHours();
  const temp = hour >= 12 && hour < 17 ? 22 : hour >= 17 ? 21 : 20;
  const humidity = 48;

  return (
    <section className="rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title="İstanbul, Hava Durumu" accent="#f59e0b" href="/etkinlikler" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-[#f59e0b]">
            <CloudSun className="h-5 w-5" />
          </span>
          <span className="text-[2.2rem] font-bold leading-none text-zinc-900">{temp}°</span>
        </div>
        <span className="text-[0.8rem] font-medium text-zinc-600">Parçalı Bulutlu</span>
      </div>
      <p className="mt-1.5 text-[0.7rem] text-zinc-500">Hissedilen {temp - 1}° · Nem %{humidity}</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5 border-t border-zinc-100 pt-2.5">
        {FORECAST.map(item => (
          <div key={item.hour} className="rounded-[8px] bg-zinc-50 py-1.5 text-center">
            <div className="text-[0.66rem] text-zinc-500">{item.hour}</div>
            <div className="text-[0.74rem] font-semibold text-zinc-800">{item.temp}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CultureSection({
  title,
  accent,
  href,
  lead,
  list,
}: {
  title: string;
  accent: string;
  href: string;
  lead?: ArticlePreview | null;
  list: ArticlePreview[];
}) {
  const leadItem = lead ?? list[0] ?? null;
  const sideList = lead ? list : list.slice(1);

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title={title} accent={accent} href={href} />
      <div className="grid flex-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          {leadItem ? (
            <Link href={`/haber/${leadItem.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-[10px] bg-zinc-200">
                {leadItem.imageUrl ? (
                  <img
                    src={leadItem.imageUrl}
                    alt={leadItem.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-200" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mt-1 text-[1.08rem] font-semibold leading-[1.24] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                {leadItem.title}
              </h3>
              <p className="mt-1 text-[0.7rem] text-zinc-500">{timeAgo(leadItem.publishedAt)}</p>
            </Link>
          ) : (
            <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
          )}
        </div>
        <ul className="flex h-full flex-col gap-2">
          {sideList.map(item => (
            <li key={item.id} className="flex-1 rounded-[10px] border border-zinc-100 bg-zinc-50/75 p-2">
              <Link href={`/haber/${item.slug}`} className="group flex h-full items-start gap-2">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    />
                  ) : null}
                </div>
                <span className="min-w-0">
                  <span className="block text-[0.8rem] font-medium leading-[1.3] text-zinc-800 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[0.66rem] text-zinc-500">{timeAgo(item.publishedAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function VideoSection({
  lead,
  list,
}: {
  lead?: VideoPreview;
  list: VideoPreview[];
}) {
  const leadItem = lead ?? list[0] ?? null;
  const sideList = lead ? list : list.slice(1);

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-zinc-200/90 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <SectionHead title="Video" accent={KADIKOY_BLUE} href="/video-galeri" />
      <div className="grid flex-1 gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          {leadItem ? (
            <Link href="/video-galeri" className="group block">
              <div className="relative overflow-hidden rounded-[10px] bg-zinc-200">
                {leadItem.thumbnailUrl ? (
                  <img
                    src={leadItem.thumbnailUrl}
                    alt={leadItem.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-200" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mt-1 text-[1.06rem] font-semibold leading-[1.24] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                {leadItem.title}
              </h3>
              <p className="mt-1 text-[0.7rem] text-zinc-500">{leadItem.duration ?? "01:00"}</p>
            </Link>
          ) : (
            <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
          )}
        </div>
        <ul className="flex h-full flex-col gap-2">
          {sideList.map(video => (
            <li key={video.id} className="flex-1 rounded-[10px] border border-zinc-100 bg-zinc-50/75 p-2">
              <Link href="/video-galeri" className="group grid h-full grid-cols-[82px_1fr] gap-2">
                <div className="relative overflow-hidden rounded-[2px] bg-zinc-200">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-zinc-200" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="min-w-0">
                  <span className="block text-[0.78rem] font-medium leading-[1.3] text-zinc-800 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                    {video.title}
                  </span>
                  <span className="mt-0.5 block text-[0.66rem] text-zinc-500">
                    {video.duration ?? "02:00"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CultureMegaSection({
  lead,
  list,
  href,
}: {
  lead?: ArticlePreview | null;
  list: ArticlePreview[];
  href: string;
}) {
  const leadItem = lead ?? list[0] ?? null;
  const sideList = (lead ? list : list.slice(1)).slice(0, 5);

  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <SectionHead title="Kültür Sanat" accent="#db2777" href={href} />
      <div className="grid gap-3 xl:grid-cols-[1.42fr_0.9fr]">
        <div>
          {leadItem ? (
            <Link href={`/haber/${leadItem.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-[12px] bg-zinc-200">
                {leadItem.imageUrl ? (
                  <img
                    src={leadItem.imageUrl}
                    alt={leadItem.title}
                    className="aspect-[21/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[21/9] w-full bg-zinc-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="inline-flex rounded-[6px] bg-white/15 px-2 py-1 text-[0.66rem] font-bold uppercase tracking-[0.12em]">
                    Kültür Sanat
                  </p>
                  <h3 className="mt-2 text-[1.95rem] font-extrabold leading-[1.08] tracking-[-0.01em]">
                    {leadItem.title}
                  </h3>
                  {leadItem.summary ? (
                    <p className="mt-2 max-w-[64ch] text-[0.9rem] leading-[1.5] text-white/90 line-clamp-2">
                      {leadItem.summary}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : (
            <div className="aspect-[21/9] animate-shimmer rounded-[12px] bg-zinc-200" />
          )}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          {sideList.map(item => (
            <Link
              key={item.id}
              href={`/haber/${item.slug}`}
              className="group grid grid-cols-[86px_1fr] items-start gap-2.5 rounded-[10px] border border-zinc-100 bg-zinc-50/80 p-2.5 transition-colors hover:border-zinc-200 hover:bg-zinc-50"
            >
              <div className="h-[62px] overflow-hidden rounded-[8px] bg-zinc-200">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-[0.9rem] font-semibold leading-[1.3] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.68rem] font-medium text-zinc-500">{timeAgo(item.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaArchiveSection({
  videoLead,
  videoList,
  galleries,
}: {
  videoLead?: VideoPreview;
  videoList: VideoPreview[];
  galleries: PhotoGalleryPreview[];
}) {
  const leadVideo = videoLead ?? videoList[0] ?? null;
  const sideVideos = (videoLead ? videoList : videoList.slice(1)).slice(0, 3);
  const leadGallery = galleries[0];
  const sideGalleries = galleries.slice(1, 5);

  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <SectionHead title="Videolar ve Görsel Arşivi" accent={KADIKOY_BLUE} href="/video-galeri" />
      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-[12px] border border-zinc-100 bg-zinc-50/60 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.1em] text-zinc-500">Videolar</p>
            <Link href="/video-galeri" className="text-[0.74rem] font-semibold text-zinc-600 hover:text-[var(--kadikoy-blue)]">
              Tüm Videolar →
            </Link>
          </div>
          {leadVideo ? (
            <Link href="/video-galeri" className="group block">
              <div className="relative overflow-hidden rounded-[10px] bg-zinc-200">
                {leadVideo.thumbnailUrl ? (
                  <img
                    src={leadVideo.thumbnailUrl}
                    alt={leadVideo.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-200" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/22">
                  <Play className="h-9 w-9 text-white" />
                </div>
              </div>
              <h3 className="mt-2 text-[1.2rem] font-bold leading-[1.2] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                {leadVideo.title}
              </h3>
            </Link>
          ) : (
            <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
          )}
          <ul className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {sideVideos.map(video => (
              <li key={video.id}>
                <Link href="/video-galeri" className="group block rounded-[10px] border border-zinc-100 bg-white p-2">
                  <div className="relative overflow-hidden rounded-[8px] bg-zinc-200">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="aspect-[16/10] w-full bg-zinc-200" />
                    )}
                  </div>
                  <p className="mt-1.5 text-[0.76rem] font-semibold leading-[1.32] text-zinc-800 line-clamp-2">{video.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[12px] border border-zinc-100 bg-zinc-50/60 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.1em] text-zinc-500">Görsel Arşivi</p>
            <Link href="/foto-galeri" className="text-[0.74rem] font-semibold text-zinc-600 hover:text-[var(--kadikoy-blue)]">
              Tüm Galeriler →
            </Link>
          </div>
          {leadGallery ? (
            <Link href="/foto-galeri" className="group block">
              <div className="overflow-hidden rounded-[10px] bg-zinc-200">
                {leadGallery.thumbnailUrl ? (
                  <img
                    src={leadGallery.thumbnailUrl}
                    alt={leadGallery.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-200" />
                )}
              </div>
              <h3 className="mt-2 text-[1.2rem] font-bold leading-[1.2] text-zinc-900 transition-colors group-hover:text-[#de0f17] line-clamp-2">
                {leadGallery.title}
              </h3>
            </Link>
          ) : (
            <div className="aspect-[16/9] animate-shimmer rounded-[10px] bg-zinc-200" />
          )}
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {sideGalleries.map(gallery => (
              <Link
                key={gallery.id}
                href="/foto-galeri"
                className="group rounded-[10px] border border-zinc-100 bg-white p-2 transition-colors hover:border-zinc-200"
              >
                <div className="overflow-hidden rounded-[8px] bg-zinc-200">
                  {gallery.thumbnailUrl ? (
                    <img
                      src={gallery.thumbnailUrl}
                      alt={gallery.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="aspect-[16/10] w-full bg-zinc-200" />
                  )}
                </div>
                <p className="mt-1.5 text-[0.75rem] font-semibold leading-[1.32] text-zinc-800 line-clamp-2">
                  {gallery.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReporterJoinSection() {
  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-[linear-gradient(95deg,color-mix(in_oklch,var(--kadikoy-blue)_18%,white_82%)_0%,white_40%,color-mix(in_oklch,var(--kadikoy-blue)_10%,white_90%)_100%)] p-4 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--kadikoy-blue)]">Muhabirimiz Ol</p>
          <h3 className="mt-1 text-[1.35rem] font-extrabold leading-[1.15] text-zinc-900">
            Mahallenden haberi sen yaz, Kadıköy birlikte anlatsın.
          </h3>
          <p className="mt-1 text-[0.82rem] leading-[1.5] text-zinc-600">
            Eğitim, etkinlik, sokak hikayeleri ve yerel gündemi bize ilet; doğrulama sonrası yayına alalım.
          </p>
        </div>
        <Link
          href="/muhabirimiz-ol"
          className="inline-flex h-11 items-center justify-center rounded-[11px] bg-[#de0f17] px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-[#b90c12]"
        >
          Başvuru Formuna Git
        </Link>
      </div>
    </section>
  );
}

function PrintArchiveSection({ issues }: { issues: NewspaperIssuePreview[] }) {
  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <SectionHead title="Basılı Gazete Arşivi (PDF)" accent="#111827" href="/arsiv" />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {issues.length
          ? issues.slice(0, 8).map(issue => (
              <a
                key={issue.id}
                href={issue.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[10px] border border-zinc-100 bg-zinc-50/70 p-2.5 transition-colors hover:border-zinc-200"
              >
                <div className="overflow-hidden rounded-[8px] bg-zinc-200">
                  {issue.coverImageUrl ? (
                    <img
                      src={issue.coverImageUrl}
                      alt={issue.title ?? `Sayı ${issue.issueNumber}`}
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-zinc-200" />
                  )}
                </div>
                <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.09em] text-zinc-500">Sayı {issue.issueNumber}</p>
                <p className="mt-0.5 text-[0.84rem] font-semibold leading-[1.3] text-zinc-900 line-clamp-2">
                  {issue.title ?? "Gazete Kadıköy Basılı Sayı"}
                </p>
                <p className="mt-1 text-[0.68rem] text-zinc-500">{formatBannerDate(issue.publishDate)}</p>
              </a>
            ))
          : Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-[10px] border border-zinc-100 bg-zinc-50/70 p-2.5">
                <div className="aspect-[3/4] animate-shimmer rounded-[8px] bg-zinc-200" />
              </div>
            ))}
      </div>
    </section>
  );
}

function ThisWeekHistorySection() {
  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <SectionHead title="Tarihte Bu Hafta" accent="#f59e0b" href="/arsiv" />
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
        {THIS_WEEK_TIMELINE.map(item => (
          <article key={item.day} className="rounded-[10px] border border-zinc-100 bg-zinc-50/75 p-3">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.09em] text-amber-700">{item.day}</p>
            <h3 className="mt-1 text-[0.96rem] font-semibold leading-[1.25] text-zinc-900">{item.title}</h3>
            <p className="mt-1.5 text-[0.78rem] leading-[1.45] text-zinc-600">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function VolunteerProgramSection() {
  return (
    <section className="rounded-[16px] border border-zinc-200/90 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#de0f17]">Gönüllü Programı</p>
          <h3 className="mt-1 text-[1.32rem] font-extrabold leading-[1.15] text-zinc-900">
            Kadıköy için gönüllü destek programına katıl.
          </h3>
          <p className="mt-1.5 max-w-[68ch] text-[0.84rem] leading-[1.55] text-zinc-600">
            Mahalle etkinlikleri, saha haberleri, sosyal dayanışma ve kültür çalışmalarında aktif görev alabileceğin
            açık çağrı programı. Katılımcılar düzenli bilgilendirme ve atölye akışlarına dahil edilir.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[10px] border border-zinc-100 bg-zinc-50 p-2.5 text-[0.78rem] font-medium text-zinc-700">
            Etkinlik saha desteği
          </div>
          <div className="rounded-[10px] border border-zinc-100 bg-zinc-50 p-2.5 text-[0.78rem] font-medium text-zinc-700">
            Topluluk iletişim ağı
          </div>
          <div className="rounded-[10px] border border-zinc-100 bg-zinc-50 p-2.5 text-[0.78rem] font-medium text-zinc-700">
            Gençlik ve kültür projeleri
          </div>
          <Link
            href="/muhabirimiz-ol"
            className="inline-flex h-11 items-center justify-center rounded-[11px] bg-[var(--kadikoy-blue)] px-4 text-[0.83rem] font-semibold text-white transition-colors hover:bg-[var(--kadikoy-blue-dark)] sm:col-span-3 lg:col-span-1"
          >
            Programa Katıl
          </Link>
        </div>
      </div>
    </section>
  );
}

function AuthorsRow({ items }: { items: AuthorPreview[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-[4px] border border-zinc-200 bg-white p-2">
      <SectionHead title="Yazarlar / Köşe Yazıları" accent="#111827" href="/yazarlar" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(author => (
          <Link
            key={author.id}
            href={`/yazar/${author.id}`}
            className="group flex items-start gap-2 rounded-[4px] border border-zinc-200 p-2 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[0.72rem] font-bold text-zinc-600">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                author.name
                  .split(" ")
                  .map(word => word[0])
                  .slice(0, 2)
                  .join("")
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[0.9rem] font-semibold text-zinc-900 transition-colors group-hover:text-[#de0f17]">
                {author.name}
              </span>
              <span className="mt-0.5 block text-[0.72rem] text-zinc-600 line-clamp-2">
                {author.bio ?? "Yapay zekanın geleceği"}
              </span>
              <span className="mt-1 block text-[0.66rem] text-zinc-500">{Math.floor(Math.random() * 3) + 2} saat önce</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Footer24() {
  return (
    <footer className="mt-4 border-t border-zinc-200 bg-white text-zinc-800">
      <div className="h-3 bg-[#101418]" />
      <div className="container py-8 md:py-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Logo24 />
            <p className="mt-2 text-[0.78rem] leading-[1.5] text-zinc-600">
              Kadıköy’den gündem, kültür, spor ve kent yaşamını güncel akışla sunan yerel haber platformu.
            </p>
          </div>
          <div>
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.1em] text-zinc-500">Kurumsal</p>
            <p className="mt-1.5 text-[0.84rem] text-zinc-700">Hakkımızda</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">Künye</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">İletişim</p>
          </div>
          <div>
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.1em] text-zinc-500">Servisler</p>
            <p className="mt-1.5 text-[0.84rem] text-zinc-700">Video Galeri</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">Foto Galeri</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">Basılı Arşiv (PDF)</p>
          </div>
          <div>
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.1em] text-zinc-500">Topluluk</p>
            <p className="mt-1.5 text-[0.84rem] text-zinc-700">Muhabirimiz Ol</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">Gönüllü Programı</p>
            <p className="mt-1 text-[0.84rem] text-zinc-700">Yazarlar</p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50">
        <div className="container flex flex-col items-center justify-between gap-2 py-3 sm:flex-row">
          <p className="text-[0.72rem] text-zinc-500">© {new Date().getFullYear()} Gazete Kadıköy. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-[0.74rem] font-extrabold tracking-[0.08em] text-zinc-900">
              BOOK LOVE
            </span>
            <span className="text-[0.74rem] font-medium text-zinc-600">Siteyi yapan Book Love Creative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const [location, navigate] = useLocation();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: featured } = trpc.articles.featured.useQuery({ limit: 12 });
  const { data: latest } = trpc.articles.latest.useQuery({ limit: 90 });
  const { data: breaking } = trpc.articles.breaking.useQuery({ limit: 12 });
  const { data: mostRead } = trpc.mostRead.list.useQuery({ limit: 12 });
  const { data: authors } = trpc.authors.list.useQuery();
  const { data: videos } = trpc.videoGalleries.list.useQuery({ limit: 10 });
  const { data: photoGalleries } = trpc.photoGalleries.list.useQuery({ limit: 8 });
  const { data: newspaperIssues } = trpc.newspaperIssues.list.useQuery({ limit: 12 });

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState(
    "Kişisel verileriniz KVKK kapsamında korunmaktadır."
  );
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const featuredGalleries = useMemo(
    () => ((photoGalleries ?? []).slice(0, 6) as PhotoGalleryPreview[]) ?? [],
    [photoGalleries]
  );
  const featuredIssues = useMemo(
    () => ((newspaperIssues ?? []).slice(0, 8) as NewspaperIssuePreview[]) ?? [],
    [newspaperIssues]
  );

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: ok => {
      if (ok) {
        setNewsletterMessage("Abonelik başarılı.");
        setNewsletterEmail("");
      } else {
        setNewsletterMessage("Kaydedilemedi. Lütfen tekrar deneyin.");
      }
    },
    onError: () => {
      setNewsletterMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const home = useMemo(() => {
    const categoryList = (categories ?? []) as Category[];
    const categoryBySlug = new Map(categoryList.map(category => [category.slug, category]));

    const resolveSlug = (slugs: string[], fallback = "gundem") =>
      slugs.find(slug => categoryBySlug.has(slug)) ??
      categoryList[0]?.slug ??
      fallback;

    const feed = dedupeById([
      ...((featured ?? []) as ArticlePreview[]),
      ...((latest ?? []) as ArticlePreview[]),
      ...((breaking ?? []) as ArticlePreview[]),
      ...((mostRead ?? []) as ArticlePreview[]),
    ]);

    const byCategory = new Map<number, ArticlePreview[]>();
    for (const article of feed) {
      if (!byCategory.has(article.categoryId)) byCategory.set(article.categoryId, []);
      byCategory.get(article.categoryId)!.push(article);
    }

    const used = new Set<number>();

    const poolBySlugs = (slugs: string[]) => {
      const ids = slugs
        .map(slug => categoryBySlug.get(slug)?.id)
        .filter((id): id is number => typeof id === "number");
      const pool = dedupeById(ids.flatMap(id => byCategory.get(id) ?? []));
      return pool.length ? pool : feed;
    };

    const take = (pool: ArticlePreview[], count: number) => {
      const merged = dedupeById([...pool, ...feed]);
      const picked = merged.filter(article => !used.has(article.id)).slice(0, count);

      if (picked.length < count) {
        const fallback = merged
          .filter(article => !picked.some(item => item.id === article.id))
          .slice(0, count - picked.length);
        picked.push(...fallback);
      }

      for (const item of picked) used.add(item.id);
      return picked;
    };

    const hero = take(dedupeById([...(featured ?? []), ...(breaking ?? []), ...feed]) as ArticlePreview[], 1)[0];

    const pulsePool = dedupeById([...(breaking ?? []), ...feed]) as ArticlePreview[];
    const topPulseItems = take(pulsePool, 3);

    const createSection = (slugs: string[], listCount = 3) => {
      const sectionPool = poolBySlugs(slugs);
      const items = take(sectionPool, 1 + listCount);
      return {
        lead: items[0] ?? null,
        list: items.slice(1),
      };
    };

    const gundem = createSection(["gundem"], 4);
    const dunya = createSection(["dunya", "cevre", "saglik"], 4);
    const ekonomi = createSection(["ekonomi", "yasam"], 4);
    const teknoloji = createSection(["teknoloji", "egitim"], 4);
    const spor = createSection(["spor"], 4);
    const kultur = createSection(["kultur", "kultur-sanat"], 4);

    const mostReadItems = dedupeById([...(mostRead ?? []), ...feed] as ArticlePreview[])
      .filter(article => article.id !== hero?.id)
      .slice(0, 5);

    const navItems = [
      { label: "Gündem", href: `/kategori/${resolveSlug(["gundem"])}` },
      { label: "Dünya", href: `/kategori/${resolveSlug(["dunya", "cevre"])}` },
      { label: "Ekonomi", href: `/kategori/${resolveSlug(["ekonomi", "yasam"])}` },
      { label: "Teknoloji", href: `/kategori/${resolveSlug(["teknoloji", "egitim"])}` },
      { label: "Spor", href: `/kategori/${resolveSlug(["spor"])}` },
      { label: "Kültür", href: `/kategori/${resolveSlug(["kultur", "kultur-sanat"])}` },
      { label: "Video", href: "/video-galeri" },
      { label: "Yazarlar", href: "/yazarlar" },
    ];

    const categoryName = (article?: ArticlePreview | null) =>
      categoryList.find(category => category.id === article?.categoryId)?.name;

    return {
      navItems,
      ticker: ((breaking ?? feed) as ArticlePreview[]).slice(0, 8),
      hero,
      topPulseItems,
      gundem,
      dunya,
      ekonomi,
      teknoloji,
      spor,
      kultur,
      mostReadItems,
      links: {
        gundem: `/kategori/${resolveSlug(["gundem"])}`,
        dunya: `/kategori/${resolveSlug(["dunya", "cevre"])}`,
        ekonomi: `/kategori/${resolveSlug(["ekonomi", "yasam"])}`,
        teknoloji: `/kategori/${resolveSlug(["teknoloji", "egitim"])}`,
        spor: `/kategori/${resolveSlug(["spor"])}`,
        kultur: `/kategori/${resolveSlug(["kultur", "kultur-sanat"])}`,
      },
      categoryName,
      videoLead: (videos?.[0] as VideoPreview | undefined) ?? undefined,
      videoList: ((videos ?? []).slice(1, 6) as VideoPreview[]) ?? [],
      authors: ((authors ?? []).slice(0, 4) as AuthorPreview[]) ?? [],
    };
  }, [authors, breaking, categories, featured, latest, mostRead, videos]);

  const onNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = newsletterEmail.trim();
    if (!value) {
      setNewsletterMessage("Geçerli bir e-posta adresi girin.");
      return;
    }
    subscribeMutation.mutate({ email: value });
  };

  const onHeaderSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = headerSearchQuery.trim();
    if (!value) return;
    navigate(`/arama?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="container py-2.5">
          <div className="grid items-center gap-2.5 lg:grid-cols-[auto_minmax(320px,1fr)_auto] lg:gap-4">
            <div className="flex items-center justify-between gap-2">
              <Logo24 compact />
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700"
                  aria-label="Bildirimler"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-0 top-0 inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#de0f17] px-1 text-[0.62rem] font-bold text-white">
                    3
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={onHeaderSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={headerSearchQuery}
                onChange={event => setHeaderSearchQuery(event.target.value)}
                placeholder="Haber, yazar veya konu ara..."
                className="h-12 w-full rounded-[14px] border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-[1.03rem] text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-[var(--kadikoy-blue)] focus:bg-white"
              />
            </form>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex items-center gap-2.5 rounded-full px-1 py-1">
                <CloudSun className="h-8 w-8 text-amber-400" />
                <div className="text-left leading-tight">
                  <p className="text-[1.16rem] font-semibold text-zinc-800">İstanbul</p>
                  <p className="text-[0.95rem] text-zinc-500">Parçalı Bulutlu</p>
                </div>
                <span className="pl-1 text-[2rem] font-bold leading-none text-zinc-900">22°C</span>
              </div>

              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700"
                aria-label="Bildirimler"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-0 top-0 inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#de0f17] px-1 text-[0.62rem] font-bold text-white">
                  3
                </span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1.5 text-left"
                aria-label="Kullanıcı menüsü"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700">
                  <User className="h-4.5 w-4.5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.82rem] text-zinc-500">Merhaba,</span>
                  <span className="block text-[1.02rem] font-semibold text-zinc-900">Ali Yılmaz</span>
                </span>
                <ChevronDown className="h-4.5 w-4.5 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <BlueMenuBar items={home.navItems} currentPath={location} />
      <BreakingBar items={home.ticker} />

      <main className="container space-y-2.5 py-3 md:py-3 lg:py-4">
        <section className="grid items-stretch gap-2.5 xl:grid-cols-[1.14fr_1fr]">
          <TopHero article={home.hero} categoryName={home.categoryName(home.hero)} />
          <TopNewsPulse items={home.topPulseItems} categoryName={home.categoryName} />
        </section>

        <section className="grid items-stretch gap-3 xl:grid-cols-[1fr_1fr_0.9fr]">
          <TwoColumnSection
            title="Gündem"
            accent="#de0f17"
            href={home.links.gundem}
            lead={home.gundem.lead}
            list={home.gundem.list}
          />
          <TwoColumnSection
            title="Dünya"
            accent={KADIKOY_BLUE}
            href={home.links.dunya}
            lead={home.dunya.lead}
            list={home.dunya.list}
          />
          <MostRead items={home.mostReadItems} />
        </section>

        <section className="grid items-stretch gap-3 xl:grid-cols-[1fr_1fr_1fr_0.95fr]">
          <ThreeColumnSection
            title="Ekonomi"
            accent="#16a34a"
            href={home.links.ekonomi}
            lead={home.ekonomi.lead}
            list={home.ekonomi.list}
          />
          <ThreeColumnSection
            title="Teknoloji"
            accent="#7c3aed"
            href={home.links.teknoloji}
            lead={home.teknoloji.lead}
            list={home.teknoloji.list}
          />
          <ThreeColumnSection
            title="Spor"
            accent="#f97316"
            href={home.links.spor}
            lead={home.spor.lead}
            list={home.spor.list}
          />

          <div className="space-y-2.5">
            <MarketsWidget />
            <WeatherWidget />
          </div>
        </section>

        <section>
          <NewsletterWidget
            email={newsletterEmail}
            message={newsletterMessage}
            pending={subscribeMutation.isPending}
            onEmail={setNewsletterEmail}
            onSubmit={onNewsletterSubmit}
          />
        </section>

        <section>
          <CultureMegaSection lead={home.kultur.lead} list={home.kultur.list} href={home.links.kultur} />
        </section>

        <section>
          <MediaArchiveSection
            videoLead={home.videoLead}
            videoList={home.videoList}
            galleries={featuredGalleries}
          />
        </section>

        <section>
          <ReporterJoinSection />
        </section>

        <section>
          <PrintArchiveSection issues={featuredIssues} />
        </section>

        <section>
          <ThisWeekHistorySection />
        </section>

        <section>
          <AuthorsRow items={home.authors} />
        </section>

        <section>
          <VolunteerProgramSection />
        </section>
      </main>

      <Footer24 />
    </div>
  );
}
