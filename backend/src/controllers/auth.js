import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: "Utilisateur introuvable." });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: "Mot de passe incorrect." });

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      role: user.role 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const registerFromToken = async (req, res) => {
  try {
    const { token, password } = req.body;

    const appointment = await Appointment.findOne({ where: { confirmationToken: token } });
    if (!appointment) return res.status(400).json({ message: "Token invalide ou expiré" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: appointment.name,
      email: appointment.email,
      password: hashed,
      role: "patient"
    });

    appointment.confirmationToken = null;
    await appointment.save();

    res.json({ message: "Compte patient créé avec succès", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};