import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Plus, Calendar, Eye, Phone, Mail, Loader2, FileText } from "lucide-react";
import PrescriptionPopup from "@/components/PrescriptionPopup";

interface ApiPatient {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  birthdate?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface FormattedPatient {
  id: number;
  name: string;
  age: number | string;
  gender: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string;
  condition: string;
  status: string;
  severity: string;
  treatments: string[];
  notes: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // États pour le popup de prescription
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    name: string;
    age: number | string;
    condition: string;
  } | null>(null);

  // Fonction utilitaire pour récupérer le token
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Fonction pour fetcher les patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      
      if (!token) {
        setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
        return;
      }

      console.log('🔄 Récupération des patients...');

      const response = await fetch('http://localhost:5000/api/patient/patients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          setError('Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📦 Données reçues de l\'API:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la récupération des patients');
      }

      setPatients(result.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Ouvrir le popup de prescription
  const handleOpenPrescription = (patient: FormattedPatient) => {
    setSelectedPatient({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      condition: patient.condition
    });
    setIsPrescriptionOpen(true);
  };

  // Fermer le popup
  const handleClosePrescription = () => {
    setIsPrescriptionOpen(false);
    setSelectedPatient(null);
  };

  // Sauvegarder la prescription
  const handleSavePrescription = (prescription: any) => {
    console.log('Prescription sauvegardée:', prescription);
    // Ici vous pouvez envoyer la prescription à votre API
    // Exemple: await savePrescription(prescription);
    
    // Afficher un message de succès
    alert(`Prescription créée avec succès pour ${prescription.patientName}`);
  };

  // Formater les données pour l'affichage - CORRIGÉ
  const formattedPatients: FormattedPatient[] = patients.map(patient => {
    // Calculer l'âge à partir de birthdate
    const calculateAge = (birthdate: string): number | string => {
      if (!birthdate) return 'N/A';
      try {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      } catch {
        return 'N/A';
      }
    };

    // Déterminer le statut
    const getStatus = (createdAt: string): string => {
      try {
        const createdDate = new Date(createdAt);
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        return createdDate > thirtyDaysAgo ? "new" : "active";
      } catch {
        return "active";
      }
    };

    // Conditions médicales simulées (à adapter avec vos vraies données)
    const medicalConditions = [
      "Dermatite atopique", "Acné sévère", "Psoriasis", "Eczéma", 
      "Rosacée", "Cancer de la peau", "Vitiligo", "Urticaire"
    ];
    
    const randomCondition = medicalConditions[Math.floor(Math.random() * medicalConditions.length)];
    const randomSeverity = ["légère", "modérée", "élevée"][Math.floor(Math.random() * 3)];

    return {
      id: patient.id,
      name: patient.name, // Utiliser directement le nom de l'API
      age: calculateAge(patient.birthdate || ''),
      gender: "Non spécifié", // À adapter si vous avez le genre dans l'API
      email: patient.email,
      phone: patient.phone || 'Non renseigné',
      lastVisit: patient.createdAt, // Utiliser createdAt comme dernière visite
      nextAppointment: 'Aucun',
      condition: randomCondition,
      status: getStatus(patient.createdAt),
      severity: randomSeverity,
      treatments: ["Consultation en attente"],
      notes: patient.address || "Aucune note médicale"
    };
  });

  console.log('📊 Patients formatés:', formattedPatients);

  // Filtrage des patients
  const filteredPatients = formattedPatients.filter(patient => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      patient.name.toLowerCase().includes(search) ||
      patient.email.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search);

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Aucun') return 'Aucun';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-500/10 text-green-600 border-green-200",
      new: "bg-blue-500/10 text-blue-600 border-blue-200",
      critical: "bg-red-500/10 text-red-600 border-red-200",
      inactive: "bg-gray-500/10 text-gray-600 border-gray-200"
    };

    const labels = {
      active: "Actif",
      new: "Nouveau",
      critical: "Critique",
      inactive: "Inactif"
    };

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      légère: "bg-green-500/10 text-green-600 border-green-200",
      modérée: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      élevée: "bg-red-500/10 text-red-600 border-red-200"
    };

    return (
      <Badge variant="outline" className={variants[severity as keyof typeof variants]}>
        {severity}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des patients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Erreur: {error}</div>
        <Button onClick={fetchPatients}>Réessayer</Button>
      </div>
    );
  }

  const conditions = [...new Set(formattedPatients.map(p => p.condition))];

  return (
    <div className="space-y-6">
      {/* Popup de prescription */}
      {selectedPatient && (
        <PrescriptionPopup
          patient={selectedPatient}
          isOpen={isPrescriptionOpen}
          onClose={handleClosePrescription}
          onSave={handleSavePrescription}
        />
      )}

      {/* En-tête de page */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Patients</h2>
          <p className="text-muted-foreground">
            {filteredPatients.length} patient(s) sur {patients.length} au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPatients}>
            Actualiser
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Patient
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Rechercher un patient</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, email ou pathologie..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions filtres */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setAgeFilter("all");
                setGenderFilter("all");
                setStatusFilter("all");
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des Patients
          </CardTitle>
          <CardDescription>
            {patients.length > 0 ? (
              `Cliquez sur "Voir fiche" pour accéder au dossier complet du patient`
            ) : (
              `Aucun patient trouvé dans la base de données`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    
                    {/* Informations patient */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        {getStatusBadge(patient.status)}
                        {getSeverityBadge(patient.severity)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Âge:</span>
                          <span className="font-medium">{patient.age} ans</span>
                        </div>
                  
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Dernière visite:</span>
                          <span className="font-medium">{formatDate(patient.lastVisit)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Prochain RDV:</span>
                          <span className="font-medium">
                            {patient.nextAppointment === "Aucun" ? 
                              "Aucun" : 
                              formatDate(patient.nextAppointment)
                            }
                          </span>
                        </div>
                      </div>

                      {/* Contacts */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </div>

                      {/* Traitements */}
                      <div className="flex flex-wrap gap-1">
                        {patient.treatments.map((treatment, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {treatment}
                          </Badge>
                        ))}
                      </div>

                      {/* Notes */}
                      {patient.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {patient.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Rapport Médical
                    </Button>
                    <Button size="sm" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Voir fiche
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Affecter un RDV
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => handleOpenPrescription(patient)}
                    >
                      <FileText className="h-4 w-4" />
                      Créer Prescription 
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPatients.length === 0 && patients.length > 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun patient trouvé</p>
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              </div>
            )}

            {patients.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun patient enregistré</p>
                <p className="text-sm">Commencez par ajouter un nouveau patient</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}