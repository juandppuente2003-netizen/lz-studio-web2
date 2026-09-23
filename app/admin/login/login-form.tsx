"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: String(data.get("email")), password: String(data.get("password")) });
    if (error) { setBusy(false); return setError("Correo o contraseña incorrectos."); }
    router.replace("/admin"); router.refresh();
  }

  return <form className="login-form" onSubmit={submit}><label htmlFor="email">Correo</label><input id="email" name="email" type="email" autoComplete="email" required /><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required /><button className="admin-button admin-button-dark" disabled={busy}>{busy ? "Entrando…" : "Entrar al panel"}</button><p className="login-error" aria-live="polite">{error}</p></form>;
}
