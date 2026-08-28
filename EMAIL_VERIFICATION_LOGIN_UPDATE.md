# Email verification login UX update

Implemented the requested flow for existing local users whose password is correct but whose email is still unverified.

## Behavior

- Login with valid credentials + unverified email now lands on the email verification page instead of showing the old "verify using the link we sent" error.
- The page shows the user's current email.
- First action is **Send Verification Email**.
- After the first successful send, the action becomes **Resend Verification Email**.
- **Edit Email** lets the user correct the pending email address.
- Changing the email invalidates the previous verification link and returns the page to **Send Verification Email**.
- New manual signup no longer automatically sends a verification email; the user explicitly sends it from the pending page.
- Google authentication behavior is unchanged.

## Files changed for this feature

- `server/src/controllers/auth.controller.js`
- `client/src/context/AuthContext.jsx`
- `client/src/pages/AuthPage.jsx`
- `client/src/pages/SignupEmailPendingPage.jsx`

The rest of the project is included as the latest project snapshot used for this update.
