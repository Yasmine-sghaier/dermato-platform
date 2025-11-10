import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
   

    const user = await User.findOne({ where: { email } });

    if (!user) {
     
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }


    const validPass = await bcrypt.compare(password, user.password);
   

    if (!validPass) {
     
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('Login réussi, token généré');

    res.status(200).json({
      message: "Connexion réussie",
      token,
      role: user.role ,
       user: { //
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(' Erreur dans login:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
// controllers/authController.js
export const registerFromAppointment = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token et mot de passe requis." });
    }

    // Décoder et vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, name } = decoded;

    // Vérifier si un utilisateur existe déjà avec cet email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Un compte existe déjà avec cet email." });
    }

    // Trouver le rendez-vous correspondant
    const appointment = await Appointment.findOne({ 
      where: { email },
      order: [['created_at', 'DESC']] // Prendre le plus récent
    });
    
    if (!appointment) {
      return res.status(404).json({ message: "Aucun rendez-vous associé à cet email." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouveau user
    const newUser = await User.create({
      name: appointment.name,
      email: appointment.email,
      password: hashedPassword,
      phone: appointment.phone,
      birthdate: appointment.birthdate,
      address: appointment.address,
      role: 'patient'
    });

    // Lier TOUS les rendez-vous de cet email au nouvel utilisateur
    const linkedAppointments = await Appointment.update(
      { user_id: newUser.id },
      { 
        where: { 
          email: email,
          user_id: null 
        } 
      }
    );

    return res.status(201).json({
      message: "Compte patient créé avec succès.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      appointments_linked: linkedAppointments[0] // Nombre de RDV liés
    });

  } catch (error) {
    console.error("Erreur inscription depuis rendez-vous:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création du compte.",
      error: error.message,
    });
  }
};