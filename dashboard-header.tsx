"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { createClient } from "@/lib/supabase/client"

interface DashboardHeaderProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { getTotalItems } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  const navItems = [
    { title: "Profile", href: "/dashboard", icon: "User" },
    { title: "My Listings", href: "/dashboard/listings", icon: "Package" },
    { title: "My Purchases", href: "/dashboard/purchases", icon: "ShoppingBag" },
    { title: "Cart", href: "/dashboard/cart", icon: "ShoppingCart" },
    { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col gap-4 py-4">
                  <div className="px-3">
                    <h2 className="text-lg font-semibold text-emerald-600">EcoFinds</h2>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
                        >
                          {Icon === "User" ? <div className="h-4 w-4" /> : null}
                          {Icon === "Package" ? <div className="h-4 w-4" /> : null}
                          {Icon === "ShoppingBag" ? <div className="h-4 w-4" /> : null}
                          {Icon === "ShoppingCart" ? <ShoppingCart className="h-4 w-4" /> : null}
                          {Icon === "Settings" ? <div className="h-4 w-4" /> : null}
                          {item.title}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-emerald-600">EcoFinds</h1>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search products, sellers..." className="pl-10 bg-gray-50 border-0 focus:bg-white" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart with improved notification badge */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/dashboard/cart">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-600 text-xs text-white flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {getTotalItems() > 99 ? "99+" : getTotalItems()}
                  </span>
                )}
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-semibold shadow-lg">
                  3
                </span>
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <div className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/listings" className="cursor-pointer">
                    <div className="mr-2 h-4 w-4" />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/purchases" className="cursor-pointer">
                    <div className="mr-2 h-4 w-4" />
                    My Purchases
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/cart" className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <div className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                  <div className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search products, sellers..." className="pl-10" />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
