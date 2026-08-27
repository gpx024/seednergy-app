import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SeedEditor } from "./SeedEditor";

export default async function SeedPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const admin=await requireAdmin();const supabase=await createSupabaseServerClient();const {data}=await supabase.from("seed_drafts").select("seed_data,stages_data,status").eq("seed_id",id).maybeSingle();if(!data)notFound();return <SeedEditor seedId={id} initialSeed={data.seed_data as Record<string,unknown>} initialStages={data.stages_data as Record<string,unknown>[]} initialStatus={data.status} role={admin.role}/>}
