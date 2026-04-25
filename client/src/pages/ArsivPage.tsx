import { useState, useMemo } from "react";
import { Calendar, Search, Download, Eye, X, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export default function ArsivPage() {
  const { data: issues, isLoading } = trpc.newspaperIssues.list.useQuery({ limit: 200 });
  const [year, setYear] = useState<number | "all">("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [viewingIssue, setViewingIssue] = useState<{ pdfUrl: string; title: string; issueNumber: number } | null>(null);

  const filtered = useMemo(() => {
    if (!issues) return [];
    return issues.filter((i) => {
      const d = new Date(i.publishDate);
      if (year !== "all" && d.getFullYear() !== year) return false;
      if (month !== "all" && d.getMonth() !== month) return false;
      return true;
    });
  }, [issues, year, month]);

  const years = useMemo(() => {
    if (!issues) return [];
    const set = new Set(issues.map((i) => new Date(i.publishDate).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [issues]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        {/* Header */}
        <div className="text-center mb-10 pb-8 border-b border-border">
          <div className="kicker text-press mb-3">PDF Arşiv</div>
          <h1 className="font-display text-[2.5rem] md:text-[3.5rem] text-primary leading-none mb-4">
            Gazete Sayılarımız
          </h1>
          <p className="dek text-[1.05rem] md:text-[1.2rem] text-foreground/75 max-w-2xl mx-auto">
            2000'den bu yana yayımlanan tüm baskılarımıza erişin. İncelemek için kapağa tıklayın, indirmek için butona basın.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-4 mb-10 p-4 bg-muted/40 border border-border">
          <div className="flex items-center gap-2 kicker text-muted-foreground">
            <Search className="w-3.5 h-3.5" /> Filtrele
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-ui font-semibold text-muted-foreground">Yıl:</label>
            <select
              value={year === "all" ? "all" : String(year)}
              onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-1.5 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
            >
              <option value="all">Tüm Yıllar</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-ui font-semibold text-muted-foreground">Ay:</label>
            <select
              value={month === "all" ? "all" : String(month)}
              onChange={(e) => setMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-1.5 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
            >
              <option value="all">Tüm Aylar</option>
              {MONTHS_TR.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto byline">
            {filtered.length} sayı {year !== "all" && `· ${year}`} {month !== "all" && `· ${MONTHS_TR[month as number]}`}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border">
            <FileText className="w-12 h-12 mx-auto opacity-20 mb-4" />
            <h3 className="font-display text-xl mb-2">Henüz arşivlenen sayı yok</h3>
            <p className="text-muted-foreground font-reading text-sm max-w-md mx-auto">
              Gazete sayılarımız yakında burada yer alacak. Editörlerimiz PDF baskılarını
              yönetim panelinden yüklediğinde otomatik listelenecek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filtered.map((issue) => {
              const d = new Date(issue.publishDate);
              return (
                <div key={issue.id} className="group">
                  <button
                    onClick={() =>
                      setViewingIssue({
                        pdfUrl: issue.pdfUrl,
                        title: issue.title ?? `Sayı ${issue.issueNumber}`,
                        issueNumber: issue.issueNumber,
                      })
                    }
                    className="block relative w-full aspect-[3/4] overflow-hidden bg-muted border border-border hover:border-primary transition-colors"
                  >
                    {issue.coverImageUrl ? (
                      <img
                        src={issue.coverImageUrl}
                        alt={`Sayı ${issue.issueNumber}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex items-center gap-1.5 kicker text-white">
                        <Eye className="w-3 h-3" /> Oku
                      </div>
                    </div>
                  </button>
                  <div className="mt-2.5">
                    <div className="font-serif text-sm font-bold">Sayı {issue.issueNumber}</div>
                    <div className="byline mt-0.5">
                      {d.getDate()} {MONTHS_TR[d.getMonth()]} {d.getFullYear()}
                    </div>
                    <a
                      href={issue.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1 text-xs font-ui font-semibold text-primary hover:text-press transition-colors mt-1.5"
                    >
                      <Download className="w-3 h-3" /> İndir
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* PDF Modal Viewer */}
      {viewingIssue && (
        <div
          className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up"
          onClick={() => setViewingIssue(null)}
        >
          <div
            className="relative w-full h-full max-w-5xl mx-auto bg-background flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <div>
                <div className="kicker text-press">Sayı {viewingIssue.issueNumber}</div>
                <h3 className="font-display text-xl text-foreground leading-none mt-1">{viewingIssue.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingIssue.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3 py-2 border border-border font-ui text-xs font-semibold hover:border-primary hover:text-primary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> İndir
                </a>
                <button
                  onClick={() => setViewingIssue(null)}
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-press hover:text-press transition-colors"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <iframe
              src={viewingIssue.pdfUrl}
              title={viewingIssue.title}
              className="flex-1 w-full"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
