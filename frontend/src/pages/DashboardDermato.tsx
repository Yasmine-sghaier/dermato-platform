import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, FileText, Stethoscope, AlertTriangle, Eye, Plus, ArrowRight, Search } from "lucide-react";

export default function DermatologistDashboard() {
  const [activeTab, setActiveTab] = useState("today");

  // Données simulées
  const dashboardData = {
    stats: {
      totalPatients: 1247,
      todayAppointments: 8,
      pendingAnalyses: 12,
      monthlyGrowth: 15
    },
    todayAppointments: [
      {
        id: 1,
        patientName: "Marie Dubois",
        time: "09:00",
        duration: "30min",
        type: "Consultation",
        status: "confirmed",
        priority: "medium",
        previousAnalysis: true
      },
      {
        id: 2,
        patientName: "Jean Martin",
        time: "09:30",
        duration: "45min",
        type: "Première visite",
        status: "confirmed",
        priority: "high",
        previousAnalysis: false
      },
      {
        id: 3,
        patientName: "Sophie Lambert",
        time: "10:15",
        duration: "30min",
        type: "Suivi traitement",
        status: "confirmed",
        priority: "low",
        previousAnalysis: true
      },
      {
        id: 4,
        patientName: "Pierre Moreau",
        time: "11:00",
        duration: "30min",
        type: "Consultation",
        status: "waiting",
        priority: "medium",
        previousAnalysis: true
      }
    ],
    pendingAnalyses: [
      {
        id: 1,
        patientName: "Alice Bernard",
        submitted: "2024-12-19T08:30:00Z",
        diagnosis: "Dermatite atopique",
        confidence: 87,
        severity: "medium",
        symptoms: ["Rougeur", "Démangeaisons"]
      },
      {
        id: 2,
        patientName: "Thomas Petit",
        submitted: "2024-12-19T07:15:00Z",
        diagnosis: "Acné sévère",
        confidence: 92,
        severity: "high",
        symptoms: ["Plaies", "Gonflement"]
      },
      {
        id: 3,
        patientName: "Emma Laurent",
        submitted: "2024-12-18T16:45:00Z",
        diagnosis: "Psoriasis",
        confidence: 78,
        severity: "medium",
        symptoms: ["Desquamation", "Rougeur"]
      }
    ],
    recentPatients: [
      {
        id: 1,
        name: "Marie Dubois",
        lastVisit: "2024-12-10",
        nextAppointment: "2024-12-20",
        condition: "Dermatite atopique",
        status: "active"
      },
      {
        id: 2,
        name: "Jean Martin",
        lastVisit: "2024-12-15",
        nextAppointment: "Aucun",
        condition: "Acné sévère",
        status: "new"
      },
      {
        id: 3,
        name: "Sophie Lambert",
        lastVisit: "2024-12-12",
        nextAppointment: "2024-12-27",
        condition: "Psoriasis",
        status: "active"
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-green-500/10 text-green-600 border-green-200",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      high: "bg-red-500/10 text-red-600 border-red-200"
    };

    const labels = {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée"
    };

    return (
      <Badge variant="outline" className={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
      waiting: "bg-orange-500/10 text-orange-600 border-orange-200",
      completed: "bg-green-500/10 text-green-600 border-green-200"
    };

    const labels = {
      confirmed: "Confirmé",
      waiting: "En attente",
      completed: "Terminé"
    };

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
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
              Tableau de bord <span className="text-primary">Dermatologue</span>
            </h1>
            <p className="text-muted-foreground">
              Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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

        {/* Cartes de statistiques */}
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Agenda du jour */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Agenda du jour
                  </CardTitle>
                  <CardDescription>
                    {dashboardData.todayAppointments.length} rendez-vous programmés
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Aujourd'hui</Button>
                  <Button variant="ghost" size="sm">Demain</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <p className="font-bold text-lg">{appointment.time}</p>
                          <p className="text-xs text-muted-foreground">{appointment.duration}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{appointment.patientName}</p>
                            {appointment.previousAnalysis && (
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs">
                                Analyse IA
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(appointment.priority)}
                        {getStatusBadge(appointment.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patients récents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Patients récents
                </CardTitle>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  Voir tout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{patient.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Dernière visite</p>
                        <p className="font-medium">{formatDate(patient.lastVisit)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Analyses IA en attente */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Analyses IA en attente
                  </CardTitle>
                  <CardDescription>
                    {dashboardData.pendingAnalyses.length} analyses nécessitent votre validation
                  </CardDescription>
                </div>
                <Badge variant="secondary">{dashboardData.pendingAnalyses.length} en attente</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.pendingAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{analysis.patientName}</p>
                          <p className="text-sm text-muted-foreground">
                            Soumis le {formatDate(analysis.submitted)}
                          </p>
                        </div>
                        {getPriorityBadge(analysis.severity)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Diagnostic IA:</span>
                          <span className="font-semibold">{analysis.diagnosis}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Confiance IA</span>
                            <span className="font-medium">{analysis.confidence}%</span>
                          </div>
                          <Progress value={analysis.confidence} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {analysis.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le dossier
                          </Button>
                          <Button variant="outline" size="sm">
                            Valider
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Dossiers patients</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Stethoscope className="h-6 w-6" />
                    <span className="text-sm">Prescriptions</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm">Cas urgents</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Nouveaux patients</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques diagnostics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Diagnostics du mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { condition: "Dermatite atopique", count: 24, percentage: 32 },
                    { condition: "Acné", count: 18, percentage: 24 },
                    { condition: "Psoriasis", count: 12, percentage: 16 },
                    { condition: "Eczéma", count: 8, percentage: 11 },
                    { condition: "Autres", count: 13, percentage: 17 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.condition}</span>
                        <span className="text-muted-foreground">{item.count} cas ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}