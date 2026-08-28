import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";

export default async function CmsLayout({children}:{children:React.ReactNode}){const admin=await requireAdmin();return <div className="shell"><aside className="sidebar"><Link className="brand" href="/dashboard" aria-label="Seednergy CMS home"><Image className="brand-logo" src="/brand/wordmark.svg" alt="Seednergy" width={161} height={35} priority /></Link><nav className="nav"><Link href="/dashboard">Overview</Link><Link href="/seeds">Seeds</Link><Link href="/settings">AI settings</Link><Link href="/audit">Audit</Link></nav><p className="role">{admin.email}<br/>{admin.role}</p><SignOutButton/></aside><main className="content">{children}</main></div>}
