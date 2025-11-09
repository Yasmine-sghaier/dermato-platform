// components/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/Authcontext";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Déterminer si le bouton "Prendre RDV" doit être affiché
  const shouldShowAppointmentButton = !isLoggedIn || role === "patient";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DermaCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/services" className="text-sm font-medium hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/appointments" className="text-sm font-medium hover:text-primary transition-colors">
              Rendez-vous
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              À propos
            </Link>

            {/* Accès spécifique selon le rôle */}
            {role === "secretary" && (
              <Link to="/secretary/dashboard" className="text-sm font-medium text-primary">
                Espace secrétaire
              </Link>
            )}
            {role === "dermatologist" && (
              <Link to="/dermatologist/dashboard" className="text-sm font-medium text-primary">
                Espace dermatologue
              </Link>
            )}
            {role === "patient" && (
              <Link to="/patient/dashboard" className="text-sm font-medium text-primary">
                Mon espace
              </Link>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Informations utilisateur */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user?.name || "Utilisateur"}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                    {role}
                  </span>
                </div>
                
                {/* Bouton Déconnexion */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            )}

            {/* Bouton Prendre RDV - Conditionnel */}
            {shouldShowAppointmentButton && (
              <Link to="/appointment">
                <Button size="sm" className="shadow-soft hover:shadow-hover transition-all">
                  Prendre RDV
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              {/* ... (même contenu mobile que précédemment) ... */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};