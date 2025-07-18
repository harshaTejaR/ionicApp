# Forgot and Reset Password Feature

## Overview

The forgot and reset password feature allows users who have registered with email/password authentication to reset their password if they forget it. This feature includes:

1. **Forgot Password Page** (`/forgot-password`)
2. **Reset Password Page** (`/reset-password`)
3. **Updated AuthService** with password reset methods
4. **Updated Login Page** with "Forgot Password" link

## Feature Flow

### 1. Forgot Password Request
- User clicks "Forgot Password?" link on the login page
- User enters their email address
- System validates the email and generates a reset token
- Reset token is displayed on screen (in a real app, this would be sent via email)

### 2. Password Reset
- User navigates to reset password page with email and token
- User enters new password and confirms it
- System validates the token and resets the password
- User is redirected to login page after successful reset

## Implementation Details

### AuthService Methods

#### `requestPasswordReset(email: string): Promise<void>`
- Validates user exists and uses email authentication
- Generates a secure random reset token
- Sets token expiry to 1 hour from creation
- Saves token to user data

#### `resetPassword(email: string, token: string, newPassword: string): Promise<void>`
- Validates user exists
- Verifies reset token matches and hasn't expired
- Validates new password meets requirements (min 6 characters)
- Updates user password with new hashed password
- Clears reset token and expiry

#### `generateToken(): string`
- Creates a secure random token using timestamp and random string
- Used for password reset token generation

### User Interface

#### Forgot Password Page (`/forgot-password`)
- Clean, user-friendly interface
- Email input field
- Submit button with loading state
- Error and success message display
- Token display (demo purposes - would be emailed in production)
- Links to login and reset password pages

#### Reset Password Page (`/reset-password`)
- Form with email, token, new password, and confirm password fields
- Input validation and error handling
- Success confirmation with auto-redirect to login
- Links to get new token or return to login

#### Updated Login Page
- Added "Forgot Password?" link below the login form
- Link navigates to forgot password page

### User Data Structure

Updated `User` interface includes:
```typescript
interface User {
  // ... existing fields
  resetToken?: string;        // Password reset token
  resetTokenExpiry?: string;  // ISO string for token expiry
}
```

### Security Features

1. **Token Expiry**: Reset tokens expire after 1 hour
2. **Token Validation**: Tokens are validated for existence, match, and expiry
3. **Password Hashing**: New passwords are hashed before storage
4. **User Validation**: Only email-authenticated users can reset passwords
5. **Secure Token Generation**: Uses random strings and timestamps

### Demo vs Production

**Demo Features (Current Implementation):**
- Reset tokens are displayed on screen
- Tokens are stored locally in JSON file
- No actual email sending

**Production Considerations:**
- Integrate with email service (SendGrid, AWS SES, etc.)
- Use proper database instead of local JSON file
- Add rate limiting for password reset requests
- Implement proper logging and monitoring
- Add CAPTCHA for additional security

## Usage

1. **User forgets password:**
   - Goes to login page
   - Clicks "Forgot Password?" link
   - Enters email and clicks "Send Reset Token"

2. **User resets password:**
   - Copies displayed token (or receives via email in production)
   - Clicks "Go to Reset Password" or navigates directly
   - Enters email, token, new password, and confirmation
   - Clicks "Reset Password"
   - Gets redirected to login page

3. **User logs in with new password:**
   - Uses new password to log in normally

## Error Handling

The system provides clear error messages for:
- Invalid email addresses
- Non-existent users
- Google-authenticated users (not supported)
- Invalid or expired tokens
- Password validation failures
- Network or storage errors

## Testing

To test the feature:

1. Register a new user with email/password
2. Log out
3. Go to login page and click "Forgot Password?"
4. Enter the registered email
5. Copy the displayed token
6. Navigate to reset password page
7. Enter email, token, and new password
8. Verify password reset works by logging in with new password

## Files Modified/Created

### New Files
- `src/app/forgot-password/forgot-password.page.ts`
- `src/app/forgot-password/forgot-password.page.html`
- `src/app/forgot-password/forgot-password.page.scss`
- `src/app/reset-password/reset-password.page.ts`
- `src/app/reset-password/reset-password.page.html`
- `src/app/reset-password/reset-password.page.scss`

### Modified Files
- `src/app/auth.service.ts` - Added password reset methods
- `src/app/login/login.page.html` - Added forgot password link
- `src/app/login/login.page.ts` - Added navigation method
- `src/app/login/login.page.scss` - Added link styling
- `src/app/app.routes.ts` - Added new routes

## Future Enhancements

1. **Email Integration**: Send reset tokens via email
2. **Rate Limiting**: Prevent abuse of reset requests
3. **Password Strength**: More robust password validation
4. **Audit Trail**: Log password reset attempts
5. **Multi-factor Authentication**: Add 2FA for sensitive operations
6. **Custom Token Expiry**: Allow configurable token expiry times
