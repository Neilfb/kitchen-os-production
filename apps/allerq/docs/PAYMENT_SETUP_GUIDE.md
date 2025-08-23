# Payment Integration Setup Guide
## Stripe + GoCardless Configuration

This guide will help you configure both Stripe (for card payments) and GoCardless (for direct debit) as payment options for AllerQ subscriptions.

## 🎯 **Quick Setup Checklist**

### Stripe Configuration
- [ ] Create Stripe account
- [ ] Get API keys (test mode first)
- [ ] Create products and prices
- [ ] Configure Vercel environment variables
- [ ] Set up webhook endpoint
- [ ] Test subscription flow

### GoCardless Configuration  
- [ ] Create GoCardless account
- [ ] Get API keys
- [ ] Configure redirect flows
- [ ] Add environment variables
- [ ] Test direct debit setup

---

## 🔧 **Part 1: Stripe Setup**

### Step 1: Get Stripe API Keys

1. **Go to**: https://dashboard.stripe.com
2. **Switch to Test Mode** (toggle in sidebar)
3. **Navigate to**: Developers → API Keys
4. **Copy**:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### Step 2: Create Products (Automated)

Run our setup script:

```bash
cd /Users/neilbradley/allerq-forge/AllerQ-Forge
node scripts/setup-stripe-products.js
```

**Or create manually in Stripe Dashboard:**

1. Go to **Products** → **Add Product**
2. **Standard Plan**:
   - Name: "AllerQ Standard Plan"
   - Price: £7.49 GBP, Monthly recurring
   - Trial: 14 days
3. **Pay As You Go**:
   - Name: "AllerQ Pay As You Go" 
   - Price: £0.99 GBP, Monthly recurring
   - Trial: 14 days

### Step 3: Configure Vercel Environment Variables

1. **Go to**: https://vercel.com/neilfb/aller-q-forge/settings/environment-variables
2. **Add these variables**:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Price IDs (from products created above)
STRIPE_STANDARD_PRICE_ID=price_your_standard_price_id
STRIPE_PAY_AS_YOU_GO_PRICE_ID=price_your_payg_price_id
```

### Step 4: Set Up Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://aller-q-forge.vercel.app/api/webhooks/stripe`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret** and add to Vercel:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

---

## 🏦 **Part 2: GoCardless Setup**

### Step 1: Create GoCardless Account

1. **Go to**: https://manage.gocardless.com/signup
2. **Choose**: Business account
3. **Complete**: Business verification
4. **Switch to**: Sandbox mode for testing

### Step 2: Get API Keys

1. **Navigate to**: Developers → API Keys
2. **Copy**:
   - Access token: `live_...` or `sandbox_...`
   - Webhook secret: For webhook verification

### Step 3: Add GoCardless Environment Variables

Add to Vercel:

```bash
# GoCardless Configuration
GOCARDLESS_ACCESS_TOKEN=sandbox_your_access_token_here
GOCARDLESS_WEBHOOK_SECRET=your_webhook_secret_here
GOCARDLESS_ENVIRONMENT=sandbox  # or 'live' for production

# Redirect URLs
GOCARDLESS_SUCCESS_URL=https://aller-q-forge.vercel.app/dashboard?payment=success
GOCARDLESS_CANCEL_URL=https://aller-q-forge.vercel.app/subscription-setup?cancelled=true
```

---

## 🚀 **Implementation Status**

### ✅ Already Implemented
- Complete Stripe integration
- Subscription API with checkout sessions
- Webhook handling
- Demo mode fallbacks

### 🔄 Next: GoCardless Integration

I'll now implement GoCardless alongside Stripe to give users payment choice:

**Payment Flow Options:**
1. **Card Payment** → Stripe Checkout
2. **Direct Debit** → GoCardless Redirect Flow
3. **Demo Mode** → For testing without payment setup

---

## 🧪 **Testing**

### Test Cards (Stripe)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Bank Details (GoCardless)
- **Sort Code**: `20-00-00`
- **Account Number**: `55779911`
- **Account Holder**: Any name

---

## 📞 **Support**

**Stripe Issues:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: https://support.stripe.com

**GoCardless Issues:**
- Dashboard: https://manage.gocardless.com
- Docs: https://developer.gocardless.com
- Support: https://gocardless.com/support

---

## 🎯 **Next Steps**

1. **Configure Stripe** (follow Part 1)
2. **Test Stripe integration**
3. **Configure GoCardless** (follow Part 2)  
4. **Implement payment method selection UI**
5. **Test both payment flows**
6. **Switch to live mode** when ready

Would you like me to start implementing the GoCardless integration now?
