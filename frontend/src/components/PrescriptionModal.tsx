import React from "react";
import { Button } from "@/components/ui/button";

interface Prescription {
  id: number;
  patientId: number;
  medications: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    name: string;
    birthdate?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

// Informations fixes de la clinique et du docteur
const CLINIC_INFO = {
  name: "Clinique Médicale DermaCare",
  phone: "73 288 345",
  address: "123 Avenue de la Santé, Tunis, Tunisie"
};

const DOCTOR_INFO = {
  name: "Dr. Yasmine Sghaier",
  specialty: "Dermatologue",
  rpps: "12345678901"
};

export default function PrescriptionModal({ isOpen, onClose, prescription }: Props) {
  if (!isOpen || !prescription) return null;

  // Calculer l'âge du patient
  const calculateAge = (birthdate?: string): number | null => {
    if (!birthdate) return null;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formater la date en français
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formater l'heure
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const patientAge = prescription.patient?.birthdate 
    ? calculateAge(prescription.patient.birthdate)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la clinique */}
        <div className="text-center mb-6 border-b pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="text-left">
              <h3 className="font-bold text-lg text-blue-800">{CLINIC_INFO.name}</h3>
              <p className="text-sm text-gray-600">{CLINIC_INFO.address}</p>
              <p className="text-sm text-gray-600">Tél: {CLINIC_INFO.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">N° Ordonnance: {prescription.id}</p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(prescription.createdAt)}
              </p>
              <p className="text-sm text-gray-600 text-xs">
                Heure: {formatTime(prescription.createdAt)}
              </p>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-wide">
            Ordonnance Médicale
          </h1>
        </div>

        {/* Informations patient */}
        <div className="mb-6 p-4 bg-gray-50 rounded-m">
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p>
                <strong className="text-gray-700">Patient (e)</strong> 
                <span className="ml-2 font-medium">
                  {prescription.patient?.name || "Patient ID: " + prescription.patientId}
                </span>
              </p>
  
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Âge:</strong> 
                <span className="ml-2">
                  {patientAge ? `${patientAge} ans` : "Non spécifié"}
                </span>
              </p>
              {prescription.patient?.birthdate && (
                <p>
                  <strong className="text-gray-700">Date de naissance:</strong> 
                  <span className="ml-2">
                    {formatDate(prescription.patient.birthdate)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations médecin */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-bold text-lg mb-2 text-blue-800">
            Médecin Prescripteur
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="font-semibold text-lg">{DOCTOR_INFO.name}</p>
              <p className="text-blue-700">{DOCTOR_INFO.specialty}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>N° RPPS: {DOCTOR_INFO.rpps}</p>
            </div>
          </div>
        </div>

        {/* Détails de la prescription */}
        <div className="mb-8">
          <h3 className="font-bold text-xl mb-4 text-gray-800 border-b-2 border-blue-200 pb-2">
            Prescription Médicale
          </h3>
          
          <div className="space-y-6">
            {/* Médicaments */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <strong className="text-lg text-gray-800">Médicaments Prescrits</strong>
              </div>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-line">
                {prescription.medications}
              </div>
            </div>
            
            {/* Posologie */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <strong className="block mb-2 text-blue-700">Dosage</strong>
                <div className="p-3 bg-blue-50 rounded text-center font-medium">
                  {prescription.dosage}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <strong className="block mb-2 text-blue-700">Fréquence</strong>
                <div className="p-3 bg-blue-50 rounded text-center font-medium">
                  {prescription.frequency}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <strong className="block mb-2 text-blue-700">Durée du Traitement</strong>
                <div className="p-3 bg-blue-50 rounded text-center font-medium">
                  {prescription.duration}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {prescription.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <strong className="text-lg text-gray-800">Instructions Spéciales</strong>
                </div>
                <div className="p-3 bg-white rounded border border-yellow-100 italic">
                  {prescription.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signature et informations additionnelles */}
        <div className="mt-10 pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div className="mb-4 md:mb-0">
         
         
            </div>
            
            <div className="text-center md:text-right">
              <div className="inline-block border-t-2 border-black pt-3 px-6">
                <p className="font-bold text-lg">{DOCTOR_INFO.name}</p>
                <p className="text-gray-700">{DOCTOR_INFO.specialty}</p>
                <p className="text-sm text-gray-600 mt-2">{CLINIC_INFO.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <Button 
            onClick={() => window.open(`http://localhost:5000/api/prescription/pdf/${prescription.id}`, "_blank")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 hover:bg-gray-50"
          >
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}