import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Tentative de login: ${email}`);
    console.log(`🔑 Mot de passe reçu: ${password}`);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    console.log(`✅ Utilisateur trouvé: ${user.email}`);
    console.log(`🔐 Hash dans la base: ${user.password}`);
    console.log(`📏 Longueur du hash: ${user.password.length}`);

    console.log('🔑 Début comparaison bcrypt...');
    const validPass = await bcrypt.compare(password, user.password);
    console.log(`✅ Résultat bcrypt.compare: ${validPass}`);

    if (!validPass) {
      console.log('❌ Mot de passe incorrect');
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('🎉 Login réussi, token généré');

    res.status(200).json({
      message: "Connexion réussie",
      token,
      role: user.role 
    });

  } catch (error) {
    console.error('💥 Erreur dans login:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
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
    const appointment = await Appointment.findOne({ where: { email } });
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
      birthday: appointment.birthday,
      address: appointment.address,
    });

    // Marquer le rendez-vous comme "inscription terminée"
    appointment.is_registered = true;
    await appointment.save();

    return res.status(201).json({
      message: "Compte patient créé avec succès.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error("Erreur inscription depuis rendez-vous:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création du compte.",
      error: error.message,
    });
  }
};