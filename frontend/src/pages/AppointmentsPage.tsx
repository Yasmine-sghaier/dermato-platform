import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/Authcontext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, MapPin, Cake, ArrowLeft, ArrowRight, Loader2, Ban, Check } from "lucide-react";

// Schéma pour visiteur (non connecté)
const appointmentSchemaVisitor = z.object({
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

// Schéma pour patient connecté (champs optionnels car déjà dans le compte)
const appointmentSchemaPatient = z.object({
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchemaVisitor>;

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
  const { isLoggedIn, user, role } = useAuth();
  const isPatient = isLoggedIn && role === "patient";
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [blockedDatesInfo, setBlockedDatesInfo] = useState<Map<string, { reason: string }>>(new Map());
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPatientInfo, setLoadingPatientInfo] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [selectedDateBlocked, setSelectedDateBlocked] = useState<{ isBlocked: boolean; reason?: string }>({ isBlocked: false });

  // Charger les dates disponibles et les jours bloqués au montage du composant
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

    const fetchBlockedDates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:5000/api/blocked-dates", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.data.success) {
          const blockedMap = new Map<string, { reason: string }>();
          response.data.data.forEach((bd: { blocked_date: string; reason: string }) => {
            const dateStr = new Date(bd.blocked_date).toISOString().split('T')[0];
            blockedMap.set(dateStr, { reason: bd.reason });
          });
          setBlockedDatesInfo(blockedMap);
        }
      } catch (error) {
        // Si l'utilisateur n'est pas authentifié, on ignore l'erreur
        console.log("Impossible de charger les jours bloqués (normal si non authentifié)");
      }
    };

    const fetchPatientInfo = async () => {
      if (isPatient && user?.id) {
        setLoadingPatientInfo(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/api/patient/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // L'API retourne directement l'objet patient
          if (response.data) {
            setPatientInfo(response.data);
          }
        } catch (error) {
          console.error("Erreur chargement infos patient:", error);
        } finally {
          setLoadingPatientInfo(false);
        }
      }
    };

    fetchAvailableDates();
    fetchBlockedDates();
    fetchPatientInfo();
  }, [isPatient, user?.id]);

  // Vérifier si une date est bloquée
  const checkIfDateBlocked = async (date: string) => {
    // D'abord vérifier dans la map locale (plus rapide)
    const blockedInfo = blockedDatesInfo.get(date);
    if (blockedInfo) {
      return {
        isBlocked: true,
        reason: blockedInfo.reason
      };
    }
    
    // Si pas dans la map locale, vérifier via l'API (seulement si nécessaire)
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/blocked-dates/check/${date}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success && response.data.isBlocked) {
        return {
          isBlocked: true,
          reason: response.data.data?.reason || 'Congé médecin'
        };
      }
    } catch (error) {
      // Si l'API échoue, on assume que la date n'est pas bloquée
      // (pour éviter de bloquer toutes les dates en cas d'erreur)
      console.log("Erreur vérification date bloquée:", error);
    }
    
    return { isBlocked: false };
  };

  // Charger la disponibilité des créneaux quand une date est sélectionnée
  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setLoadingSlots(true);
    setSelectedDateBlocked({ isBlocked: false }); // Réinitialiser le statut
    
    try {
      // Récupérer les créneaux disponibles pour cette date
      const response = await axios.get(`http://localhost:5000/api/availability/slots/${date}`);
      
      if (response.data.success) {
        // Vérifier si le message indique que c'est un jour bloqué
        const message = response.data.message || '';
        if (message.includes('bloqué') || message.includes('congé')) {
          const blockedStatus = {
            isBlocked: true,
            reason: 'Congé médecin'
          };
          setSelectedDateBlocked(blockedStatus);
          toast.error("Cette date est indisponible : Médecin en congé");
          setTimeSlots([]);
          return;
        }
        
        // Si ce n'est pas un jour bloqué, procéder normalement
        const availableSlots = response.data.availableSlots || [];
        
        // Créer la liste complète des créneaux avec leur disponibilité
        const allSlotsWithAvailability: TimeSlot[] = ALL_TIME_SLOTS.map(slot => ({
          time: slot,
          available: availableSlots.includes(slot)
        }));
        
        setTimeSlots(allSlotsWithAvailability);
        appointmentForm.setValue("date", date);
        
        // Si patient connecté, passer directement à la soumission après sélection de l'heure
        // Sinon, passer à l'étape formulaire
        setCurrentStep("time");
      } else {
        // Si l'API retourne success: false, vérifier si c'est bloqué
        const blockedStatus = await checkIfDateBlocked(date);
        if (blockedStatus.isBlocked) {
          setSelectedDateBlocked(blockedStatus);
          toast.error(`Cette date est indisponible : ${blockedStatus.reason || 'Médecin en congé'}`);
          setTimeSlots([]);
        } else {
          toast.error("Erreur lors du chargement des créneaux");
          setTimeSlots([]);
        }
      }
    } catch (error: any) {
      console.error("Erreur chargement créneaux:", error);
      
      // En cas d'erreur réseau, vérifier si c'est un jour bloqué (vérification locale)
      const blockedInfo = blockedDatesInfo.get(date);
      if (blockedInfo) {
        setSelectedDateBlocked({
          isBlocked: true,
          reason: blockedInfo.reason
        });
        toast.error(`Cette date est indisponible : ${blockedInfo.reason}`);
        setTimeSlots([]);
      } else {
        toast.error("Erreur lors du chargement des créneaux disponibles");
        // Afficher tous les créneaux comme indisponibles en cas d'erreur
        const fallbackSlots: TimeSlot[] = ALL_TIME_SLOTS.map(slot => ({
          time: slot,
          available: false
        }));
        setTimeSlots(fallbackSlots);
      }
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = async (time: string, available: boolean) => {
    if (!available) {
      toast.error("Ce créneau n'est pas disponible");
      return;
    }
    appointmentForm.setValue("time", time);
    
    // Si patient connecté avec toutes les infos, soumettre directement
    if (isPatient && patientInfo) {
      const formValues = appointmentForm.getValues();
      // Préparer les données avec les infos du patient
      const submitData = {
        ...formValues,
        firstName: formValues.firstName || patientInfo.name?.split(' ')[0] || '',
        lastName: formValues.lastName || patientInfo.name?.split(' ').slice(1).join(' ') || '',
        email: formValues.email || patientInfo.email || '',
        phone: formValues.phone || patientInfo.phone || '',
        address: formValues.address || patientInfo.address || '',
        birthDate: formValues.birthDate || patientInfo.birthdate || '',
      };
      await onAppointmentSubmit(submitData);
    } else {
      // Sinon, afficher le formulaire
      setCurrentStep("form");
    }
  };

  // Créer le schéma conditionnel
  const getAppointmentSchema = () => {
    return isPatient ? appointmentSchemaPatient : appointmentSchemaVisitor;
  };

  const appointmentForm = useForm<AppointmentFormValues>({
    resolver: zodResolver(getAppointmentSchema()),
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

  // Pré-remplir le formulaire avec les données du patient si connecté
  useEffect(() => {
    if (isPatient && patientInfo) {
      const nameParts = patientInfo.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      appointmentForm.reset({
        date: appointmentForm.getValues("date") || "",
        time: appointmentForm.getValues("time") || "",
        firstName: firstName,
        lastName: lastName,
        email: patientInfo.email || "",
        phone: patientInfo.phone || "",
        address: patientInfo.address || "",
        birthDate: patientInfo.birthdate || "",
      });
    }
  }, [patientInfo, isPatient]);

  const onAppointmentSubmit = async (data: AppointmentFormValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Vérifier si la date est bloquée avant de créer le RDV
      const blockedStatus = await checkIfDateBlocked(data.date);
      if (blockedStatus.isBlocked) {
        toast.error(`Cette date est indisponible : ${blockedStatus.reason || 'Médecin en congé'}`);
        setCurrentStep("date");
        setSelectedDateBlocked(blockedStatus);
        setLoading(false);
        return;
      }
      
      // Préparer les données pour l'API
      // Si patient connecté, utiliser les données du compte, sinon utiliser les données du formulaire
      const appointmentData = isPatient && patientInfo ? {
        firstName: data.firstName || patientInfo.name?.split(' ')[0] || '',
        lastName: data.lastName || patientInfo.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || patientInfo.email || '',
        phone: data.phone || patientInfo.phone || '',
        address: data.address || patientInfo.address || '',
        birthDate: data.birthDate || patientInfo.birthdate || '',
        date: data.date,
        time: data.time,
        user_id: user?.id // Lier le rendez-vous au compte utilisateur
      } : {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        birthDate: data.birthDate || '',
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
        const reason = availabilityCheck.data.reason || "indisponible";
        if (reason.includes("bloqué") || reason.includes("congé")) {
          toast.error(`Cette date est indisponible : Médecin en congé`);
          setCurrentStep("date");
          setSelectedDateBlocked({ isBlocked: true, reason: "Congé médecin" });
        } else {
          toast.error("Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.");
          setCurrentStep("time");
        }
        setLoading(false);
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
      if (role === "patient") {
        navigate("/space/patient");
      } else if (role === "secretary") {
        navigate("/secretary/dashboard");
      } else if (role === "dermatologist") {
        navigate("/dermatologist/dashboard");
      } else {
        // Visiteur non connecté
        toast.info("Rendez-vous créé ! Connectez-vous pour voir vos rendez-vous.");
        navigate("/login");
      }
      
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
    if (currentStep === "time") {
      const time = appointmentForm.watch("time");
      // Si patient connecté, on peut soumettre directement après sélection de l'heure
      if (isPatient && time) {
        return true;
      }
      return !!time;
    }
    // Pour l'étape formulaire, vérifier les champs requis seulement si visiteur
    if (currentStep === "form" && !isPatient) {
      const values = appointmentForm.getValues();
      return !!(values.firstName && values.lastName && values.email && values.phone);
    }
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
                                  onChange={async (e) => {
                                    const date = e.target.value;
                                    setSelectedDate(date);
                                    setSelectedDateBlocked({ isBlocked: false });
                                    
                                    // Si la date n'est pas dans la liste des dates disponibles
                                    if (!isDateAvailable(date)) {
                                      // Vérifier si c'est parce qu'elle est bloquée (vérification locale rapide)
                                      const blockedInfo = blockedDatesInfo.get(date);
                                      if (blockedInfo) {
                                        setSelectedDateBlocked({
                                          isBlocked: true,
                                          reason: blockedInfo.reason
                                        });
                                        toast.error(`Cette date est indisponible : ${blockedInfo.reason}`);
                                        return;
                                      }
                                      // Si ce n'est pas bloqué mais pas disponible, c'est peut-être un weekend ou date passée
                                      // On laisse l'utilisateur essayer quand même
                                    }
                                    
                                    // Procéder avec la sélection de date (même si pas dans availableDates)
                                    handleDateSelect(date);
                                  }}
                                  value={selectedDate}
                                  disabled={loadingDates}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {selectedDate && selectedDateBlocked.isBlocked && (
                            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Ban className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-red-800 mb-1">
                                    Date indisponible
                                  </p>
                                  <p className="text-sm text-red-700">
                                    {selectedDateBlocked.reason 
                                      ? `Le médecin est en congé : ${selectedDateBlocked.reason}`
                                      : "Le médecin est en congé. Cette date n'est pas disponible pour les rendez-vous."
                                    }
                                  </p>
                                  <p className="text-xs text-red-600 mt-2">
                                    Veuillez choisir une autre date disponible.
                                  </p>
                                </div>
                              </div>
                            </div>
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

                {/* ÉTAPE 3 : Formulaire d'informations (seulement pour les visiteurs) */}
                {currentStep === "form" && !isPatient && (
                  <div className="space-y-6">
                    <div className="text-center mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-lg font-semibold text-blue-800">
                        Rendez-vous pour le {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR')} à {appointmentForm.watch("time")}
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
                          <FormLabel>Adresse *</FormLabel>
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
                          <FormLabel>Date de naissance *</FormLabel>
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

                {/* Message pour patient connecté après sélection de l'heure */}
                {currentStep === "time" && isPatient && patientInfo && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <Check className="inline h-4 w-4 mr-2" />
                      Vos informations sont déjà enregistrées. Cliquez sur un créneau pour confirmer votre rendez-vous.
                    </p>
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
                      disabled={loading || loadingPatientInfo}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {isPatient ? "Confirmer le rendez-vous" : "Créer le rendez-vous"}
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