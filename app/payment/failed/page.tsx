import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            Something went wrong with your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Common reasons for payment failure:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Insufficient funds</li>
              <li>• Card expired or blocked</li>
              <li>• Network connection issues</li>
              <li>• Payment cancelled by user</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/pricing">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Go Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}