import { LoginForm } from "./LoginForm";
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){const params=await searchParams;return <main className="login"><LoginForm initialError={params.error}/></main>}
