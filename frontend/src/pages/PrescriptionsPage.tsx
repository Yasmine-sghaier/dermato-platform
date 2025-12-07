import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrescriptionModal from "@/components/PrescriptionModal";
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
  patient: {
    name: string;
    birthdate: string;
    phone: string;
    address: string;
  };
}

const PrescriptionsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token") || "";
      
      const res = await fetch(
        `http://localhost:5000/api/prescription/list/${patientId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      console.log("Données reçues:", data);
      
      if (Array.isArray(data)) {
        setPrescriptions(data);
      } else if (data.success && Array.isArray(data.data)) {
        setPrescriptions(data.data);
      } else if (data.data && Array.isArray(data.data)) {
        setPrescriptions(data.data);
      } else {
        throw new Error("Format de données inattendu");
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération des prescriptions:", err);
      setError(err.message || "Erreur lors du chargement des prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
    }
  }, [patientId]);

  const downloadPdf = async (id: number) => {
    try {
      const token = localStorage.getItem("token") || "";
      
      const response = await fetch(`http://localhost:5000/api/prescription/pdf/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordonnance-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const openModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPrescription(null);
    setIsModalOpen(false);
  };

  const handleCreatePrescription = () => {
    navigate(`/create-prescription/${patientId}`);
  };

  const handleEditPrescription = (prescriptionId: number) => {
    navigate(`/edit-prescription/${prescriptionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Espace fixe pour compenser la navbar - Solution recommandée */}
      <div className="h-16"></div> {/* Cette div compense la hauteur de la navbar fixe */}
      
      {/* En-tête de la page */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Prescriptions du patient #{patientId}
              </h1>
              {prescriptions.length > 0 && (
                <p className="text-gray-600 mt-1">
                  Patient: {prescriptions[0]?.patient?.name || "Non spécifié"}
                </p>
              )}
            </div>
            
            <Button
              onClick={handleCreatePrescription}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-md px-6 py-2.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des prescriptions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Erreur de chargement</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchPrescriptions}
              className="mt-4 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white mt-4">
            <svg className="mx-auto h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">Aucune prescription</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Ce patient n'a pas encore de prescriptions médicales enregistrées.
            </p>
            <Button
              onClick={handleCreatePrescription}
              className="mt-8 bg-green-600 hover:bg-green-700 flex items-center gap-2 mx-auto px-6 py-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer la première prescription
            </Button>
          </div>
        )}

        {!loading && !error && prescriptions.length > 0 && (
          <>
            {/* Résumé */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total des prescriptions</p>
                      <p className="text-3xl font-bold text-blue-900">{prescriptions.length}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block h-12 w-px bg-blue-200"></div>
                  
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Dernière prescription:</p>
                    <p className="font-semibold text-lg">
                      {new Date(prescriptions[0].createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleCreatePrescription}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une prescription
                </Button>
              </div>
            </div>

            {/* Liste des prescriptions */}
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-4">
                        <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-2 rounded-full">
                          Prescription #{prescription.id}
                        </div>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                          {new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="mb-5">
                        <div className="text-gray-700 mb-3">
                          <span className="font-medium text-gray-900">Médicaments:</span>
                          <span className="ml-2">{prescription.medications}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Durée:</span>
                            <span className="ml-1">{prescription.duration}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Fréquence:</span>
                            <span className="ml-1">{prescription.frequency}</span>
                          </div>
                        </div>
                        
                        {prescription.notes && (
                          <div className="mt-3 flex items-start">
                            <svg className="w-4 h-4 mr-1.5 mt-0.5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600 italic">
                              <span className="font-medium">Instructions:</span> {prescription.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => openModal(prescription)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Détails
                      </button>
                      
                      <button
                        onClick={() => handleEditPrescription(prescription.id)}
                        className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                      
                      <button
                        onClick={() => downloadPdf(prescription.id)}
                        className="px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Télécharger PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Prescription */}
        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          prescription={selectedPrescription}
        />
      </div>
    </div>
  );
};

export default PrescriptionsPage;