
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { Op } from "sequelize";
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

    // Récupérer l'utilisateur pour obtenir son email
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const userEmail = user.email;

    // Récupérer les rendez-vous liés au user_id OU à l'email (pour les rendez-vous créés avant la création du compte)
    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { user_id: userId },
          { email: userEmail, user_id: null } // Rendez-vous créés avec cet email avant la création du compte
        ]
      },
      order: [["requested_date", "DESC"]], // tri par date (plus récent en premier)
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'address',
        'birthdate',
        'requested_date',
        'status',
        'created_by',
        'user_id',
        'created_at',
        'updated_at'
      ]
    });

    // Si certains rendez-vous n'ont pas de user_id, les lier maintenant
    const appointmentsToLink = appointments.filter(apt => !apt.user_id);
    if (appointmentsToLink.length > 0) {
      await Promise.all(
        appointmentsToLink.map(apt => 
          apt.update({ user_id: userId })
        )
      );
      // Recharger les rendez-vous après la mise à jour
      const updatedAppointments = await Appointment.findAll({
        where: {
          [Op.or]: [
            { user_id: userId },
            { email: userEmail, user_id: null }
          ]
        },
        order: [["requested_date", "DESC"]],
        attributes: [
          'id',
          'name',
          'email',
          'phone',
          'address',
          'birthdate',
          'requested_date',
          'status',
          'notes',
          'created_by',
          'user_id',
          'created_at',
          'updated_at'
        ]
      });
      
      return res.json({
        success: true,
        data: updatedAppointments,
        count: updatedAppointments.length
      });
    }

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error("Erreur récupération rendez-vous patient:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
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

