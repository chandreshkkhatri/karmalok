import { useCallback } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentOptions {
  amount: number
  currency?: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  onSuccess?: (response: any) => void
  onFailure?: (error: any) => void
}

export const useRazorpay = () => {
  const initializePayment = useCallback(async (options: PaymentOptions) => {
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Create order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency || 'INR',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()

      // Initialize Razorpay
      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Karmalok',
        description: options.description || 'Pro Plan Subscription',
        order_id: order.id,
        prefill: options.prefill || {},
        theme: {
          color: '#000000',
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            })

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              if (verifyData.success) {
                options.onSuccess?.(response)
              } else {
                options.onFailure?.(new Error('Payment verification failed'))
              }
            } else {
              options.onFailure?.(new Error('Payment verification failed'))
            }
          } catch (error) {
            options.onFailure?.(error)
          }
        },
        modal: {
          ondismiss: () => {
            options.onFailure?.(new Error('Payment cancelled'))
          },
        },
      }

      const razorpay = new window.Razorpay(razorpayOptions)
      razorpay.open()
    } catch (error) {
      options.onFailure?.(error)
    }
  }, [])

  return { initializePayment }
}