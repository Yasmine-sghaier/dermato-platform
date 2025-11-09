import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Activity, CheckCircle, Mail, User } from "lucide-react";

const createAccountSchema = z.object({
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

interface TokenPayload {
  email: string;
  name: string;
  appointmentId: number;
  iat: number;
  exp: number;
}

export default function CreateAccountFromToken() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // Décoder le token pour extraire les informations
        const decoded = jwtDecode<TokenPayload>(token);
        setUserInfo({
          email: decoded.email,
          name: decoded.name
        });
        console.log("Informations utilisateur extraites:", decoded);
      } catch (error) {
        console.error("Erreur décodage token:", error);
        setTokenValid(false);
        toast.error("Token invalide ou expiré");
      }
    } else {
      setTokenValid(false);
      toast.error("Token manquant");
    }
  }, [token]);

  const createAccountForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onCreateAccountSubmit = async (data: CreateAccountFormValues) => {
    if (!token) {
      toast.error("Token manquant");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register-from-appointment", {
        token: token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      toast.success("Compte créé avec succès !");
      
      // Redirection vers la page de login avec message
      navigate("/login", { 
        state: { message: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter." } 
      });
    } catch (err: any) {
      console.error("Erreur création compte:", err.response?.data);
      toast.error(err.response?.data?.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Lien invalide ou expiré</h2>
            <p className="text-muted-foreground mb-4">
              Ce lien de création de compte est invalide ou a expiré.
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12 flex items-center justify-center bg-muted/30">
      <div className="max-w-md w-full mx-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-3 bg-primary rounded-xl">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DermaCare
          </span>
        </div>

        <Card className="shadow-hover">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Finaliser votre inscription</CardTitle>
            <p className="text-sm text-muted-foreground">
              Votre rendez-vous a été confirmé. Créez votre mot de passe pour accéder à votre espace patient.
            </p>
          </CardHeader>
          <CardContent>
            {/* Affichage des informations utilisateur */}
            {userInfo && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3">
             
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ces informations proviennent de votre demande de rendez-vous.
                </p>
              </div>
            )}

            <Form {...createAccountForm}>
              <form onSubmit={createAccountForm.handleSubmit(onCreateAccountSubmit)} className="space-y-4">
                <FormField
                  control={createAccountForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
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
                  control={createAccountForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Création du compte..." : "Finaliser mon inscription"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Déjà un compte ? </span>
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Se connecter
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}