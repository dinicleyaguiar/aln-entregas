import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { sessionCookie, verifySessionToken } from "@/lib/security";

export type CurrentAdmin = { id: number; name: string; email: string };

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const store = await cookies();
  const payload = verifySessionToken(store.get(sessionCookie.name)?.value);
  if (!payload) return null;
  const admin = getDb().prepare("SELECT id, name, email FROM admins WHERE id = ?").get(payload.adminId) as CurrentAdmin | undefined;
  return admin ?? null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin as CurrentAdmin;
}

export async function requireAdminApi() {
  return getCurrentAdmin();
}
