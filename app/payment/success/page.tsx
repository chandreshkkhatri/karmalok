import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for upgrading to Pro. Your subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You now have access to:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Premium AI models
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Advanced features
              </li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/pricing">View Plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}