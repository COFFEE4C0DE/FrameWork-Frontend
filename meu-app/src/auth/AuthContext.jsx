import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { subscribeUnauthorized } from "../services/requestLoader";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());

  useEffect(() => {
    return subscribeUnauthorized(() => {
      clearStoredToken();
      setToken("");
    });
  }, []);

  const value = useMemo(() => {
    function login(nextToken) {
      setStoredToken(nextToken);
      setToken(nextToken);
    }

    function logout() {
      clearStoredToken();
      setToken("");
    }

    return {
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }

  return context;
}
