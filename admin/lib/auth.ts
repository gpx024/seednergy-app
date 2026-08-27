import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "editor" | "publisher" | "owner";

export async function requireAdmin(): Promise<{ userId: string; email: string; role: AdminRole }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: admin } = await supabase.from("app_admins").select("role").eq("user_id", user.id).eq("active", true).maybeSingle();
  if (!admin) redirect("/login?error=not-admin");
  return { userId: user.id, email: user.email ?? "Admin", role: admin.role as AdminRole };
}
