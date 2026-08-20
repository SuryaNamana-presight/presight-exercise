import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { DirectoryPage } from "@/pages/directory/ui/directory-page";
import { LoginPage } from "@/pages/login/ui/login-page";
import { AuthProvider } from "@/features/auth/model/auth-provider";
import { useAuth } from "@/features/auth/model/auth-context";
import { Spinner } from "@/shared/ui/spinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});
function AuthenticatedApp() {
  const { account, loading } = useAuth();
  if (loading)
    return (
      <div className="session-loader">
        <Spinner label="Opening PeopleSpace…" />
      </div>
    );
  return account ? <DirectoryPage /> : <LoginPage />;
}
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
