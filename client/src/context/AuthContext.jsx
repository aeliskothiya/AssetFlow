import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("assetflow_token"),
  );
  const [loading, setLoading] = useState(Boolean(token));
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.me();
        setUser(response.data);
      } catch (_error) {
        localStorage.removeItem("assetflow_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  useEffect(() => {
    if (user && token) {
      const newSocket = io("/", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        newSocket.emit("register", user._id || user.id);
      });

      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setNotifications([]);
    }
  }, [user, token]);

  const signup = async (credentials) => {
    const response = await authService.signup(credentials);
    localStorage.setItem("assetflow_token", response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem("assetflow_token", response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem("assetflow_token");
    setToken(null);
    setUser(null);
    if (socket) socket.disconnect();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(token && user),
      notifications,
      setNotifications,
      socket,
    }),
    [user, token, loading, notifications, socket],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
