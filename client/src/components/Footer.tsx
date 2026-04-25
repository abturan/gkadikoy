import { Link } from "wouter";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

const SECTIONS = [
  { name: "Gündem", href: "/kategori/gundem" },
  { name: "Yaşam", href: "/kategori/yasam" },
  { name: "Kültür Sanat", href: "/kategori/kultur-sanat" },
  { name: "Çevre", href: "/kategori/cevre" },
  { name: "Sağlık", href: "/kategori/saglik" },
  { name: "Spor", href: "/kategori/spor" },
];

const EXPLORE = [
  { name: "Yazarlar", href: "/yazarlar" },
  { name: "Foto Galeri", href: "/foto-galeri" },
  { name: "Video Galeri", href: "/video-galeri" },
  { name: "Arşiv", href: "/arsiv" },
];

const ABOUT = [
  { name: "Manifesto", href: "/muhabirimiz-ol" },
  { name: "Muhabirimiz Ol", href: "/muhabirimiz-ol" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 overflow-hidden bg-[#151515] text-white">
      <div className="container py-14 md:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.72fr))]">
          <div className="max-w-xl">
            <div className="text-[0.64rem] font-ui font-semibold uppercase tracking-[0.18em] text-white/45">
              Independent local briefing
            </div>
            <Link
              href="/"
              className="mt-3 inline-block font-display text-[2.4rem] font-bold tracking-[-0.08em] text-white"
            >
              Gazete Kadıköy
            </Link>
            <p className="mt-4 max-w-md font-ui text-[0.98rem] leading-[1.8] text-white/62">
              Kadıköy gündemini büyük hikâyeler, hızlı keşif kartları ve daha
              berrak bir editoryal ritimle okutan bağımsız haber yayını.
            </p>

            <a
              href="mailto:info@gazetekadikoy.com.tr"
              className="ink-cta mt-6 inline-flex"
            >
              Bültene Katıl <ArrowUpRight className="h-4 w-4" />
            </a>

            <div className="mt-7 space-y-3 text-sm font-ui text-white/54">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6a2f]" />
                <span>
                  Caferağa Mah. Moda Cad. No:42
                  <br />
                  Kadıköy / İstanbul
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#ff6a2f]" />
                <a
                  href="tel:+902163456789"
                  className="transition-colors hover:text-white"
                >
                  0 216 345 67 89
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#ff6a2f]" />
                <a
                  href="mailto:info@gazetekadikoy.com.tr"
                  className="transition-colors hover:text-white"
                >
                  info@gazetekadikoy.com.tr
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[0.68rem] font-ui font-semibold uppercase tracking-[0.16em] text-white/38">
              Sections
            </div>
            <ul className="mt-4 space-y-3">
              {SECTIONS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-[0.95rem] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[0.68rem] font-ui font-semibold uppercase tracking-[0.16em] text-white/38">
              Explore
            </div>
            <ul className="mt-4 space-y-3">
              {EXPLORE.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-[0.95rem] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[0.68rem] font-ui font-semibold uppercase tracking-[0.16em] text-white/38">
              About
            </div>
            <ul className="mt-4 space-y-3">
              {ABOUT.map(item => (
                <li key={item.href + item.name}>
                  <Link
                    href={item.href}
                    className="font-ui text-[0.95rem] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
              <div className="text-[0.68rem] font-ui font-semibold uppercase tracking-[0.16em] text-white/38">
                Contact
              </div>
              <p className="mt-3 font-ui text-sm leading-[1.7] text-white/60">
                Günlük editoryal özetler ve özel dosyalar için bizimle
                iletişimde kal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-[0.74rem] font-ui text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {year} Gazete Kadıköy. Tüm hakları saklıdır.</p>
          <p>Kaynak gösterilmeden alıntılanamaz.</p>
        </div>
      </div>
    </footer>
  );
}
