# Zoom API Setup Guide

## Getting Zoom API Credentials

1. **Go to Zoom Marketplace**
   - Visit: https://marketplace.zoom.us/develop/create
   - Sign in with your Zoom account

2. **Create Server-to-Server OAuth App**
   - Click "Build App"
   - Select "Server-to-Server OAuth"
   - Name your app (e.g., "TeachForward Tutoring")

3. **Get Your Credentials**
   - After creating the app, you'll see:
     - **Account ID** (starts with account ID format)
     - **Client ID** (alphanumeric string)
     - **Client Secret** (long alphanumeric string)

4. **Add Scopes**
   - Go to "Scopes" tab
   - Add these scopes:
     - `meeting:write:admin` - Create meetings
     - `meeting:read:admin` - Read meeting details
     - `meeting:delete:admin` - Delete meetings

5. **Activate App**
   - Click "Activate" to make the app live

## Configure Backend

Add these to your `.env` file:

```bash
ZOOM_ACCOUNT_ID=your-account-id-here
ZOOM_CLIENT_ID=your-client-id-here
ZOOM_CLIENT_SECRET=your-client-secret-here
```

## How It Works

1. **When a session is booked:**
   - Backend calls Zoom API with session details
   - Zoom creates a real meeting and returns join URL
   - Meeting link is saved to database
   - Students/tutors can click to join

2. **If Zoom is not configured:**
   - System falls back to mock links (development mode)
   - No errors, just uses placeholder URLs

## Testing

1. Add credentials to `.env`
2. Restart backend server
3. Book a test session
4. Check that zoom_link is a real Zoom URL (not mock)
5. Click the link to verify meeting exists

## Production Deployment

- Add Zoom credentials as environment variables in Railway/hosting platform
- Ensure `requests` and `PyJWT` packages are installed
- Monitor API usage (Zoom has rate limits)

## Troubleshooting

**"Failed to get Zoom access token"**
- Check that credentials are correct
- Verify app is activated in Zoom Marketplace
- Ensure no whitespace in credential values

**"Failed to create Zoom meeting"**
- Verify scopes are added to app
- Check that Account ID matches the Zoom account
- Look at backend logs for detailed error messages

**Falls back to mock links**
- This is normal if credentials aren't configured
- Check `.env` file has all three Zoom variables
- Restart backend after adding credentials
