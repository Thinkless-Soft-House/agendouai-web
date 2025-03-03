
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

// Configuração do React Query com opções de erro
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      useErrorBoundary: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      useErrorBoundary: true,
    }
  },
});

// Contexto de autenticação
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return { isAuthenticated, login, logout };
};

// Componente de rota protegida
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rotas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Index />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Users />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/empresas" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Empresas />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/particoes" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Particoes />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agendamento" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Agendamento />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/categorias" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Categorias />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Configuracoes />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              
              {/* Página 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
