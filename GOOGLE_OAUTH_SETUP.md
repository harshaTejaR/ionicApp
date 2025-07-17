# Google OAuth Setup Guide

## Error 400: redirect_uri_mismatch

This error occurs when the redirect URI in your Google OAuth configuration doesn't match what your app is using.

## Steps to Fix:

### 1. Go to Google Cloud Console
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Select your project (or create a new one)

### 2. Enable Required APIs
- Go to **APIs & Services** → **Library**
- Search for and enable:
  - **Google+ API** (or Google Identity API)
  - **Google People API** (optional but recommended)

### 3. Configure OAuth Consent Screen
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **External** user type
- Fill in the required information:
  - App name: `myApp`
  - User support email: Your email
  - Developer contact information: Your email
- Add scopes: `email`, `profile`, `openid`
- Add test users if needed

### 4. Create OAuth 2.0 Client ID
- Go to **APIs & Services** → **Credentials**
- Click **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Web application**
- Name: `myApp Web Client`

### 5. Configure Redirect URIs
Add these **Authorized redirect URIs**:
```
http://localhost:8100
http://localhost:8100/
http://localhost:8100/auth/callback
http://localhost:4200
http://localhost:4200/
capacitor://localhost
capacitor://localhost/
```

### 6. Configure JavaScript Origins
Add these **Authorized JavaScript origins**:
```
http://localhost:8100
http://localhost:4200
```

### 7. For Mobile App (Additional)
If you plan to build for mobile, also add:
- **Android**: Add your app's SHA-1 certificate fingerprint
- **iOS**: Add your app's bundle identifier

### 8. Update Configuration Files
Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual client ID in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `capacitor.config.ts`

### 9. Test the Configuration
1. Save all changes in Google Cloud Console
2. Restart your Ionic development server
3. Try signing in again

## Common Issues:

### Issue 1: Still getting redirect_uri_mismatch
- Make sure you've added all the redirect URIs listed above
- Check that your client ID is correctly copied (no extra spaces)
- Wait a few minutes for Google's changes to propagate

### Issue 2: localhost vs 127.0.0.1
- Some systems use `127.0.0.1` instead of `localhost`
- Add both to your authorized origins:
  - `http://127.0.0.1:8100`
  - `http://localhost:8100`

### Issue 3: Different ports
- If your app runs on a different port, add it to the authorized origins
- Common ports: 8100, 4200, 3000, 8000

## Debug Information:
- Your current app URL: Check the browser address bar when running `ionic serve`
- The redirect URI being used is typically your app's base URL
- Error details can be found in the browser's developer console

## Next Steps:
1. Complete the Google Cloud Console setup
2. Replace the placeholder client ID
3. Test the authentication flow
4. If still having issues, check the browser console for more detailed error messages
