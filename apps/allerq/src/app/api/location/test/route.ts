// Test API endpoint for address verification fixes
import { NextRequest, NextResponse } from "next/server";
import { googlePlacesService } from "@/lib/location/googlePlaces";

export async function GET(req: NextRequest) {
  try {
    console.log('[Location Test] Running address verification tests');

    const testAddresses = [
      {
        address: '40 Ardaveen Ave, Newry BT35 8UJ, UK',
        description: 'UK address from issue report',
        expectedComplete: true,
      },
      {
        address: '123 Main Street, London SW1A 1AA, UK',
        description: 'Standard UK address',
        expectedComplete: true,
      },
      {
        address: '456 Broadway, New York, NY 10001, USA',
        description: 'US address with state',
        expectedComplete: true,
      },
      {
        address: 'London, UK',
        description: 'Incomplete address (city only)',
        expectedComplete: false,
      },
    ];

    const results = [];

    for (const test of testAddresses) {
      console.log(`Testing: ${test.address}`);

      try {
        const verification = await googlePlacesService.verifyAddress(test.address);

        const result = {
          address: test.address,
          description: test.description,
          verification: {
            verified: verification.verified,
            confidence: verification.confidence,
            source: verification.verificationSource,
            completeness: {
              score: verification.completeness.score,
              isComplete: verification.completeness.isComplete,
              issues: verification.completeness.issues,
            },
            components: verification.addressComponents,
          },
          expected: {
            complete: test.expectedComplete,
          },
          testResult: {
            passed: verification.completeness.isComplete === test.expectedComplete,
            message: verification.completeness.isComplete === test.expectedComplete
              ? 'Test passed'
              : `Expected ${test.expectedComplete ? 'complete' : 'incomplete'}, got ${verification.completeness.isComplete ? 'complete' : 'incomplete'}`,
          },
        };

        results.push(result);

      } catch (error) {
        console.error(`Error testing ${test.address}:`, error);
        results.push({
          address: test.address,
          description: test.description,
          error: error instanceof Error ? error.message : 'Unknown error',
          testResult: {
            passed: false,
            message: 'Test failed with error',
          },
        });
      }
    }

    // Summary
    const passedTests = results.filter(r => r.testResult?.passed).length;
    const totalTests = results.length;

    const summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      success: passedTests === totalTests,
      message: `${passedTests}/${totalTests} tests passed`,
    };

    console.log(`[Location Test] Summary: ${summary.message}`);

    return NextResponse.json({
      success: true,
      summary,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Location Test] Error:', error);
    return NextResponse.json(
      {
        error: "Failed to run address verification tests",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    console.log(`[Location Test] Testing single address: ${address}`);

    const verification = await googlePlacesService.verifyAddress(address);

    const result = {
      address,
      verification: {
        verified: verification.verified,
        confidence: verification.confidence,
        source: verification.verificationSource,
        formattedAddress: verification.formattedAddress,
        completeness: {
          score: verification.completeness.score,
          isComplete: verification.completeness.isComplete,
          issues: verification.completeness.issues,
        },
        components: {
          streetNumber: verification.addressComponents.street_number,
          streetName: verification.addressComponents.route,
          city: verification.addressComponents.locality,
          state: verification.addressComponents.administrative_area_level_1,
          postalCode: verification.addressComponents.postal_code,
          country: verification.addressComponents.country,
        },
      },
      analysis: {
        hasStreetNumber: !!verification.addressComponents.street_number,
        hasStreetName: !!verification.addressComponents.route,
        hasCity: !!verification.addressComponents.locality,
        hasPostalCode: !!verification.addressComponents.postal_code,
        hasCountry: !!verification.addressComponents.country,
        requiresState: ['united states', 'canada', 'australia'].includes(
          verification.addressComponents.country?.toLowerCase() || ''
        ),
        hasState: !!verification.addressComponents.administrative_area_level_1,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('[Location Test] Error testing single address:', error);
    return NextResponse.json(
      {
        error: "Failed to test address",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
