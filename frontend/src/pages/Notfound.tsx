import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Home, ArrowLeft, Lock, AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft text-center">
          <CardContent className="p-8">
            {/* Icône d'erreur */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl" />
              <div className="relative h-24 w-24 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-destructive rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
              </div>
            </div>

            {/* Message d'erreur */}
            <div className="space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full">
                <Shield className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Accès Restreint</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold">
                Oops !
                <span className="bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent block">
                  Accès Refusé
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
                Cette ressource est réservée aux utilisateurs connectés.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link to="/" className="block">
                <Button className="w-full group shadow-soft hover:shadow-hover transition-all" size="lg">
                  <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Retour à l'accueil
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full group"
                size="lg"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Page précédente
              </Button>
            </div>

            {/* Informations supplémentaires */}
            
          </CardContent>
        </Card>

        {/* Code d'erreur décoratif */}
        <div className="text-center mt-6">
          <span className="text-xs text-muted-foreground font-mono">
            Erreur 403 • Accès non autorisé
          </span>
        </div>
      </div>
    </div>
  );
}