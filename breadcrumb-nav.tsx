"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  const breadcrumbs = [{ label: "Dashboard", href: "/dashboard", icon: Home }]

  // Build breadcrumb trail based on current path
  if (pathSegments.includes("listings")) {
    breadcrumbs.push({ label: "My Listings", href: "/dashboard/listings" })
  } else if (pathSegments.includes("purchases")) {
    breadcrumbs.push({ label: "My Purchases", href: "/dashboard/purchases" })
  } else if (pathSegments.includes("settings")) {
    breadcrumbs.push({ label: "Settings", href: "/dashboard/settings" })
  }

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          <Link
            href={crumb.href}
            className={`flex items-center gap-1 hover:text-emerald-600 transition-colors ${
              index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : ""
            }`}
          >
            {crumb.icon && <crumb.icon className="h-4 w-4" />}
            {crumb.label}
          </Link>
        </div>
      ))}
    </nav>
  )
}
