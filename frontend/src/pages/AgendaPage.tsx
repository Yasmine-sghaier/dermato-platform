// components/CalendarAppointment.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  MapPin,
  Check,
  X,
  AlertCircle,
  Filter,
  RefreshCw,
  Plus,
  MoreVertical,
  Printer,
  Download,
  Share2,
  Bell,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  isWeekend,
  parseISO, 
  isValid,
  getHours,
  getMinutes,
  isPast,
  isFuture,
  parse
} from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";

// Types basés sur votre modèle
interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  birthdate?: string;
  requested_date: string; // Date complète avec heure
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  confirmation_token?: string;
  user_id?: number;
  created_by: 'patient' | 'secretary';
  created_at: string;
  updated_at: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  appointment?: Appointment;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

interface AvailableSlotsResponse {
  success: boolean;
  date: string;
  availableSlots: string[];
  totalSlots: number;
  bookedSlotsCount: number;
  message?: string;
}

interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  requested_date: string;
  doctorId: string;
  reason: string;
}

// Constantes pour les horaires de travail
const WORKING_HOURS = {
  start: 8,
  end: 17,
  breakStart: 12,
  breakEnd: 13
};

const SLOT_DURATION = 30; // minutes

export default function CalendarAppointment() {
  // États principaux
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [newAppointmentData, setNewAppointmentData] = useState<AppointmentFormData>({
    name: '',
    email: '',
    phone: '',
    requested_date: '',
    doctorId: '1',
    reason: 'Consultation'
  });

  // Données des médecins
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Yasmine Sghaier',
      specialty: 'Dermatologie',
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Dr. Ahmed Ben Ali',
      specialty: 'Dermatologie Pédiatrique',
      color: '#10b981'
    },
    {
      id: '3',
      name: 'Dr. Leila Trabelsi',
      specialty: 'Chirurgie Dermatologique',
      color: '#8b5cf6'
    }
  ];

  // Navigation
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => subDays(prev, 7));
    } else {
      setCurrentDate(prev => subDays(prev, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Génération des jours du mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Génération des jours de la semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Récupération des rendez-vous depuis l'API
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/appointments/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
      // En cas d'erreur, montrer un message
    } finally {
      setLoading(false);
    }
  };

  // Récupération des créneaux disponibles
  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await axios.get<AvailableSlotsResponse>(
        `http://localhost:5000/api/appointments/slots/${dateStr}`
      );
      
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots);
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Vérifier la disponibilité d'un créneau spécifique
  const checkSlotAvailability = async (date: string, time: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/check/${date}/${time}`
      );
      return response.data.available;
    } catch (error) {
      console.error('Erreur vérification créneau:', error);
      return false;
    }
  };

  // Création d'un nouveau rendez-vous
  const createAppointment = async (data: AppointmentFormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/appointments/create', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        requested_date: data.requested_date,
        reason: data.reason,
        created_by: 'secretary'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Recharger les données
        fetchAppointments();
        fetchAvailableSlots(selectedDate);
        setShowNewAppointmentForm(false);
        setNewAppointmentData({
          name: '',
          email: '',
          phone: '',
          requested_date: '',
          doctorId: '1',
          reason: 'Consultation'
        });
      }
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
    }
  };

  // Chargement initial et quand la date change
  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

  // Générer tous les créneaux possibles pour la journée
  const generateAllTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    let currentHour = WORKING_HOURS.start;
    
    while (currentHour < WORKING_HOURS.end) {
      // Sauter la pause déjeuner
      if (currentHour >= WORKING_HOURS.breakStart && currentHour < WORKING_HOURS.breakEnd) {
        currentHour = WORKING_HOURS.breakEnd;
        continue;
      }
      
      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = parse(`${dateStr} ${timeString}`, 'yyyy-MM-dd HH:mm', new Date());
        
        // Trouver si un rendez-vous existe à ce créneau
        const appointment = appointments.find(app => {
          const appDate = new Date(app.requested_date);
          return (
            format(appDate, 'yyyy-MM-dd') === dateStr &&
            format(appDate, 'HH:mm') === timeString
          );
        });
        
        // Vérifier si le créneau est disponible
        const isAvailable = availableSlots.includes(timeString) && !appointment;
        
        slots.push({
          time: timeString,
          isAvailable,
          appointment
        });
      }
      
      currentHour++;
    }
    
    return slots;
  };

  // Filtrer les rendez-vous pour la date sélectionnée
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(app => {
      const appDate = new Date(app.requested_date);
      return isSameDay(appDate, date);
    });
  };

  // Filtrage des rendez-vous pour la date sélectionnée
  const filteredAppointments = getAppointmentsForDate(selectedDate).filter(appointment => {
    if (selectedDoctor !== 'all') {
      // Ici vous pourriez filtrer par médecin si vous avez cette information
      return true; // À adapter selon vos données
    }
    return true;
  });

  // Statistiques
  const getStatistics = () => {
    const todayAppointments = getAppointmentsForDate(selectedDate);
    
    return {
      total: todayAppointments.length,
      pending: todayAppointments.filter(a => a.status === 'pending').length,
      confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
      done: todayAppointments.filter(a => a.status === 'done').length,
      cancelled: todayAppointments.filter(a => a.status === 'cancelled').length,
    };
  };

  // Composant Jour du calendrier
  const DayCell = ({ day }: { day: Date }) => {
    const isCurrentDay = isToday(day);
    const isSelected = isSameDay(day, selectedDate);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isWeekendDay = isWeekend(day);
    const isPastDay = isPast(day) && !isCurrentDay;
    
    const dayAppointments = getAppointmentsForDate(day);
    const confirmedCount = dayAppointments.filter(a => a.status === 'confirmed').length;
    const pendingCount = dayAppointments.filter(a => a.status === 'pending').length;

    return (
      <button
        onClick={() => {
          setSelectedDate(day);
          if (!isSameMonth(day, currentDate)) {
            setCurrentDate(day);
          }
        }}
        disabled={isPastDay}
        className={`
          relative h-32 p-2 border rounded-lg transition-all duration-200
          flex flex-col hover:shadow-md
          ${isSelected 
            ? 'bg-blue-50 border-blue-300 shadow-sm ring-2 ring-blue-500/20' 
            : isPastDay
            ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
          }
          ${!isCurrentMonth ? 'opacity-40' : ''}
          ${isWeekendDay ? 'bg-red-50/20' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* En-tête du jour */}
          <div className="flex justify-between items-start mb-1">
            <span className={`
              text-sm font-medium
              ${isCurrentDay 
                ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' 
                : isSelected 
                ? 'text-blue-700' 
                : 'text-gray-700'
              }
              ${isPastDay ? 'text-gray-400' : ''}
            `}>
              {format(day, 'd')}
            </span>
            
            {isWeekendDay && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-300 bg-red-50">
                WE
              </Badge>
            )}
          </div>

          {/* Indicateurs de rendez-vous */}
          <div className="space-y-1 mb-2">
            {confirmedCount > 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">{confirmedCount} confirmé(s)</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">{pendingCount} en attente</span>
              </div>
            )}
          </div>

          {/* Mini liste des rendez-vous */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {dayAppointments.slice(0, 2).map(app => (
              <div
                key={app.id}
                className={`
                  text-xs p-1.5 rounded truncate
                  ${app.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                   app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                   app.status === 'done' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                   'bg-red-100 text-red-800 border border-red-200'}
                `}
                title={`${format(new Date(app.requested_date), 'HH:mm')} - ${app.name} (${app.status})`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {format(new Date(app.requested_date), 'HH:mm')}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`
                      h-4 px-1 text-[10px]
                      ${app.status === 'confirmed' ? 'border-green-300 text-green-700 bg-green-50' :
                       app.status === 'pending' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                       app.status === 'done' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                       'border-red-300 text-red-700 bg-red-50'}
                    `}
                  >
                    {app.status === 'confirmed' ? '✓' : 
                     app.status === 'pending' ? '?' :
                     app.status === 'done' ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="truncate mt-0.5">{app.name.split(' ')[0]}</div>
              </div>
            ))}
            
            {dayAppointments.length > 2 && (
              <div className="text-xs text-gray-500 text-center bg-gray-100 py-1 rounded">
                +{dayAppointments.length - 2} autres
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  // Composant Vue Mois
  const MonthView = () => {
    return (
      <div className="space-y-4">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 p-2 bg-gray-50 rounded">
              {day}
            </div>
          ))}
        </div>
        
        {/* Jours du mois */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => (
            <DayCell key={day.toISOString()} day={day} />
          ))}
        </div>
      </div>
    );
  };

  // Composant Vue Jour
  const DayView = () => {
    const stats = getStatistics();
    const timeSlots = generateAllTimeSlots();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    return (
      <div className="space-y-6">
        {/* En-tête et statistiques */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </h2>
              <p className="text-gray-600 mt-1">
                {isToday(selectedDate) ? "Aujourd'hui" : 
                 format(selectedDate, "'Le' d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-gray-600">Total RDV</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-green-700">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmés</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {availableSlots.length}
                </div>
                <div className="text-sm text-gray-600">Créneaux libres</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des créneaux horaires */}
        {loadingSlots ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 mt-4">Chargement des créneaux disponibles...</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            {timeSlots.map((slot, index) => {
              const appointment = slot.appointment;
              
              return (
                <div 
                  key={index} 
                  className="flex border-b last:border-b-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-24 bg-gray-50 p-3 border-r font-medium text-gray-700">
                    {slot.time}
                  </div>
                  <div className="flex-1 p-3">
                    {appointment ? (
                      <div className={`
                        p-3 rounded-lg border-l-4
                        ${appointment.status === 'confirmed' ? 'border-green-500 bg-green-50' :
                         appointment.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
                         appointment.status === 'done' ? 'border-blue-500 bg-blue-50' :
                         'border-red-500 bg-red-50'}
                      `}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {appointment.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {appointment.phone}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3" />
                                {appointment.email}
                              </div>
                            </div>
                          </div>
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' :
                            appointment.status === 'done' ? 'outline' :
                            'destructive'
                          }>
                            {appointment.status === 'confirmed' ? 'Confirmé' :
                             appointment.status === 'pending' ? 'En attente' :
                             appointment.status === 'done' ? 'Terminé' :
                             'Annulé'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          Créé le: {format(new Date(appointment.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    ) : slot.isAvailable ? (
                      <div 
                        className="h-full border-2 border-dashed border-green-300 rounded-lg p-4 hover:bg-green-50 transition-colors cursor-pointer text-center"
                        onClick={() => {
                          const dateTime = `${dateStr}T${slot.time}:00`;
                          setNewAppointmentData(prev => ({
                            ...prev,
                            requested_date: dateTime
                          }));
                          setShowNewAppointmentForm(true);
                        }}
                      >
                        <div className="text-green-600 font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Créneau disponible
                        </div>
                        <div className="text-sm text-green-500 mt-1">
                          Cliquez pour prendre rendez-vous
                        </div>
                      </div>
                    ) : (
                      <div className="h-full bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                        <XCircle className="h-5 w-5 mx-auto mb-2" />
                        Non disponible
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Formulaire de nouveau rendez-vous
  const NewAppointmentForm = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      
      try {
        await createAppointment(newAppointmentData);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Nouveau Rendez-vous</h2>
                <p className="text-gray-600 mt-1">
                  {newAppointmentData.requested_date && 
                    format(new Date(newAppointmentData.requested_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewAppointmentForm(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newAppointmentData.name}
                  onChange={(e) => setNewAppointmentData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newAppointmentData.phone}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newAppointmentData.email}
                    onChange={(e) => setNewAppointmentData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif de consultation
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={newAppointmentData.reason}
                  onChange={(e) => setNewAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewAppointmentForm(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirmer le RDV
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  };

  // Rendu du composant sélectionné
  const renderView = () => {
    switch (viewMode) {
      case 'month': return <MonthView />;
      case 'day': return <DayView />;
      default: return <MonthView />;
    }
  };

  // Icones supplémentaires
  const Phone = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  const Mail = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📅 Agenda des Rendez-vous
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez et planifiez les consultations de votre clinique
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={goToToday}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Aujourd'hui
              </Button>
              
              <Button
                variant="default"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setShowNewAppointmentForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau RDV
              </Button>
            </div>
          </div>
        </div>

        {/* Contrôles du calendrier */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Navigation temporelle */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewMode === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
                    {viewMode === 'day' && format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {format(currentDate, 'dd/MM/yyyy')}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="border-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sélecteurs de vue et filtres */}
              <div className="flex flex-wrap items-center gap-3">
                <Tabs 
                  value={viewMode} 
                  onValueChange={(v: any) => setViewMode(v)}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="month">Vue Mois</TabsTrigger>
                    <TabsTrigger value="day">Vue Jour</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrer par médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les médecins</SelectItem>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: doctor.color }}
                          />
                          {doctor.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchAppointments}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="space-y-6">
          {renderView()}
        </div>
        
        {/* Liste des rendez-vous du jour */}
        <Card className="mt-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Rendez-vous du {format(selectedDate, 'dd/MM/yyyy')}
            </CardTitle>
            <CardDescription>
              {filteredAppointments.length} rendez-vous programmés
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' :
                          appointment.status === 'pending' ? 'secondary' :
                          appointment.status === 'done' ? 'outline' :
                          'destructive'
                        }>
                          {appointment.status === 'confirmed' ? 'Confirmé' :
                           appointment.status === 'pending' ? 'En attente' :
                           appointment.status === 'done' ? 'Terminé' :
                           'Annulé'}
                        </Badge>
                        <div className="font-semibold text-gray-900">
                          {format(new Date(appointment.requested_date), 'HH:mm')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{appointment.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{appointment.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{appointment.email}</span>
                        </div>
                        
                        {appointment.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{appointment.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 sm:mt-0">
                      <Button size="sm" variant="outline">
                        Détails
                      </Button>
                      <Button size="sm" variant="outline">
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">
                  Aucun rendez-vous programmé
                </h3>
                <p className="text-gray-600 mt-2">
                  Aucun rendez-vous n'est prévu pour cette date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulaire de nouveau rendez-vous */}
        {showNewAppointmentForm && <NewAppointmentForm />}
      </div>
    </div>
  );
}