"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Save, X, Camera, AlertCircle, CheckCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: string
  updated_at: string
}

interface UserProfileProps {
  user: User
  profile: Profile | null
}

interface UserStats {
  itemsListed: number
  itemsSold: number
  purchasesMade: number
}

export function UserProfile({ user, profile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({ itemsListed: 0, itemsSold: 0, purchasesMade: 0 })

  const [formData, setFormData] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    email: profile?.email || user.email || "",
  })

  const [originalData, setOriginalData] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    email: profile?.email || user.email || "",
  })

  useEffect(() => {
    const fetchUserStats = async () => {
      const supabase = createClient()

      try {
        // Get items listed count
        const { count: listedCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // Get items sold count
        const { count: soldCount } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "Sold")

        // Get purchases made count
        const { count: purchasesCount } = await supabase
          .from("purchases")
          .select("*", { count: "exact", head: true })
          .eq("buyer_id", user.id)

        setUserStats({
          itemsListed: listedCount || 0,
          itemsSold: soldCount || 0,
          purchasesMade: purchasesCount || 0,
        })
      } catch (error) {
        console.error("[v0] Error fetching user stats:", error)
      }
    }

    fetchUserStats()
  }, [user.id])

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // Update original data to reflect saved changes
      setOriginalData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      })

      setMessage({ type: "success", text: "Profile updated successfully!" })
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your personal information and account settings</CardDescription>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="flex items-center gap-2" disabled={isLoading}>
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-700"}`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/user-profile-avatar.png" />
                <AvatarFallback className="text-lg">
                  {formData.firstName?.[0] || "U"}
                  {formData.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-gray-600">{formData.email}</p>
              {profile?.created_at && (
                <p className="text-xs text-gray-500">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{userStats.itemsListed}</div>
              <div className="text-sm text-gray-600">Items Listed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.itemsSold}</div>
              <div className="text-sm text-gray-600">Items Sold</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.purchasesMade}</div>
              <div className="text-sm text-gray-600">Purchases Made</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
