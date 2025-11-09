import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Check, X, Phone, Mail, Search, Filter, User, MapPin, Cake } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type AppointmentRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  birthdate?: string;
  requested_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  notes?: string;
};

export default function SecretaryDashboard() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AppointmentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending"); // Par défaut "pending"
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger TOUS les rendez-vous
  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/appointments/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des rendez-vous");
        }

        const data = await response.json();

        // Formatter les données
        const formatted = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          birthdate: item.birthdate,
          requested_date: item.requested_date,
          status: item.status,
          created_at: item.createdAt || item.created_at,
          notes: item.notes,
        }));

        setRequests(formatted);
      } catch (error) {
        console.error("Erreur :", error);
        toast.error("Erreur lors du chargement des rendez-vous");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllAppointments();
  }, []);

  // Filtrage des demandes côté frontend
  useEffect(() => {
    let filtered = requests;

    // Filtre par statut - par défaut "pending"
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.phone.includes(searchTerm)
      );
    }

    // Trier par date de création (les plus récents en premier)
    filtered = filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  // Fonction pour confirmer un rendez-vous
  const handleConfirmAppointment = async (requestId: string) => {
    setLoading(requestId);
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `http://localhost:5000/api/secretary/confirm/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Mettre à jour le statut localement
      setRequests(prev => prev.map(request =>
        request.id === requestId ? { ...request, status: 'confirmed' } : request
      ));

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }

      toast.success(response.data.message || "Rendez-vous confirmé avec succès !");
      
    } catch (err: any) {
      console.error("Erreur confirmation RDV:", err);
      
      if (err.response) {
        const errorMessage = err.response.data.message || "Erreur lors de la confirmation du rendez-vous";
        toast.error(errorMessage);
      } else if (err.request) {
        toast.error("Erreur de connexion au serveur");
      } else {
        toast.error("Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(null);
    }
  };

  // Fonction pour annuler un rendez-vous
  const handleCancelAppointment = async (requestId: string) => {
    setLoading(requestId);
    try {
      const token = localStorage.getItem("token");
      
      // Appel API pour annuler (vous devrez créer cette route)
      // Pour l'instant, on gère seulement localement
      setRequests(prev => prev.map(request =>
        request.id === requestId ? { ...request, status: 'cancelled' } : request
      ));

      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }

      toast.success("Rendez-vous annulé avec succès");
      
    } catch (err: any) {
      console.error("Erreur annulation RDV:", err);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: AppointmentRequest['status']) => {
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le titre dynamique selon le filtre
  const getListTitle = () => {
    switch (statusFilter) {
      case 'pending':
        return "Rendez-vous en attente de décision";
      case 'confirmed':
        return "Rendez-vous confirmés";
      case 'cancelled':
        return "Rendez-vous annulés";
      case 'completed':
        return "Rendez-vous terminés";
      default:
        return "Tous les rendez-vous";
    }
  };

  // Obtenir la description dynamique selon le filtre
  const getListDescription = () => {
    switch (statusFilter) {
      case 'pending':
        return "Prenez une décision pour chaque demande - Accepter ou Refuser";
      case 'confirmed':
        return "Rendez-vous confirmés et planifiés";
      case 'cancelled':
        return "Rendez-vous annulés ou refusés";
      case 'completed':
        return "Rendez-vous déjà effectués";
      default:
        return "Consultez l'ensemble des rendez-vous";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Espace Secrétaire</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
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
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Annulés</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminés</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des demandes */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {getListTitle()}
                </CardTitle>
                <CardDescription>
                  {getListDescription()}
                </CardDescription>
                
                {/* Barre de recherche et filtres */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, email ou téléphone..."
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
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmés</option>
                    <option value="cancelled">Annulés</option>
                    <option value="completed">Terminés</option>
                    <option value="all">Tous les statuts</option>
                  </select>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement des rendez-vous...</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredRequests.map((request, index) => (
                      <Card 
                        key={request.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md border-l-4 ${
                          selectedRequest?.id === request.id ? 'border-l-primary bg-primary/5' : 'border-l-transparent'
                        } ${
                          request.status === 'pending' ? 'bg-yellow-500/5' :
                          request.status === 'confirmed' ? 'bg-green-500/5' :
                          request.status === 'cancelled' ? 'bg-red-500/5' : 'bg-blue-500/5'
                        } animate-scale-in`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{request.name}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(request.requested_date)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {request.email}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {request.phone}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {formatDate(request.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions rapides - SEULEMENT pour les rendez-vous en attente */}
                          {request.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmAppointment(request.id);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"

                                disabled={loading === request.id}
                              >
                                {loading === request.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAppointment(request.id);
                                }}
                                disabled={loading === request.id}
                              >
                                {loading === request.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {filteredRequests.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {statusFilter === 'pending' 
                            ? "Aucun rendez-vous en attente" 
                            : `Aucun rendez-vous ${statusFilter} trouvé`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails de la demande sélectionnée */}
          <div className="space-y-6">
            {selectedRequest ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft sticky top-6 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Détails du rendez-vous
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedRequest.status)}
                    <span className="text-sm text-muted-foreground">
                      ID: {selectedRequest.id}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Informations personnelles */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Informations personnelles
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nom complet:</span>
                        <span className="font-medium">{selectedRequest.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="font-medium">{selectedRequest.email}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Téléphone:</span>
                        <span className="font-medium">{selectedRequest.phone}</span>
                      </div>
                      
                      {selectedRequest.birthdate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Date de naissance:</span>
                          <span className="font-medium">
                            {new Date(selectedRequest.birthdate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      
                      {selectedRequest.address && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground flex items-start gap-1">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            Adresse:
                          </span>
                          <span className="font-medium text-right">{selectedRequest.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Détails du rendez-vous */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Détails du rendez-vous
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date demandée:</span>
                        <span className="font-medium">{formatDate(selectedRequest.requested_date)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date de la demande:</span>
                        <span className="font-medium">{formatDate(selectedRequest.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h4 className="font-semibold">Actions</h4>
                    
                    <div className="grid gap-2">
                      {selectedRequest.status === 'pending' && (
                        <>
                          <Button 
                            onClick={() => handleConfirmAppointment(selectedRequest.id)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading === selectedRequest.id}
                          >
                            {loading === selectedRequest.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                Confirmation...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Confirmer le rendez-vous
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleCancelAppointment(selectedRequest.id)}
                            className="w-full"
                            disabled={loading === selectedRequest.id}
                          >
                            {loading === selectedRequest.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                Annulation...
                              </>
                            ) : (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Refuser la demande
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft animate-fade-in">
                <CardContent className="p-8 text-center">
               
                </CardContent>
              </Card>
            )}

            {/* Actions rapides */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir l'agenda complet
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Liste des patients
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Créneaux disponibles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}