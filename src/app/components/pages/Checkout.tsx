import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Check, ArrowLeft, Shield, CreditCard, Lock } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

// Initialize Stripe with error handling
let stripePromise: Promise<any> | null = null;
try {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
  stripePromise = loadStripe(key);
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  stripePromise = null;
}

const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: null, // Free plan, no Stripe price ID
    interval: null,
    features: [
      'Up to 5 clients',
      'Basic session notes (DAP format)',
      'Client portal access',
      'Email support',
      'PHIPA-compliant storage'
    ]
  },
  solo: {
    id: 'solo',
    name: 'Solo Practitioner',
    price: 49,
    priceId: import.meta.env.VITE_STRIPE_PRICE_SOLO || 'price_solo_placeholder',
    interval: 'month',
    features: [
      'Unlimited clients',
      'All note formats (SOAP, DAP, BIRP, Progress)',
      'AI-assisted note generation',
      'Billing & invoicing',
      'T2125 tax export',
      'Client portal & booking',
      'Calendar integration',
      'Priority email support',
      'Cultural sensitivity templates',
      'PHIPA & PIPEDA compliant'
    ]
  },
  group: {
    id: 'group',
    name: 'Group Practice',
    price: 79,
    priceId: import.meta.env.VITE_STRIPE_PRICE_GROUP || 'price_group_placeholder',
    interval: 'month',
    features: [
      'Everything in Solo, plus:',
      'Up to 3 practitioners',
      'Shared client management',
      'Practice-wide analytics',
      'Team calendar',
      'Centralized billing',
      'Advanced reporting',
      'Phone + email support',
      'Custom branding'
    ]
  }
};

function CheckoutForm({ plan, onSuccess }: { plan: typeof PLANS[keyof typeof PLANS]; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred processing your payment.');
        toast.error(error.message || 'Payment failed');
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-medium text-[var(--ink)] mb-4">Payment Details</h3>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[var(--sage)] text-white py-4 rounded-xl font-medium text-base hover:bg-[var(--sage-deep)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Start Free Trial (7 days)
          </>
        )}
      </button>

      <p className="text-xs text-center text-[var(--ink-muted)]">
        Your trial starts today. You won't be charged until {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}. Cancel anytime.
      </p>
    </form>
  );
}

export function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan') || 'solo';
  const plan = PLANS[planId as keyof typeof PLANS] || PLANS.solo;
  
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create payment intent when component mounts
  const initializePayment = async () => {
    if (plan.price === 0) {
      // Free plan - no payment needed
      navigate('/signup');
      return;
    }

    setIsLoading(true);
    try {
      // Call your backend to create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.priceId
        })
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      toast.error('Failed to load payment form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('Subscription activated! Welcome to MentalPath 🎉');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--warm)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--sage)] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-white stroke-2 [stroke-linecap:round]">
                <path d="M12 3c-4.5 0-8 3.5-8 8 0 3 1.7 5.6 4.2 7l-.2 3 4-2c.7.1 1.3.2 2 .2 4.5 0 8-3.5 8-8s-3.5-8-8-8z"/>
                <path d="M8 11h8M8 14h5"/>
              </svg>
            </div>
            <span className="font-[var(--font-display)] text-lg text-[var(--ink)]">MentalPath</span>
          </Link>
          
          <div className="flex items-center gap-2 text-xs text-[var(--sage-deep)] bg-[var(--sage-pale)] px-3 py-1.5 rounded-full">
            <Shield className="w-4 h-4" />
            Secure Checkout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--ink-soft)] hover:text-[var(--sage)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to pricing
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="font-[var(--font-display)] text-3xl text-[var(--ink)] mb-2">
                Complete your order
              </h1>
              <p className="text-[var(--ink-soft)]">
                Start your 7-day free trial today
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[var(--border)] p-6">
              <h2 className="text-sm font-medium text-[var(--ink-muted)] uppercase tracking-wide mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
                  <div>
                    <h3 className="font-medium text-[var(--ink)] mb-1">{plan.name}</h3>
                    <p className="text-sm text-[var(--ink-muted)]">
                      Billed monthly · Cancel anytime
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-[var(--font-display)] text-2xl text-[var(--ink)]">
                      ${plan.price}
                    </div>
                    <div className="text-xs text-[var(--ink-muted)]">CAD/month</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[var(--ink)] mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
                        <Check className="w-4 h-4 text-[var(--sage)] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--border)] space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--ink-muted)]">Free trial (7 days)</span>
                    <span className="font-medium text-[var(--sage)]">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-[var(--ink)]">Due today</span>
                    <span className="font-[var(--font-display)] text-xl text-[var(--ink)]">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--ink-muted)]">Starting {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                    <span className="font-medium text-[var(--ink)]">${plan.price}/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <div className="w-5 h-5 bg-[var(--sage-pale)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-[var(--sage)]" />
                </div>
                Cancel anytime, no questions asked
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <div className="w-5 h-5 bg-[var(--sage-pale)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-[var(--sage)]" />
                </div>
                PHIPA-compliant Canadian data storage
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <div className="w-5 h-5 bg-[var(--sage-pale)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-[var(--sage)]" />
                </div>
                No hidden fees or setup charges
              </div>
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="lg:col-span-3">
            {plan.price === 0 ? (
              <div className="bg-white rounded-xl border border-[var(--border)] p-8 text-center">
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--ink)] mb-4">
                  Free Plan Selected
                </h2>
                <p className="text-[var(--ink-soft)] mb-6">
                  No payment required. Start using MentalPath right away!
                </p>
                <Link
                  to="/signup"
                  className="inline-block bg-[var(--sage)] text-white px-8 py-3 rounded-xl font-medium hover:bg-[var(--sage-deep)] transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            ) : (
              <>
                {!clientSecret ? (
                  <div className="bg-white rounded-xl border border-[var(--border)] p-8">
                    <button
                      onClick={initializePayment}
                      disabled={isLoading}
                      className="w-full bg-[var(--sage)] text-white py-4 rounded-xl font-medium hover:bg-[var(--sage-deep)] transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Continue to Payment'}
                    </button>
                  </div>
                ) : (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm plan={plan} onSuccess={handleSuccess} />
                  </Elements>
                )}

                {/* Security Notice */}
                <div className="mt-6 bg-[var(--sage-pale)] rounded-xl p-4 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-[var(--sage-deep)] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[var(--sage-deep)]">
                    <strong className="font-medium">Secure payment powered by Stripe.</strong>
                    <br />
                    Your payment information is encrypted and never stored on our servers. We're PCI DSS compliant.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}