import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login"; 
import AppointmentsPage from "./pages/AppointmentsPage";
import SecretaryDashboard from "./pages/DashboardSec";
import CreateAccountFromToken from "./pages/CreateAccountFormValues";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundPage from "./pages/Notfound";
import { AuthProvider } from '@/hooks/Authcontext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
<AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
             <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/create-account/:token" element={<CreateAccountFromToken />} />
             
           <Route path="/secretary/dashboard"
          element={
            <ProtectedRoute requiredRole="secretary">
              <SecretaryDashboard />
            </ProtectedRoute>
          }
        />

        {/* Page d’accès refusé */}
        <Route path="/unauthorized" element={<NotFoundPage />} />

     
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </AuthProvider>
   </TooltipProvider>
  </QueryClientProvider>
);

export default App;
