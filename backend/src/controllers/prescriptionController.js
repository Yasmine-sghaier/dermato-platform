import Prescription from "../models/Prescription.js";
import User from "../models/User.js";

export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, dosage, frequency, duration, notes } = req.body;

    // Vérifier que patientId est présent
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId est requis"
      });
    }

    // Vérifier que le patient existe et est bien un patient
    const patient = await User.findOne({ where: { id: patientId, role: 'patient' } });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient introuvable ou rôle invalide"
      });
    }

    // Création de la prescription
    const prescription = await Prescription.create({
      patientId,
      medications,
      dosage,
      frequency,
      duration,
      notes: notes || ""    // notes optionnel
    });

    res.status(201).json({
      success: true,
      message: "Prescription créée avec succès",
      data: prescription
    });

  } catch (err) {
    console.error("Erreur création prescription:", err);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
};


export const  getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.findAll({
      where: { patientId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
