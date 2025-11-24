// pages/PatientSpace.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Cake,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type Appointment = {
  id: string;
  requested_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
};

export default function PatientSpace() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);



  // Charger les rendez-vous du patient
  useEffect(() => {
    const fetchPatientAppointments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/patient/my-appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des rendez-vous");
        }

        const data = await response.json();
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors du chargement de vos rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatientAppointments();
    }
  }, [isAuthenticated]);

  // Filtrer les rendez-vous
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        new Date(apt.requested_date).toLocaleDateString('fr-FR').includes(searchTerm) ||
        apt.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Trier par date (plus récent en premier)
    filtered = filtered.sort((a, b) => 
      new Date(b.requested_date).getTime() - new Date(a.requested_date).getTime()
    );

    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, appointments]);

  const getStatusBadge = (status: Appointment['status']) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      confirmed: "bg-green-500/10 text-green-600 border-green-200",
      cancelled: "bg-red-500/10 text-red-600 border-red-200",
      completed: "bg-blue-500/10 text-blue-600 border-blue-200",
    };

    const labels = {
      pending: "En attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé",
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
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

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/patient/appointments/${appointmentId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'annulation du rendez-vous");
      }

      // Mettre à jour localement
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );

      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }

      toast.success("Rendez-vous annulé avec succès");
    } catch (error) {
      console.error("Erreur annulation:", error);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.requested_date);
    const now = new Date();
    const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Peut annuler seulement si le rendez-vous est dans plus de 24h
    return hoursDifference > 24 && appointment.status === 'confirmed';
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  if (!isAuthenticated) {
    return null; // La redirection se fera via le useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full mb-4">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Espace Patient</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Bonjour, <span className="text-blue-600">{user?.name || "Patient"}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gérez vos rendez-vous et consultez vos informations personnelles
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total RDV</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des rendez-vous */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Mes Rendez-vous
                    </CardTitle>
                    <CardDescription>
                      Consultez et gérez vos rendez-vous
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => navigate("/create-appointment")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau RDV
                  </Button>
                </div>
                
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="cancelled">Annulés</option>
                    <option value="completed">Terminés</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement de vos rendez-vous...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredAppointments.map((appointment, index) => (
                      <Card 
                        key={appointment.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md border-l-4 ${
                          selectedAppointment?.id === appointment.id ? 'border-l-blue-600 bg-blue-500/5' : 'border-l-transparent'
                        } ${
                          appointment.status === 'pending' ? 'bg-yellow-500/5' :
                          appointment.status === 'confirmed' ? 'bg-green-500/5' :
                          appointment.status === 'cancelled' ? 'bg-red-500/5' : 'bg-blue-500/5'
                        } animate-scale-in`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {formatDate(appointment.requested_date)}
                              </h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Créé le {new Date(appointment.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 ml-4">
                            {canCancelAppointment(appointment) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAppointment(appointment.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">Aucun rendez-vous trouvé</p>
                        <Button 
                          onClick={() => navigate("/create-appointment")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Prendre un rendez-vous
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails du rendez-vous sélectionné et informations patient */}
          <div className="space-y-6">
            {/* Détails du rendez-vous */}
            {selectedAppointment ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft sticky top-6 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Détails du rendez-vous
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Informations du rendez-vous
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date et heure:</span>
                        <span className="font-medium text-right">
                          {formatDate(selectedAppointment.requested_date)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Statut:</span>
                        <span className="font-medium capitalize">{selectedAppointment.status}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date de création:</span>
                        <span className="font-medium">
                          {new Date(selectedAppointment.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-semibold">Actions</h4>
                    
                    <div className="grid gap-2">
                      {canCancelAppointment(selectedAppointment) && (
                        <Button 
                          variant="destructive"
                          onClick={() => handleCancelAppointment(selectedAppointment.id)}
                          className="w-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Annuler le rendez-vous
                        </Button>
                      )}
                      
                      <Button variant="outline" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier (bientôt disponible)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft animate-fade-in">
                <CardContent className="p-8 text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">Sélectionnez un rendez-vous</h3>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur un rendez-vous dans la liste pour voir les détails
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Informations patient */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Mes Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                  
                  <Button variant="outline" className="w-full justify-start mt-4">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier mes informations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/create-appointment")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Prendre un nouveau RDV
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir mon historique
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier mon profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}