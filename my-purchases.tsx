"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, MessageCircle, Package, RefreshCw, CheckCircle, Truck } from "lucide-react"

interface Purchase {
  id: string
  order_id: string
  price: number
  status: string
  tracking_number: string | null
  has_review: boolean
  created_at: string
  listings: {
    id: string
    name: string
    category: string
    image_url: string | null
  }
  profiles: {
    first_name: string
    last_name: string
  }
}

export function MyPurchases() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPurchases = async () => {
      const supabase = createClient()

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from("purchases")
          .select(`
            *,
            listings:listing_id (
              id,
              name,
              category,
              image_url
            ),
            profiles:seller_id (
              first_name,
              last_name
            )
          `)
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching purchases:", error)
          return
        }

        setPurchases(data || [])
      } catch (error) {
        console.error("[v0] Error fetching purchases:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  // Filter and sort purchases
  const filteredPurchases = purchases
    .filter((purchase) => {
      const matchesSearch =
        purchase.listings.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${purchase.profiles.first_name} ${purchase.profiles.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || purchase.listings.category === filterCategory
      const matchesStatus = filterStatus === "all" || purchase.status.toLowerCase() === filterStatus.toLowerCase()
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
        default:
          return 0
      }
    })

  const categories = ["all", ...Array.from(new Set(purchases.map((item) => item.listings.category)))]
  const statuses = ["all", "Processing", "In Transit", "Delivered"]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <RefreshCw className="h-4 w-4" />
      case "In Transit":
        return <Truck className="h-4 w-4" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-500"
      case "In Transit":
        return "bg-blue-500"
      case "Delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
            <p className="text-gray-600">Loading your purchases...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-600">View your purchase history and order status</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search purchases or sellers..."
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
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Status" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredPurchases.length} of {purchases.length} purchases
        </p>
      </div>

      {/* Purchases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={purchase.listings.image_url || "/placeholder.svg"}
                  alt={purchase.listings.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(purchase.status)} flex items-center gap-1`}>
                  {getStatusIcon(purchase.status)}
                  {purchase.status}
                </Badge>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {purchase.listings.name}
                  </h3>
                  <p className="text-sm text-gray-600">{purchase.listings.category}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">${purchase.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">#{purchase.order_id}</span>
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sold by:</span>
                  <span className="text-sm font-medium">
                    {purchase.profiles.first_name} {purchase.profiles.last_name}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Purchased on {new Date(purchase.created_at).toLocaleDateString()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Order
                  </Button>
                  {purchase.status === "Delivered" && !purchase.has_review && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                      <Star className="h-4 w-4" />
                      Review
                    </Button>
                  )}
                  {purchase.status === "Delivered" && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                      <MessageCircle className="h-4 w-4" />
                      Contact
                    </Button>
                  )}
                </div>

                {/* Tracking Info */}
                {purchase.tracking_number && purchase.status === "In Transit" && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <span className="text-blue-700 font-medium">Tracking: </span>
                    <span className="text-blue-600">{purchase.tracking_number}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "You haven't made any purchases yet"}
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/shop")}>Start Shopping</Button>
        </div>
      )}
    </div>
  )
}
