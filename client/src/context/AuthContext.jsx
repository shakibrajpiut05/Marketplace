import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

const readSignupSession = () => {
  try {
    const raw = sessionStorage.getItem("epr_signup_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingGoogleSignup, setPendingGoogleSignup] = useState(null);
  const [signupSession, setSignupSession] = useState(readSignupSession);

  const restoreUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/users/profile");

      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error(
        "Session restoration failed:",
        error.response?.data?.message || error.message,
      );

      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }

    return null;
  };

  useEffect(() => {
    restoreUser();
  }, []);

  const login = async (email, password, role) => {
    const response = await api.post("/auth/login", {
      email,
      password,
      role,
    });

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const googleLogin = async ({ credential }) => {
    const response = await api.post("/auth/google", { credential });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
    }

    if (response.data.needsSignup || response.data.needsPhone) {
      setPendingGoogleSignup({
        credential,
        profile: response.data.googleProfile,
      });
    }

    return response.data;
  };

  const completeGoogleSignup = async ({ role, phone }) => {
    if (!pendingGoogleSignup?.credential) {
      throw new Error("Your Google signup session has expired. Please start again.");
    }

    const response = await api.post("/auth/google/complete-signup", {
      credential: pendingGoogleSignup.credential,
      role,
      phone,
    });

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    setPendingGoogleSignup(null);

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);

    if (response.data.signupSessionToken) {
      const session = {
        token: response.data.signupSessionToken,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      };

      sessionStorage.setItem("epr_signup_session", JSON.stringify(session));
      setSignupSession(session);
    }

    return response.data;
  };

  const resendVerification = async () => {
    const response = await api.post("/auth/resend-verification");
    return response.data;
  };

  const resendSignupVerification = async () => {
    const session = signupSession || readSignupSession();

    if (!session?.token) {
      throw new Error("Signup session has expired. Please start signup again.");
    }

    const response = await api.post("/auth/resend-signup-verification", {
      signupSessionToken: session.token,
    });

    return response.data;
  };

  const changeSignupEmail = async (email) => {
    const session = signupSession || readSignupSession();

    if (!session?.token) {
      throw new Error("Signup session has expired. Please start signup again.");
    }

    const response = await api.post("/auth/change-signup-email", {
      signupSessionToken: session.token,
      email,
    });

    const nextSession = {
      ...session,
      email: response.data.email,
    };

    sessionStorage.setItem("epr_signup_session", JSON.stringify(nextSession));
    setSignupSession(nextSession);

    return response.data;
  };

  const loginFromEmailVerification = (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    if (data?.user) {
      setUser(data.user);
    }

    sessionStorage.removeItem("epr_signup_session");
    setSignupSession(null);
  };

  const refreshUser = async () => restoreUser();

  const updateProfile = async ({ name, phone }) => {
    const response = await api.patch("/users/profile", { name, phone });
    if (response.data.success) setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        googleLogin,
        completeGoogleSignup,
        pendingGoogleSignup,
        setPendingGoogleSignup,
        register,
        signupSession,
        resendVerification,
        resendSignupVerification,
        changeSignupEmail,
        loginFromEmailVerification,
        refreshUser,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
