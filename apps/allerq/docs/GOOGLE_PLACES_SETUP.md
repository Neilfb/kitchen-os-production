# Google Places API Setup Guide

This guide will help you set up the Google Places API for address verification in AllerQ-Forge.

## Prerequisites

- Google Cloud Platform account
- Credit card for billing (Google provides $200 free credit monthly)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `allerq-forge` (or your preferred name)
4. Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable the following APIs:
   - **Places API** (required for address verification)
   - **Geocoding API** (required for coordinate conversion)
   - **Maps JavaScript API** (optional, for future map features)

## Step 3: Create API Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" to secure it:
   - **Application restrictions**: 
     - For development: "None"
     - For production: "HTTP referrers" and add your domain
   - **API restrictions**: 
     - Select "Restrict key"
     - Choose: Places API, Geocoding API, Maps JavaScript API

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Places API key:
   ```env
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

## Step 5: Set Up Billing (Required)

1. Go to "Billing" in Google Cloud Console
2. Link a billing account to your project
3. **Note**: Google provides $200 free credit monthly, which covers ~11,000 address verifications

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. **Test Page**: Go to `/test-dropdown` for comprehensive UX testing
   - Tests dropdown styling and visual separation
   - Shows demo mode vs API mode behavior
   - Provides testing instructions and examples

3. **Restaurant Setup**: Go to `/welcome` and try creating a restaurant
   - The address field should show autocomplete suggestions
   - Verify dropdown appears with proper styling
   - Test backdrop click-to-close functionality

4. **Console Verification**: Check browser console for detailed logs
   - API calls and responses
   - Fallback mode activation
   - Error handling and recovery

## API Usage and Costs

### Pricing (as of 2024)
- **Places API**: $0.017 per request
- **Geocoding API**: $0.005 per request
- **Free tier**: $200 credit monthly (~11,000 requests)

### Usage Estimates
- **Small restaurant (1-5 locations)**: ~$1-5/month
- **Medium restaurant (10-50 locations)**: ~$10-50/month
- **Large chain (100+ locations)**: ~$100+/month

### Cost Optimization Tips
1. **Cache results**: Store verified addresses to avoid re-verification
2. **Batch operations**: Verify multiple addresses in bulk when possible
3. **Set quotas**: Limit API usage in Google Cloud Console
4. **Monitor usage**: Set up billing alerts

## Fallback Mode

If the Google Places API is not configured or fails:
- Address verification will work in "fallback mode"
- Users can still enter addresses manually
- Verification status will show as "manual" instead of "verified"
- All functionality remains available
- Demo mode notice appears when API key is not configured
- Enhanced fallback suggestions for addresses starting with numbers

### Recent UX Improvements (2024)
- ✅ **Fixed "Load failed" errors**: Improved error handling when API key missing
- ✅ **Enhanced dropdown styling**: Better visual separation and backdrop overlay
- ✅ **Demo mode indicators**: Clear feedback when running without API key
- ✅ **Improved fallback suggestions**: Smart pattern recognition for partial addresses
- ✅ **Better error messaging**: User-friendly error states and recovery options

## Security Best Practices

1. **Restrict API keys**: Always restrict keys to specific APIs and domains
2. **Environment variables**: Never commit API keys to version control
3. **Rotate keys**: Regularly rotate API keys for security
4. **Monitor usage**: Set up alerts for unusual API usage

## Troubleshooting

### Common Issues

1. **"API key not valid"**
   - Check that the API key is correctly set in `.env.local`
   - Ensure the Places API is enabled for your project
   - Verify API key restrictions allow your domain

2. **"This API project is not authorized"**
   - Enable billing for your Google Cloud project
   - Ensure the Places API is enabled

3. **"You have exceeded your rate limit"**
   - Check your API quotas in Google Cloud Console
   - Consider upgrading your billing plan

4. **Address suggestions not appearing**
   - Check browser console for JavaScript errors
   - Verify network requests are reaching the API
   - Test with a simple address like "123 Main St"

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
NODE_ENV=development
```

This will show detailed logs in the browser console and server logs.

## Support

For issues with:
- **Google Places API**: [Google Cloud Support](https://cloud.google.com/support)
- **AllerQ-Forge integration**: Check the application logs and GitHub issues

## Next Steps

Once address verification is working:
1. Test with various address formats
2. Monitor API usage and costs
3. Consider implementing Phase 2: Business Verification
4. Set up production environment with proper API key restrictions
