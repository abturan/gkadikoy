import { Activity } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";
import { timeAgo } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  "article.create": "Haber oluşturdu",
  "article.update": "Haberi düzenledi",
  "article.delete": "Haberi sildi",
  "comment.approved": "Yorumu onayladı",
  "comment.rejected": "Yorumu reddetti",
  "comment.delete": "Yorumu sildi",
  "report.approved": "Muhabir haberini onayladı",
  "report.rejected": "Muhabir haberini reddetti",
  "report.published": "Muhabir haberini yayımladı",
  "report.delete": "Muhabir haberini sildi",
  "report.publish": "Muhabir haberini habere çevirdi",
  "user.create": "Kullanıcı oluşturdu",
  "user.update": "Kullanıcıyı düzenledi",
  "user.delete": "Kullanıcıyı sildi",
  "issue.create": "Gazete sayısı ekledi",
  "issue.delete": "Gazete sayısı sildi",
  "ai.revise": "AI ile metin düzeltti",
};

export default function AuditLog() {
  const { user, loading } = useAdminAuth({ requireRoles: ["admin"] });
  const { data: logs } = trpc.admin.auditLogs.useQuery(undefined, { enabled: !!user, refetchInterval: 20000 });

  if (loading || !user) return null;

  return (
    <AdminLayout
      user={user}
      title="İşlem Günlüğü"
      subtitle="Tüm admin aktiviteleri — son 200 kayıt."
    >
      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 kicker text-muted-foreground">Kullanıcı</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground">İşlem</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground">Hedef</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground">Detay</th>
              <th className="text-right px-4 py-3 kicker text-muted-foreground w-32">Ne Zaman</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!logs || logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-muted-foreground font-reading">
                  <Activity className="w-8 h-8 mx-auto opacity-20 mb-2" />
                  Henüz kayıt yok.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-ui text-sm font-semibold">{l.userName}</td>
                  <td className="px-4 py-2.5 font-ui text-sm">
                    {ACTION_LABELS[l.action] ?? l.action}
                  </td>
                  <td className="px-4 py-2.5 font-ui text-xs text-muted-foreground">
                    {l.targetType && l.targetId ? `${l.targetType} #${l.targetId}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-ui text-xs text-muted-foreground line-clamp-1 max-w-xs">
                    {l.details ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground text-right">
                    {timeAgo(l.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
