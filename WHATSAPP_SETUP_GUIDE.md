# WhatsApp Business API Setup Guide

## Step 1: Get WhatsApp Business API Access

### Option A: Meta Business (Recommended)
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Meta Business Account if you don't have one
3. Navigate to WhatsApp Business API
4. Create a new WhatsApp Business App
5. Get your:
   - **Access Token** (starts with `EAA...`)
   - **Phone Number ID** 
   - **Business Account ID**

### Option B: Third-Party Provider (Easier)
Popular providers:
- **Twilio** (https://twilio.com/whatsapp)
- **360Dialog** (https://360dialog.com/)
- **Wati** (https://wati.io/)

## Step 2: Configure in Your System

1. **Go to Settings Page**
   - Navigate to Settings → API Keys tab
   - Find "WhatsApp Business API" section

2. **Add Your Credentials**
   - **Access Token**: Paste your WhatsApp Business API token
   - **Phone Number ID**: Your verified WhatsApp Business number
   - **Business Account ID**: Your Meta Business account ID

3. **Save Configuration**
   - Click "Save Settings"
   - System will validate the credentials

## Step 3: Phone Number Format

All phone numbers must be in international format:
- **Correct**: +919876543210
- **Incorrect**: 9876543210, 09876543210

## Step 4: Available Notifications

### Automatic Notifications:
- **Fee Reminders**: Sent to students with pending payments
- **Payment Confirmations**: Sent after successful payment
- **Attendance Alerts**: Sent for consecutive absences
- **Batch Updates**: Sent for schedule changes

### Manual Notifications:
- **Bulk Messages**: Send to all students or specific groups
- **Individual Messages**: Send to specific students
- **Emergency Alerts**: Send urgent notifications

## Step 5: Using the System

### Send Fee Reminders:
1. Go to **Fees → Pending** tab
2. Click "Send Reminder" next to any pending payment
3. Message will be sent automatically

### Send Bulk Messages:
1. Go to **Communications** page
2. Select **WhatsApp** as channel
3. Choose recipients (All students, Sport-wise, Batch-wise)
4. Type your message
5. Click "Send Message"

### Check Message Status:
1. Go to **Communications** page
2. View sent messages and their delivery status
3. Track delivery, read receipts, and failures

## Step 6: Message Templates

### Pre-built Templates:
- Fee reminder with amount and due date
- Payment confirmation with receipt
- Attendance alert with absent days
- Welcome message for new students

### Custom Messages:
You can send custom messages with:
- Student name merge tags
- Fee amount and due dates
- Batch and sport information
- Academy contact details

## Step 7: Best Practices

1. **Message Timing**: Send between 9 AM - 6 PM
2. **Frequency**: Don't send more than 3 messages per day per student
3. **Content**: Keep messages professional and informative
4. **Language**: Use local language for better engagement
5. **Compliance**: Follow WhatsApp Business Policy guidelines

## Step 8: Troubleshooting

### Common Issues:
- **Invalid Token**: Check your Meta Business account access
- **Phone Number Not Verified**: Verify your WhatsApp Business number
- **Message Delivery Failed**: Check recipient's phone number format
- **Rate Limiting**: You've exceeded daily message limits

### Error Codes:
- `400`: Invalid phone number format
- `401`: Invalid access token
- `403`: Phone number not verified
- `429`: Rate limit exceeded

## Step 9: Costs

WhatsApp Business API pricing:
- **Business-initiated messages**: ₹0.50 - ₹2.00 per message
- **User-initiated messages**: Free (24-hour window)
- **Template messages**: Vary by region and type

## Step 10: Testing

1. Add your own phone number as a test student
2. Send yourself a fee reminder
3. Check message delivery and formatting
4. Verify all merge tags work correctly

## Support

If you need help:
1. Check Meta Business API documentation
2. Contact your WhatsApp Business API provider
3. Check system logs in Settings → System Logs