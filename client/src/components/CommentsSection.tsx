import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { timeAgo } from "@/lib/utils";

export default function CommentsSection({ articleId }: { articleId: number }) {
  const { data: comments, refetch } = trpc.comments.byArticle.useQuery({ articleId });
  const [form, setForm] = useState({ authorName: "", authorEmail: "", content: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.comments.submit.useMutation({
    onSuccess: (data) => {
      if (data) {
        setSubmitted(true);
        setForm({ authorName: "", authorEmail: "", content: "" });
        refetch();
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setError("Yorumunuz kaydedilemedi.");
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submitMutation.mutate({
      articleId,
      authorName: form.authorName.trim(),
      authorEmail: form.authorEmail.trim(),
      content: form.content.trim(),
    });
  };

  return (
    <section className="mt-14 pt-10 border-t-2 border-double border-primary">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-press" />
        <h2 className="font-display text-2xl text-primary">
          Yorumlar <span className="text-muted-foreground text-lg">({comments?.length ?? 0})</span>
        </h2>
      </div>

      {/* Comment form */}
      <div className="bg-muted/30 border border-border p-5 mb-8">
        <h3 className="kicker text-press mb-3">Yorum Bırak</h3>
        {submitted ? (
          <div className="flex items-center gap-2 text-primary font-reading">
            <CheckCircle className="w-5 h-5" />
            Yorumunuz moderasyon kuyruğuna eklendi. Onaylandıktan sonra yayımlanacak.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="Adınız"
                className="px-3 py-2 bg-background border border-border font-ui text-sm focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                required
                value={form.authorEmail}
                onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                placeholder="E-posta (yayımlanmaz)"
                className="px-3 py-2 bg-background border border-border font-ui text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <textarea
              required
              minLength={2}
              maxLength={2000}
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Yorumunuzu yazın..."
              className="w-full px-3 py-2 bg-background border border-border font-reading text-sm leading-relaxed focus:outline-none focus:border-primary resize-y"
            />

            <div className="flex items-center justify-between gap-3">
              <p className="byline">
                Yorumlar yayımlanmadan önce moderasyondan geçer.
              </p>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-ui font-bold text-sm uppercase tracking-[0.1em] hover:brightness-110 transition-all disabled:opacity-60"
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor</>
                ) : (
                  <><Send className="w-4 h-4" /> Gönder</>
                )}
              </button>
            </div>

            {error && (
              <div className="p-2 border border-press bg-press/5 text-press text-xs font-ui">{error}</div>
            )}
          </form>
        )}
      </div>

      {/* Comment list */}
      {!comments || comments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground font-reading">
          Henüz yorum yok. İlk yorumu sen bırak.
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4 pb-5 border-b border-border last:border-0">
              <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-display text-base rounded-full flex-shrink-0">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif font-bold">{c.authorName}</span>
                  <span className="byline text-[0.7rem]">· {timeAgo(c.createdAt)}</span>
                </div>
                <p className="font-reading text-[0.95rem] leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
