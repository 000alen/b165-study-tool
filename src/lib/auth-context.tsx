"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "professor";

interface AuthContextValue {
  isAuthenticated: boolean;
  role: Role | null;
  login: (code: string) => { valid: boolean; role: Role | null };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  role: null,
  login: () => ({ valid: false, role: null }),
  logout: () => {},
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function validateCode(code: string): { valid: boolean; role: Role | null } {
  const accessCode = process.env.NEXT_PUBLIC_ACCESS_CODE;
  const profCode = process.env.NEXT_PUBLIC_PROF_CODE;

  if (!accessCode) {
    return { valid: true, role: "professor" };
  }

  if (profCode && code === profCode) {
    return { valid: true, role: "professor" };
  }

  if (code === accessCode) {
    return { valid: true, role: "student" };
  }

  return { valid: false, role: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const access = getCookie("b165-access");
    const storedRole = getCookie("b165-role") as Role | null;

    // If no access code env var is set, auto-authenticate as professor (full access in dev)
    if (!process.env.NEXT_PUBLIC_ACCESS_CODE) {
      setIsAuthenticated(true);
      setRole("professor");
      return;
    }

    if (access === "true" && storedRole) {
      setIsAuthenticated(true);
      setRole(storedRole);
    }
  }, []);

  const login = useCallback((code: string): { valid: boolean; role: Role | null } => {
    const result = validateCode(code);
    if (result.valid && result.role) {
      setCookie("b165-access", "true");
      setCookie("b165-role", result.role);
      setIsAuthenticated(true);
      setRole(result.role);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    deleteCookie("b165-access");
    deleteCookie("b165-role");
    setIsAuthenticated(false);
    setRole(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
