import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, ExternalLink, Star, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";
import { cn, timeAgo } from "@/lib/utils";

export default function ArticlesList() {
  const { user, loading } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "all">("all");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: articles, refetch } = trpc.admin.articles.list.useQuery(
    {
      search: search || undefined,
      categoryId: categoryId === "all" ? undefined : categoryId,
      limit: 100,
    },
    { enabled: !!user }
  );

  const deleteMutation = trpc.admin.articles.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  if (loading || !user) return null;

  return (
    <AdminLayout
      user={user}
      title="Haberler"
      subtitle={`${articles?.length ?? 0} haber`}
      actions={
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-ui font-semibold text-sm rounded hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Yeni Haber
        </Link>
      }
    >
      {/* Filters */}
      <div className="bg-background border border-border p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[14rem]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Başlık veya slug ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-ui"
          />
        </div>
        <select
          value={categoryId === "all" ? "all" : String(categoryId)}
          onChange={(e) => setCategoryId(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 kicker text-muted-foreground">Başlık</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-32">Kategori</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-28">Durum</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-32">Yayın</th>
              <th className="text-right px-4 py-3 kicker text-muted-foreground w-32">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!articles || articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-muted-foreground font-reading">
                  Eşleşen haber bulunamadı.
                </td>
              </tr>
            ) : (
              articles.map((a) => {
                const cat = catMap[a.categoryId];
                return (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {a.imageUrl ? (
                          <img src={a.imageUrl} alt="" className="w-12 h-12 object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-muted flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm font-bold line-clamp-2 leading-snug">{a.title}</p>
                          <p className="byline mt-0.5 line-clamp-1 font-mono text-[0.7rem]">/{a.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cat && <span className="kicker text-press">{cat.name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {a.isBreaking && (
                          <span className="inline-flex items-center gap-1 kicker text-press text-[0.6rem]">
                            <Zap className="w-2.5 h-2.5" fill="currentColor" /> Son Dakika
                          </span>
                        )}
                        {a.isFeatured && (
                          <span className="inline-flex items-center gap-1 kicker text-primary text-[0.6rem]">
                            <Star className="w-2.5 h-2.5" fill="currentColor" /> Öne Çıkan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-ui">
                      {timeAgo(a.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/haber/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                          title="Siteye git"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/admin/articles/${a.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                          title="Düzenle"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`"${a.title}" haberini silmek istediğinize emin misiniz?`)) {
                              deleteMutation.mutate({ id: a.id });
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center border border-border hover:border-press hover:text-press transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
