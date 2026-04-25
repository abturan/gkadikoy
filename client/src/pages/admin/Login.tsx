import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LogIn, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  // Dev convenience: pre-fill with seed admin credentials.
  // Stripped out in production builds.
  const [email, setEmail] = useState(import.meta.env.DEV ? "admin@gazetekadikoy.com.tr" : "");
  const [password, setPassword] = useState(import.meta.env.DEV ? "zpZQFrCAbaG" : "");
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const meQuery = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (meQuery.data) navigate("/admin");
  }, [meQuery.data, navigate]);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (user) => {
      utils.admin.me.setData(undefined, user);
      navigate("/admin");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-background border border-border shadow-lg">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border text-center">
          <div className="flex items-baseline justify-center">
            <span className="font-display text-3xl text-primary tracking-[-0.03em]">Gazete</span>
            <span className="font-display italic text-3xl text-primary tracking-[-0.02em] ml-1">Kadıköy</span>
          </div>
          <div className="kicker text-press mt-2">Yönetim Paneli</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="kicker text-muted-foreground mb-2 block">E-posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3 bg-background border border-border font-ui text-base focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@gazetekadikoy.com.tr"
            />
          </div>

          <div>
            <label className="kicker text-muted-foreground mb-2 block">Şifre</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-background border border-border font-ui text-base focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 border border-press bg-press/5 text-press text-sm font-ui">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-ui font-bold text-sm uppercase tracking-[0.12em] hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Giriş Yapılıyor...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </>
            )}
          </button>
        </form>

        <div className="px-8 pb-6 text-center">
          <p className="text-xs font-ui text-muted-foreground">
            Sadece yetkili personel içindir.
          </p>
        </div>
      </div>
    </div>
  );
}
