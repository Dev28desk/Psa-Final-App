# How to Configure and Use WhatsApp Notifications

## Quick Setup (5 minutes)

### Step 1: Get WhatsApp Business API Credentials

**Option A: Meta Business (Free)**
1. Go to https://developers.facebook.com/
2. Create a business account
3. Create a WhatsApp Business app
4. Get your Access Token and Phone Number ID

**Option B: Third-party Provider (Easier)**
- Use Twilio, 360Dialog, or Wati
- They provide easy setup with documentation

### Step 2: Configure in Your System

1. **Open your academy system**
2. **Go to Settings → API Keys tab**
3. **Find WhatsApp Business API section**
4. **Add your credentials:**
   - Access Token (starts with EAA...)
   - Phone Number ID (your business number)
5. **Save Settings**

### Step 3: You're Ready! 🎉

## How to Use WhatsApp Features

### 1. Send Fee Reminders
- Go to **Fees → Pending** tab
- Click "Send Reminder" next to any student
- WhatsApp message sent automatically!

### 2. Send Bulk Messages
- Go to **Communications** page
- Select "WhatsApp" as channel
- Choose recipients (All students, By sport, By batch)
- Type your message
- Click "Send WhatsApp Message"

### 3. Check Message Status
- Go to **Communications** page
- See all sent messages and delivery status
- Track which messages were delivered or failed

## What Messages Are Sent Automatically?

✅ **Fee Reminders** - When payment is due
✅ **Payment Confirmations** - After successful payment
✅ **Attendance Alerts** - For consecutive absences
✅ **Welcome Messages** - For new students

## Sample Messages

### Fee Reminder
```
Hi [Student Name],

This is a friendly reminder that your monthly fee payment of ₹500 is due on 15th January.

Please pay at your earliest convenience to avoid any service interruption.

Thank you!
Parmanand Sports Academy
```

### Payment Confirmation
```
Hi [Student Name],

Your payment of ₹500 has been successfully received via UPI.

Thank you for your payment!
Parmanand Sports Academy
```

## Important Notes

📱 **Phone Numbers**: Must be in international format (+919876543210)
📝 **Message Length**: Keep under 4096 characters
⏰ **Best Time**: Send between 9 AM - 6 PM
🔄 **Frequency**: Max 3 messages per day per student

## Troubleshooting

### "API not configured" error
- Check your Access Token and Phone Number ID in Settings
- Make sure they're saved properly

### "Phone number not found" error
- Student phone numbers must be added in their profile
- Use international format (+91 for India)

### Messages not delivering
- Check if WhatsApp number is verified
- Ensure recipient has WhatsApp installed
- Check your Meta Business account status

## Quick Test

1. Add your own phone number as a test student
2. Go to Fees → Pending and send yourself a reminder
3. Check if you receive the WhatsApp message
4. If yes, you're all set! 🎉

## Support

Need help?
- Check Meta Business documentation
- Contact your WhatsApp API provider
- Check system logs in Settings

---

**Your WhatsApp system is fully ready - just add your API credentials and start sending messages!**