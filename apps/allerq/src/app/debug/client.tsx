'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugHomePageClient() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Menu API Tester</CardTitle>
          <CardDescription>
            Test menu creation and view API responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Use this tool to test the menu creation API and diagnose issues with menu-related endpoints.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/debug/menu-api">
            <Button>
              Open Menu API Tester
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Status Checker</CardTitle>
          <CardDescription>
            Check if API endpoints are working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Tests key API endpoints and reports their status. Useful for diagnosing connection issues.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/debug/api-status">
            <Button>
              Check API Status
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Console</CardTitle>
          <CardDescription>
            View application logs and errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Debug console shows application logs and errors for troubleshooting.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/debug/console">
            <Button>
              Open Debug Console
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
