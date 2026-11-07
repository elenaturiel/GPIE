"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { borrarInteresado } from "@/lib/lead/repo";
import { crearLimitador } from "@/lib/lead/rate-limit";
import { COOKIE, DURACION_S, passwordCorrecta, sesionValida, valorCookie } from "@/lib/panel/auth";

const intentos = crearLimitador(10, 15 * 60 * 1000);

export async function entrar(_prev: string | null, form: FormData): Promise<string | null> {
  const ip = ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "sin-ip";
  if (!intentos(createHash("sha256").update(ip).digest("hex"))) return "Demasiados intentos. Espera 15 minutos.";
  if (!passwordCorrecta(String(form.get("password") ?? ""))) return "Contraseña incorrecta.";
  (await cookies()).set(COOKIE, valorCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/panel",
    maxAge: DURACION_S,
  });
  redirect("/panel");
}

export async function salir() {
  (await cookies()).delete({ name: COOKIE, path: "/panel" });
  redirect("/panel");
}

export async function borrar(form: FormData) {
  if (!(await sesionValida())) redirect("/panel");
  await borrarInteresado(String(form.get("id") ?? ""));
  redirect("/panel");
}
