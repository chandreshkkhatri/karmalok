"use client"

import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRazorpay } from "@/hooks/useRazorpay"

export function PricingSection() {
  const router = useRouter()
  const { initializePayment } = useRazorpay()

  const handleProPlanPayment = () => {
    // Option 1: Use USD currency directly (requires international payments enabled)
    // initializePayment({ amount: 25, currency: 'USD', description: "Pro Plan - $25/month" })
    
    // Option 2: Convert to INR for Indian users
    const usdAmount = 25
    const inrAmount = Math.round(usdAmount * 83) // ₹2075 approximately
    
    initializePayment({
      amount: inrAmount,
      description: "Pro Plan Subscription - Monthly ($25 USD)",
      onSuccess: (response) => {
        toast.success("Payment successful! Welcome to Pro!")
        console.log('Payment successful:', response)
        router.push('/payment/success')
      },
      onFailure: (error) => {
        toast.error("Payment failed. Please try again.")
        console.error('Payment failed:', error)
        router.push('/payment/failed')
      },
    })
  }

  return (
    <section className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-balance mb-4">Choose Your Plan</h2>
        <p className="text-lg text-muted-foreground text-pretty">Start for free, upgrade when you need more power</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Basic Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-2xl">Basic</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Free</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Free access to notebook chat</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Basic AI assistance</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Community support</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-transparent" 
              variant="outline"
              onClick={() => router.push('/')}
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>For power users and professionals</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$25</span>
              <span className="text-muted-foreground ml-2">per month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Everything in Basic</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Access to premium models</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="size-5 text-green-600" />
              <span>Advanced features</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleProPlanPayment}
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
