import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/admin");
  return <main className="login-shell"><div className="login-card"><a className="admin-brand login-brand" href="/"><span>LZ</span> LZ Studio</a><span className="admin-kicker">Administración</span><h1>Iniciar sesión</h1><p>Accede con el correo y la contraseña configurados para el administrador.</p><LoginForm /><a className="login-back" href="/">← Volver al sitio</a></div></main>;
}
