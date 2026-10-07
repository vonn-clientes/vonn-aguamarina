"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CM_COOKIE, checkCredentials, makeToken } from "@/lib/cm-auth";

export async function loginCm(_prev: { error?: string } | null, formData: FormData) {
  const user = String(formData.get("user") ?? "");
  const pass = String(formData.get("pass") ?? "");
  if (!checkCredentials(user, pass)) {
    await new Promise((r) => setTimeout(r, 800)); // frena los intentos al azar
    return { error: "Usuario o contraseña incorrectos." };
  }
  (await cookies()).set(CM_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/cm",
    maxAge: 14 * 86400,
  });
  redirect("/cm");
}

export async function logoutCm() {
  (await cookies()).delete({ name: CM_COOKIE, path: "/cm" });
  redirect("/cm");
}
