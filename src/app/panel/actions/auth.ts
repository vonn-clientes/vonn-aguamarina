"use server";

import { queryOne, query } from "@/lib/db";
import { isDbConfigured } from "@/lib/config";
import { closeSession, createSession, hashPassword, isLegacyHash, verifyPassword } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = { error: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const error = "Usuario o contraseña incorrectos.";
  if (!isDbConfigured()) {
    return { error: "Todavía no hay una base de datos conectada (falta DATABASE_URL)." };
  }

  // Se puede entrar con un usuario simple (ej. "aguamarina") o con un email completo.
  const raw = String(formData.get("email") || "").trim().toLowerCase();
  const email = raw.includes("@") ? raw : `${raw}@aguamarina.vonn.com.ar`;
  const password = String(formData.get("password") || "");

  try {
    const user = await queryOne<{ id: string; password_hash: string }>(
      "select id, password_hash from app_users where email = $1", [email],
    );
    if (!user || !(await verifyPassword(password, user.password_hash))) return { error };
    // Contraseña migrada desde Supabase (bcrypt): se re-hashea a scrypt al primer login correcto.
    if (isLegacyHash(user.password_hash)) {
      await query("update app_users set password_hash = $1 where id = $2", [await hashPassword(password), user.id]);
    }
    await createSession(user.id);
  } catch {
    return { error };
  }
  redirect("/panel/agenda");
}

export async function logout() {
  await closeSession();
  redirect("/panel/login");
}
