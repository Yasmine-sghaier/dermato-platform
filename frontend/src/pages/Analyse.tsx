import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Brain, AlertTriangle, Check, X, Zap, Shield } from "lucide-react";

const symptomsList = [
 { id: "scaling", name: "Desquamation / peau qui pèle", icon: "🧽" },
{ id: "blisters", name: "Cloques / vésicules", icon: "💧" },
{ id: "swelling", name: "Gonflement", icon: "💢" },
{ id: "burning", name: "Sensation de brûlure", icon: "🔥" },
{ id: "pus", name: "Pus / infection", icon: "🟡" },
{ id: "nodules", name: "Nodules / grosseurs", icon: "⚪" },
{ id: "crusts", name: "Croûtes", icon: "🍞" },
{ id: "hair_loss", name: "Perte de cheveux", icon: "🧑‍🦲" },
{ id: "bleeding", name: "Saignement", icon: "🩸" },
{ id: "thickening", name: "Épaississement de la peau", icon: "🧱" },
{ id: "ring_shape", name: "Lésions en forme d’anneau", icon: "⭕" }

  
];

export default function SkinAiAnalyzer() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    diagnosis: string;
    confidence: number;
    recommendation: string;
    severity: "low" | "medium" | "high";
  }>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      setResult({
        diagnosis: "Dermatite atopique",
        confidence: 87,
        recommendation: "Consulter un dermatologue dans les 3 jours. Éviter les produits irritants et appliquer une crème hydratante adaptée.",
        severity: "medium"
      });
      setLoading(false);
    }, 2000);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "low": return { color: "bg-green-500", text: "Faible urgence", variant: "secondary" as const };
      case "medium": return { color: "bg-yellow-500", text: "Consultation recommandée", variant: "secondary" as const };
      case "high": return { color: "bg-red-500", text: "Urgence médicale", variant: "destructive" as const };
      default: return { color: "bg-gray-500", text: "Non évalué", variant: "secondary" as const };
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setPreview(null);
    setSelectedSymptoms([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header minimal */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Analyse IA Dermatologique</span>
          </div>
          
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Section gauche */}
          <div className="space-y-4">
            {/* Upload d'image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Photo de la lésion
                </CardTitle>
                <CardDescription>
                  Téléchargez une photo claire de la zone concernée
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <img
                        src={preview}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={resetAnalysis} className="flex-1" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                        <Button onClick={() => fileInputRef.current?.click()} className="flex-1" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Changer
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Camera className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Ajouter une photo</p>
                        <p className="text-sm text-muted-foreground mb-3">JPG, PNG - Max 5MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Choisir un fichier
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Symptômes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Symptômes (optionnel)
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {symptomsList.map((symptom) => (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        selectedSymptoms.includes(symptom.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{symptom.icon}</span>
                        <span>{symptom.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section droite */}
          <div className="space-y-4">
            {/* Bouton d'analyse */}
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={!image || loading}
                  className="w-full h-12"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Lancer l'analyse IA
                    </>
                  )}
                </Button>
                {!image && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Téléchargez une photo pour commencer
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Résultats */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Résultats de l'analyse</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Sévérité */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Niveau de priorité</span>
                        <Badge variant={getSeverityConfig(result.severity).variant}>
                          {getSeverityConfig(result.severity).text}
                        </Badge>
                      </div>

                      {/* Diagnostic */}
                      <div>
                        <h4 className="font-semibold mb-2">Diagnostic probable</h4>
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="font-medium text-green-700">{result.diagnosis}</p>
                        </div>
                      </div>

                      {/* Confiance */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fiabilité de l'analyse</span>
                          <span className="font-semibold">{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-2" />
                      </div>

                      {/* Recommandation */}
                      <div>
                        <h4 className="font-semibold mb-2">Recommandation</h4>
                        <p className="text-sm text-muted-foreground bg-blue-500/5 p-3 rounded-lg">
                          {result.recommendation}
                        </p>
                      </div>

                      {/* Avertissement */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700">
                            Analyse préliminaire uniquement. Consultez un dermatologue pour un diagnostic définitif.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simulation de toast
const toast = {
  error: (message: string) => console.error(message),
  info: (message: string) => console.log(message)
};