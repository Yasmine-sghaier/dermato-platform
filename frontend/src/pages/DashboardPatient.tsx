import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, Camera, History, Bell, ArrowRight, Plus } from "lucide-react";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Données simulées
  const patientData = {
    name: "Marie Dubois",
    nextAppointment: {
      date: "2024-12-20T10:00:00Z",
      status: "confirmed",
      dermatologist: "Dr. Sophie Martin"
    },
    recentAnalyses: [
      {
        id: 1,
        date: "2024-12-15T14:30:00Z",
        diagnosis: "Dermatite atopique",
        confidence: 87,
        severity: "medium"
      },
      {
        id: 2,
        date: "2024-11-20T09:15:00Z",
        diagnosis: "Acné modérée",
        confidence: 92,
        severity: "low"
      }
    ],
    medicalHistory: [
      {
        id: 1,
        date: "2024-12-10T11:00:00Z",
        type: "consultation",
        title: "Consultation de suivi",
        dermatologist: "Dr. Sophie Martin"
      },
      {
        id: 2,
        date: "2024-11-15T10:30:00Z",
        type: "prescription",
        title: "Ordonnance - Crème hydratante",
        dermatologist: "Dr. Sophie Martin"
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "bg-green-500/10 text-green-600 border-green-200",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      high: "bg-red-500/10 text-red-600 border-red-200"
    };
    
    const labels = {
      low: "Faible urgence",
      medium: "Consultation recommandée",
      high: "Urgence médicale"
    };

    return (
      <Badge variant="outline" className={variants[severity as keyof typeof variants]}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, <span className="text-primary">{patientData.name}</span>
            </h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre espace patient DermaCare
            </p>
          </div>
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Link to="/ai-analysis">
              <Button className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Nouvelle analyse IA
              </Button>
            </Link>
            <Link to="/appointment">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prendre RDV
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Cartes de stats rapides */}
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prochain RDV</p>
                  <p className="text-2xl font-bold">
                    {patientData.nextAppointment ? 
                      new Date(patientData.nextAppointment.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) 
                      : "Aucun"
                    }
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Analyses récentes</p>
                  <p className="text-2xl font-bold">{patientData.recentAnalyses.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dossier médical</p>
                  <p className="text-2xl font-bold">{patientData.medicalHistory.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Prochain rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Prochain rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientData.nextAppointment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {formatDate(patientData.nextAppointment.date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          avec {patientData.nextAppointment.dermatologist}
                        </p>
                      </div>
                      <Badge variant="secondary">Confirmé</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Rappel
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">Aucun rendez-vous programmé</p>
                    <Link to="/appointment">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Prendre un rendez-vous
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analyses récentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Analyses récentes
                </CardTitle>
                <Link to="/ai-analysis">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientData.recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{analysis.diagnosis}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(analysis.date)}
                          <span className="font-medium text-primary">{analysis.confidence}%</span>
                        </div>
                      </div>
                      {getSeverityBadge(analysis.severity)}
                    </div>
                  ))}
                  {patientData.recentAnalyses.length === 0 && (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">Aucune analyse effectuée</p>
                      <Link to="/ai-analysis">
                        <Button size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Première analyse
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Accès rapide */}
            <Card>
              <CardHeader>
                <CardTitle>Accès rapide</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/analyse">
                    <Card className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 mx-auto mb-2 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Camera className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="font-medium text-sm">Analyse IA</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/appointment">
                    <Card className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 mx-auto mb-2 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="font-medium text-sm">Prendre RDV</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/medical-records">
                    <Card className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 mx-auto mb-2 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-500" />
                        </div>
                        <p className="font-medium text-sm">Dossier médical</p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/appointment-history">
                    <Card className="cursor-pointer transition-all hover:shadow-md border-2 hover:border-primary/50">
                      <CardContent className="p-4 text-center">
                        <div className="h-10 w-10 mx-auto mb-2 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <History className="h-5 w-5 text-orange-500" />
                        </div>
                        <p className="font-medium text-sm">Historique RDV</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Historique médical récent */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Dossier médical
                </CardTitle>
                <Link to="/medical-records">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    Voir tout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientData.medicalHistory.map((record) => (
                    <div key={record.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.type === 'consultation' ? 'bg-blue-500/10' : 'bg-green-500/10'
                      }`}>
                        {record.type === 'consultation' ? (
                          <User className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{record.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.date)} • {record.dermatologist}
                        </p>
                      </div>
                    </div>
                  ))}
                  {patientData.medicalHistory.length === 0 && (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">Aucun document médical</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Rappel de rendez-vous</p>
                      <p className="text-xs text-muted-foreground">
                        Votre consultation avec le Dr. Martin est dans 3 jours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                    <FileText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Nouvelle ordonnance</p>
                      <p className="text-xs text-muted-foreground">
                        Votre dermatologue a ajouté une nouvelle prescription
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}