import { Link } from "wouter";
import { Users, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AuthorsPage() {
  const { data: authors, isLoading } = trpc.authors.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="relative py-12 md:py-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="container relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Yazarlar</h1>
              <p className="text-muted-foreground text-sm mt-0.5"><span className="bg-foreground text-transparent select-none rounded-sm px-1">Gazete Kadıköy</span> yazarları ve köşe yazıları</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="liquid-glass-elevated rounded-2xl p-7">
                <div className="w-20 h-20 rounded-full bg-muted/20 mx-auto mb-5 animate-shimmer" />
                <div className="h-5 bg-muted/20 rounded-full w-3/4 mx-auto mb-3 animate-shimmer" />
                <div className="h-3 bg-muted/20 rounded-full w-full mb-2 animate-shimmer" />
              </div>
            ))}
          </div>
        ) : authors && authors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/yazar/${author.id}`}
                className="group liquid-glass-elevated rounded-2xl p-7 text-center relative overflow-hidden"
              >
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 ring-2 ring-border/30 group-hover:ring-primary/30 transition-all duration-500 shadow-md relative z-10">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold font-serif">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-serif text-lg font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 relative z-10">
                  {author.name}
                </h3>

                {/* Bio */}
                {author.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed font-reading relative z-10">{author.bio}</p>
                )}

                {/* CTA */}
                <div className="flex items-center justify-center gap-1.5 mt-5 pt-4 border-t border-border/20 text-sm text-primary font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10">
                  Yazıları Gör <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 opacity-20" />
            </div>
            <p className="text-lg font-serif">Henüz yazar eklenmemiş.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
