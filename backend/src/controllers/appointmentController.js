import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, birthDate, date, time } = req.body;

    if (!firstName || !lastName || !email || !phone || !date || !time) {
      return res.status(400).json({ 
        message: "Champs manquants", 
        required: ["firstName", "lastName", "email", "phone", "date", "time"]
      });
    }

    // Vérifier si l'utilisateur est connecté
    const userId = req.user?.id; // Depuis le token JWT
    const createdBy = userId ? "patient" : "patient";

    // Si l'utilisateur est connecté, vérifier s'il existe
    let user = null;
    if (userId) {
      user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    }

    const appointmentDateTime = new Date(`${date}T${time}`);
    
    const appointment = await Appointment.create({
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      address: address || null,
      birthdate: birthDate || null,
      requested_date: appointmentDateTime,
      user_id: userId || null, // Lier au user si connecté, sinon null
      created_by: createdBy,
      status: "pending"
    });

    res.status(201).json({ 
      message: "Demande de rendez-vous enregistrée", 
      appointment: {
        id: appointment.id,
        name: appointment.name,
        email: appointment.email,
        requested_date: appointment.requested_date,
        status: appointment.status,
        created_by: appointment.created_by,
        user_id: appointment.user_id
      }
    });
  } catch (error) {
    console.error("Erreur création RDV:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message
    });
  }
};

// controllers/appointmentController.js
export const linkAppointmentsToUser = async (req, res) => {
  try {
    const userId = req.user.id; // L'utilisateur qui vient de créer son compte
    const { email } = req.user; // Email de l'utilisateur

    // Trouver tous les rendez-vous avec cet email qui n'ont pas encore de user_id
    const appointments = await Appointment.findAll({
      where: {
        email: email,
        user_id: null
      }
    });

    // Lier ces rendez-vous à l'utilisateur
    const updatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        return await appointment.update({
          user_id: userId
        });
      })
    );

    res.json({
      message: `${updatedAppointments.length} rendez-vous liés à votre compte`,
      appointments: updatedAppointments.length
    });

  } catch (error) {
    console.error("Erreur liaison RDV:", error);
    res.status(500).json({ 
      message: "Erreur lors de la liaison des rendez-vous", 
      error: error.message
    });
  }
};

export const getAllAppointments = async (req, res) => {
  const pending = await Appointment.findAll();
  res.json(pending);
};


