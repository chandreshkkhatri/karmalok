import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured')
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // Check if using placeholder values
    if (process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id_here' || 
        process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret_here') {
      console.error('Razorpay credentials are placeholder values')
      return NextResponse.json(
        { error: 'Payment system not configured with valid credentials' },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const { amount, currency = 'INR' } = await req.json()

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    })
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}