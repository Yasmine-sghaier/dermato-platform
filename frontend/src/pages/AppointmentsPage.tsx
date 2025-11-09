import { useState, useEffect } from "react";
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
import { Calendar, Clock, User, Phone, MapPin, Cake, ArrowLeft, ArrowRight, Loader2, Ban, Check } from "lucide-react";

const appointmentSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

type Step = "date" | "time" | "form";

// Configuration des créneaux horaires possibles
const ALL_TIME_SLOTS = [
   "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

type TimeSlot = {
  time: string;
  available: boolean;
};

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  // Charger les dates disponibles au montage du composant
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setLoadingDates(true);
      try {
        const response = await axios.get("http://localhost:5000/api/availability/dates");
        if (response.data.success) {
          setAvailableDates(response.data.availableDates);
          setMinDate(response.data.minDate);
          setMaxDate(response.data.maxDate);
        }
      } catch (error) {
        console.error("Erreur chargement dates:", error);
        toast.error("Erreur lors du chargement des dates disponibles");
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, []);

  // Charger la disponibilité des créneaux quand une date est sélectionnée
  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setLoadingSlots(true);
    
    try {
      // Récupérer les créneaux disponibles pour cette date
      const response = await axios.get(`http://localhost:5000/api/availability/slots/${date}`);
      
      if (response.data.success) {
        const availableSlots = response.data.availableSlots;
        
        // Créer la liste complète des créneaux avec leur disponibilité
        const allSlotsWithAvailability: TimeSlot[] = ALL_TIME_SLOTS.map(slot => ({
          time: slot,
          available: availableSlots.includes(slot)
        }));
        
        setTimeSlots(allSlotsWithAvailability);
        appointmentForm.setValue("date", date);
        setCurrentStep("time");
      }
    } catch (error) {
      console.error("Erreur chargement créneaux:", error);
      toast.error("Erreur lors du chargement des créneaux disponibles");
      
      // En cas d'erreur, afficher tous les créneaux comme indisponibles
      const fallbackSlots: TimeSlot[] = ALL_TIME_SLOTS.map(slot => ({
        time: slot,
        available: false
      }));
      setTimeSlots(fallbackSlots);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) {
      toast.error("Ce créneau n'est pas disponible");
      return;
    }
    appointmentForm.setValue("time", time);
    setCurrentStep("form");
  };

  const appointmentForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: "",
      time: "",
      firstName: "",
      lastName: "",
      email: "",
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
        email: data.email,
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

      // Vérifier la disponibilité du créneau avant de créer le RDV
      const availabilityCheck = await axios.get(
        `http://localhost:5000/api/availability/check/${data.date}/${data.time}`
      );

      if (!availabilityCheck.data.available) {
        toast.error("Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.");
        setCurrentStep("time");
        return;
      }

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
      
      if (err.response) {
        const errorMessage = err.response.data.message || "Erreur lors de la création du rendez-vous";
        
        if (err.response.data.errors) {
          err.response.data.errors.forEach((error: any) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        } else if (err.response.data.required) {
          toast.error(`Champs manquants: ${err.response.data.required.join(', ')}`);
        } else {
          toast.error(errorMessage);
        }
      } else if (err.request) {
        toast.error("Erreur de connexion au serveur. Vérifiez votre connexion internet.");
      } else {
        toast.error("Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === "form") {
      setCurrentStep("time");
    } else if (currentStep === "time") {
      setCurrentStep("date");
      setTimeSlots([]);
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

  // Fonction pour vérifier si une date est disponible
  const isDateAvailable = (date: string) => {
    return availableDates.includes(date);
  };

  // Fonction pour obtenir les classes CSS selon la disponibilité
  const getDateInputClass = (date: string) => {
    const baseClass = "pl-12 text-lg py-6";
    if (!isDateAvailable(date)) {
      return `${baseClass} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    return baseClass;
  };

  // Fonction pour obtenir les classes CSS des boutons de créneaux
  const getTimeSlotClass = (slot: TimeSlot, selectedTime: string) => {
    const baseClass = "h-14 text-lg font-medium transition-all duration-200";
    
    if (!slot.available) {
      return `${baseClass} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-100`;
    }
    
    if (selectedTime === slot.time) {
      return `${baseClass} bg-blue-600 text-white border-blue-600 hover:bg-blue-700`;
    }
    
    // BLEU CLAIR pour les créneaux disponibles
    return `${baseClass} bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900 hover:border-blue-300`;
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
      <div className="max-w-4xl mx-auto w-full px-4">
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
                
                {/* ÉTAPE 1 : Sélection de la date */}
                {currentStep === "date" && (
                  <div className="space-y-4">
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Sélectionnez une date disponible</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                              {loadingDates ? (
                                <div className="flex items-center justify-center pl-12 text-lg py-6 border rounded-md bg-muted">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  Chargement des dates disponibles...
                                </div>
                              ) : (
                                <Input 
                                  type="date" 
                                  className={getDateInputClass(selectedDate)}
                                  min={minDate}
                                  max={maxDate}
                                  onChange={(e) => {
                                    const date = e.target.value;
                                    if (isDateAvailable(date)) {
                                      handleDateSelect(date);
                                    } else {
                                      setSelectedDate(date);
                                    }
                                  }}
                                  value={selectedDate}
                                  disabled={loadingDates}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {selectedDate && !isDateAvailable(selectedDate) && (
                            <p className="text-sm text-destructive mt-2">
                              Cette date n'est pas disponible. Veuillez choisir une autre date.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {loadingDates 
                        ? "Chargement des dates disponibles..." 
                        : `Dates disponibles du ${new Date(minDate).toLocaleDateString('fr-FR')} au ${new Date(maxDate).toLocaleDateString('fr-FR')}`
                      }
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 : Sélection de l'heure */}
                {currentStep === "time" && (
                  <div className="space-y-4">
                    <FormLabel className="text-lg">
                      Sélectionnez une heure pour le {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR')}
                    </FormLabel>
                    
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Chargement des créneaux disponibles...</span>
                      </div>
                    ) : (
                      <FormField
                        control={appointmentForm.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {timeSlots.map((slot) => (
                                  <Button
                                    key={slot.time}
                                    type="button"
                                    className={getTimeSlotClass(slot, field.value)}
                                    onClick={() => handleTimeSelect(slot.time, slot.available)}
                                    disabled={!slot.available}
                                  >
                                    <div className="flex items-center justify-center w-full">
                                      {!slot.available ? (
                                        <>
                                          <Ban className="w-4 h-4 mr-2 text-gray-400" />
                                          <span className="text-gray-400">{slot.time}</span>
                                        </>
                                      ) : field.value === slot.time ? (
                                        <>
                                          <Check className="w-4 h-4 mr-2 text-white" />
                                          <span className="text-white font-semibold">{slot.time}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                          <span className="text-blue-800 font-medium">{slot.time}</span>
                                        </>
                                      )}
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center">
                                  <Clock className="w-2 h-2 text-blue-600" />
                                </div>
                                <span>Disponible</span>
                              </div>
                        
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                                  <Ban className="w-2 h-2 text-gray-400" />
                                </div>
                                <span>Indisponible</span>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {/* ÉTAPE 3 : Formulaire d'informations */}
                {currentStep === "form" && (
                  <div className="space-y-6">
                    <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-lg font-semibold text-blue-800">
                        Rendez-vous  pour le {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR')} à {appointmentForm.watch("time")}
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
                          <FormLabel>Adresse Email *</FormLabel>
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
                                max={new Date().toISOString().split('T')[0]}
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
                      className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700" 
                      size="lg" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          créer le rendez-vous
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700" 
                      size="lg"
                      onClick={goToNextStep}
                      disabled={!canProceed() || loading || loadingSlots}
                    >
                      {loadingSlots ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          Continuer
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
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