import { useState } from "react";
import { Check, X, Trash2, Clock, CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";
import { cn, timeAgo } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected" | "all";

const STATUSES: { key: Status; label: string; icon: typeof Clock }[] = [
  { key: "pending", label: "Bekleyen", icon: Clock },
  { key: "approved", label: "Onaylı", icon: CheckCircle },
  { key: "rejected", label: "Reddedilen", icon: XCircle },
  { key: "all", label: "Tümü", icon: Mail },
];

export default function CommentsModeration() {
  const { user, loading } = useAdminAuth();
  const [status, setStatus] = useState<Status>("pending");

  const { data: comments, refetch } = trpc.admin.comments.list.useQuery(
    status === "all" ? undefined : { status },
    {
      enabled: !!user,
      refetchInterval: 10000, // 10s polling for live moderation feel
    }
  );

  const setStatusMutation = trpc.admin.comments.setStatus.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = trpc.admin.comments.delete.useMutation({
    onSuccess: () => refetch(),
  });

  if (loading || !user) return null;

  return (
    <AdminLayout
      user={user}
      title="Yorum Moderasyonu"
      subtitle="Canlı olarak bekleyen yorumları onayla, reddet veya sil."
    >
      {/* Status tabs */}
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
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Comment list */}
      <div className="space-y-3">
        {!comments || comments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border">
            <Mail className="w-10 h-10 mx-auto opacity-20 mb-3" />
            <h3 className="font-display text-xl mb-2">
              {status === "pending" ? "Bekleyen yorum yok" : "Yorum yok"}
            </h3>
            <p className="byline">Yeni yorumlar buraya düşer.</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-background border border-border p-4 hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted flex items-center justify-center font-display text-base flex-shrink-0 rounded-full">
                  {c.authorName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <span className="font-ui font-bold text-sm">{c.authorName}</span>
                    <span className="byline text-[0.7rem]">{c.authorEmail}</span>
                    <span className="byline text-[0.7rem]">· {timeAgo(c.createdAt)}</span>
                    <span className="byline text-[0.7rem]">· Haber #{c.articleId}</span>
                    <span className={cn(
                      "kicker text-[0.6rem] px-1.5 py-0.5",
                      c.status === "pending" && "bg-muted text-muted-foreground",
                      c.status === "approved" && "bg-primary/10 text-primary",
                      c.status === "rejected" && "bg-press/10 text-press"
                    )}>
                      {c.status === "pending" && "Bekliyor"}
                      {c.status === "approved" && "Onaylı"}
                      {c.status === "rejected" && "Reddedildi"}
                    </span>
                  </div>

                  <p className="font-reading text-[0.95rem] leading-relaxed whitespace-pre-wrap">{c.content}</p>

                  <div className="flex items-center gap-2 mt-3">
                    {c.status !== "approved" && (
                      <button
                        onClick={() => setStatusMutation.mutate({ id: c.id, status: "approved" })}
                        disabled={setStatusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-ui text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-60"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Onayla
                      </button>
                    )}
                    {c.status !== "rejected" && (
                      <button
                        onClick={() => setStatusMutation.mutate({ id: c.id, status: "rejected" })}
                        disabled={setStatusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border font-ui text-xs font-semibold hover:border-press hover:text-press transition-colors disabled:opacity-60"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reddet
                      </button>
                    )}
                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          if (confirm("Bu yorumu ve yazarın banını kalıcı olarak silmek üzeresin. Emin misin?")) {
                            deleteMutation.mutate({ id: c.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border font-ui text-xs font-semibold hover:border-press hover:text-press transition-colors disabled:opacity-60 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground font-ui">
        <Loader2 className="w-3 h-3 animate-spin opacity-50" />
        Otomatik yenileniyor · 10 sn
      </div>
    </AdminLayout>
  );
}
