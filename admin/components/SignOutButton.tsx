"use client";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
export function SignOutButton(){const router=useRouter();return <button className="button ghost" onClick={async()=>{await createSupabaseBrowserClient().auth.signOut();router.push("/login")}}>Sign out</button>}
