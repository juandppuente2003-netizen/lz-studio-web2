import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem } from "@/lib/gallery";
import { AdminPanel } from "./panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return <main className="admin-shell admin-denied"><div className="admin-panel"><span className="admin-kicker">LZ Studio</span><h1>Cuenta sin acceso</h1><p>La cuenta {user.email} inició sesión correctamente, pero todavía no está registrada como administradora.</p><Link className="admin-link-button" href="/">Volver al sitio</Link></div></main>;
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  return <main className="admin-shell">
    <header className="admin-topbar"><Link href="/" className="admin-brand"><span>LZ</span> LZ Studio</Link><div className="admin-user"><span>{user.email}</span></div></header>
    <section className="admin-heading"><span className="admin-kicker">Panel independiente</span><h1>Galería de trabajos</h1><p>Sube fotografías, cambia el orden y decide cuáles aparecen en la página.</p></section>
    <AdminPanel initialItems={(data ?? []) as GalleryItem[]} initialError={error?.message} supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!} />
  </main>;
}
