EPR Nexus authentication fix

Replace these files in your project:
- client/src/context/AuthContext.jsx
- client/src/pages/AuthPage.jsx
- client/src/App.jsx

Fixes:
1. AuthContext.login now sends email, password AND role to /api/auth/login.
2. Successful login routes to the correct buyer/seller/admin dashboard instead of home.
3. Restores the existing Google + email-verification session methods used by the current auth pages.
4. Adds the missing startSignupSession method used by AuthPage.
5. Adds routes for email-pending, email-verification and google-signup-phone pages.
6. Reads verification links using the verify-email query parameter used by the email service.

The backend already correctly skips email verification for admin accounts.

Note: The uploaded node_modules directory contains platform-specific native Vite/Rolldown binaries, so a build could not be run in this Linux environment. Run npm install in client on Windows, then npm run build.
