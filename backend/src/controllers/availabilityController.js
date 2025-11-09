
import Appointment from "../models/Appointment.js";
import { Op } from "sequelize";

const WORKING_HOURS = {
  start: 9, 
  end: 17,  
  breakStart: 12, 
  breakEnd: 14
};

const WORKING_DAYS = [1, 2, 3, 4, 5]; // (0 = sunday)

const SLOT_DURATION = 30; 

// all available  dates 
export const getAvailableDates = async (req, res) => {
  try {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const availableDates = [];

    // available  dates for 3 next  month 
    for (let d = new Date(today); d <= threeMonthsLater; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      
    
      if (WORKING_DAYS.includes(dayOfWeek)) {
        availableDates.push(d.toISOString().split('T')[0]);
      }
    }

    res.json({
      success: true,
      availableDates,
      minDate: today.toISOString().split('T')[0],
      maxDate: threeMonthsLater.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error("Erreur récupération dates:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// Retrieve available time slots for a date
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: "Date requise" 
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    
    if (!WORKING_DAYS.includes(dayOfWeek)) {
      return res.json({
        success: true,
        date,
        availableSlots: [],
        message: "Jour non ouvré"
      });
    }

    // check if it is a past date
    const today = new Date();
    if (selectedDate < new Date(today.toISOString().split('T')[0])) {
      return res.json({
        success: true,
        date,
        availableSlots: [],
        message: "Date passée"
      });
    }

    // fetch appointments  for this date
    const appointments = await Appointment.findAll({
      where: {
        requested_date: {
          [Op.between]: [
            new Date(date + 'T00:00:00'),
            new Date(date + 'T23:59:59')
          ]
        },
        status: {
          [Op.notIn]: ['canceled']
        }
      },
      attributes: ['requested_date']
    });

    // Convertir les rendez-vous en heures pour vérification
    const bookedSlots = appointments.map(apt => 
      new Date(apt.requested_date).toTimeString().substring(0, 5)
    );

    // Générer tous les créneaux possibles pour la journée
    const allSlots = [];
    let currentHour = WORKING_HOURS.start;
    
    while (currentHour < WORKING_HOURS.end) {
      // Gérer la pause déjeuner
      if (currentHour >= WORKING_HOURS.breakStart && currentHour < WORKING_HOURS.breakEnd) {
        currentHour = WORKING_HOURS.breakEnd;
        continue;
      }

      for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(`${date}T${timeString}`);
        
        // Ne pas inclure les créneaux passés
        if (slotDateTime > new Date()) {
          allSlots.push(timeString);
        }
      }
      currentHour++;
    }

    // Filtrer les créneaux déjà réservés
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      date,
      availableSlots,
      totalSlots: availableSlots.length,
      bookedSlotsCount: bookedSlots.length
    });

  } catch (error) {
    console.error("Erreur récupération créneaux:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// Vérifier la disponibilité d'un créneau spécifique
export const checkSlotAvailability = async (req, res) => {
  try {
    const { date, time } = req.params;

    if (!date || !time) {
      return res.status(400).json({ 
        success: false,
        message: "Date et heure requises" 
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Vérifier si c'est un jour ouvré
    if (!WORKING_DAYS.includes(dayOfWeek)) {
      return res.json({
        success: true,
        available: false,
        reason: "Jour non ouvré"
      });
    }

    // Vérifier si l'heure est dans les horaires de travail
    const [hours, minutes] = time.split(':').map(Number);
    if (hours < WORKING_HOURS.start || hours >= WORKING_HOURS.end) {
      return res.json({
        success: true,
        available: false,
        reason: "Hors horaires de travail"
      });
    }

    // Vérifier la pause déjeuner
    if (hours >= WORKING_HOURS.breakStart && hours < WORKING_HOURS.breakEnd) {
      return res.json({
        success: true,
        available: false,
        reason: "Pause déjeuner"
      });
    }

    // Vérifier si le créneau n'est pas déjà pris
    const appointment = await Appointment.findOne({
      where: {
        requested_date: {
          [Op.between]: [
            new Date(`${date}T${time}:00`),
            new Date(`${date}T${time}:59`)
          ]
        },
        status: {
          [Op.notIn]: ['canceled']
        }
      }
    });

    const isAvailable = !appointment;

    res.json({
      success: true,
      available: isAvailable,
      date,
      time,
      reason: isAvailable ? "Créneau disponible" : "Créneau déjà réservé"
    });

  } catch (error) {
    console.error("Erreur vérification créneau:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};