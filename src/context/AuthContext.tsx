import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>("/login", {
      email,
      password,
    });
    const { user: loggedInUser, token: newToken } = res.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setToken(newToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/logout");
    } catch {
      // even if the API call fails (e.g. token already expired),
      // still clear local state so the user isn't stuck logged "in"
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}