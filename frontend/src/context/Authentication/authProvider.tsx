import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/api/core";
import { constVar } from "@/shared/constVar";
import { jwtDecode } from "jwt-decode";
import {
  AuthContextValue,
  AuthProviderProps,
  JWTTokenResponse,
  DecodedToken,
  FetchOptions,
} from "@/shared/interfaces";

import { AuthContext } from "./authContext";

function isApiError(error: unknown): error is { status: number } {
  return typeof error === "object" && error !== null && "status" in error;
}

let refreshPromise: Promise<string | null> | null = null;
let proactiveRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [uid, setUid] = useState<string | number | null>(null);
  const [prevUid, setPrevUid] = useState<string | number | null>(null);

  const setAuthState = useCallback(
    (token: string | null, authenticated: boolean, loading: boolean) => {
      setAccessToken(token);
      setIsAuthenticated(authenticated);
      setIsLoading(loading);
      scheduleProactiveRefresh(token);
    },
    []
  );

  const handleAuthSuccess = useCallback(
    (res: JWTTokenResponse) => {
      let decoded: DecodedToken | null = null;
      try {
        decoded = jwtDecode(res.access_token);
      } catch (e) {
        console.warn("Failed to decode token on auth success:", e);
      }

      if (decoded?.sub) {
        setUid(decoded.sub);
      }

      setAuthState(res.access_token, true, false);
    },
    [setAuthState]
  );

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const response = await fetchApi<JWTTokenResponse>(
          constVar.api_routes.auth.refresh.path,
          {
            method: constVar.api_routes.auth.refresh.method,
            credentials: "include",
          }
        );
        handleAuthSuccess(response);
        refreshPromise = null;
        return response.access_token;
      } catch (error) {
        console.error("Token refresh failed:", error);
        setAuthState(null, false, false);
        refreshPromise = null;
        return null;
      }
    })();

    return refreshPromise;
  }, [handleAuthSuccess, setAuthState]);

  const scheduleProactiveRefresh = (token: string | null) => {
    if (proactiveRefreshTimeout) clearTimeout(proactiveRefreshTimeout);
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const expiry = decoded["exp"] * 1000;
      const now = Date.now();
      const refreshTime = expiry - now - 10_000;

      if (decoded["sub"]) {
        setUid(decoded["sub"]);
      }

      if (refreshTime > 0) {
        proactiveRefreshTimeout = setTimeout(refreshAccessToken, refreshTime);
      }
    } catch (e) {
      console.warn("Failed to decode token for proactive refresh:", e);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const response = await fetchApi<JWTTokenResponse>(
          constVar.api_routes.auth.refresh.path,
          {
            method: constVar.api_routes.auth.refresh.method,
            credentials: "include",
          }
        );
        handleAuthSuccess(response);
      } catch (error) {
        if (!isApiError(error) || error.status !== 401) {
          console.error("Failed to initialize auth via refresh:", error);
        }
        setAuthState(null, false, false);
      }
    };

    initializeAuth();

    return () => {
      if (proactiveRefreshTimeout) clearTimeout(proactiveRefreshTimeout);
    };
  }, [handleAuthSuccess, setAuthState]);

  useEffect(() => {
    if (uid && prevUid === uid) {
      setPrevUid(null);
    }
  }, [uid, prevUid]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setPrevUid(uid);

    try {
      const response = await fetchApi<JWTTokenResponse>(
        constVar.api_routes.auth.login.path,
        {
          method: constVar.api_routes.auth.login.method,
          body: JSON.stringify({ username: email, password }),
        }
      );
      handleAuthSuccess(response);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setAuthState(null, false, false);
      throw new Error("Invalid email or password");
    }
  };

  const logout = async (): Promise<void> => {
    const prev = uid;
    setPrevUid(prev);
    setAuthState(null, false, true);

    try {
      await fetchApi(constVar.api_routes.auth.logout.path, {
        method: constVar.api_routes.auth.logout.method,
        credentials: "include",
      });
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      setUid(null);
      setIsLoading(false);
    }
  };

  const authRequireAPIFetch = async <T = unknown,>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const makeRequest = async (token: string | null): Promise<T> => {
      if (!token) {
        console.error("No access token available for authenticated request.");
        if (isAuthenticated) await logout();
        throw new Error("Authentication token missing.");
      }

      const headers: Record<string, string> = {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };

      if (options.body && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const credentials =
        options.credentials === "include" ? "include" : undefined;

      return await fetchApi<T>(url, {
        ...options,
        headers,
        credentials,
      });
    };

    try {
      return await makeRequest(accessToken);
    } catch (error: unknown) {
      if (isApiError(error) && error.status === 401) {
        console.log("Received 401, attempting token refresh...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log("Token refreshed, retrying request...");
          return makeRequest(newToken);
        } else {
          if (isAuthenticated) await logout();
          throw new Error("Authentication required and token refresh failed.");
        }
      }
      throw error;
    }
  };

  const value: AuthContextValue = {
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    authRequireAPIFetch,
    prevUid,
    uid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
