import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, MessageSquare, Send, Users, Newspaper,
  ClipboardList, LogOut, ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { roleLabel, StaffUser } from "@/lib/adminAuth";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  badge?: number;
}

export default function AdminLayout({
  user,
  children,
  title,
  subtitle,
  actions,
}: {
  user: StaffUser;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const [location, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      utils.admin.me.setData(undefined, null);
      navigate("/admin/login");
    },
  });

  const nav: NavItem[] = [
    { href: "/admin", label: "Panel", icon: LayoutDashboard },
    { href: "/admin/articles", label: "Haberler", icon: FileText },
    { href: "/admin/comments", label: "Yorumlar", icon: MessageSquare, badge: stats?.pendingComments },
    { href: "/admin/reports", label: "Muhabir Haberleri", icon: Send, badge: stats?.pendingReports },
    { href: "/admin/issues", label: "Gazete Sayıları", icon: Newspaper },
    { href: "/admin/users", label: "Kullanıcılar", icon: Users, roles: ["admin"] },
    { href: "/admin/audit", label: "İşlem Günlüğü", icon: ClipboardList, roles: ["admin"] },
  ];

  const filteredNav = nav.filter((n) => !n.roles || n.roles.includes(user.role));

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* ─── Sidebar ─── */}
      <aside className="w-64 bg-background border-r border-border flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <Link href="/admin" className="flex flex-col px-5 py-5 border-b border-border">
          <div className="flex items-baseline">
            <span className="font-display text-xl text-primary tracking-[-0.03em]">Gazete</span>
            <span className="font-display italic text-xl text-primary tracking-[-0.02em] ml-1">Kadıköy</span>
          </div>
          <span className="kicker text-muted-foreground mt-0.5 text-[0.6rem]">Yönetim Paneli</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-ui font-medium rounded transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className={cn(
                    "text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center",
                    active
                      ? "bg-primary-foreground text-primary"
                      : "bg-press text-primary-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-9 h-9 bg-primary text-primary-foreground flex items-center justify-center font-display text-base rounded-full flex-shrink-0">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground truncate">{user.name ?? "Yönetici"}</div>
              <div className="kicker text-muted-foreground text-[0.6rem]">{roleLabel(user.role)}</div>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs font-ui font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Siteyi Gör
          </a>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-ui font-medium text-muted-foreground hover:text-press transition-colors disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex-1 ml-64">
        {(title || actions) && (
          <header className="bg-background border-b border-border">
            <div className="px-8 py-5 flex items-center justify-between gap-4">
              <div>
                {title && <h1 className="font-display text-2xl text-foreground leading-tight">{title}</h1>}
                {subtitle && <p className="byline mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </header>
        )}

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
