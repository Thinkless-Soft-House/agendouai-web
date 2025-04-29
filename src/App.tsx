import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error/ErrorFallback";
import Index from "./pages/Index";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Empresas from "./pages/Empresas";
import Particoes from "./pages/Particoes";
import Agendamento from "./pages/Agendamento";
import Categorias from "./pages/Categorias";
import Configuracoes from "./pages/Configuracoes";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import { AcessoNegado } from "./pages/AcessoNegado";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Configurações para mutations
    },
  },
});

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("authToken") // Agora verifica se há um token salvo
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = (token: string) => {
    const tokenString =
      typeof token === "string" ? token : JSON.stringify(token); // Converte para string se necessário
    localStorage.setItem("authToken", tokenString);
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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

const ProtectedRoute = ({
  children,
  requiredPermissions,
}: {
  children: React.ReactNode;
  requiredPermissions?: string[];
}) => {
  const { isAuthenticated } = useAuth();
  const { usuario, isLoading } = useUsuarioLogado(); // Agora também recebe o estado de carregamento

  // Se estiver carregando, exibe um loading ou nada
  if (isLoading) {
    return <div>Carregando...</div>; // Ou um spinner de carregamento
  }

  // Se o usuário não estiver autenticado, redirecione para o login
  if (!isAuthenticated) {
    return <Navigate to="/app/login" />;
  }

  // Se houver permissões necessárias e o usuário não tiver nenhuma delas, redirecione para a página de acesso negado
  if (
    requiredPermissions &&
    !requiredPermissions.includes(usuario?.permissao.descricao)
  ) {
    return <Navigate to="/app/acesso-negado" />;
  }

  // Se o usuário estiver autenticado e tiver a permissão necessária, renderize o conteúdo
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />

                <Route path="/app">
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="acesso-negado" element={<AcessoNegado />} />
                  {/* Rota para Acesso Negado */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador", "Empresa"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Index />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador", "Empresa"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Users />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresas"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Empresas />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="particoes"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador", "Empresa"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Particoes />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="agendamento"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador", "Empresa", "Funcionario"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Agendamento />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="categorias"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Categorias />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="configuracoes"
                    element={
                      <ProtectedRoute
                        requiredPermissions={["Administrador", "Empresa", "Funcionario"]}
                      >
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Configuracoes />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
