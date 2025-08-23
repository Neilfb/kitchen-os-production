'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { CheckCircle, XCircle, Clock, CreditCard, Building2 } from 'lucide-react';
import Link from 'next/link';

interface EnvironmentStatus {
  vercelEnv: string;
  paymentEnv: string;
  baseUrl: string;
  gocardlessConfigured: boolean;
  stripeConfigured: boolean;
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors?: string[];
  warnings?: string[];
}

interface PaymentTestResult {
  provider: 'stripe' | 'gocardless';
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

/**
 * Payment Integration Test Page
 * Tests Stripe Test and GoCardless Sandbox integrations
 */
export default function PaymentTestPage() {
  const t = useTranslations('common');
  const [environment, setEnvironment] = useState<EnvironmentStatus | null>(null);
  const [testResults, setTestResults] = useState<PaymentTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEnvironmentStatus();
  }, []);

  const fetchEnvironmentStatus = async () => {
    try {
      const response = await fetch('/api/debug/environment');
      const data = await response.json();
      setEnvironment(data);
    } catch (error) {
      console.error('Failed to fetch environment status:', error);
    }
  };

  const runPaymentTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const tests: PaymentTestResult[] = [
      { provider: 'stripe', test: 'Environment Check', status: 'pending', message: 'Checking Stripe configuration...' },
      { provider: 'stripe', test: 'API Connection', status: 'pending', message: 'Testing Stripe API connection...' },
      { provider: 'stripe', test: 'Webhook Endpoint', status: 'pending', message: 'Testing webhook endpoint...' },
      { provider: 'gocardless', test: 'Environment Check', status: 'pending', message: 'Checking GoCardless configuration...' },
      { provider: 'gocardless', test: 'API Connection', status: 'pending', message: 'Testing GoCardless API connection...' },
      { provider: 'gocardless', test: 'Webhook Endpoint', status: 'pending', message: 'Testing webhook endpoint...' },
    ];

    setTestResults([...tests]);

    // Test Stripe Environment
    await runTest(0, async () => {
      if (!environment?.stripeConfigured) {
        throw new Error('Stripe not configured - missing environment variables');
      }
      return { configured: true, environment: environment.paymentEnv };
    });

    // Test Stripe API Connection
    await runTest(1, async () => {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection', provider: 'stripe' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API connection failed');
      return data;
    });

    // Test Stripe Webhook
    await runTest(2, async () => {
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test.event', data: { object: { id: 'test' } } })
      });
      if (response.status === 400) {
        return { status: 'expected_error', message: 'Webhook correctly rejects unsigned requests' };
      }
      throw new Error('Webhook should reject unsigned requests');
    });

    // Test GoCardless Environment
    await runTest(3, async () => {
      if (!environment?.gocardlessConfigured) {
        throw new Error('GoCardless not configured - missing environment variables');
      }
      return { configured: true, environment: environment.paymentEnv };
    });

    // Test GoCardless API Connection
    await runTest(4, async () => {
      const response = await fetch('/api/subscriptions/gocardless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_connection' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'API connection failed');
      return data;
    });

    // Test GoCardless Webhook
    await runTest(5, async () => {
      const response = await fetch('/api/webhooks/gocardless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [{ id: 'test', resource_type: 'test', action: 'test' }] })
      });
      if (response.status === 400) {
        return { status: 'expected_error', message: 'Webhook correctly rejects unsigned requests' };
      }
      throw new Error('Webhook should reject unsigned requests');
    });

    setIsLoading(false);
  };

  const runTest = async (index: number, testFn: () => Promise<any>) => {
    try {
      const result = await testFn();
      setTestResults(prev => prev.map((test, i) => 
        i === index 
          ? { ...test, status: 'success', message: 'Test passed', details: result }
          : test
      ));
    } catch (error) {
      setTestResults(prev => prev.map((test, i) => 
        i === index 
          ? { ...test, status: 'error', message: error instanceof Error ? error.message : 'Test failed' }
          : test
      ));
    }
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getStatusIcon = (status: PaymentTestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (configured: boolean) => (
    <Badge variant={configured ? 'default' : 'destructive'}>
      {configured ? 'Configured' : 'Not Configured'}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Integration Tests</h1>
            <p className="text-gray-600 mt-2">Test Stripe Test and GoCardless Sandbox integrations</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Environment Status */}
        {environment && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
              <CardDescription>Current payment environment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Environment</p>
                  <p className="text-lg font-semibold">{environment.vercelEnv}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Mode</p>
                  <p className="text-lg font-semibold">{environment.paymentEnv}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stripe</p>
                  {getStatusBadge(environment.stripeConfigured)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">GoCardless</p>
                  {getStatusBadge(environment.gocardlessConfigured)}
                </div>
              </div>
              
              {environment.errors && environment.errors.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <strong className="text-red-900">Configuration Errors:</strong>
                      <ul className="list-disc list-inside mt-2 text-red-800">
                        {environment.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Tests</CardTitle>
            <CardDescription>Run comprehensive tests for both payment providers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runPaymentTests} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Running Tests...' : 'Run Payment Tests'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stripe Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe Tests
                </CardTitle>
                <CardDescription>Testing Stripe Test environment integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.filter(test => test.provider === 'stripe').map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.test}</p>
                          <p className="text-sm text-gray-600">{test.message}</p>
                        </div>
                      </div>
                      {test.details && (
                        <Badge variant="outline" className="text-xs">
                          Details
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GoCardless Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  GoCardless Tests
                </CardTitle>
                <CardDescription>Testing GoCardless Sandbox environment integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.filter(test => test.provider === 'gocardless').map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium">{test.test}</p>
                          <p className="text-sm text-gray-600">{test.message}</p>
                        </div>
                      </div>
                      {test.details && (
                        <Badge variant="outline" className="text-xs">
                          Details
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Manual Testing Instructions</CardTitle>
            <CardDescription>Additional tests to perform manually</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Stripe Test Cards</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Success:</strong> 4242 4242 4242 4242</p>
                  <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
                  <p><strong>3D Secure:</strong> 4000 0025 0000 3155</p>
                  <p className="text-gray-600">Use any future expiry date and any 3-digit CVC</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">GoCardless Test Bank Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Sort Code:</strong> 20-00-00</p>
                  <p><strong>Account Number:</strong> 55779911</p>
                  <p><strong>Account Holder:</strong> Any name</p>
                  <p className="text-gray-600">Use for testing bank account setup</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Manual Test Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Go to <Link href="/subscription-setup" className="underline">Subscription Setup</Link></li>
                <li>Select a plan and payment method</li>
                <li>Complete the payment flow with test credentials</li>
                <li>Verify webhook events are received and processed</li>
                <li>Check subscription status in dashboard</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Remove this page notice */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            <strong>Note:</strong> This test page should be removed after payment integration testing is complete.
          </p>
        </div>
      </div>
    </div>
  );
}
