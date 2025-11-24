import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, FileText } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionPopupProps {
  patient: {
    id: number;
    name: string;
    age: number | string;
    condition: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescription: any) => void;
}

export default function PrescriptionPopup({ patient, isOpen, onClose, onSave }: PrescriptionPopupProps) {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [instructions, setInstructions] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now().toString(), name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSave = () => {
    const prescription = {
      patientId: patient.id,
      patientName: patient.name,
      date,
      medications: medications.filter(med => med.name.trim() !== ''),
      instructions,
      status: 'active'
    };
    
    onSave(prescription);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setMedications([{ id: '1', name: '', dosage: '', frequency: '', duration: '' }]);
    setInstructions('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Nouvelle Prescription
            </CardTitle>
            <CardDescription>
              Pour {patient.name} - {patient.condition}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informations patient */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Patient</Label>
              <p className="font-semibold">{patient.name}</p>
            </div>
         
            <div>
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Médicaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Médicaments</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Médicament
              </Button>
            </div>

            {medications.map((medication, index) => (
              <div key={medication.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Médicament {index + 1}</Badge>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(medication.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`med-name-${medication.id}`}>Nom du médicament *</Label>
                    <Input
                      id={`med-name-${medication.id}`}
                      placeholder="Paracétamol"
                      value={medication.name}
                      onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dosage-${medication.id}`}>Dosage *</Label>
                    <Input
                      id={`dosage-${medication.id}`}
                      placeholder="500mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`frequency-${medication.id}`}>Fréquence *</Label>
                    <Input
                      id={`frequency-${medication.id}`}
                      placeholder="3 fois par jour"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`duration-${medication.id}`}>Durée *</Label>
                    <Input
                      id={`duration-${medication.id}`}
                      placeholder="7 jours"
                      value={medication.duration}
                      onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions supplémentaires</Label>
            <Textarea
              id="instructions"
              placeholder="Instructions particulières pour le patient..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Générer l'Ordonnance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}