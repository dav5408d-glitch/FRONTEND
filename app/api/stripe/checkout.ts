import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId, email } = await req.json();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${req.nextUrl.origin}/checkout/success?plan=${planId}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
    });
    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
