import { Link } from "wouter";
import logoUrl from "../../assets/logo.png";

const FOOTER_LINKS = [
  { name: "Ekibimiz", href: "/yazarlar" },
  { name: "Şartlar & Koşullar", href: "/muhabirimiz-ol" },
  { name: "Blog", href: "/arsiv" },
  { name: "SSS", href: "/muhabirimiz-ol" },
  { name: "Hikayelerimiz", href: "/foto-galeri" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-foreground/20 bg-background">
      <div className="container py-8">
        <div className="grid gap-6 border-b border-foreground/15 pb-6 md:grid-cols-3 md:items-start">
          <div>
            <div className="text-[0.7rem] font-ui font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Tüm hakları saklıdır
            </div>
            <p className="mt-1 font-serif text-[0.95rem] text-foreground/80">
              © Gazete Kadıköy {year}
            </p>
          </div>
          <div className="text-center">
            <div className="text-[0.7rem] font-ui font-semibold uppercase tracking-[0.18em] text-foreground/55">
              Adresimiz
            </div>
            <p className="mt-1 font-serif text-[0.95rem] text-foreground/80">
              Caferağa Mah. Moda Cad. No:42, Kadıköy / İstanbul
            </p>
          </div>
          <div className="md:text-right">
            <div className="text-[0.7rem] font-ui font-semibold uppercase tracking-[0.18em] text-foreground/55">
              İletişim
            </div>
            <p className="mt-1 font-serif text-[0.95rem] text-foreground/80">
              0 216 345 67 89
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex items-end gap-4 overflow-hidden">
          <Link href="/" className="shrink-0">
            <img
              src={logoUrl}
              alt="Gazete Kadıköy"
              className="h-20 w-auto object-contain md:h-28"
            />
          </Link>
          <div className="font-headline flex-1 truncate text-[18vw] font-black leading-[0.8] tracking-[-0.06em] text-foreground md:text-[14vw]">
            Gazete Kadıköy
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/15 pt-5">
          <div className="flex items-center gap-3 text-foreground/60">
            <span className="text-[0.7rem] font-ui font-semibold uppercase tracking-[0.18em]">
              Sosyal
            </span>
            <span className="h-1 w-1 rounded-full bg-foreground/40" />
            <span className="text-sm font-ui">Twitter · Instagram · Facebook</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {FOOTER_LINKS.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="font-ui text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
