import type React from "react"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { createClient } from "@/lib/supabase/server"

async function getUser() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("[v0] Auth error:", error.message)
      if (error.message === "Supabase not configured") {
        console.log("[v0] Supabase not configured, using demo mode")
        return null
      }
      return null
    }

    if (!user) {
      console.log("[v0] No authenticated user found")
      return null
    }

    console.log("[v0] Authenticated user found:", user.id)

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile fetch error:", profileError.message)
      // Continue with user data even if profile fetch fails
    }

    return {
      id: user.id,
      firstName: profile?.first_name || user.user_metadata?.first_name || "User",
      lastName: profile?.last_name || user.user_metadata?.last_name || "",
      email: user.email || "",
      avatar: profile?.avatar_url || null,
    }
  } catch (error) {
    console.log("[v0] Error fetching user:", error)
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("[v0] Redirecting unauthenticated user to login")
    redirect("/login")
  }

  const demoUser = user || {
    id: "demo",
    firstName: "Demo",
    lastName: "User",
    email: "demo@ecofinds.com",
    avatar: null,
  }

  console.log("[v0] Dashboard layout rendering for user:", demoUser.firstName)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={demoUser} />
      {children}
    </div>
  )
}
