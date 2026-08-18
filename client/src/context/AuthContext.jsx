import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const restoreUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          "/users/profile"
        );

        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error.response?.data?.message ||
            error.message
        );

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    localStorage.setItem(
      "token",
      response.data.token
    );

    setUser(response.data.user);

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

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
        register,
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};