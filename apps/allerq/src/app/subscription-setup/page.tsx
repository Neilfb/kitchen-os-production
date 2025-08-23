"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import PlanSelector from "@/components/PlanSelector";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number | null;
  annualPrice?: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  billingUnit?: string;
  limitations?: string[];
}

export default function SubscriptionSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('direct_debit');
  const [step, setStep] = useState<'payment_method' | 'plan_selection'>('payment_method');

  // Redirect if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[SubscriptionSetup] User not authenticated, redirecting to signin');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Show loading spinner while authentication is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handlePlanSelect = async (plan: SubscriptionPlan, billingPeriod: 'monthly' | 'annual') => {
    setLoading(true);
    setError("");

    try {
      console.log('Selected plan:', plan.name, 'Payment method:', paymentMethod, 'Billing:', billingPeriod);

      if (plan.id === 'enterprise') {
        // For enterprise, redirect to contact sales
        window.open('mailto:sales@allerq.com?subject=Enterprise Plan Inquiry', '_blank');
        setLoading(false);
        return;
      }

      // Get Firebase auth token
      if (!user) {
        setError('Please sign in to continue');
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const subscriptionData = {
        planId: plan.id,
        billingPeriod,
        price: billingPeriod === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price,
        billingUnit: plan.billingUnit || 'per location',
        paymentMethod
      };

      if (paymentMethod === 'direct_debit') {
        // Handle GoCardless direct debit
        console.log('[SubscriptionSetup] Creating GoCardless direct debit...');

        const response = await fetch('/api/subscriptions/gocardless', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscriptionData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (data.type === 'redirect' && data.redirectUrl) {
            // Redirect to GoCardless bank account setup
            console.log('[SubscriptionSetup] Redirecting to GoCardless...');
            window.location.href = data.redirectUrl;
          } else if (data.type === 'demo') {
            // Demo mode - redirect to dashboard
            console.log('[SubscriptionSetup] Demo direct debit created, redirecting to dashboard');
            router.push(data.demoRedirectUrl || '/dashboard?subscription=demo&payment_method=direct_debit');
          } else {
            setError('Unexpected response from direct debit service');
            setLoading(false);
          }
        } else {
          setError(data.error || 'Failed to set up direct debit');
          setLoading(false);
        }
      } else {
        // Handle Stripe card payment
        console.log('[SubscriptionSetup] Creating Stripe subscription...');

        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscriptionData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (data.type === 'checkout' && data.checkoutUrl) {
            // Redirect to Stripe checkout
            console.log('[SubscriptionSetup] Redirecting to Stripe checkout...');
            window.location.href = data.checkoutUrl;
          } else if (data.type === 'demo') {
            // Demo mode - redirect to dashboard
            console.log('[SubscriptionSetup] Demo subscription created, redirecting to dashboard');
            router.push('/dashboard?subscription=demo&payment_method=card');
          } else if (data.type === 'enterprise_contact') {
            // Enterprise plan handled
            setError('');
            setLoading(false);
          } else {
            setError('Unexpected response from subscription service');
            setLoading(false);
          }
        } else {
          setError(data.error || 'Failed to create subscription');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to process subscription. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip subscription for now and access limited features
    router.push('/dashboard?subscription=skipped');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">AllerQ Setup</h1>
            </div>
            <div className="text-sm text-gray-600">
              Step {step === 'payment_method' ? '2' : '3'} of 3: {step === 'payment_method' ? 'Choose Payment Method' : 'Choose Your Plan'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to AllerQ, {user.displayName || user.email || 'User'}! 🎉
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your restaurant has been created successfully. Now {step === 'payment_method' ? 'choose how you\'d like to pay' : 'choose a plan'} to unlock
            AllerQ's powerful allergen management and menu features.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        {step === 'payment_method' && (
          <div className="max-w-4xl mx-auto">
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
              disabled={loading}
            />

            <div className="flex justify-center mt-8">
              <button
                onClick={() => setStep('plan_selection')}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Plan Selection
              </button>
            </div>
          </div>
        )}

        {/* Plan Selector */}
        {step === 'plan_selection' && (
          <>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setStep('payment_method')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Payment Method
              </button>
            </div>

            <PlanSelector
              onPlanSelect={handlePlanSelect}
              showSkipOption={true}
              onSkip={handleSkip}
            />
          </>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-900 font-medium">Setting up your subscription...</p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose AllerQ?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Allergen Detection</h4>
              <p className="text-gray-600">Automatically identify and tag allergens in your menu items with 99% accuracy.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">QR Code Menus</h4>
              <p className="text-gray-600">Generate beautiful, mobile-optimized QR code menus with allergen filtering.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Analytics</h4>
              <p className="text-gray-600">Track menu views, popular items, and allergen searches to optimize your offerings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
