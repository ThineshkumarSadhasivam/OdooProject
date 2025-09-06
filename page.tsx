import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/signup-form"
import { Leaf, Recycle, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign Up - EcoFinds",
  description: "Join EcoFinds and start your sustainable shopping journey",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 to-secondary/10 p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EcoFinds</h1>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-6 text-balance">
            Join the sustainable marketplace revolution
          </h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Discover amazing second-hand treasures while helping reduce waste and protect our planet. Every purchase
            makes a difference.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <Recycle className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-foreground">Reduce environmental impact</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-foreground">Support sustainable living</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-foreground">Find unique, quality items</span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground italic">
              "EcoFinds helped me furnish my entire apartment sustainably while saving hundreds of dollars. It feels
              great knowing I'm helping the environment too!"
            </p>
            <p className="text-sm font-medium text-foreground mt-2">- Sarah M., Verified Buyer</p>
          </div>
        </div>
      </div>

      {/* Right Column - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">EcoFinds</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start your sustainable shopping journey today</p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:text-primary/80">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
