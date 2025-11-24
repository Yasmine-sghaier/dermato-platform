import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, FileText, Stethoscope, AlertTriangle, Eye, Plus, ArrowRight } from "lucide-react";

// Import des pages
import PatientsPage from "./PatientsPage";
import OverviewPage from "./OverviewPage";
//import AppointmentsPage from "./pages/AppointmentsPage";
//import AnalysesPage from "./pages/AnalysesPage";
//import ReportsPage from "./pages/ReportsPage";

export default function DermatologistDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Données simulées pour le header
  const dashboardData = {
    stats: {
      totalPatients: 1247,
      todayAppointments: 8,
      pendingAnalyses: 12,
      monthlyGrowth: 15
    }
  };

  // Composants des pages
  const pages = {
    overview: <OverviewPage />,
    //appointments: <AppointmentsPage />,
    //analyses: <AnalysesPage />,
    patients: <PatientsPage />,
    //reports: <ReportsPage />
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Tableau de bord <span className="text-primary">Dermatologue</span>
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "overview" && "Aujourd'hui, " + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {activeTab === "patients" && "Gestion des patients"}
              {activeTab === "appointments" && "Gestion des rendez-vous"}
              {activeTab === "analyses" && "Analyses IA et diagnostics"}
              {activeTab === "reports" && "Rapports et statistiques"}
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle consultation
            </Button>
            <Button className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Voir l'agenda
            </Button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-1 mb-8 bg-muted/50 p-1 rounded-lg w-fit">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: Eye },
            { id: "appointments", label: "Rendez-vous", icon: Calendar },
            { id: "analyses", label: "Analyses IA", icon: Stethoscope },
            { id: "patients", label: "Patients", icon: Users },
            { id: "reports", label: "Rapports", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Cartes de statistiques (seulement pour l'overview) */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patients totaux</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.totalPatients}</p>
                    <p className="text-xs text-green-600 font-medium">+{dashboardData.stats.monthlyGrowth}% ce mois</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">RDV aujourd'hui</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.todayAppointments}</p>
                    <p className="text-xs text-muted-foreground">Prochain: 09:00</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Analyses en attente</p>
                    <p className="text-2xl font-bold">{dashboardData.stats.pendingAnalyses}</p>
                    <p className="text-xs text-orange-600 font-medium">À traiter</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taux d'occupation</p>
                    <p className="text-2xl font-bold">78%</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenu de la page active */}
        {pages[activeTab as keyof typeof pages]}
      </div>
    </div>
  );
}