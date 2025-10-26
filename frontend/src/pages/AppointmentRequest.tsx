import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Cake, ArrowLeft, Check, Calendar, Clock } from "lucide-react";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  birthdate?: string;
  requested_date: string;
};

type Props = {
  requestedDate: string; // Maintenant obligatoire
  onBack?: () => void;
};

export default function AppointmentRequest({ requestedDate, onBack }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      requested_date: requestedDate,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success("Demande envoyée avec succès !");
      reset();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi de la demande");
    }
  };

  const formatSelectedDate = () => {
    const date = new Date(requestedDate);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-soft hover:shadow-hover transition-all animate-fade-in">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          Finaliser votre demande
        </CardTitle>
        <CardDescription>
          Complétez vos informations pour confirmer le rendez-vous
        </CardDescription>
        
        {/* Affichage du créneau sélectionné - Lecture seule */}
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-center gap-3 text-lg font-semibold text-primary">
            <Clock className="h-5 w-5" />
            {formatSelectedDate()}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Ce créneau a été réservé pour vous. Modification impossible.
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Champ hidden pour la date - Lecture seule */}
          <input
            type="hidden"
            {...register("requested_date")}
          />

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom complet *
            </Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Votre nom et prénom"
              className="bg-background/50"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="votre@email.com"
                className="bg-background/50"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone *
              </Label>
              <Input
                id="phone"
                {...register("phone", { required: true })}
                placeholder="+33 1 23 45 67 89"
                className="bg-background/50"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthdate" className="flex items-center gap-2">
                <Cake className="h-4 w-4" />
                Date de naissance
              </Label>
              <Input
                id="birthdate"
                type="date"
                {...register("birthdate")}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Votre adresse complète"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {onBack && (
              <Button 
                type="button"
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Changer de créneau
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 group shadow-soft hover:shadow-hover transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Confirmer la demande
                  <Check className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
            <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Votre créneau est réservé temporairement. Notre secrétaire vous contactera 
              sous 24h pour confirmation définitive.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}