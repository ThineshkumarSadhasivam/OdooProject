"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, ShoppingBag, Settings, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Profile",
    href: "/dashboard",
    icon: User,
  },
  {
    title: "My Listings",
    href: "/dashboard/listings",
    icon: Package,
  },
  {
    title: "My Purchases",
    href: "/dashboard/purchases",
    icon: ShoppingBag,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        <Button size="sm" className="hidden lg:flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Sell Item
        </Button>
      </div>

      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Listings</span>
            <span className="font-medium text-emerald-600">12</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Sales</span>
            <span className="font-medium text-blue-600">8</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">This Month</span>
            <span className="font-medium text-purple-600">$1,247</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
