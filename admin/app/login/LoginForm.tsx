"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm({ initialError }: { initialError?: string }) {
  const router=useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(initialError === "not-admin" ? "This account is not an approved Seednergy administrator." : "");
  const supabase=createSupabaseBrowserClient();
  async function google(){ const { error }=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${location.origin}/auth/callback`}}); if(error)setMessage(error.message); }
  async function passwordLogin(event:React.FormEvent){event.preventDefault();setMessage("");const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else router.push("/dashboard");}
  return <div className="card login-card"><p className="eyebrow">Private administration</p><h1>Seednergy CMS</h1><p>Sign in with an approved administrator account.</p><div className="actions"><button className="button" onClick={google}>Continue with Google</button></div><p className="eyebrow" style={{marginTop:24}}>Or use email</p><form onSubmit={passwordLogin} className="form-grid"><div className="field span-2"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div><div className="field span-2"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div><button className="button span-2" type="submit">Sign in</button></form>{message&&<p className="error">{message}</p>}</div>;
}
