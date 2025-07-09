# WhatsApp Business API Setup Guide

## Overview
This guide helps you set up WhatsApp Business API for automated notifications in the sports academy management system.

## Method 1: Official WhatsApp Business API (Recommended)

### Step 1: WhatsApp Business Account
1. Go to [WhatsApp Business API](https://business.whatsapp.com/products/business-api)
2. Apply for WhatsApp Business API access
3. Complete business verification process
4. Get approved (can take 1-3 weeks)

### Step 2: Get API Credentials
Once approved, you'll receive:
- **Phone Number ID**
- **Access Token**
- **Business Account ID**
- **Webhook Verification Token**

### Step 3: Configure Environment Variables
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_TOKEN=your_webhook_verification_token
```

## Method 2: Third-Party WhatsApp API Services

### Popular Services:
1. **Twilio WhatsApp API**
   - Website: https://www.twilio.com/whatsapp
   - Cost: $0.005-$0.02 per message
   - Setup time: 1-2 days

2. **360Dialog**
   - Website: https://www.360dialog.com/
   - Cost: €0.02-€0.05 per message
   - Setup time: 2-3 days

3. **WABA (WhatsApp Business API)**
   - Website: https://developers.facebook.com/docs/whatsapp
   - Official Meta solution
   - Setup time: 1-3 weeks

### Twilio Setup Example:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Method 3: Local WhatsApp Solution (Not Recommended for Production)

### Using WhatsApp Web API (Unofficial)
⚠️ **Warning**: This method violates WhatsApp's Terms of Service and may result in account suspension.

1. **whatsapp-web.js** (Node.js library)
   ```bash
   npm install whatsapp-web.js
   ```

2. **Basic implementation** (for testing only):
   ```javascript
   const { Client, LocalAuth } = require('whatsapp-web.js');
   
   const client = new Client({
     authStrategy: new LocalAuth()
   });
   
   client.on('qr', (qr) => {
     // Generate QR code for authentication
     console.log('QR RECEIVED', qr);
   });
   
   client.on('ready', () => {
     console.log('Client is ready!');
   });
   
   client.initialize();
   ```

## Implementation in Your Application

### Current Notification Features:
1. **Fee Reminders** - Automated monthly fee reminders
2. **Payment Confirmations** - Instant payment confirmations
3. **Attendance Alerts** - Absence notifications
4. **Welcome Messages** - New student onboarding
5. **Birthday Wishes** - Automated birthday messages
6. **Campaign Messages** - Custom marketing campaigns

### Message Templates (Pre-approved)
You'll need to get these templates approved by WhatsApp:

1. **Fee Reminder Template**:
   ```
   Dear {{name}}, your monthly fee of ₹{{amount}} is due on {{date}}. 
   Please pay to continue classes. Pay online: {{payment_link}}
   ```

2. **Payment Confirmation Template**:
   ```
   Payment received! ₹{{amount}} paid via {{method}} on {{date}}. 
   Thank you {{name}}! Receipt: {{receipt_link}}
   ```

3. **Welcome Template**:
   ```
   Welcome to Parmanand Sports Academy, {{name}}! 
   Your registration is complete. Classes start on {{start_date}}. 
   Contact us: {{phone}}
   ```

## Testing Your Setup

### 1. Test Environment Variables
```bash
# Check if variables are loaded
echo $WHATSAPP_ACCESS_TOKEN
```

### 2. Test API Connection
```bash
# Test with curl
curl -X POST "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "text",
    "text": {
      "body": "Test message from Sports Academy"
    }
  }'
```

### 3. Test in Application
Navigate to Communications > Send Test Message and try sending a message.

## Cost Estimates

### Official WhatsApp Business API:
- **Conversation-based pricing**
- India: ₹0.40-₹2.50 per conversation
- 1000 messages/month ≈ ₹400-₹2500

### Third-party Services:
- **Twilio**: $0.005-$0.02 per message
- **360Dialog**: €0.02-€0.05 per message
- 1000 messages/month ≈ ₹400-₹4000

## Compliance and Best Practices

### 1. Message Content Guidelines:
- No promotional content without opt-in
- Include opt-out instructions
- Use approved templates only
- Respect user preferences

### 2. Rate Limiting:
- Max 100 messages per second
- Daily limits based on phone number rating
- Monitor message delivery rates

### 3. Data Privacy:
- Store user consent records
- Implement opt-out mechanisms
- Follow GDPR/local privacy laws

## Troubleshooting

### Common Issues:

1. **Messages not sending**:
   - Check phone number format (+91XXXXXXXXXX)
   - Verify API credentials
   - Check rate limits

2. **Template not working**:
   - Ensure template is approved
   - Check parameter formatting
   - Verify template ID

3. **High failure rates**:
   - Users may have blocked business numbers
   - Check WhatsApp number quality rating
   - Review message content compliance

## Alternative Solutions

If WhatsApp Business API is not available:

1. **SMS Gateway** (Twilio, AWS SNS)
2. **Email Notifications** (already implemented)
3. **Push Notifications** (for mobile app)
4. **Telegram Bot API** (easier setup)

## Support

For technical support:
- WhatsApp Business API: https://developers.facebook.com/support/
- Twilio: https://support.twilio.com/
- Application: Check logs in `/api/notifications/` endpoints

## Next Steps

1. Choose your preferred WhatsApp API provider
2. Complete business verification
3. Get API credentials
4. Add environment variables
5. Test message sending
6. Deploy to production

Your sports academy management system is ready to integrate with any WhatsApp Business API solution!