
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
// Récupérer un patient par ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await User.findOne({ where: { id, role: "patient" } });

    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour un patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, birthdate } = req.body;

    const patient = await User.findOne({ where: { id, role: "patient" } });
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Mettre à jour seulement les champs fournis
    patient.name = name || patient.name;
    patient.email = email || patient.email;
    patient.phone = phone || patient.phone;
    patient.address = address || patient.address;
    patient.birthdate = birthdate || patient.birthdate;

    await patient.save();

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};







export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // récupéré par le middleware

    const appointments = await Appointment.findAll({
      where: { user_id: userId }, // ou patientId selon ton modèle
      order: [["requested_date", "ASC"]] // tri par date
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.findAll({ 
      where: { role: "patient" },
      attributes: { 
        exclude: ['password'] // Exclure le mot de passe
      },
      order: [['createdAt', 'DESC']] // Trier par date de création
    });

    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la récupération des patients" 
    });
  }
};

