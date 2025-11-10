
import User from "../models/User.js";

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


import Appointment from "../models/Appointment.js";
import User from "../models/User.js";


export const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await Appointment.findAll({
      where: {
        user_id: userId
      },
      order: [['requested_date', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'] // Spécifiez les attributs que vous voulez
      }]
    });

    res.json(appointments);

  } catch (error) {
    console.error("Erreur récupération RDV patient:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message
    });
  }
};

