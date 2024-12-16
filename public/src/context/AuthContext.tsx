import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/apiService";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    setIsAuthenticated(!!token);
    setUserId(storedUserId ? Number(storedUserId) : null);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    console.log("Login response:", response);
    localStorage.setItem("accessToken", response.access);
    localStorage.setItem("refreshToken", response.refresh);
    localStorage.setItem("userId", response.userId.toString());
    setIsAuthenticated(true);
    setUserId(response.userId);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
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
