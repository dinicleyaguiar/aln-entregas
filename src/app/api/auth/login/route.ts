import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSessionToken, sessionCookie, verifyPassword } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

async function readCredentials(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as LoginBody;
    return {
      email: String(body.email || "").trim().toLowerCase(),
      password: String(body.password || ""),
      isForm: false,
    };
  }

  const form = await request.formData();
  return {
    email: String(form.get("email") || "").trim().toLowerCase(),
    password: String(form.get("password") || ""),
    isForm: true,
  };
}

export async function POST(request: Request) {
  const { email, password, isForm } = await readCredentials(request);
  const loginUrl = new URL("/admin/login", request.url);

  if (!email || !password) {
    if (isForm) {
      loginUrl.searchParams.set("erro", "Informe o e-mail e a senha.");
      return NextResponse.redirect(loginUrl, 303);
    }
    return NextResponse.json({ error: "Informe o e-mail e a senha." }, { status: 400 });
  }

  const admin = getDb()
    .prepare("SELECT id, email, password_hash FROM admins WHERE email = ?")
    .get(email) as { id: number; email: string; password_hash: string } | undefined;

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    if (isForm) {
      loginUrl.searchParams.set("erro", "E-mail ou senha inválidos.");
      return NextResponse.redirect(loginUrl, 303);
    }
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const destination = new URL("/admin", request.url);
  const response = isForm
    ? NextResponse.redirect(destination, 303)
    : NextResponse.json({ ok: true });

  response.cookies.set(sessionCookie.name, createSessionToken(admin.id, admin.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionCookie.maxAge,
  });

  return response;
}
