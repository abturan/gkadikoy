import { useState } from "react";
import { Check, X, Trash2, Clock, Eye, CheckCircle, XCircle, Send, MapPin, User, Mail, Phone, PenLine, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";
import { cn, timeAgo } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "published" | "all";

const STATUSES: { key: Status; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Bekleyen", icon: Clock },
  { key: "approved", label: "Onaylı", icon: CheckCircle },
  { key: "published", label: "Yayımlandı", icon: Send },
  { key: "rejected", label: "Reddedilen", icon: XCircle },
  { key: "all", label: "Tümü", icon: Eye },
];

export default function ReportsModeration() {
  const { user, loading } = useAdminAuth();
  const [status, setStatus] = useState<Status>("pending");
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [publishing, setPublishing] = useState<{
    title: string;
    summary: string;
    content: string;
    categoryId: number;
    imageUrl: string;
  } | null>(null);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: reports, refetch } = trpc.admin.reports.list.useQuery(
    status === "all" ? undefined : { status },
    { enabled: !!user, refetchInterval: 15000 }
  );

  const viewing = reports?.find((r) => r.id === viewingId) ?? null;

  const setStatusMutation = trpc.admin.reports.setStatus.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = trpc.admin.reports.delete.useMutation({
    onSuccess: () => { refetch(); setViewingId(null); },
  });
  const publishMutation = trpc.admin.reports.publishAsArticle.useMutation({
    onSuccess: () => { refetch(); setViewingId(null); setPublishing(null); },
  });

  if (loading || !user) return null;

  return (
    <AdminLayout
      user={user}
      title="Muhabir Haberleri"
      subtitle="Okuyucuların gönderdiği haberleri incele, düzenle ve yayına al."
    >
      <div className="flex items-center border border-border bg-background mb-6 overflow-hidden">
        {STATUSES.map((s) => {
          const Icon = s.icon;
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-ui font-semibold uppercase tracking-wider transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" /> {s.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List */}
        <div className={cn(
          "space-y-3",
          viewingId ? "lg:col-span-5" : "lg:col-span-12"
        )}>
          {!reports || reports.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border">
              <Send className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <h3 className="font-display text-xl mb-2">
                {status === "pending" ? "Bekleyen gönderi yok" : "Gönderi yok"}
              </h3>
            </div>
          ) : (
            reports.map((r) => {
              const active = r.id === viewingId;
              return (
                <button
                  key={r.id}
                  onClick={() => setViewingId(r.id)}
                  className={cn(
                    "block w-full text-left bg-background border p-4 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-serif text-base font-bold line-clamp-2 leading-snug">{r.title}</h3>
                    <span className={cn(
                      "kicker text-[0.6rem] px-1.5 py-0.5 flex-shrink-0",
                      r.status === "pending" && "bg-muted text-muted-foreground",
                      r.status === "approved" && "bg-primary/10 text-primary",
                      r.status === "published" && "bg-primary text-primary-foreground",
                      r.status === "rejected" && "bg-press/10 text-press"
                    )}>
                      {r.status === "pending" && "Bekliyor"}
                      {r.status === "approved" && "Onaylı"}
                      {r.status === "published" && "Yayımlandı"}
                      {r.status === "rejected" && "Red"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
                    <span className="font-semibold">{r.name}</span>
                    {r.location && <span>· {r.location}</span>}
                    <span>· {timeAgo(r.createdAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail */}
        {viewing && !publishing && (
          <div className="lg:col-span-7 bg-background border border-border sticky top-8 self-start">
            <div className="p-5 border-b border-border">
              <div className="kicker text-press mb-2">Muhabir Gönderisi · #{viewing.id}</div>
              <h2 className="font-display text-2xl leading-tight">{viewing.title}</h2>
            </div>

            <div className="p-5 grid grid-cols-2 gap-3 text-sm border-b border-border">
              <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-ui">{viewing.name}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /><a href={`mailto:${viewing.email}`} className="font-ui text-primary hover:underline">{viewing.email}</a></div>
              {viewing.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-ui">{viewing.phone}</span></div>}
              {viewing.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /><span className="font-ui">{viewing.location}</span></div>}
            </div>

            {viewing.imageUrl && (
              <div className="border-b border-border">
                <img src={viewing.imageUrl} alt="" className="w-full aspect-video object-cover" />
              </div>
            )}

            <div className="p-5 font-reading text-[0.95rem] leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
              {viewing.content}
            </div>

            <div className="p-5 border-t border-border space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {viewing.status === "pending" && (
                  <button
                    onClick={() => setStatusMutation.mutate({ id: viewing.id, status: "approved" })}
                    disabled={setStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-ui text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> Onayla
                  </button>
                )}

                {viewing.status !== "rejected" && viewing.status !== "published" && (
                  <button
                    onClick={() => setStatusMutation.mutate({ id: viewing.id, status: "rejected" })}
                    disabled={setStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 border border-border font-ui text-sm font-semibold hover:border-press hover:text-press transition-colors disabled:opacity-60"
                  >
                    <X className="w-4 h-4" /> Reddet
                  </button>
                )}

                {viewing.status !== "published" && (
                  <button
                    onClick={() =>
                      setPublishing({
                        title: viewing.title,
                        summary: viewing.content.slice(0, 200),
                        content: `<p>${viewing.content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`,
                        categoryId: categories?.[0]?.id ?? 1,
                        imageUrl: viewing.imageUrl ?? "",
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-2 bg-press text-primary-foreground font-ui text-sm font-semibold hover:brightness-110 transition-all ml-auto"
                  >
                    <PenLine className="w-4 h-4" /> Habere Dönüştür
                  </button>
                )}

                {user.role === "admin" && (
                  <button
                    onClick={() => {
                      if (confirm("Bu gönderiyi kalıcı olarak sil?")) {
                        deleteMutation.mutate({ id: viewing.id });
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 border border-border font-ui text-sm hover:border-press hover:text-press transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Publish form */}
        {viewing && publishing && (
          <div className="lg:col-span-7 bg-background border border-border sticky top-8 self-start">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-xl">Habere Dönüştür</h2>
              <button onClick={() => setPublishing(null)} className="text-muted-foreground hover:text-press">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Başlık</label>
                <input
                  type="text"
                  value={publishing.title}
                  onChange={(e) => setPublishing({ ...publishing, title: e.target.value })}
                  className="w-full px-3 py-2 font-serif text-lg font-bold bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Kategori</label>
                <select
                  value={publishing.categoryId}
                  onChange={(e) => setPublishing({ ...publishing, categoryId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
                >
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Öz</label>
                <textarea
                  value={publishing.summary}
                  onChange={(e) => setPublishing({ ...publishing, summary: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border text-sm font-reading italic focus:outline-none focus:border-primary"
                />
              </div>
              <div className="text-xs font-ui text-muted-foreground">
                Tam düzenleme için önce yayımla, sonra "Haberler" sayfasında aç.
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => publishMutation.mutate({
                    reportId: viewing.id,
                    title: publishing.title,
                    summary: publishing.summary,
                    content: publishing.content,
                    categoryId: publishing.categoryId,
                    imageUrl: publishing.imageUrl || undefined,
                  })}
                  disabled={publishMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-press text-primary-foreground font-ui font-bold text-sm hover:brightness-110 disabled:opacity-60"
                >
                  {publishMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Habere Çevir
                </button>
                <button
                  onClick={() => setPublishing(null)}
                  className="px-4 py-2 border border-border font-ui text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
