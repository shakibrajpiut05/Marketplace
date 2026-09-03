// Official Indian state list used anywhere the application asks for a state.
// Delhi is kept separately for backwards compatibility because existing listings
// and user data may use "Delhi" as a location even though it is a Union Territory.
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Existing project data uses Delhi as a listing/request location, so keep it
// available without changing any stored values or existing filtering behavior.
export const INDIAN_LOCATIONS = ["Delhi", ...INDIAN_STATES];
