// Enhanced AllerQ subscription plan selector
"use client";

import React, { useState } from "react";

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

const allerqPlans: SubscriptionPlan[] = [
  {
    id: "standard",
    name: "Standard",
    price: 7.49,
    annualPrice: 74,
    description: "Best for restaurants",
    billingUnit: "per location",
    features: [
      "Unlimited menus & items",
      "AI allergen & dietary tagging",
      "Customizable QR codes & live preview",
      "Real-time scan analytics",
      "Priority email support"
    ],
    popular: true,
    buttonText: "Start 14-Day Trial"
  },
  {
    id: "pay-as-you-go",
    name: "Pay As You Go",
    price: 0.99,
    annualPrice: 9,
    description: "For single-menu vendors",
    billingUnit: "per menu",
    features: [
      "AI allergen & dietary tagging",
      "Basic QR code generation",
      "Scan analytics",
      "Email support"
    ],
    limitations: [
      "Maximum 20 items per menu"
    ],
    buttonText: "Start Trial"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "For restaurant chains & franchises",
    features: [
      "Multiple locations",
      "Volume discounts",
      "White-label solution",
      "Advanced analytics & reporting",
      "API access",
      "Custom allergen rules",
      "Dedicated account manager",
      "SLA & priority support"
    ],
    buttonText: "Contact Sales"
  },
];

interface PlanSelectorProps {
  onPlanSelect?: (plan: SubscriptionPlan, billingPeriod: 'monthly' | 'annual') => void;
  selectedPlanId?: string;
  showSkipOption?: boolean;
  onSkip?: () => void;
}

export default function PlanSelector({
  onPlanSelect,
  selectedPlanId,
  showSkipOption = false,
  onSkip
}: PlanSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    setLoading(plan.id);
    try {
      if (onPlanSelect) {
        await onPlanSelect(plan, billingPeriod);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your AllerQ Plan
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Simple, transparent pricing for restaurants of all sizes
        </p>

        {/* Billing period toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingPeriod === 'annual'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual <span className="text-green-600 font-medium">Save 18%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {allerqPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border rounded-lg p-6 flex flex-col ${
              plan.popular
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 shadow-sm'
            } ${selectedPlanId === plan.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              <div className="mb-4">
                {plan.price !== null ? (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      £{billingPeriod === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{billingPeriod === 'annual' ? 'year' : 'month'} {plan.billingUnit && plan.billingUnit}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                )}
              </div>
            </div>

            <ul className="flex-1 space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}

              {plan.limitations && plan.limitations.map((limitation, index) => (
                <li key={`limit-${index}`} className="flex items-start">
                  <svg className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-amber-700">{limitation}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(plan)}
              disabled={loading === plan.id}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : plan.id === 'enterprise'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? 'Processing...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {showSkipOption && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Skip for now (you can upgrade later)
          </button>
        </div>
      )}
    </div>
  );
}
