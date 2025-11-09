import Appointment from "../models/Appointment.js";
import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";


// Fonction d'envoi d'email
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Mot de passe d'application
      }
    });

    const mailOptions = {
      from: `"Cabinet DermaCare" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: process.env.EMAIL_USER
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error);
    throw error;
  }
};


export const confirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable." });
    }

 
    if (appointment.status === "confirmed") {
      return res.status(400).json({ message: "Ce rendez-vous est déjà confirmé." });
    }

   
    const token = jwt.sign(
      { 
        email: appointment.email,
        name: appointment.name,
        appointmentId: appointment.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  
    appointment.status = "confirmed";
    appointment.confirmation_token = token;
    await appointment.save();

    // Lien d'inscription
    const registrationLink = `http://localhost:5173/create-account/${token}`;

    // Email de confirmation
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E8B57;">Confirmation de votre rendez-vous</h2>
        
        <p>Bonjour <strong>${appointment.name}</strong>,</p>
        
        <p>Votre rendez-vous au <strong>Cabinet DermaCare</strong> a été confirmé avec succès.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2E8B57; margin-top: 0;">📅 Détails du rendez-vous :</h3>
          <p><strong>Date et heure :</strong> ${new Date(appointment.requested_date).toLocaleString('fr-FR')}</p>
          <p><strong>Patient :</strong> ${appointment.name}</p>
          <p><strong>Email :</strong> ${appointment.email}</p>
          <p><strong>Téléphone :</strong> ${appointment.phone}</p>
        </div>

        <p>Pour finaliser votre inscription et accéder à votre espace patient, veuillez créer votre compte :</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${registrationLink}" 
             style="background-color: #2E8B57; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Créer mon compte patient
          </a>
        </div>

        <p><strong>Important :</strong> Ce lien expirera dans 7 jours.</p>
        
        <p>En cas de problème, contactez-nous au :<br>
        📞 01 23 45 67 89<br>
        📧 ${process.env.EMAIL_USER}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Cabinet DermaCare<br>
          Votre santé dermatologique, notre priorité
        </p>
      </div>
    `;

    // Envoyer l'email
    await sendEmail(
      appointment.email,
      "✅ Confirmation de votre rendez-vous dermatologique",
      emailHtml
    );

    res.json({ 
      message: "Rendez-vous confirmé et email envoyé avec succès.",
      appointment: {
        id: appointment.id,
        name: appointment.name,
        email: appointment.email,
        requested_date: appointment.requested_date,
        status: appointment.status
      }
    });

  } catch (error) {
    console.error("❌ Erreur confirmation RDV:", error);
    res.status(500).json({ 
      message: "Erreur lors de la confirmation du rendez-vous", 
      error: error.message 
    });
  }
};
