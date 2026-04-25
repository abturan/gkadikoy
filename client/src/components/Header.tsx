import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Contrast, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { trpc } from "@/lib/trpc";
import { cn, timeAgo } from "@/lib/utils";
import logoUrl from "../../assets/logo.png";

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
  { label: "Foto Galeri", href: "/foto-galeri" },
  { label: "Video", href: "/video-galeri" },
  { label: "Arşiv", href: "/arsiv" },
];

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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [pastSearch, setPastSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 80);
      setPastSearch(y > 620);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: searchResults } = trpc.articles.search.useQuery(
    { query: debouncedQuery, limit: 6 },
    { enabled: debouncedQuery.length >= 2 }
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    if (!searchQuery.trim()) return;

    navigate(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    closePanels();
  };

  const openArticle = (slug: string) => {
    navigate(`/haber/${slug}`);
    setSearchQuery("");
    closePanels();
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-white/30 bg-white/45 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_8px_28px_rgba(15,15,15,0.06)] supports-[backdrop-filter]:bg-white/35 transition-all duration-300",
          scrolled && "bg-white/65 supports-[backdrop-filter]:bg-white/55"
        )}
      >
        <div className="container">
          <div
            className={cn(
              "flex items-center gap-4 transition-all duration-300",
              scrolled ? "py-2 md:py-2.5" : "py-3 md:py-3.5"
            )}
          >
            <Link
              href="/"
              className="group inline-flex shrink-0 items-center gap-2.5"
            >
              <img
                src={logoUrl}
                alt="Gazete Kadıköy"
                className={cn(
                  "w-auto object-contain transition-all duration-300 dark:invert",
                  scrolled ? "h-8 sm:h-9" : "h-10 sm:h-12"
                )}
              />
            </Link>

            <nav
              className={cn(
                "hidden min-w-0 flex-1 items-center justify-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                scrolled && "lg:flex"
              )}
            >
              {CATEGORIES.map(category => (
                <Link
                  key={category.slug}
                  href={category.slug}
                  onClick={closePanels}
                  className={cn(
                    "ink-nav-link whitespace-nowrap",
                    isActive(category.slug)
                      ? "text-press"
                      : "text-foreground/72 hover:text-foreground"
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </nav>

            <div
              className={cn(
                "flex items-center justify-end gap-2",
                !scrolled && "ml-auto"
              )}
            >
              <div
                className={cn(
                  "hidden items-center gap-2 xl:flex",
                  scrolled && "xl:hidden"
                )}
              >
                {QUICK_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/50 bg-white/35 px-3 py-2 text-[0.68rem] font-ui font-semibold uppercase tracking-[0.12em] text-foreground/72 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_4px_14px_rgba(15,15,15,0.05)] backdrop-blur-xl backdrop-saturate-150 transition-all hover:border-press/35 hover:bg-white/60 hover:text-press"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div
                className={cn(
                  "hidden items-center gap-2 sm:flex",
                  scrolled && "sm:hidden"
                )}
              >
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize === "sm"}
                  className="ink-toolbar-button px-3 text-[0.78rem] font-semibold disabled:opacity-40"
                  aria-label="Yazıyı küçült"
                >
                  A-
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize === "xl"}
                  className="ink-toolbar-button px-3 text-[0.78rem] font-semibold disabled:opacity-40"
                  aria-label="Yazıyı büyüt"
                >
                  A+
                </button>
              </div>

              <button
                onClick={toggleHighContrast}
                className={cn(
                  "ink-toolbar-button hidden sm:flex",
                  highContrast && "border-press/35 bg-press text-white",
                  scrolled && "sm:hidden"
                )}
                aria-label="Kontrast değiştir"
              >
                <Contrast className="h-4 w-4" />
              </button>

              {toggleTheme ? (
                <button
                  onClick={() => toggleTheme()}
                  className={cn(
                    "ink-toolbar-button hidden sm:flex",
                    scrolled && "sm:hidden"
                  )}
                  aria-label="Temayı değiştir"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              ) : null}

              <div
                className={cn(
                  "relative transition-all duration-300",
                  !pastSearch &&
                    "pointer-events-none w-0 scale-90 opacity-0 overflow-hidden"
                )}
                ref={searchRef}
              >
                <button
                  onClick={() => {
                    setSearchOpen(open => !open);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "ink-toolbar-button",
                    searchOpen && "border-press/35 bg-press text-white"
                  )}
                  aria-label="Ara"
                >
                  <Search className="h-4 w-4" />
                </button>

                {searchOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-3 w-[min(34rem,calc(100vw-2rem))] rounded-[2rem] border border-border/80 bg-white/92 p-3 shadow-[0_28px_80px_rgba(18,18,18,0.14)] backdrop-blur-xl">
                    <form
                      onSubmit={handleSearchSubmit}
                      className="ink-surface rounded-[1.6rem] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
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
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
                            aria-label="Aramayı temizle"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </form>

                    <div className="mt-3 overflow-hidden rounded-[1.6rem] border border-border/70 bg-white/70">
                      {debouncedQuery.length >= 2 ? (
                        searchResults && searchResults.length > 0 ? (
                          <>
                            {searchResults.map(article => (
                              <button
                                key={article.id}
                                type="button"
                                onClick={() => openArticle(article.slug)}
                                className="grid w-full gap-3 border-b border-border/70 p-4 text-left transition-colors hover:bg-muted/45 sm:grid-cols-[96px_1fr]"
                              >
                                {article.imageUrl ? (
                                  <img
                                    src={article.imageUrl}
                                    alt=""
                                    className="h-20 w-full rounded-[1rem] object-cover sm:w-24"
                                  />
                                ) : (
                                  <div className="hidden h-20 rounded-[1rem] bg-muted sm:block" />
                                )}

                                <div className="min-w-0">
                                  <div className="line-clamp-2 font-ui text-[1rem] font-bold leading-[1.2] tracking-[-0.03em] text-foreground">
                                    {article.title}
                                  </div>
                                  <div className="mt-2 text-[0.76rem] font-ui text-muted-foreground">
                                    {timeAgo(article.publishedAt)}
                                  </div>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                if (!searchQuery.trim()) return;
                                navigate(
                                  `/arama?q=${encodeURIComponent(searchQuery.trim())}`
                                );
                                setSearchQuery("");
                                closePanels();
                              }}
                              className="w-full px-4 py-3 text-center text-[0.72rem] font-ui font-semibold uppercase tracking-[0.14em] text-press transition-colors hover:bg-muted/45"
                            >
                              Tüm sonuçları gör
                            </button>
                          </>
                        ) : (
                          <div className="px-6 py-8 text-center text-sm font-ui text-muted-foreground">
                            Sonuç bulunamadı
                          </div>
                        )
                      ) : (
                        <div className="px-6 py-8 text-center text-sm font-ui text-muted-foreground">
                          Aramak için en az 2 karakter gir
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                onClick={() => {
                  setMobileOpen(open => !open);
                  setSearchOpen(false);
                }}
                className="ink-toolbar-button lg:hidden"
                aria-label="Menü"
              >
                {mobileOpen ? (
                  <X className="h-4.5 w-4.5" />
                ) : (
                  <Menu className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <div
            className={cn(
              "border-t border-border/70 max-lg:hidden",
              scrolled && "hidden"
            )}
          >
            <nav className="flex items-center justify-center gap-4 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(category => (
                <Link
                  key={category.slug}
                  href={category.slug}
                  onClick={closePanels}
                  className={cn(
                    "ink-nav-link whitespace-nowrap",
                    isActive(category.slug)
                      ? "text-press"
                      : "text-foreground/72 hover:text-foreground"
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="border-b border-border/70 bg-background/96 backdrop-blur-xl lg:hidden">
          <div className="container py-5">
            <div className="grid gap-3">
              <div className="grid gap-2">
                {QUICK_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closePanels}
                    className="rounded-[1.2rem] border border-border/70 bg-white/68 px-4 py-3 text-sm font-ui font-semibold text-foreground/78"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="grid gap-2">
                {CATEGORIES.map(category => (
                  <Link
                    key={category.slug}
                    href={category.slug}
                    onClick={closePanels}
                    className="rounded-[1.2rem] border border-border/70 bg-white/68 px-4 py-3 text-sm font-ui font-semibold text-foreground"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSize === "sm"}
                  className="ink-toolbar-button px-3 text-[0.78rem] font-semibold disabled:opacity-40"
                >
                  A-
                </button>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSize === "xl"}
                  className="ink-toolbar-button px-3 text-[0.78rem] font-semibold disabled:opacity-40"
                >
                  A+
                </button>
                <button
                  onClick={toggleHighContrast}
                  className={cn(
                    "ink-toolbar-button px-3 text-[0.78rem] font-semibold",
                    highContrast && "border-press/35 bg-press text-white"
                  )}
                >
                  Kontrast
                </button>
                {toggleTheme ? (
                  <button
                    onClick={() => toggleTheme()}
                    className="ink-toolbar-button px-3 text-[0.78rem] font-semibold"
                  >
                    {theme === "dark" ? "Aydınlık" : "Karanlık"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
