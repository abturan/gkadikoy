import { useState } from "react";
import { UserPlus, Shield, Edit, Trash2, User as UserIcon, CheckCircle, XCircle, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth, roleLabel } from "@/lib/adminAuth";
import { cn, timeAgo } from "@/lib/utils";

type Role = "admin" | "editor" | "moderator";

interface UserFormData {
  id?: number;
  email: string;
  name: string;
  role: Role;
  password: string;
  active: boolean;
}

export default function UsersList() {
  const { user, loading } = useAdminAuth({ requireRoles: ["admin"] });
  const [editing, setEditing] = useState<UserFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: users, refetch } = trpc.admin.users.list.useQuery(undefined, { enabled: !!user });
  const createMutation = trpc.admin.users.create.useMutation();
  const updateMutation = trpc.admin.users.update.useMutation();
  const deleteMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => refetch(),
  });

  if (loading || !user) return null;

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      if (editing.id) {
        const data: any = {
          name: editing.name,
          email: editing.email,
          role: editing.role,
          active: editing.active,
        };
        if (editing.password) data.password = editing.password;
        await updateMutation.mutateAsync({ id: editing.id, data });
      } else {
        if (editing.password.length < 6) {
          setError("Şifre en az 6 karakter olmalı.");
          return;
        }
        await createMutation.mutateAsync({
          email: editing.email,
          name: editing.name,
          role: editing.role,
          password: editing.password,
        });
      }
      setEditing(null);
      refetch();
    } catch (err: any) {
      setError(err?.message ?? "Kaydetme başarısız.");
    }
  };

  return (
    <AdminLayout
      user={user}
      title="Kullanıcılar"
      subtitle="Admin, editör ve moderatörleri yönet."
      actions={
        <button
          onClick={() => setEditing({ email: "", name: "", role: "editor", password: "", active: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-ui font-semibold text-sm hover:brightness-110 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Yeni Kullanıcı
        </button>
      }
    >
      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 kicker text-muted-foreground">Kullanıcı</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-32">Rol</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-24">Durum</th>
              <th className="text-left px-4 py-3 kicker text-muted-foreground w-32">Kayıt</th>
              <th className="text-right px-4 py-3 kicker text-muted-foreground w-32">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center font-display rounded-full">
                      {(u.name ?? u.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-serif font-bold text-sm">{u.name ?? "—"}</p>
                      <p className="byline text-[0.7rem]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "kicker text-[0.65rem]",
                    u.role === "admin" && "text-press",
                    u.role === "editor" && "text-primary",
                    u.role === "moderator" && "text-foreground",
                    u.role === "user" && "text-muted-foreground"
                  )}>
                    {u.role === "admin" && <Shield className="w-3 h-3 inline mr-1" />}
                    {roleLabel(u.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.active ? (
                    <span className="inline-flex items-center gap-1 kicker text-primary text-[0.6rem]">
                      <CheckCircle className="w-2.5 h-2.5" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 kicker text-muted-foreground text-[0.6rem]">
                      <XCircle className="w-2.5 h-2.5" /> Pasif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 byline">{timeAgo(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() =>
                        setEditing({
                          id: u.id,
                          email: u.email ?? "",
                          name: u.name ?? "",
                          role: (u.role === "user" ? "editor" : u.role) as Role,
                          password: "",
                          active: u.active,
                        })
                      }
                      className="w-8 h-8 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== user.id && (
                      <button
                        onClick={() => {
                          if (confirm(`${u.email} hesabını silmek istediğinize emin misiniz?`)) {
                            deleteMutation.mutate({ id: u.id });
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center border border-border hover:border-press hover:text-press transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-background border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-display text-lg">{editing.id ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-press">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">İsim</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">E-posta</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">Rol</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                >
                  <option value="admin">Yönetici (tam yetki)</option>
                  <option value="editor">Editör (haber yönetir)</option>
                  <option value="moderator">Moderatör (yorum onaylar)</option>
                </select>
              </div>

              <div>
                <label className="kicker text-muted-foreground mb-1.5 block">
                  {editing.id ? "Yeni Şifre (boş bırak değiştirme)" : "Şifre (min 6)"}
                </label>
                <input
                  type="password"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  placeholder={editing.id ? "Değiştirmek için yaz" : "Şifre"}
                  className="w-full px-3 py-2 bg-background border border-border focus:outline-none focus:border-primary"
                />
              </div>

              {editing.id && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-ui">Aktif hesap</span>
                </label>
              )}

              {error && (
                <div className="p-2 border border-press bg-press/5 text-press text-xs font-ui">{error}</div>
              )}
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-border text-sm font-ui hover:border-press hover:text-press transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-ui font-bold hover:brightness-110 transition-all disabled:opacity-60"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
