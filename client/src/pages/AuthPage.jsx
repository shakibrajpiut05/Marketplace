
import { useState } from "react";

import { Button, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

function AuthPage({ onNavigate }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    gst: "",
    phone: "",
    doc: null,
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const uploadKycDocument = async (documentFile) => {
    const formData = new FormData();

    formData.append("type", "gst_certificate");
    formData.append("document", documentFile);

    const response = await api.post(
      "/documents/kyc",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | LOGIN
      |--------------------------------------------------------------------------
      */

      if (mode === "login") {
        if (!form.email || !form.password) {
          alert("Please enter your email and password.");
          return;
        }

        const response = await login(
          form.email,
          form.password
        );

        const userRole = response.user.role;

        if (userRole === "admin") {
          onNavigate("admin-dashboard");
        } else if (userRole === "seller") {
          onNavigate("seller-dashboard");
        } else {
          onNavigate("buyer-dashboard");
        }

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SIGNUP - STEP 1
      |--------------------------------------------------------------------------
      */

      if (step === 1) {
        if (!form.name) {
          alert("Please enter your full name.");
          return;
        }

        if (!form.email) {
          alert("Please enter your email address.");
          return;
        }

        if (!form.password) {
          alert("Please enter your password.");
          return;
        }

        if (form.password.length < 6) {
          alert(
            "Password must be at least 6 characters long."
          );
          return;
        }

        setStep(2);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SIGNUP - STEP 2 / KYC
      |--------------------------------------------------------------------------
      */

      if (!form.company) {
        alert("Please enter your company name.");
        return;
      }

      if (!form.gst) {
        alert("Please enter your GST number.");
        return;
      }

      if (!form.phone) {
        alert("Please enter your phone number.");
        return;
      }

      if (!form.doc) {
        alert(
          "Please upload your business document."
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CLIENT-SIDE FILE VALIDATION
      |--------------------------------------------------------------------------
      */

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(form.doc.type)) {
        alert(
          "Only PDF, JPG, PNG and WEBP files are allowed."
        );
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (form.doc.size > maxFileSize) {
        alert(
          "File size must be less than 5 MB."
        );
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | REGISTER USER
      |--------------------------------------------------------------------------
      */

      const registerResponse = await register({
        name: form.name,
        company: form.company,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      });

      if (!registerResponse.success) {
        throw new Error(
          registerResponse.message ||
            "Registration failed."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | LOGIN AFTER REGISTRATION
      |--------------------------------------------------------------------------
      |
      | We need the JWT before uploading the KYC document
      | because the KYC API is protected.
      |
      */

      const loginResponse = await login(
        form.email,
        form.password
      );

      if (!loginResponse.success) {
        throw new Error(
          "Registration succeeded, but automatic login failed."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | UPLOAD KYC DOCUMENT
      |--------------------------------------------------------------------------
      */

      const kycResponse =
        await uploadKycDocument(form.doc);

      if (!kycResponse.success) {
        throw new Error(
          kycResponse.message ||
            "KYC document upload failed."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      alert(
        "Registration and KYC submission successful!"
      );

      if (role === "seller") {
        onNavigate("seller-dashboard");
      } else {
        onNavigate("buyer-dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#5AC361] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <span
              className="text-xl font-bold text-[#0F1923]"
              style={{
                fontFamily: "Outfit, sans-serif",
              }}
            >
              EPR Nexus
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-[#0F1923]"
            style={{
              fontFamily: "Outfit, sans-serif",
            }}
          >
            {mode === "login"
              ? "Sign In to Your Account"
              : step === 1
                ? "Create Your Account"
                : "Complete KYC"}
          </h1>

          <p className="text-sm text-[#6B7280] mt-1">
            {mode === "login"
              ? "Access your EPR Nexus dashboard"
              : step === 1
                ? "Join India's trusted EPR credit marketplace"
                : "One last step — verify your business identity"}
          </p>
        </div>

        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-6 shadow-sm">
          {/* Role toggle (signup) */}
          {mode === "signup" && step === 1 && (
            <div className="flex gap-2 mb-5 p-1 bg-[#F0F4F8] rounded-xl">
              {["buyer", "seller"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    role === r
                      ? "bg-white shadow-sm text-[#0F1923]"
                      : "text-[#6B7280]"
                  }`}
                >
                  {r === "buyer"
                    ? "🏢 Sign Up as Buyer"
                    : "📋 Sign Up as Seller"}
                </button>
              ))}
            </div>
          )}

          {/* Login role select */}
          {mode === "login" && (
            <div className="flex gap-2 mb-5 p-1 bg-[#F0F4F8] rounded-xl">
              {["buyer", "seller", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    role === r
                      ? "bg-white shadow-sm text-[#0F1923] font-semibold"
                      : "text-[#6B7280]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Step 1 / Login form */}
          {(mode === "login" || step === 1) && (
            <div className="flex flex-col gap-4">
              {mode === "signup" && (
                <Input
                  label="Full Name *"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                />
              )}

              <Input
                label="Email Address *"
                type="email"
                placeholder="work@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
              />

              <Input
                label="Password *"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    password: e.target.value,
                  }))
                }
              />

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-[#5AC361] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-1"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign In"
                    : "Continue to KYC →"}
              </Button>
            </div>
          )}

          {/* Step 2: KYC */}
          {mode === "signup" && step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-[#EBF8EC] border border-[#A5D6A7] rounded-lg text-xs text-[#2E7D32]">
                Business verification required to ensure
                platform trust and compliance.
              </div>

              <Input
                label="Business / Company Name *"
                placeholder="Legal entity name"
                value={form.company}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    company: e.target.value,
                  }))
                }
              />

              <Input
                label="GST Number *"
                placeholder="22AAAAA0000A1Z5"
                value={form.gst}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gst: e.target.value,
                  }))
                }
              />

              <Input
                label="Phone Number *"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone: e.target.value,
                  }))
                }
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#374151]">
                  Upload Business Document *
                </label>

                <label className="border-2 border-dashed border-[#E5EAF0] rounded-xl p-5 text-center hover:border-[#5AC361] transition-colors cursor-pointer">
                  <svg
                    className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>

                  <p className="text-sm text-[#6B7280]">
                    {form.doc
                      ? form.doc.name
                      : "GST Certificate / Registration Document"}
                  </p>

                  <p className="text-xs text-[#9CA3AF] mt-1">
                    PDF, JPG, PNG (max 5 MB)
                  </p>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        doc:
                          e.target.files?.[0] ||
                          null,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </Button>

                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Complete Sign Up"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#E5EAF0] text-center text-sm text-[#6B7280]">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-[#5AC361] font-medium hover:underline"
                  onClick={() => {
                    setMode("signup");
                    setStep(1);
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-[#5AC361] font-medium hover:underline"
                  onClick={() => {
                    setMode("login");
                    setStep(1);
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-[#9CA3AF] text-center mt-4 leading-relaxed">
          By continuing, you agree to our Terms of Service and
          Privacy Policy. All transactions are mediated by EPR
          Nexus.
        </p>
      </div>
    </div>
  );
}

export { AuthPage as default };

