"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Eye, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Listing {
  id: string
  name: string
  price: number
  category: string
  condition: string
  status: string
  views: number
  image_url: string | null
  created_at: string
}

export function MyListings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchListings = async () => {
      const supabase = createClient()

      try {
        console.log("[v0] Starting to fetch listings...")

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.log("[v0] Auth error:", userError)
          if (userError.message === "Supabase not configured") {
            setIsSupabaseConfigured(false)
            setError("Supabase is not configured. Please set up your environment variables.")
            return
          }
          throw userError
        }

        if (!user) {
          console.log("[v0] No authenticated user found")
          setError("Please log in to view your listings.")
          return
        }

        console.log("[v0] User authenticated:", user.id)

        const { data, error: fetchError } = await supabase
          .from("listings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("[v0] Error fetching listings:", fetchError)
          if (fetchError.message.includes("Could not find the table")) {
            setError("Database tables not found. Please run the database setup scripts.")
          } else {
            setError(`Failed to load listings: ${fetchError.message}`)
          }
          return
        }

        console.log("[v0] Successfully fetched listings:", data?.length || 0)
        setListings(data || [])
        setError(null)
      } catch (error) {
        console.error("[v0] Unexpected error:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()

    const supabase = createClient()
    const channel = supabase
      .channel("listings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "listings",
        },
        (payload) => {
          console.log("[v0] Real-time update received:", payload)
          // Refetch listings when changes occur
          fetchListings()
        },
      )
      .subscribe()

    return () => {
      console.log("[v0] Cleaning up real-time subscription")
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch = listing.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || listing.category === filterCategory
      const matchesStatus = filterStatus === "all" || listing.status.toLowerCase() === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        case "views":
          return b.views - a.views
        default:
          return 0
      }
    })

  const categories = ["all", ...Array.from(new Set(listings.map((item) => item.category)))]

  const handleProductClick = (listingId: string) => {
    router.push(`/product/${listingId}`)
  }

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    const supabase = createClient()
    const { error } = await supabase.from("listings").delete().eq("id", listingId)

    if (error) {
      console.error("[v0] Error deleting listing:", error)
      setError(`Failed to delete listing: ${error.message}`)
    } else {
      console.log("[v0] Successfully deleted listing:", listingId)
      // Remove from local state immediately for better UX
      setListings((prev) => prev.filter((listing) => listing.id !== listingId))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600">Loading your listings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant={isSupabaseConfigured ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {!isSupabaseConfigured && (
              <div className="mt-2">
                <p className="text-sm">To configure Supabase:</p>
                <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                  <li>Go to Project Settings in the top right</li>
                  <li>Add the Supabase integration</li>
                  <li>Run the database setup scripts</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">Manage your posted items</p>
        </div>
        <Button className="flex items-center gap-2" asChild>
          <Link href="/dashboard/listings/add">
            <Plus className="h-4 w-4" />
            Add New Listing
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredListings.length} of {listings.length} listings
        </p>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative cursor-pointer" onClick={() => handleProductClick(listing.id)}>
                <img
                  src={listing.image_url || "/placeholder.svg?height=200&width=300&query=product"}
                  alt={listing.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    listing.status === "Active"
                      ? "bg-green-500"
                      : listing.status === "Sold"
                        ? "bg-gray-500"
                        : "bg-yellow-500"
                  }`}
                >
                  {listing.status}
                </Badge>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div onClick={() => handleProductClick(listing.id)} className="cursor-pointer">
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {listing.name}
                  </h3>
                  <p className="text-sm text-gray-600">{listing.category}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">${listing.price.toFixed(2)}</span>
                  <Badge variant="outline">{listing.condition}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views} views</span>
                  <span>•</span>
                  <span>Posted {new Date(listing.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleProductClick(listing.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "You haven't created any listings yet"}
          </p>
          <Button asChild>
            <Link href="/dashboard/listings/add">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
