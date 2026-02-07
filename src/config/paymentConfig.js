/**
 * Payment Configuration
 * Stripe integration for course payments
 * 
 * Setup:
 * 1. Get Stripe API key from https://dashboard.stripe.com/apikeys
 * 2. Replace STRIPE_PUBLIC_KEY with your publishable key
 * 3. Backend will handle SECRET_KEY securely
 */

export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publicKey: 'pk_test_demo_key_replace_with_real_key',
  
  // Payment methods
  paymentMethods: ['card', 'apple_pay', 'google_pay'],
  
  // Currency
  currency: 'USD',
  
  // Webhook endpoint for payment updates
  webhookEndpoint: '/api/webhooks/stripe',
};

/**
 * Payment statuses
 */
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  COURSE_PURCHASE: 'course_purchase',
  SUBSCRIPTION: 'subscription',
  REFUND: 'refund',
  CREDIT: 'credit',
};

/**
 * Add Stripe script to window
 */
export const loadStripe = async () => {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      resolve(window.Stripe);
    };
    script.onerror = () => {
      console.error('Failed to load Stripe');
      resolve(null);
    };
    document.body.appendChild(script);
  });
};

/**
 * Create payment intent (call your backend)
 * Backend should call Stripe API
 */
export const createPaymentIntent = async (userId, courseId, amount) => {
  try {
    // In production, call your backend API
    // const response = await fetch('/api/create-payment-intent', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, courseId, amount })
    // });
    // return await response.json();

    // For demo: return mock response
    return {
      clientSecret: `pi_${Date.now()}_secret_demo`,
      paymentIntentId: `pi_${Date.now()}`,
      amount,
      currency: STRIPE_CONFIG.currency,
      status: 'requires_payment_method',
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment (call your backend)
 */
export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  try {
    // In production, call your backend API
    // const response = await fetch('/api/confirm-payment', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ paymentIntentId, paymentMethodId })
    // });
    // return await response.json();

    // For demo: return success
    return {
      success: true,
      paymentIntentId,
      status: 'succeeded',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Process refund
 */
export const processRefund = async (paymentIntentId) => {
  try {
    // In production: call your backend
    return {
      success: true,
      refundId: `ref_${Date.now()}`,
      status: 'refunded',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};
