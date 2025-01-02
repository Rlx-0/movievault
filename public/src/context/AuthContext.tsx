import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/apiService";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  userEmail: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("userEmail");
    setIsAuthenticated(!!token);
    setUserId(storedUserId ? Number(storedUserId) : null);
    setUserEmail(storedEmail);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    localStorage.setItem("accessToken", response.access);
    localStorage.setItem("refreshToken", response.refresh);
    localStorage.setItem("userId", response.userId.toString());
    localStorage.setItem("userEmail", response.email);
    setIsAuthenticated(true);
    setUserId(response.userId);
    setUserEmail(response.email);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    window.location.href = "/";
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await authService.register(username, email, password);
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userId, userEmail, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
