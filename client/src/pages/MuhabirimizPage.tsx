import { useState } from "react";
import { CheckCircle, Send, Camera, MapPin, User, Mail, Phone, FileText, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const KADIKOY_MAHALLELERI = [
  "Acıbadem", "Bostancı", "Caddebostan", "Caferağa", "Dumlupınar", "Eğitim",
  "Erenköy", "Fenerbahçe", "Feneryolu", "Fikirtepe", "Göztepe", "Hasanpaşa",
  "Koşuyolu", "Kozyatağı", "Merdivenköy", "Moda", "Osmanağa", "Rasimpaşa",
  "Sahrayıcedit", "Suadiye", "Zühtüpaşa", "19 Mayıs", "Bahariye", "Yeldeğirmeni",
];

export default function MuhabirimizPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    content: "",
    location: "",
    imageUrl: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.citizenReports.submit.useMutation({
    onSuccess: (data) => {
      if (data) setSubmitted(true);
      else setError("Haberiniz kaydedilemedi. Lütfen tekrar deneyin.");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      title: form.title.trim(),
      content: form.content.trim(),
      location: form.location || undefined,
      imageUrl: form.imageUrl || undefined,
    };

    if (payload.content.length < 20) {
      setError("Haber içeriği en az 20 karakter olmalıdır.");
      return;
    }

    submitMutation.mutate(payload);
  };

  // Simple image to data URL for preview + submission (upload happens later via real storage)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Görsel 5MB'dan küçük olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12 pb-10 border-b border-border">
            <div className="kicker text-press mb-4">Kadıköy'ün Gönüllü Muhabirleri</div>
            <h1 className="font-display text-[2.5rem] md:text-[3.75rem] text-primary leading-[0.98] mb-5 max-w-3xl mx-auto">
              Mahallende bir haber mi var?
            </h1>
            <p className="dek text-[1.15rem] md:text-[1.3rem] text-foreground/80 max-w-2xl mx-auto leading-[1.45]">
              Kadıköy'ün her köşesinden gelen haberler bu gazetede yer alır. Sen de
              gördüğün, yaşadığın, duyduğun bir hikâyeyi bizimle paylaş —
              editörlerimiz haberi gözden geçirip yayına alır.
            </p>
          </div>

          {submitted ? (
            <div className="bg-primary/5 border-2 border-primary p-10 md:p-14 text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl text-primary mb-3">Haberin bize ulaştı.</h2>
              <p className="dek text-lg text-foreground/80 max-w-md mx-auto mb-6">
                Editörlerimiz en kısa sürede değerlendirecek. Yayımlandığında sana
                e-posta ile bilgi vereceğiz.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", title: "", content: "", location: "", imageUrl: "" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary font-ui font-semibold text-sm uppercase tracking-[0.1em] hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Yeni Haber Gönder
              </button>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: main form */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="kicker text-muted-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      Haber Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={5}
                      maxLength={500}
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Örn: Moda Sahili'nde yeni park açıldı"
                      className="w-full px-4 py-3 bg-background border border-border font-serif text-[1.15rem] focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="kicker text-muted-foreground mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      Haber İçeriği * <span className="opacity-60 normal-case tracking-normal ml-auto">en az 20 karakter</span>
                    </label>
                    <textarea
                      required
                      minLength={20}
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="Haberin detaylarını buraya yaz. Kim, ne, ne zaman, nerede, nasıl?"
                      rows={10}
                      className="w-full px-4 py-3 bg-background border border-border font-reading text-base leading-relaxed focus:outline-none focus:border-primary transition-colors resize-y"
                    />
                    <div className="mt-1.5 text-xs text-muted-foreground font-ui flex items-center justify-between">
                      <span>{form.content.length} karakter</span>
                      <span className="opacity-70">Editörlerimiz metni gözden geçirecek</span>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="kicker text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Camera className="w-3 h-3" />
                      Fotoğraf Ekle <span className="opacity-60 normal-case tracking-normal">(opsiyonel, max 5MB)</span>
                    </label>
                    <div className="border-2 border-dashed border-border hover:border-primary transition-colors">
                      {form.imageUrl ? (
                        <div className="relative">
                          <img src={form.imageUrl} alt="Önizleme" className="w-full max-h-64 object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: "" })}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-background border border-border font-ui text-xs font-semibold hover:border-press hover:text-press transition-colors"
                          >
                            Kaldır
                          </button>
                        </div>
                      ) : (
                        <label className="block p-8 text-center cursor-pointer group">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-ui text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Fotoğraf seçmek için tıkla
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 border border-press bg-press/5 text-press text-sm font-ui">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-ui font-bold text-sm uppercase tracking-[0.15em] hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {submitMutation.isPending ? (
                      "Gönderiliyor..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Haberi Gönder
                      </>
                    )}
                  </button>
                </div>

                {/* Right: contact + location */}
                <aside className="lg:col-span-4 space-y-6">
                  <div className="bg-muted/40 p-5 border-t-2 border-primary">
                    <div className="kicker text-primary mb-4">İletişim Bilgilerin</div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          İsim Soyisim *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Adın soyadın"
                          className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          E-posta *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="senin@email.com"
                          className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          Telefon <span className="opacity-60 normal-case tracking-normal">(ops.)</span>
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="05XX XXX XX XX"
                          className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-ui font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          Mahalle / Konum
                        </label>
                        <select
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border text-sm font-ui focus:outline-none focus:border-primary"
                        >
                          <option value="">Mahalle seç</option>
                          {KADIKOY_MAHALLELERI.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-border text-xs font-reading text-muted-foreground leading-relaxed">
                    <p className="font-ui font-bold text-foreground mb-2 kicker">Editoryal Süreç</p>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      <li>Haberini gönder.</li>
                      <li>Editörlerimiz 24 saat içinde değerlendirir.</li>
                      <li>Dilbilgisi ve üslup düzenlenir.</li>
                      <li>Yayına alınır ya da ek bilgi istenir.</li>
                    </ol>
                  </div>
                </aside>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
