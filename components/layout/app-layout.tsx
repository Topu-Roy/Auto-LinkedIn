"use client"

import { type ReactNode } from "react"
import { Calendar, Compass, FileText, History, LayoutDashboard, Menu, Settings, Tag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover" as const, label: "Discover", icon: Compass },
  { href: "/drafts" as const, label: "Drafts", icon: FileText },
  { href: "/schedule" as const, label: "Schedule", icon: Calendar },
  { href: "/history" as const, label: "History", icon: History },
  { href: "/topics" as const, label: "Topics", icon: Tag },
  { href: "/settings" as const, label: "Settings", icon: Settings },
]

function SidebarContent({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Auto-LinkedIn</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r lg:block">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
          <MobileSidebar />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
