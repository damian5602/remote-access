"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, LayoutDashboard, Users, TabletsIcon as Devices } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === "admin"

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { name: "Devices", href: "/devices", icon: Devices, show: true },
    { name: "Users", href: "/admin/users", icon: Users, show: isAdmin },
    { name: "Settings", href: "/settings", icon: Settings, show: true },
  ]

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            Device Management
          </Link>
          <nav className="hidden md:flex gap-4">
            {navigation
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">{session.user?.name || session.user?.email}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

