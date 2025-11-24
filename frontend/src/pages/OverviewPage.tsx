import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, FileText, Stethoscope, AlertTriangle, Eye, ArrowRight } from "lucide-react";

export default function OverviewPage() {
  // Données simulées pour l'overview
  const overviewData = {
    todayAppointments: [
      {
        id: 1,
        patientName: "Marie Dubois",
        time: "09:00",
        type: "Consultation",
        status: "confirmed"
      }
    ],
    pendingAnalyses: [
      {
        id: 1,
        patientName: "Alice Bernard",
        diagnosis: "Dermatite atopique",
        confidence: 87
      }
    ]
  };

  return (
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
                8 rendez-vous programmés
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Contenu de l'agenda */}
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Contenu de l'agenda à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Patients récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Liste des patients récents à venir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite */}
      <div className="space-y-6">
        {/* Analyses en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Analyses en attente
            </CardTitle>
            <CardDescription>
              12 analyses nécessitent votre validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Analyses IA en attente de validation</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
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
      </div>
    </div>
  );
}