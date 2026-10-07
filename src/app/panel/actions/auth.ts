"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { redirect } from "next/navigation";

export type LoginState = { error: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Todavía no hay un proyecto de Supabase conectado (falta el .env.local)." };
  }

  // Se puede entrar con un usuario simple (ej. "aguamarina") o con un email completo.
  const raw = String(formData.get("email") || "").trim().toLowerCase();
  const email = raw.includes("@") ? raw : `${raw}@aguamarina.vonn.com.ar`;
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  redirect("/panel/agenda");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/panel/login");
}
