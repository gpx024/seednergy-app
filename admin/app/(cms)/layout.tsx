import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function CmsLayout({children}:{children:React.ReactNode}){const admin=await requireAdmin();return <div className="shell"><aside className="sidebar"><div className="brand">Seednergy</div><nav className="nav"><Link href="/dashboard">Overview</Link><Link href="/seeds">Seeds</Link><Link href="/settings">AI settings</Link><Link href="/audit">Audit</Link></nav><p className="role">{admin.email}<br/>{admin.role}</p><SignOutButton/></aside><main className="content">{children}</main></div>}
