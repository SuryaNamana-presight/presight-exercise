import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Account } from "@/entities/account/model/types";
import {
  fetchSession,
  login as loginRequest,
  logout as logoutRequest,
} from "@/entities/account/api/auth-api";
import { AuthContext } from "./auth-context";
import { useQueryClient } from "@tanstack/react-query";


export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetchSession(controller.signal)
      .then(({ account }) => setAccount(account))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    setAccount(result.account);
  }, []);
  const logout = useCallback(async () => {
    await logoutRequest();
    queryClient.clear();
    setAccount(null);
  }, [queryClient]);
  const value = useMemo(
    () => ({ account, loading, login, logout }),
    [account, loading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
