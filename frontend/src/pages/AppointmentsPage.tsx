import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppointmentRequest from "./AppointmentRequest";
import { Calendar, Clock, ArrowLeft, Check, Shield, Info } from "lucide-react";

type AppointmentSlot = {
  date: string;
  available: boolean;
};

export default function AppointmentsPage() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Génération des créneaux fixes pour la semaine
  const generateAllSlotsForWeek = (weekOffset: number): AppointmentSlot[] => {
    const slots: AppointmentSlot[] = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + weekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      
      // Ignorer les weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Matin 9h-12h
      for (let hour = 9; hour < 12; hour++) {
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0);
        slots.push({ date: slotDate.toISOString(), available: true });
      }

      // Après-midi 14h-17h
      for (let hour = 14; hour < 17; hour++) {
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0);
        slots.push({ date: slotDate.toISOString(), available: true });
      }
    }

    return slots;
  };

  // Récupération des rendez-vous déjà pris depuis la base
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InNlY3JldGFyeSIsImlhdCI6MTc2MTQ4NzI0MSwiZXhwIjoxNzYxNTczNjQxfQ.bh3gwwf5QqLji_5nrPEs-c0k3b_-WFlHe02tdyF_IGQ";
        const res = await fetch("http://localhost:5000/api/appointments/pending", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // Générer tous les créneaux pour la semaine
        const allSlots: AppointmentSlot[] = generateAllSlotsForWeek(currentWeek);

        // Marquer indisponibles les slots déjà pris
        const updatedSlots = allSlots.map(slot => ({
          ...slot,
          available: !data.some((appt: any) => {
            const appointmentDate = new Date(appt.requested_date);
            const slotDate = new Date(slot.date);
            return appointmentDate.getTime() === slotDate.getTime();
          }),
        }));

        setSlots(updatedSlots);
      } catch (err) {
        console.error("Erreur lors de la récupération des rendez-vous :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [currentWeek]);

  const formatSlotDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      fullDate: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getWeekRange = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + currentWeek * 7);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 4); // 5 jours ouvrables
    
    return {
      start: startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  const weekRange = getWeekRange();

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header épuré */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Prendre Rendez-vous</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {!selectedSlot ? (
            <div className="space-y-8">
              {/* Navigation de la semaine */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Semaine du {weekRange.start} au {weekRange.end}</h3>
                        <p className="text-sm text-muted-foreground">
                          {slots.filter(s => s.available).length} créneaux disponibles
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentWeek(prev => Math.max(prev - 1, 0))}
                        disabled={currentWeek === 0}
                      >
                        Semaine précédente
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentWeek(prev => prev + 1)}>
                        Semaine suivante
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grille des créneaux */}
              <div className="grid gap-6">
                {isLoading ? (
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Chargement des créneaux disponibles...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid lg:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, dayIndex) => {
                      const date = new Date();
                      date.setDate(date.getDate() + currentWeek * 7 + dayIndex);
                      
                      if (date.getDay() === 0 || date.getDay() === 6) return null;

                      const daySlots = slots.filter(slot => {
                        const slotDate = new Date(slot.date);
                        return slotDate.toDateString() === date.toDateString();
                      });

                      return (
                        <Card key={dayIndex} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span className="capitalize">
                                {date.toLocaleDateString('fr-FR', { weekday: 'long' })}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="space-y-2">
                              {daySlots.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  Aucun créneau ce jour
                                </p>
                              ) : (
                                daySlots.map((slot) => {
                                  const formatted = formatSlotDate(slot.date);
                                  return (
                                    <Button
                                      key={slot.date}
                                      variant={slot.available ? "default" : "outline"}
                                      disabled={!slot.available}
                                      onClick={() => setSelectedSlot(slot.date)}
                                      className={`w-full justify-center py-3 transition-all ${
                                        slot.available 
                                          ? "hover:scale-105 hover:shadow-md" 
                                          : "opacity-50 cursor-not-allowed"
                                      }`}
                                    >
                                      <div className="flex flex-col items-center">
                                        <span className="font-semibold">{formatted.time}</span>
                                        {!slot.available && (
                                          <span className="text-xs opacity-75">Complet</span>
                                        )}
                                      </div>
                                    </Button>
                                  );
                                })
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Informations importantes */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5 text-primary" />
                      Comment ça marche ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs font-bold">1</span>
                        </div>
                        <span>Sélectionnez un créneau disponible</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs font-bold">2</span>
                        </div>
                        <span>Remplissez vos informations personnelles</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs font-bold">3</span>
                        </div>
                        <span>Notre secrétaire vous confirme sous 24h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Informations pratiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durée :</span>
                        <span className="font-medium">30-45 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Première visite :</span>
                        <span className="font-medium">Carte vitale requise</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annulation :</span>
                        <span className="font-medium">48h à l'avance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* En-tête du créneau sélectionné */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-lg">Créneau sélectionné</h3>
                        <p className="text-xl font-bold">{formatSlotDate(selectedSlot).fullDate}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedSlot(null)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Formulaire */}
              <AppointmentRequest 
                requestedDate={selectedSlot} 
                onBack={() => setSelectedSlot(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}