import Appointment from "../models/Appointment.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

export const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous introuvable." });


    const token = jwt.sign(
      { email: appointment.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    appointment.status = "confirmed";
    appointment.confirmationToken = token;
    await appointment.save();

  
    const link = `http://localhost:3000/register?token=${token}`;
    await sendEmail(
      appointment.email,
      "Confirmation de votre rendez-vous dermatologique",
      `
        <p>Bonjour ${appointment.name},</p>
        <p>Votre rendez-vous est confirmé ! Cliquez sur le lien ci-dessous pour créer votre compte :</p>
        <a href="${link}">${link}</a>
      `
    );

    res.json({ message: "Rendez-vous confirmé et email envoyé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
