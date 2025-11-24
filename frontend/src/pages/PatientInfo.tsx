import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, Mail, Phone, Cake, Edit, Shield, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function PersonalInfoPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [patientData, setPatientData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      address: ""
    },
    accountInfo: {
      createdAt: "",
      lastLogin: "",
      status: "active"
    }
  });

  const [formData, setFormData] = useState(patientData.personalInfo);

  // Récupération du patient depuis le backend
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
       const res = await fetch(`http://localhost:5000/api/patient/${patientId}`);

        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();

        const [firstName, ...lastNameParts] = data.name.split(" ");
        const lastName = lastNameParts.join(" ");

        const mappedData = {
          personalInfo: {
            firstName: firstName || "",
            lastName: lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            birthDate: data.birthdate || "",
            address: data.address || ""
          },
          accountInfo: {
            createdAt: data.createdAt || "",
            lastLogin: data.lastLogin || "",
            status: "active"
          }
        };

        setPatientData(mappedData);
        setFormData(mappedData.personalInfo);
      } catch (error) {
        toast.error("Impossible de charger les informations du patient");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { firstName, lastName, email, phone, birthDate, address } = formData;
      const res = await fetch(`http://localhost:5000/api/patient/${patientId}`,  {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          birthdate: birthDate,
          address
        })
      });

      if (!res.ok) throw new Error("Erreur serveur");
      const updatedData = await res.json();

      const [fName, ...lNameParts] = updatedData.name.split(" ");
      const lName = lNameParts.join(" ");

      setPatientData({
        personalInfo: {
          firstName: fName,
          lastName: lName,
          email: updatedData.email,
          phone: updatedData.phone,
          birthDate: updatedData.birthdate,
          address: updatedData.address
        },
        accountInfo: {
          createdAt: updatedData.createdAt,
          lastLogin: updatedData.lastLogin,
          status: "active"
        }
      });

      toast.success("Informations mises à jour avec succès");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(patientData.personalInfo);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-500/10 text-green-600 border-green-200",
      inactive: "bg-gray-500/10 text-gray-600 border-gray-200",
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200"
    };
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {status === "active" ? "Actif" : "Inactif"}
      </Badge>
    );
  };

  if (isLoading && !patientData.personalInfo.firstName) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des informations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Informations personnelles</h1>
              <p className="text-muted-foreground">
                {formData.firstName} {formData.lastName} 
              </p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>Vos informations de contact et personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline-block mr-1" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline-block mr-1" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    <Cake className="h-4 w-4 inline-block mr-1" />
                    Date de naissance *
                  </Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Statut du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Statut</span>
                  {getStatusBadge(patientData.accountInfo.status)}
                </div>
                <div className="flex justify-between">
                  <span>Membre depuis</span>
                  <span>
                    {patientData.accountInfo.createdAt
                      ? new Date(patientData.accountInfo.createdAt).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dernière connexion</span>
                  <span>
                    {patientData.accountInfo.lastLogin
                      ? new Date(patientData.accountInfo.lastLogin).toLocaleDateString("fr-FR")
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Historique des RDV
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter le support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
