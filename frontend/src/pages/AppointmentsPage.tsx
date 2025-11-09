import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, MapPin, Cake, ArrowLeft, ArrowRight } from "lucide-react";

const appointmentSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string(),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

type Step = "date" | "time" | "form";

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Simuler des créneaux disponibles (à remplacer par un appel API)
  const generateTimeSlots = (date: string) => {
    const slots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    ];
    setAvailableSlots(slots);
  };

  const appointmentForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: "",
      time: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      birthDate: "",
    },
  });

  const onAppointmentSubmit = async (data: AppointmentFormValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Préparer les données pour l'API
      const appointmentData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email:data.email,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate,
        date: data.date,
        time: data.time
      };

      // Headers avec authentification
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      // Appel à l'API
      const response = await axios.post(
        "http://localhost:5000/api/appointments/request", 
        appointmentData,
        config
      );

      toast.success(response.data.message || "Rendez-vous créé avec succès !");
      
      // Redirection après succès
      const role = localStorage.getItem("role");
      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "secretary") navigate("/secretary/dashboard");
      else if (role === "dermatologist") navigate("/dermatologist/dashboard");
      else navigate("/");
      
    } catch (err: any) {
      console.error("Erreur création RDV:", err);
      
      // Gestion des erreurs détaillée
      if (err.response) {
        // Erreur du serveur avec réponse
        const errorMessage = err.response.data.message || "Erreur lors de la création du rendez-vous";
        
        // Gestion des erreurs de validation spécifiques
        if (err.response.data.errors) {
          // Afficher les erreurs de validation individuelles
          err.response.data.errors.forEach((error: any) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        } else if (err.response.data.required) {
          // Afficher les champs manquants
          toast.error(`Champs manquants: ${err.response.data.required.join(', ')}`);
        } else {
          toast.error(errorMessage);
        }
      } else if (err.request) {
        // Erreur de réseau
        toast.error("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      } else {
        // Autres erreurs
        toast.error("Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    generateTimeSlots(date);
    appointmentForm.setValue("date", date);
    setCurrentStep("time");
  };

  const handleTimeSelect = (time: string) => {
    appointmentForm.setValue("time", time);
    setCurrentStep("form");
  };

  const goToPreviousStep = () => {
    if (currentStep === "form") {
      setCurrentStep("time");
    } else if (currentStep === "time") {
      setCurrentStep("date");
    } else {
      navigate(-1);
    }
  };

  const goToNextStep = () => {
    if (currentStep === "date" && selectedDate) {
      setCurrentStep("time");
    } else if (currentStep === "time" && appointmentForm.watch("time")) {
      setCurrentStep("form");
    }
  };

  // Date minimale pour le calendrier (aujourd'hui)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Date maximale pour le calendrier (3 mois à partir d'aujourd'hui)
  const getMaxDate = () => {
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    return threeMonthsLater.toISOString().split('T')[0];
  };

  // Indicateur de progression
  const getStepProgress = () => {
    const steps = { date: 1, time: 2, form: 3 };
    return (steps[currentStep] / 3) * 100;
  };

  // Vérifier si on peut passer à l'étape suivante
  const canProceed = () => {
    if (currentStep === "date") return !!selectedDate;
    if (currentStep === "time") return !!appointmentForm.watch("time");
    return true;
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-muted/30">
      <div className="max-w-2xl mx-auto w-full px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-3 bg-primary rounded-xl">
            <Calendar className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nouveau Rendez-vous
          </span>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${currentStep === "date" ? "text-primary" : "text-muted-foreground"}`}>
              Date
            </span>
            <span className={`text-sm font-medium ${currentStep === "time" ? "text-primary" : "text-muted-foreground"}`}>
              Heure
            </span>
            <span className={`text-sm font-medium ${currentStep === "form" ? "text-primary" : "text-muted-foreground"}`}>
              Informations
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        <Card className="shadow-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === "date" && "Choisir une date"}
              {currentStep === "time" && "Choisir une heure"}
              {currentStep === "form" && "Informations personnelles"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...appointmentForm}>
              <form onSubmit={appointmentForm.handleSubmit(onAppointmentSubmit)} className="space-y-6">
                
                {/* Étape 1: Sélection de la date */}
                {currentStep === "date" && (
                  <div className="space-y-4">
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Sélectionnez une date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              <Input 
                                type="date" 
                                className="pl-12 text-lg py-6"
                                min={getMinDate()}
                                max={getMaxDate()}
                                onChange={(e) => handleDateSelect(e.target.value)}
                                value={selectedDate}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      Choisissez une date entre aujourd'hui et {new Date(getMaxDate()).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                )}

                {/* Étape 2: Sélection de l'heure */}
                {currentStep === "time" && (
                  <div className="space-y-4">
                    <FormLabel className="text-lg">Sélectionnez une heure pour le {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR')}</FormLabel>
                    <FormField
                      control={appointmentForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {availableSlots.map((slot) => (
                                <Button
                                  key={slot}
                                  type="button"
                                  variant={field.value === slot ? "default" : "outline"}
                                  className="h-14 text-lg font-medium"
                                  onClick={() => handleTimeSelect(slot)}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Étape 3: Formulaire des informations personnelles */}
                {currentStep === "form" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">
                        Rendez-vous le {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR')} à {appointmentForm.watch("time")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={appointmentForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Votre prénom" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={appointmentForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Votre nom" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                          <FormField
                      control={appointmentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse Email </FormLabel>
                          <FormControl>
                            <div className="relative">
                             
                              <Input 
                                type="email" 
                                placeholder="nom@gmail.com" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="tel" 
                                placeholder="0123456789" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Votre adresse complète" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Cake className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="date" 
                                className="pl-10" 
                                max={getMinDate()} // Ne pas permettre les dates futures
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Boutons de navigation */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={goToPreviousStep}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                  </Button>
                  
                  {currentStep === "form" ? (
                    <Button 
                      type="submit" 
                      className="flex-1 flex items-center gap-2" 
                      size="lg" 
                      disabled={loading}
                    >
                      {loading ? "Création..." : (
                        <>
                          Confirmer le rendez-vous
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      className="flex-1 flex items-center gap-2" 
                      size="lg"
                      onClick={goToNextStep}
                      disabled={!canProceed() || loading}
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}