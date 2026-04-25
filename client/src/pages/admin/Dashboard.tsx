import { Link } from "wouter";
import { FileText, MessageSquare, Send, Mail, TrendingUp, Plus, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";
import { cn, timeAgo } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: typeof FileText;
  href?: string;
  accent?: "primary" | "press" | "muted";
}) {
  const content = (
    <div className={cn(
      "p-5 border bg-background transition-colors",
      href && "hover:border-primary cursor-pointer",
      accent === "press" ? "border-press" : "border-border"
    )}>
      <div className="flex items-center gap-2 kicker text-muted-foreground mb-3">
        <Icon className={cn("w-3.5 h-3.5", accent === "press" ? "text-press" : "text-primary")} />
        {label}
      </div>
      <div className="font-display text-[2.5rem] leading-none text-foreground">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { user, loading } = useAdminAuth();
  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: !!user });
  const { data: recentArticles } = trpc.admin.articles.list.useQuery({ limit: 5 }, { enabled: !!user });
  const { data: pendingReports } = trpc.admin.reports.list.useQuery({ status: "pending" }, { enabled: !!user });

  if (loading || !user) return null;

  return (
    <AdminLayout
      user={user}
      title={`Merhaba, ${user.name ?? "Yönetici"}`}
      subtitle={new Date().toLocaleDateString("tr-TR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })}
      actions={
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-ui font-semibold text-sm rounded hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Yeni Haber
        </Link>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Toplam Haber" value={stats?.articles ?? 0} icon={FileText} href="/admin/articles" />
        <StatCard
          label="Bekleyen Yorum"
          value={stats?.pendingComments ?? 0}
          icon={MessageSquare}
          href="/admin/comments"
          accent={stats?.pendingComments && stats.pendingComments > 0 ? "press" : undefined}
        />
        <StatCard
          label="Bekleyen Muhabir Haberi"
          value={stats?.pendingReports ?? 0}
          icon={Send}
          href="/admin/reports"
          accent={stats?.pendingReports && stats.pendingReports > 0 ? "press" : undefined}
        />
        <StatCard label="Bülten Abonesi" value={stats?.subscribers ?? 0} icon={Mail} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent articles */}
        <section className="bg-background border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-display text-lg">Son Haberler</h3>
            </div>
            <Link href="/admin/articles" className="kicker text-primary hover:text-press transition-colors">
              Tümü →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentArticles?.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm font-reading">
                Henüz haber yok. <Link href="/admin/articles/new" className="text-primary font-semibold">İlk haberi ekle</Link>
              </div>
            )}
            {recentArticles?.map((a) => (
              <Link
                key={a.id}
                href={`/admin/articles/${a.id}/edit`}
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt="" className="w-12 h-12 object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-bold line-clamp-2 leading-snug">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-ui">
                      <Clock className="w-3 h-3" />
                      {timeAgo(a.publishedAt)}
                      {a.isBreaking && <span className="text-press font-bold">· SON DAKİKA</span>}
                      {a.isFeatured && <span className="text-primary font-semibold">· ÖNE ÇIKAN</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pending reports */}
        <section className="bg-background border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-press" />
              <h3 className="font-display text-lg">Muhabir Gönderileri</h3>
              {pendingReports && pendingReports.length > 0 && (
                <span className="kicker bg-press text-primary-foreground px-1.5 py-0.5 text-[0.6rem]">
                  {pendingReports.length} bekliyor
                </span>
              )}
            </div>
            <Link href="/admin/reports" className="kicker text-primary hover:text-press transition-colors">
              Tümü →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(!pendingReports || pendingReports.length === 0) && (
              <div className="p-6 text-center text-muted-foreground text-sm font-reading">
                Bekleyen muhabir haberi yok.
              </div>
            )}
            {pendingReports?.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href={`/admin/reports`}
                className="block p-4 hover:bg-muted/50 transition-colors"
              >
                <p className="font-serif text-sm font-bold line-clamp-2 leading-snug">{r.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-ui">
                  <span className="font-semibold">{r.name}</span>
                  {r.location && <span>· {r.location}</span>}
                  <span>· {timeAgo(r.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
