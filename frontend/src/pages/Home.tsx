import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Calendar, FileText, Shield, ArrowRight, Check } from "lucide-react";
import heroImage from "@/assets/hero-dermatology.jpg";
import aiIcon from "@/assets/ai-analysis-icon.jpg";
import appointmentIcon from "@/assets/appointment-icon.jpg";
import medicalRecordIcon from "@/assets/medical-record-icon.jpg";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "Analyse IA Intelligente",
      description: "Pré-diagnostic automatique des affections cutanées grâce à notre IA avancée",
      image: aiIcon,
    },
    {
      icon: Calendar,
      title: "Prise de Rendez-vous",
      description: "Réservez facilement vos consultations en ligne selon les disponibilités",
      image: appointmentIcon,
    },
    {
      icon: FileText,
      title: "Dossier Médical Centralisé",
      description: "Accédez à votre historique médical complet et sécurisé à tout moment",
      image: medicalRecordIcon,
    },
    {
      icon: Shield,
      title: "Données Sécurisées",
      description: "Vos informations médicales sont protégées selon les normes les plus strictes",
      image: null,
    },
  ];

  const benefits = [
    "Accès rapide aux soins dermatologiques",
    "Suivi médical personnalisé",
    "Analyse préliminaire par IA",
    "Communication facilitée avec votre dermatologue",
  ];

  return (
    <div className="min-h-screen">
      <section className="relative pt-24 pb-20 bg-gradient-hero overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Plateforme Médicale Sécurisée</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Soins Dermatologiques
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
                  Intelligents & Accessibles
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Bénéficiez d'une analyse IA préliminaire, prenez rendez-vous facilement et 
                consultez votre dossier médical en toute sécurité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/appointment">
                  <Button size="lg" className="group shadow-soft hover:shadow-hover transition-all">
                    Prendre Rendez-vous
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline">
                    Découvrir nos Services
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-secondary" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Plateforme DermaCare"
                className="relative rounded-2xl shadow-hover w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Une plateforme complète pour vos soins
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvrez tous les services qui vous facilitent l'accès aux soins dermatologiques
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-hover transition-all duration-300 bg-gradient-card border-border/50 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  {feature.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Un processus simple en quelques étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Demandez un Rendez-vous",
                description: "Remplissez le formulaire en ligne avec vos informations de contact",
              },
              {
                step: "02",
                title: "Validation & Création de Compte",
                description: "La secrétaire valide votre demande et vous recevez un lien pour créer votre compte",
              },
              {
                step: "03",
                title: "Accédez aux Services",
                description: "Utilisez l'analyse IA, consultez votre historique et gérez vos rendez-vous",
              },
            ].map((item, index) => (
              <div key={index} className="relative animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold shadow-soft">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
