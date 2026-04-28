import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Contrast, Menu, Moon, Search, Sun, X } from "lucide-react";
import kadikoyLogoUrl from "../../assets/logo.png";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { trpc } from "@/lib/trpc";
import { cn, timeAgo } from "@/lib/utils";

const CATEGORIES = [
  { label: "Son Gelişmeler", slug: "/" },
  { label: "Gündem", slug: "/kategori/gundem" },
  { label: "Yaşam", slug: "/kategori/yasam" },
  { label: "Kültür", slug: "/kategori/kultur-sanat" },
  { label: "Çevre", slug: "/kategori/cevre" },
  { label: "Sağlık", slug: "/kategori/saglik" },
  { label: "Spor", slug: "/kategori/spor" },
];

const QUICK_LINKS = [
  { label: "Yazarlar", href: "/yazarlar" },
  { label: "Foto", href: "/foto-galeri" },
  { label: "Video", href: "/video-galeri" },
  { label: "Arşiv", href: "/arsiv" },
];

const TR_DAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];
const TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function formatToday() {
  const d = new Date();
  return `${TR_DAYS[d.getDay()]}, ${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Header() {
  const [location, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    highContrast,
    toggleHighContrast,
  } = useAccessibility();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults } = trpc.articles.search.useQuery(
    { query: debouncedQuery, limit: 6 },
    { enabled: debouncedQuery.length >= 2 }
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const closePanels = () => {
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchQuery.trim();
    if (!value) return;

    navigate(`/arama?q=${encodeURIComponent(value)}`);
    setSearchQuery("");
    closePanels();
  };

  const openArticle = (slug: string) => {
    navigate(`/haber/${slug}`);
    setSearchQuery("");
    closePanels();
  };

  const tool =
    "inline-flex h-8 min-w-8 items-center justify-center border border-foreground/30 bg-background px-2 text-foreground/72 transition-colors hover:border-foreground hover:text-foreground";

  const drawerExpanded = !scrolled || searchOpen;

  return (
    <>
      <header className="sticky top-0 z-40 bg-background">
        {!scrolled && (
          <div className="border-b border-foreground/15">
            <div className="container flex items-center justify-between gap-4 py-2">
              <span className="font-serif italic text-[0.85rem] text-foreground/65">
                {formatToday()}
              </span>
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize === "sm"}
                  className={cn(
                    tool,
                    "text-[0.72rem] font-semibold disabled:opacity-30"
                  )}
                  aria-label="Yazıyı küçült"
                >
                  A-
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize === "xl"}
                  className={cn(
                    tool,
                    "text-[0.72rem] font-semibold disabled:opacity-30"
                  )}
                  aria-label="Yazıyı büyüt"
                >
                  A+
                </button>
                <button
                  onClick={toggleHighContrast}
                  className={cn(
                    tool,
                    highContrast && "border-foreground bg-foreground text-background"
                  )}
                  aria-label="Kontrast değiştir"
                >
                  <Contrast className="h-3.5 w-3.5" />
                </button>
                {toggleTheme ? (
                  <button
                    onClick={() => toggleTheme()}
                    className={tool}
                    aria-label="Temayı değiştir"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-3.5 w-3.5" />
                    ) : (
                      <Moon className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {!scrolled && (
          <>
            <div className="container">
              <div className="h-[3px] bg-foreground" />
              <div className="mt-1 h-px bg-foreground/40" />
            </div>
            <div className="container pt-5 pb-6 md:pt-7 md:pb-8">
              <div className="hidden items-center justify-between gap-4 pb-3 sm:flex">
                <span className="font-ui text-[0.7rem] font-bold uppercase tracking-[0.22em] text-foreground/55">
                  Kadıköy · İstanbul
                </span>
                <span className="font-ui text-[0.7rem] font-bold uppercase tracking-[0.22em] text-foreground/55">
                  Bağımsız Yerel Yayın
                </span>
              </div>
              <Link href="/" className="block" onClick={closePanels}>
                <img
                  src={kadikoyLogoUrl}
                  alt="Gazete Kadıköy"
                  className="h-14 w-auto max-w-full object-contain sm:h-16 md:h-20 lg:h-24"
                />
              </Link>
            </div>
            <div className="container">
              <div className="h-px bg-foreground/40" />
              <div className="mt-1 h-[3px] bg-foreground" />
            </div>
          </>
        )}

        <div
          className={cn(
            "bg-background",
            scrolled
              ? "border-b border-foreground/85 shadow-[0_2px_0_rgba(0,0,0,0.04)]"
              : "border-b border-foreground/15"
          )}
        >
          <div className="container flex items-center gap-3 py-2.5">
            {scrolled && (
              <Link
                href="/"
                onClick={closePanels}
                className="shrink-0"
              >
                <img
                  src={kadikoyLogoUrl}
                  alt="Gazete Kadıköy"
                  className="h-7 w-auto object-contain"
                />
              </Link>
            )}

            <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex">
              {CATEGORIES.map(category => (
                <Link
                  key={category.slug}
                  href={category.slug}
                  onClick={closePanels}
                  className={cn(
                    "whitespace-nowrap px-2.5 py-1.5 font-ui text-[0.74rem] font-bold uppercase tracking-[0.14em] transition-colors",
                    isActive(category.slug)
                      ? "text-press"
                      : "text-foreground/72 hover:text-foreground"
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <span className="h-4 w-px bg-foreground/25" />
              {QUICK_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closePanels}
                  className="whitespace-nowrap font-ui text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground/60 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileOpen(open => !open);
                  setSearchOpen(false);
                }}
                className={cn(tool, "lg:hidden")}
                aria-label="Menü"
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          ref={searchRef}
          className="relative overflow-hidden bg-background"
        >
          <div
            className={cn(
              "transition-all duration-300 ease-out",
              drawerExpanded
                ? "max-h-[80vh] border-b border-foreground/15 opacity-100"
                : "pointer-events-none max-h-0 border-b-0 opacity-0"
            )}
          >
            <div className="container py-3">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-3 border border-foreground/30 bg-card px-4 py-2.5"
              >
                <Search className="h-4 w-4 shrink-0 text-foreground/55" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Haber, semt, yazar ya da konu ara"
                  className="flex-1 bg-transparent font-ui text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="flex h-7 w-7 items-center justify-center border border-foreground/25 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    aria-label="Aramayı temizle"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="shrink-0 border border-foreground bg-foreground px-3 py-1.5 font-ui text-[0.7rem] font-bold uppercase tracking-[0.16em] text-background transition-colors hover:bg-background hover:text-foreground"
                >
                  Ara
                </button>
              </form>

              {debouncedQuery.length >= 2 ? (
                <div className="mt-3 max-h-[55vh] overflow-y-auto border border-foreground/20 bg-background">
                  {searchResults && searchResults.length > 0 ? (
                    <>
                      {searchResults.map(article => (
                        <button
                          key={article.id}
                          type="button"
                          onClick={() => openArticle(article.slug)}
                          className="grid w-full gap-3 border-b border-foreground/10 p-4 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[96px_1fr]"
                        >
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="h-20 w-full object-cover sm:w-24"
                            />
                          ) : (
                            <div className="hidden h-20 bg-muted sm:block" />
                          )}
                          <div className="min-w-0">
                            <div className="line-clamp-2 font-headline text-[1rem] font-bold leading-[1.2] tracking-[-0.02em] text-foreground">
                              {article.title}
                            </div>
                            <div className="mt-2 font-ui text-[0.74rem] text-muted-foreground">
                              {timeAgo(article.publishedAt)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const value = searchQuery.trim();
                          if (!value) return;
                          navigate(`/arama?q=${encodeURIComponent(value)}`);
                          setSearchQuery("");
                          closePanels();
                        }}
                        className="w-full border-t border-foreground/15 px-4 py-3 text-center font-ui text-[0.72rem] font-bold uppercase tracking-[0.18em] text-press transition-colors hover:bg-muted/40"
                      >
                        Tüm sonuçları gör
                      </button>
                    </>
                  ) : (
                    <div className="px-6 py-6 text-center font-serif italic text-sm text-muted-foreground">
                      Sonuç bulunamadı
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(
              "group flex w-full items-center justify-center gap-2 transition-all duration-300 ease-out",
              drawerExpanded
                ? "pointer-events-none h-0 overflow-hidden opacity-0"
                : "h-5 border-b border-foreground/85 opacity-100"
            )}
            aria-label="Aramayı aç"
          >
            <Search className="animate-search-peek h-3 w-3 text-foreground/55 group-hover:text-foreground" />
            <ChevronDown className="animate-search-peek h-3.5 w-3.5 text-foreground/60 group-hover:text-foreground" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="border-b border-foreground/85 bg-background lg:hidden">
          <div className="container py-4">
            <div className="grid gap-px bg-foreground/15">
              {CATEGORIES.map(category => (
                <Link
                  key={category.slug}
                  href={category.slug}
                  onClick={closePanels}
                  className={cn(
                    "bg-background px-4 py-3 font-ui text-[0.78rem] font-bold uppercase tracking-[0.14em]",
                    isActive(category.slug) ? "text-press" : "text-foreground"
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px bg-foreground/15">
              {QUICK_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closePanels}
                  className="bg-background px-4 py-3 font-ui text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-foreground/72"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
