import { useState } from "react";
import { Plus, Trash2, Newspaper, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/adminAuth";

export default function IssuesList() {
  const { user, loading } = useAdminAuth();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    issueNumber: 1,
    title: "",
    publishDate: new Date().toISOString().slice(0, 10),
    coverImageUrl: "",
    pdfUrl: "",
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: issues, refetch } = trpc.newspaperIssues.list.useQuery({ limit: 200 }, { enabled: !!user });
  const uploadMutation = trpc.admin.upload.useMutation();
  const createMutation = trpc.admin.issues.create.useMutation();
  const deleteMutation = trpc.admin.issues.delete.useMutation({ onSuccess: () => refetch() });

  if (loading || !user) return null;

  const uploadFile = async (file: File, folder: "issues", setter: "cover" | "pdf") => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (setter === "cover") setUploadingCover(true);
      else setUploadingPdf(true);
      try {
        const result = await uploadMutation.mutateAsync({ dataUrl, folder });
        if (setter === "cover") setForm((f) => ({ ...f, coverImageUrl: result.url }));
        else setForm((f) => ({ ...f, pdfUrl: result.url }));
      } catch (err: any) {
        setError(err?.message ?? "Yükleme başarısız.");
      } finally {
        if (setter === "cover") setUploadingCover(false);
        else setUploadingPdf(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    setError(null);
    if (!form.coverImageUrl || !form.pdfUrl) {
      setError("Kapak görseli ve PDF zorunludur.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        issueNumber: form.issueNumber,
        title: form.title || undefined,
        coverImageUrl: form.coverImageUrl,
        pdfUrl: form.pdfUrl,
        publishDate: new Date(form.publishDate),
      });
      setCreating(false);
      setForm({
        issueNumber: form.issueNumber + 1,
        title: "",
        publishDate: new Date().toISOString().slice(0, 10),
        coverImageUrl: "",
        pdfUrl: "",
      });
      refetch();
    } catch (err: any) {
      setError(err?.message ?? "Kayıt başarısız.");
    }
  };

  return (
    <AdminLayout
      user={user}
      title="Gazete Sayıları"
      subtitle={`${issues?.length ?? 0} sayı arşivde`}
      actions={
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-ui font-semibold text-sm hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Yeni Sayı
        </button>
      }
    >
      {!issues || issues.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <Newspaper className="w-12 h-12 mx-auto opacity-20 mb-3" />
          <h3 className="font-display text-xl mb-2">Henüz sayı yüklenmedi</h3>
          <p className="byline mb-4 max-w-md mx-auto">PDF arşiv sayfanda görünecek gazete sayılarını buradan yükle.</p>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-ui font-semibold text-sm"
          >
            <Plus className="w-4 h-4" /> İlk Sayıyı Yükle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {issues.map((issue) => (
            <div key={issue.id} className="group bg-background border border-border">
              <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer" className="block aspect-[3/4] overflow-hidden bg-muted">
                {issue.coverImageUrl ? (
                  <img src={issue.coverImageUrl} alt={`Sayı ${issue.issueNumber}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 opacity-30" /></div>
                )}
              </a>
              <div className="p-3">
                <div className="font-serif text-sm font-bold">Sayı {issue.issueNumber}</div>
                <div className="byline mt-0.5">
                  {new Date(issue.publishDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Sayı ${issue.issueNumber}'yi sil?`)) deleteMutation.mutate({ id: issue.id });
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 border border-border text-xs font-ui hover:border-press hover:text-press transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-background border border-border w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg">Yeni Gazete Sayısı</h3>
              <button onClick={() => setCreating(false)} className="text-muted-foreground hover:text-press"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Sayı No</label>
                <input
                  type="number"
                  value={form.issueNumber}
                  onChange={(e) => setForm({ ...form, issueNumber: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Yayın Tarihi</label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>
              <div className="col-span-2">
                <label className="kicker text-muted-foreground mb-1.5 block">Başlık (opsiyonel)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ör. Nisan 2026 Özel Sayı"
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>

              {/* Cover upload */}
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Kapak</label>
                {form.coverImageUrl ? (
                  <div className="relative border border-border">
                    <img src={form.coverImageUrl} alt="" className="w-full aspect-[3/4] object-cover" />
                    <button
                      onClick={() => setForm({ ...form, coverImageUrl: "" })}
                      className="absolute top-2 right-2 w-7 h-7 bg-background border border-border flex items-center justify-center hover:border-press hover:text-press"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer border-2 border-dashed border-border hover:border-primary aspect-[3/4] flex items-center justify-center transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "issues", "cover"); }}
                    />
                    {uploadingCover ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 mx-auto opacity-50 mb-1" />
                        <span className="text-xs font-ui">Kapak seç</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {/* PDF upload */}
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">PDF</label>
                {form.pdfUrl ? (
                  <div className="border border-border p-4 text-center">
                    <FileText className="w-6 h-6 mx-auto text-primary mb-1" />
                    <p className="font-ui text-xs font-semibold">PDF yüklendi</p>
                    <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="byline text-primary hover:underline">Görüntüle</a>
                    <button
                      onClick={() => setForm({ ...form, pdfUrl: "" })}
                      className="mt-2 text-xs text-press hover:underline"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer border-2 border-dashed border-border hover:border-primary aspect-[3/4] flex items-center justify-center transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "issues", "pdf"); }}
                    />
                    {uploadingPdf ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto opacity-50 mb-1" />
                        <span className="text-xs font-ui">PDF seç</span>
                      </div>
                    )}
                  </label>
                )}
              </div>

              {error && (
                <div className="col-span-2 p-2 border border-press bg-press/5 text-press text-xs font-ui">{error}</div>
              )}
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className="px-4 py-2 border border-border text-sm font-ui hover:border-press hover:text-press transition-colors">
                İptal
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-ui font-bold text-sm hover:brightness-110 disabled:opacity-60"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Yayımla
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
