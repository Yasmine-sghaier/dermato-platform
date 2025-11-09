import Appointment from "../models/Appointment.js";
import crypto from "crypto";
import nodemailer from "nodemailer";


export const createAppointment = async (req, res) => {
  try {
    const { name, email, phone, address, birthdate, requested_date } = req.body;

   
    if (!name || !email || !phone || !requested_date) {
      return res.status(400).json({ 
        message: "Champs manquants", 
        required: ["name", "email", "phone", "requested_date"],
        received: req.body
      });
    }

    const appointment = await Appointment.create({
      name,
      email,
      phone,
      address: address || null,
      birthdate: birthdate || null,
      requested_date, 
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
        created_at: appointment.created_at 
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


export const getPendingAppointments = async (req, res) => {
  const pending = await Appointment.findAll({ where: { status: "pending" } });
  res.json(pending);
};

export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ message: "Rendez-vous introuvable" });


    const token = crypto.randomBytes(20).toString("hex");
    appointment.status = "confirmed";
    appointment.confirmationToken = token;
    await appointment.save();


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

       const registrationLink = `http://localhost:5173/create-account/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: appointment.email,
      subject: "Confirmation de votre rendez-vous dermatologique",
      html: `
        <h2>Bonjour ${appointment.name},</h2>
        <p>Votre rendez-vous du ${appointment.requestedDate} a été confirmé.</p>
        <p>Veuillez créer votre compte pour accéder à votre espace patient :</p>
        <a href="${registrationLink}">Créer mon compte</a>
      `
    });

    res.json({ message: "Rendez-vous confirmé et e-mail envoyé", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
