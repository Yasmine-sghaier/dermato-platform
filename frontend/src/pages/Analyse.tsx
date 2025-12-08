import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Brain, AlertTriangle, Check, X, Zap, Shield, Pill, FileText, Stethoscope, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SkinAiAnalyzer() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    diagnosis: string;
    full_name: string;
    confidence: number;
    description: string;  
    causes?: string;
    recommendations: string;
    emergency: string;
    severity: "low" | "medium" | "high";
    color?: string;
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

    const formData = new FormData();
    formData.append("image", image);
    formData.append("symptoms", JSON.stringify(selectedSymptoms));

    try {
      const res = await fetch("http://localhost:5000/api/ai/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      console.log("Données reçues:", data);
      
      // Normaliser les données pour correspondre au format attendu
      const normalizedData = {
        diagnosis: data.diagnosis || "Non déterminé",
        full_name: data.full_name || data.diagnosis,
        confidence: data.confidence || 0,
        description: data.description || "",
        causes: data.causes || "Non spécifié",
        recommendations: data.recommendations || data.recommendation || "Aucune recommandation disponible",
        emergency: data.emergency || "NON URGENT",
        severity: data.severity || 
                 (data.emergency?.includes('URGENT') ? 'high' : 
                  data.emergency?.includes('SURVEILLANCE') ? 'low' : 'medium'),
        color: data.color || "#3b82f6"
      };
      
      setResult(normalizedData);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'analyse IA");
    }

    setLoading(false);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "low": return { color: "bg-green-500", text: "Faible urgence", variant: "secondary" as const };
      case "medium": return { color: "bg-yellow-500", text: "Consultation recommandée", variant: "secondary" as const };
      case "high": return { color: "bg-red-500", text: "Urgence médicale", variant: "destructive" as const };
      default: return { color: "bg-gray-500", text: "Non évalué", variant: "secondary" as const };
    }
  };

  const formatTextWithBullets = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('•') || line.startsWith('✓') || line.startsWith('⚠️')) {
        return (
          <div key={index} className="flex items-start my-1">
            <span className="mr-2 mt-0.5">{line.charAt(0)}</span>
            <span>{line.substring(1)}</span>
          </div>
        );
      }
      return (
        <div key={index} className="my-1">
          {line}
        </div>
      );
    });
  };

  const resetAnalysis = () => {
    setImage(null);
    setPreview(null);
    setSelectedSymptoms([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full mb-4 shadow-lg">
            <Brain className="h-6 w-6" />
            <span className="text-lg font-semibold">Analyse Dermatologique par IA</span>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Téléchargez une photo de votre lésion cutanée pour obtenir un diagnostic préliminaire complet
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Section gauche - Upload et symptômes */}
          <div className="space-y-6">
            {/* Upload d'image */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl">Photo de la lésion</div>
                    <CardDescription className="text-blue-700">
                      Téléchargez une photo claire de la zone concernée
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div
                  className="border-3 border-dashed border-blue-200 rounded-2xl p-8 text-center cursor-pointer bg-white hover:bg-blue-50/50 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Aperçu"
                          className="w-full h-64 object-cover rounded-xl shadow-lg border-4 border-white"
                        />
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-200">
                          <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Image prête pour analyse
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button 
                          variant="outline" 
                          onClick={(e) => { e.stopPropagation(); resetAnalysis(); }} 
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                        <Button 
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Changer
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6 py-8">
                      <div className="h-24 w-24 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                        <Camera className="h-12 w-12 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg mb-2">Ajouter une photo</p>
                        <p className="text-gray-600 mb-6">JPG, PNG - Taille maximum 5MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Choisir un fichier
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

 
          </div>

          {/* Section droite - Analyse et résultats */}
          <div className="space-y-6">
            {/* Bouton d'analyse */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-emerald-50 to-green-50">
              <CardContent className="p-8">
                <Button
                  onClick={handleAnalyze}
                  disabled={!image || loading}
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      <span className="animate-pulse">Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-6 w-6" />
                      Lancer l'analyse IA
                    </>
                  )}
                </Button>
                {!image && (
                  <p className="text-center text-gray-600 mt-4">
                    <Upload className="h-4 w-4 inline mr-2" />
                    Téléchargez d'abord une photo pour commencer l'analyse
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Résultats */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-2xl border-0 overflow-hidden">
                    {/* Header du diagnostic */}
                    <div 
                      className="p-6 text-white"
                      style={{ backgroundColor: result.color || '#3b82f6' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                            <Brain className="h-3 w-3 mr-1" />
                            Diagnostic IA
                          </Badge>
                          <h2 className="text-2xl font-bold mb-1">
                            {result.full_name}
                          </h2>
                          
                         
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-6">
                 

                      {/* Section 2: Description */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900"> Description</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {formatTextWithBullets(result.description)}
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Causes (si disponible) */}
                      {result.causes && result.causes !== "Non spécifié" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Causes principales</h3>
                          </div>
                          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <div className="text-amber-800 leading-relaxed whitespace-pre-line">
                              {formatTextWithBullets(result.causes)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Recommandations */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900"> Recommandations</h3>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <div className="text-green-800 leading-relaxed whitespace-pre-line">
                            {formatTextWithBullets(result.recommendations)}
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Urgence */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">⚠️ Urgence</h3>
                        </div>
                        <div className={`p-4 rounded-xl border ${
                          result.severity === "high" 
                            ? "bg-red-50 border-red-200 animate-pulse" 
                            : result.severity === "medium"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        }`}>
                          <div className="flex items-start">
                            {result.severity === "high" && <span className="text-2xl mr-3">🚨</span>}
                            <div>
                              <p className="font-semibold text-gray-800">
                                {result.emergency.includes('URGENT') 
                                  ? result.emergency
                                  : 'Si les symptômes persistent ou s\'aggravent, consultez un dermatologue.'}
                              </p>
                              {result.severity === "high" && (
                                <p className="text-red-700 text-sm mt-2">
                                  Consultation dermatologique urgente recommandée dans les plus brefs délais.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      size="lg"
      onClick={() => navigate("/appointments")} // Redirection ici
    >
      <Stethoscope className="h-5 w-5 mr-2" />
      Prendre RDV avec un dermatologue
    </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                            size="lg"
                          >
                            Télécharger le rapport
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-800"
                            onClick={resetAnalysis}
                          >
                            Nouvelle analyse
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-4">
                          Cette analyse est fournie à titre informatif uniquement et ne remplace pas une consultation médicale professionnelle.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message lorsque pas de résultat */}
            {!result && image && !loading && (
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Prêt pour l'analyse
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur "Lancer l'analyse IA" pour obtenir un diagnostic complet de votre lésion cutanée.
                  </p>
                </CardContent>
              </Card>
            )}
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