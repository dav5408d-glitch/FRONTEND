// Configuration Stripe
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  products: {
    bas: {
      id: 'price_basic',
      name: 'Plan Basic',
      price: 9,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_1OZ8C2Aa0000000000000001'
    },
    pro: {
      id: 'price_pro',
      name: 'Plan Pro',
      price: 25,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1OZ8C2Aa0000000000000002'
    },
    elite: {
      id: 'price_elite',
      name: 'Plan Elite',
      price: 49,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE || 'price_1OZ8C2Aa0000000000000003'
    }
  }
};

/**
 * Redirects user to Stripe checkout
 */
export const redirectToCheckout = async (productId: string, userEmail?: string) => {
  try {
    const product = STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products];
    
    if (!product) {
      console.error(`Product ${productId} not found`);
      return;
    }

    // Call backend to create checkout session
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: product.priceId,
        planId: productId,
        email: userEmail
      })
    });

    const { sessionUrl } = await response.json();
    
    if (!sessionUrl) {
      console.error('Failed to create checkout session');
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = sessionUrl;
  } catch (error) {
    console.error('Checkout error:', error);
  }
};

/**
 * Load Stripe - simplified for Vercel
 */
const loadStripe = async (publishableKey: string) => {
  if (!publishableKey) {
    console.error('Stripe publishable key not configured');
    return null;
  }
  // For Vercel: use simple redirect instead of Stripe.js
  return null;
};

/**
 * Initialize Stripe
 */
export const initializeStripe = () => {
  if (typeof window !== 'undefined') {
    loadStripe(STRIPE_CONFIG.publishableKey);
  }
};

export const initializeLemonSqueezy = initializeStripe;
