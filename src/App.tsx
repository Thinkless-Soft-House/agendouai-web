
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

const queryClient = new QueryClient();

// Simulated auth context
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return { isAuthenticated, login, logout };
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/empresas" 
              element={
                <ProtectedRoute>
                  <Empresas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/particoes" 
              element={
                <ProtectedRoute>
                  <Particoes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agendamento" 
              element={
                <ProtectedRoute>
                  <Agendamento />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categorias" 
              element={
                <ProtectedRoute>
                  <Categorias />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } 
            />

            {/* Redirect from root to landing if not authenticated */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Index /> : <Navigate to="/landing" />
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
