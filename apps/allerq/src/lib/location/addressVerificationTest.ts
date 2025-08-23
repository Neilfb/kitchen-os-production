// Test script for address verification fixes
import { googlePlacesService } from './googlePlaces';

export async function testAddressVerification() {
  console.log('🧪 Testing Address Verification Fixes');
  console.log('=====================================');

  const testAddresses = [
    '40 Ardaveen Ave, Newry BT35 8UJ, UK',
    '123 Main Street, London SW1A 1AA, UK',
    '456 Oak Avenue, Manchester M1 1AA, UK',
    '789 High Street, Edinburgh EH1 1YZ, UK',
    '321 Broadway, New York, NY 10001, USA',
    '654 Maple Drive, Toronto, ON M5V 3A8, Canada',
  ];

  for (const address of testAddresses) {
    console.log(`\n📍 Testing: ${address}`);
    console.log('-'.repeat(50));

    try {
      const verification = await googlePlacesService.verifyAddress(address);
      
      console.log(`✅ Verification Result:`);
      console.log(`   Verified: ${verification.verified}`);
      console.log(`   Confidence: ${verification.confidence}%`);
      console.log(`   Source: ${verification.verificationSource}`);
      console.log(`   Completeness: ${verification.completeness.score}% (${verification.completeness.isComplete ? 'Complete' : 'Incomplete'})`);
      
      if (verification.completeness.issues.length > 0) {
        console.log(`   Issues:`);
        verification.completeness.issues.forEach(issue => {
          console.log(`     - ${issue}`);
        });
      }
      
      console.log(`   Address Components:`);
      console.log(`     Street Number: ${verification.addressComponents.street_number || 'N/A'}`);
      console.log(`     Street Name: ${verification.addressComponents.route || 'N/A'}`);
      console.log(`     City: ${verification.addressComponents.locality || 'N/A'}`);
      console.log(`     State/Province: ${verification.addressComponents.administrative_area_level_1 || 'N/A'}`);
      console.log(`     Postal Code: ${verification.addressComponents.postal_code || 'N/A'}`);
      console.log(`     Country: ${verification.addressComponents.country || 'N/A'}`);
      
    } catch (error) {
      console.error(`❌ Error testing address: ${error}`);
    }
  }
}

// Test specific UK address from the issue
export async function testSpecificUKAddress() {
  console.log('\n🎯 Testing Specific UK Address from Issue');
  console.log('==========================================');
  
  const address = '40 Ardaveen Ave, Newry BT35 8UJ, UK';
  console.log(`Testing: ${address}`);
  
  try {
    const verification = await googlePlacesService.verifyAddress(address);
    
    console.log('\n📊 Detailed Results:');
    console.log(`Confidence Score: ${verification.confidence}%`);
    console.log(`Completeness Score: ${verification.completeness.score}%`);
    console.log(`Status: ${verification.verified ? 'Verified' : 'Needs Review'}`);
    console.log(`Complete: ${verification.completeness.isComplete ? 'Yes' : 'No'}`);
    
    console.log('\n🔍 Parsed Components:');
    const components = verification.addressComponents;
    console.log(`Building/House Number: ${components.street_number || '❌ Missing'}`);
    console.log(`Street Name: ${components.route || '❌ Missing'}`);
    console.log(`City/Locality: ${components.locality || '❌ Missing'}`);
    console.log(`Postal Code: ${components.postal_code || '❌ Missing'}`);
    console.log(`Country: ${components.country || '❌ Missing'}`);
    console.log(`State/Province: ${components.administrative_area_level_1 || 'N/A (not required for UK)'}`);
    
    if (verification.completeness.issues.length > 0) {
      console.log('\n⚠️ Issues Reported:');
      verification.completeness.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ No issues found!');
    }
    
    // Expected results
    console.log('\n🎯 Expected vs Actual:');
    console.log(`Expected Completeness: 100% | Actual: ${verification.completeness.score}%`);
    console.log(`Expected Status: Complete | Actual: ${verification.completeness.isComplete ? 'Complete' : 'Incomplete'}`);
    
    const success = verification.completeness.score === 100 && verification.completeness.isComplete;
    console.log(`\n${success ? '🎉 TEST PASSED' : '❌ TEST FAILED'}: Address verification ${success ? 'working correctly' : 'still has issues'}`);
    
    return success;
    
  } catch (error) {
    console.error(`❌ Error testing specific address: ${error}`);
    return false;
  }
}

// Export for use in API routes or components
export { testAddressVerification, testSpecificUKAddress };
