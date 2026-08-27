EPR Nexus AccountTools fix

Replace:
client/src/components/AccountTools.jsx

Cause fixed:
ProfileMenu referenced `user` before calling useAuth(), causing:
Uncaught ReferenceError: Cannot access 'user' before initialization

All React hooks now execute before the admin branch, so hook order is stable.
