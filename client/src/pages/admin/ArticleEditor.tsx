import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Eye, Sparkles, Image as ImageIcon, Upload, Star, Zap, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import RichEditor from "@/components/admin/RichEditor";
import { useAdminAuth } from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

function generateSlug(text: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function ArticleEditor() {
  const { user, loading } = useAdminAuth();
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isNew = !params.id;
  const articleId = params.id ? Number(params.id) : undefined;

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: authors } = trpc.authors.list.useQuery();
  const { data: existing, isLoading: loadingArticle } = trpc.admin.articles.get.useQuery(
    { id: articleId ?? 0 },
    { enabled: !!articleId }
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState<"title" | "summary" | null>(null);
  const [titleSuggestions, setTitleSuggestions] = useState<string[] | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const uploadMutation = trpc.admin.upload.useMutation();
  const createMutation = trpc.admin.articles.create.useMutation();
  const updateMutation = trpc.admin.articles.update.useMutation();
  const suggestTitlesMutation = trpc.admin.ai.suggestTitles.useMutation();
  const suggestSummaryMutation = trpc.admin.ai.suggestSummary.useMutation();
  const { data: aiStatus } = trpc.admin.ai.available.useQuery();

  // Load existing article into form
  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setSlug(existing.slug);
      setSlugEdited(true);
      setSummary(existing.summary ?? "");
      setContent(existing.content);
      setImageUrl(existing.imageUrl ?? "");
      setCategoryId(existing.categoryId);
      setAuthorId(existing.authorId);
      setIsFeatured(existing.isFeatured ?? false);
      setIsBreaking(existing.isBreaking ?? false);
    }
  }, [existing]);

  // Auto-generate slug from title (only if not manually edited)
  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugEdited]);

  if (loading || !user) return null;
  if (!isNew && loadingArticle) {
    return (
      <AdminLayout user={user} title="Yükleniyor...">
        <div className="h-64 bg-muted animate-shimmer" />
      </AdminLayout>
    );
  }

  const handleCoverUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setUploadingCover(true);
      try {
        const result = await uploadMutation.mutateAsync({ dataUrl, folder: "articles" });
        setImageUrl(result.url);
      } catch (err: any) {
        alert(err?.message ?? "Yükleme başarısız.");
      } finally {
        setUploadingCover(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (andView = false) => {
    setSaveMessage(null);
    if (title.trim().length < 3) {
      setSaveMessage("Başlık en az 3 karakter olmalı.");
      return;
    }
    if (content.replace(/<[^>]*>/g, "").trim().length < 10) {
      setSaveMessage("İçerik en az 10 karakter olmalı.");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      summary: summary.trim() || null,
      content,
      imageUrl: imageUrl.trim() || null,
      categoryId,
      authorId,
      isFeatured,
      isBreaking,
    };

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(payload);
        if (created) {
          if (andView) window.open(`/haber/${created.slug}`, "_blank");
          navigate(`/admin/articles/${created.id}/edit`);
        }
      } else if (articleId) {
        await updateMutation.mutateAsync({ id: articleId, data: payload });
        setSaveMessage("Kaydedildi ✓");
        if (andView) window.open(`/haber/${slug}`, "_blank");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err: any) {
      setSaveMessage(err?.message ?? "Kaydetme başarısız.");
    }
  };

  const handleSuggestTitles = async () => {
    if (content.replace(/<[^>]*>/g, "").trim().length < 50) {
      alert("Başlık önerisi için en az 50 karakter içerik gerekli.");
      return;
    }
    setAiSuggesting("title");
    try {
      const titles = await suggestTitlesMutation.mutateAsync({ content });
      setTitleSuggestions(titles);
    } catch (err: any) {
      alert(err?.message ?? "AI önerisi başarısız.");
    } finally {
      setAiSuggesting(null);
    }
  };

  const handleSuggestSummary = async () => {
    if (content.replace(/<[^>]*>/g, "").trim().length < 50) {
      alert("Öz önerisi için en az 50 karakter içerik gerekli.");
      return;
    }
    setAiSuggesting("summary");
    try {
      const result = await suggestSummaryMutation.mutateAsync({ content });
      if (result) setSummary(result);
    } catch (err: any) {
      alert(err?.message ?? "AI önerisi başarısız.");
    } finally {
      setAiSuggesting(null);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout
      user={user}
      title={isNew ? "Yeni Haber" : "Haberi Düzenle"}
      subtitle={isNew ? "Yayına alınmadan önce tüm alanları kontrol et." : `#${articleId} · ${existing?.slug}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles"
            className="flex items-center gap-2 px-3 py-2 border border-border text-sm font-ui hover:border-primary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Liste
          </Link>
          {!isNew && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 border border-border text-sm font-ui hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
            >
              <Eye className="w-4 h-4" /> Kaydet + Önizle
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-ui font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Taslak Kaydet" : "Kaydet"}
          </button>
        </div>
      }
    >
      {saveMessage && (
        <div className={cn(
          "mb-4 p-3 border text-sm font-ui",
          saveMessage.includes("✓") ? "border-primary bg-primary/5 text-primary" : "border-press bg-press/5 text-press"
        )}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: main content */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title */}
          <div>
            <label className="kicker text-muted-foreground mb-2 flex items-center justify-between">
              <span>Başlık</span>
              {aiStatus?.enabled && (
                <button
                  onClick={handleSuggestTitles}
                  disabled={aiSuggesting === "title"}
                  className="flex items-center gap-1 text-press hover:brightness-110 transition-all normal-case tracking-normal disabled:opacity-60"
                >
                  {aiSuggesting === "title" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Öner
                </button>
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Haberin başlığı"
              className="w-full px-4 py-3 font-serif text-xl font-bold bg-background border border-border focus:outline-none focus:border-primary"
            />
            {titleSuggestions && (
              <div className="mt-2 p-3 bg-press/5 border border-press/20 space-y-2">
                <div className="kicker text-press">AI Başlık Önerileri</div>
                {titleSuggestions.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(t); setTitleSuggestions(null); }}
                    className="block w-full text-left px-3 py-2 bg-background hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-serif font-bold"
                  >
                    {t}
                  </button>
                ))}
                <button onClick={() => setTitleSuggestions(null)} className="text-xs text-muted-foreground hover:text-press">
                  Kapat
                </button>
              </div>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="kicker text-muted-foreground mb-2 block">URL Slug</label>
            <div className="flex items-center bg-background border border-border focus-within:border-primary">
              <span className="px-3 py-2 text-sm font-mono text-muted-foreground bg-muted">/haber/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                className="flex-1 px-3 py-2 font-mono text-sm bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="kicker text-muted-foreground mb-2 flex items-center justify-between">
              <span>Öz / Dek</span>
              {aiStatus?.enabled && (
                <button
                  onClick={handleSuggestSummary}
                  disabled={aiSuggesting === "summary"}
                  className="flex items-center gap-1 text-press hover:brightness-110 transition-all normal-case tracking-normal disabled:opacity-60"
                >
                  {aiSuggesting === "summary" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Üret
                </button>
              )}
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Haberin kısa özeti (listelemede ve sosyal medyada görünecek)"
              rows={3}
              className="w-full px-4 py-3 font-reading italic bg-background border border-border focus:outline-none focus:border-primary resize-y"
            />
            <div className="text-xs text-muted-foreground font-ui mt-1">{summary.length}/220 önerilen</div>
          </div>

          {/* Content */}
          <div>
            <label className="kicker text-muted-foreground mb-2 block">İçerik</label>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Haberin tam metnini buraya yaz..."
            />
          </div>
        </div>

        {/* Right: meta sidebar */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Cover image */}
          <div className="bg-background border border-border">
            <div className="p-3 border-b border-border kicker text-muted-foreground">Kapak Görseli</div>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Kapak" className="w-full aspect-video object-cover" />
                <div className="p-3 flex items-center gap-2">
                  <button
                    onClick={() => setImageUrl("")}
                    className="flex-1 px-3 py-2 text-xs font-ui border border-border hover:border-press hover:text-press transition-colors"
                  >
                    Kaldır
                  </button>
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverUpload(f);
                      }}
                    />
                    <span className="block text-center px-3 py-2 text-xs font-ui border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      {uploadingCover ? "Yükleniyor..." : "Değiştir"}
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <label className="block p-8 cursor-pointer hover:bg-muted/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCoverUpload(f);
                  }}
                />
                <div className="text-center">
                  {uploadingCover ? (
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                  ) : (
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  )}
                  <div className="font-ui text-sm font-semibold">
                    {uploadingCover ? "Yükleniyor..." : "Görsel yükle"}
                  </div>
                  <div className="byline mt-1">JPG · PNG · WebP · max 10MB</div>
                </div>
              </label>
            )}
            <div className="p-3 border-t border-border">
              <label className="kicker text-muted-foreground mb-1 block">veya URL'den</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-background border border-border p-4">
            <label className="kicker text-muted-foreground mb-2 block">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
            >
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="bg-background border border-border p-4">
            <label className="kicker text-muted-foreground mb-2 block">Yazar</label>
            <select
              value={authorId ?? ""}
              onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
            >
              <option value="">Yazar seç (opsiyonel)</option>
              {authors?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Flags */}
          <div className="bg-background border border-border p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4"
              />
              <Zap className={cn("w-4 h-4", isBreaking ? "text-press" : "text-muted-foreground")} />
              <span className="text-sm font-ui font-semibold">Son Dakika</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              <Star className={cn("w-4 h-4", isFeatured ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm font-ui font-semibold">Öne Çıkan</span>
            </label>
          </div>

          {!aiStatus?.enabled && (
            <div className="p-3 border border-dashed border-border bg-muted/20 text-xs font-reading text-muted-foreground leading-relaxed">
              <p className="font-ui font-bold text-foreground mb-1">OpenAI pasif</p>
              AI düzeltme ve başlık önerisi için <code className="text-primary">.env</code>'e <code className="text-primary">OPENAI_API_KEY</code> ekle.
            </div>
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}
