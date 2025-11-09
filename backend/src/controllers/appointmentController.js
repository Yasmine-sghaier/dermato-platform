import Appointment from "../models/Appointment.js";

export const createAppointment = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      address, 
      birthDate, 
      date, 
      time,
      email 
    } = req.body;

   
    if (!firstName || !lastName || !phone || !date || !time) {
      return res.status(400).json({ 
        message: "Champs manquants", 
        required: ["firstName", "lastName", "phone", "date", "time"],
        received: req.body
      });
    }

    // Combiner date et time pour créer requested_date
    const appointmentDateTime = new Date(`${date}T${time}`);
    
    // Validation de la date
    if (isNaN(appointmentDateTime.getTime())) {
      return res.status(400).json({ 
        message: "Date ou heure invalide" 
      });
    }

    // Vérifier que la date n'est pas dans le passé
    const now = new Date();
    if (appointmentDateTime < now) {
      return res.status(400).json({ 
        message: "La date du rendez-vous ne peut pas être dans le passé" 
      });
    }

    const appointment = await Appointment.create({
      name: `${firstName} ${lastName}`.trim(),
      email: email || null, // Optionnel dans le nouveau formulaire
      phone,
      address: address || null,
      birthdate: birthDate || null,
      requested_date: appointmentDateTime, 
      status: "pending"
    });
    
    res.status(201).json({ 
      message: "Rendez-vous créé avec succès", 
      appointment: {
        id: appointment.id,
        firstName: firstName,
        lastName: lastName,
        fullName: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        address: appointment.address,
        birthDate: appointment.birthdate,
        appointmentDate: date,
        appointmentTime: time,
        requested_date: appointment.requested_date,
        status: appointment.status,
        created_at: appointment.created_at 
      }
    });
  } catch (error) {
    console.error("Erreur création RDV:", error);
    
    // Gestion des erreurs de contrainte unique
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: "Un rendez-vous existe déjà pour cette date et heure" 
      });
    }
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: "Erreur de validation des données",
        errors: validationErrors
      });
    }
    
    res.status(500).json({ 
      message: "Erreur serveur lors de la création du rendez-vous", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllAppointments = async (req, res) => {
  const pending = await Appointment.findAll();
  res.json(pending);
};


