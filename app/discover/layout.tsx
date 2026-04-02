import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { AppLayout } from "@/components/layout/app-layout"

export default async function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  })

  if (!session.data?.session) {
    redirect("/sign-in")
  }

  return <AppLayout>{children}</AppLayout>
}
