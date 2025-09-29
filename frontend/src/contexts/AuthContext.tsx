import React, { createContext, useContext, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { AuthenticationResult } from "@azure/msal-browser";
import { toast } from "react-toastify";

import { User, LoginRequest, AzureAuthRequest } from "../types";
import { authService } from "../services/authService";
import { isStandaloneMode, loginRequest } from "../config/authConfig";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithAzure: () => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Get stored token
  const getToken = (): string | null => {
    return localStorage.getItem("authToken");
  };

  // Set token and user
  const setAuthData = (token: string, userData: User) => {
    localStorage.setItem("authToken", token);
    setUser(userData);
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  // Standalone login
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.token) {
        setAuthData(response.token, response.user);
        toast.success("Successfully logged in!");
      } else {
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Azure AD login
  const loginWithAzure = async (): Promise<void> => {
    if (isStandaloneMode) {
      toast.error("Azure AD login is not available in standalone mode");
      return;
    }

    try {
      setLoading(true);

      // Use popup login
      const response: AuthenticationResult = await instance.loginPopup(
        loginRequest
      );

      if (response.account) {
        const azureRequest: AzureAuthRequest = {
          accessToken: response.accessToken,
          userInfo: {
            oid: response.account.localAccountId,
            email: response.account.username,
            name: response.account.name || response.account.username,
          },
        };

        const authResponse = await authService.verifyAzureToken(azureRequest);

        if (authResponse.success && authResponse.token) {
          setAuthData(authResponse.token, authResponse.user);
          toast.success(
            `Welcome, ${
              authResponse.user.displayName || authResponse.user.email
            }!`
          );
        } else {
          throw new Error("Azure authentication failed");
        }
      }
    } catch (error: any) {
      console.error("Azure login error:", error);
      if (
        error.name === "BrowserAuthError" &&
        error.errorCode === "popup_window_error"
      ) {
        toast.error("Popup was blocked. Please allow popups and try again.");
      } else {
        toast.error(error.message || "Azure login failed");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    clearAuthData();

    // If using Azure AD, also logout from MSAL
    if (!isStandaloneMode && accounts.length > 0) {
      instance
        .logoutPopup({
          postLogoutRedirectUri: window.location.origin,
        })
        .catch((error) => {
          console.error("Azure logout error:", error);
        });
    }

    toast.success("Successfully logged out");
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    const token = getToken();
    if (!token) return;

    try {
      const userData = await authService.getCurrentUser();
      if (userData.success && userData.data) {
        setUser(userData.data);
      } else {
        // Token might be invalid
        clearAuthData();
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      clearAuthData();
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData.success && userData.data) {
            setUser(userData.data);
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          clearAuthData();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Handle MSAL account changes (for Azure AD)
  useEffect(() => {
    if (!isStandaloneMode && accounts.length > 0 && !user) {
      // Auto-login if MSAL has an active account but we don't have a user
      const account = accounts[0];
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account,
        })
        .then(async (response) => {
          try {
            const azureRequest: AzureAuthRequest = {
              accessToken: response.accessToken,
              userInfo: {
                oid: account.localAccountId,
                email: account.username,
                name: account.name || account.username,
              },
            };

            const authResponse = await authService.verifyAzureToken(
              azureRequest
            );

            if (authResponse.success && authResponse.token) {
              setAuthData(authResponse.token, authResponse.user);
            }
          } catch (error) {
            console.error("Silent token acquisition failed:", error);
          }
        })
        .catch((error) => {
          console.error("Silent token acquisition failed:", error);
        });
    }
  }, [accounts, instance, user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithAzure,
    logout,
    getToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
