"use client";

import { useState } from "react";
import { CreditCard, Building2, CheckCircle } from "lucide-react";

export type PaymentMethod = 'card' | 'direct_debit';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    {
      id: 'direct_debit' as PaymentMethod,
      name: 'Direct Debit',
      description: 'Pay directly from your UK bank account',
      icon: Building2,
      provider: 'GoCardless',
      benefits: [
        'Lower processing fees',
        'Automatic payments',
        'UK bank account required',
        'Protected by Direct Debit Guarantee'
      ],
      recommended: true
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Pay with Visa, Mastercard, or American Express',
      icon: CreditCard,
      provider: 'Stripe',
      benefits: [
        'Instant setup',
        'International cards accepted',
        'Secure card storage',
        '3D Secure protection'
      ],
      recommended: false
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Payment Method
        </h3>
        <p className="text-sm text-gray-600">
          Select how you'd like to pay for your AllerQ subscription
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onMethodChange(method.id)}
            >
              {/* Recommended Badge */}
              {method.recommended && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
              )}

              {/* Method Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">via {method.provider}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {method.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                {method.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-xs text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Special Notes */}
              {method.id === 'direct_debit' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700">
                    <strong>Direct Debit Guarantee:</strong> Your payments are protected by the 
                    Direct Debit Guarantee scheme. You can cancel at any time.
                  </p>
                </div>
              )}

              {method.id === 'card' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-xs text-gray-600">
                    <strong>Secure Processing:</strong> Card details are processed securely by Stripe. 
                    We never store your card information.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">Payment Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Billing Cycle:</strong> Monthly subscription
          </div>
          <div>
            <strong>Trial Period:</strong> 14 days free trial
          </div>
          <div>
            <strong>Cancellation:</strong> Cancel anytime, no commitment
          </div>
          <div>
            <strong>Support:</strong> Email support included
          </div>
        </div>
      </div>
    </div>
  );
}
