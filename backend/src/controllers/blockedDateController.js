// controllers/blockedDateController.js
import BlockedDate from "../models/BlockedDate.js";
import { Op } from "sequelize";

// Créer un jour bloqué
export const createBlockedDate = async (req, res) => {
  try {
    const { blocked_date, reason, dates } = req.body;
    const created_by = req.user?.id;

    // Si plusieurs dates sont fournies, utiliser la fonction de blocage multiple
    if (dates && Array.isArray(dates) && dates.length > 0) {
      return createMultipleBlockedDates(req, res);
    }

    if (!blocked_date) {
      return res.status(400).json({
        success: false,
        message: "La date est requise"
      });
    }

    // Vérifier si la date est déjà bloquée
    const existing = await BlockedDate.findOne({
      where: { blocked_date }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Cette date est déjà bloquée"
      });
    }

    // Vérifier que la date n'est pas dans le passé
    const dateObj = new Date(blocked_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      return res.status(400).json({
        success: false,
        message: "Impossible de bloquer une date passée"
      });
    }

    const blockedDate = await BlockedDate.create({
      blocked_date,
      reason: reason || 'Congé médecin',
      created_by
    });

    res.status(201).json({
      success: true,
      message: "Date bloquée avec succès",
      data: blockedDate
    });

  } catch (error) {
    console.error("Erreur création jour bloqué:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Créer plusieurs jours bloqués en une seule fois
export const createMultipleBlockedDates = async (req, res) => {
  try {
    const { dates, reason } = req.body;
    const created_by = req.user?.id;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Un tableau de dates est requis"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Valider et filtrer les dates
    const validDates = [];
    const invalidDates = [];
    const alreadyBlocked = [];

    for (const dateStr of dates) {
      const dateObj = new Date(dateStr);
      
      // Vérifier que la date n'est pas dans le passé
      if (dateObj < today) {
        invalidDates.push(dateStr);
        continue;
      }

      // Vérifier si la date est déjà bloquée
      const existing = await BlockedDate.findOne({
        where: { blocked_date: dateStr }
      });

      if (existing) {
        alreadyBlocked.push(dateStr);
        continue;
      }

      validDates.push(dateStr);
    }

    // Créer les dates bloquées
    const blockedDates = [];
    for (const dateStr of validDates) {
      const blockedDate = await BlockedDate.create({
        blocked_date: dateStr,
        reason: reason || 'Congé médecin',
        created_by
      });
      blockedDates.push(blockedDate);
    }

    res.status(201).json({
      success: true,
      message: `${blockedDates.length} date(s) bloquée(s) avec succès`,
      data: blockedDates,
      stats: {
        total: dates.length,
        created: blockedDates.length,
        alreadyBlocked: alreadyBlocked.length,
        invalid: invalidDates.length
      },
      alreadyBlocked,
      invalidDates
    });

  } catch (error) {
    console.error("Erreur création jours bloqués multiples:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Récupérer tous les jours bloqués
export const getBlockedDates = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = {};

    // Filtrer par période si fournie
    if (start_date && end_date) {
      whereClause.blocked_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.blocked_date = {
        [Op.gte]: start_date
      };
    }

    const blockedDates = await BlockedDate.findAll({
      where: whereClause,
      order: [['blocked_date', 'ASC']]
    });

    res.json({
      success: true,
      data: blockedDates,
      count: blockedDates.length
    });

  } catch (error) {
    console.error("Erreur récupération jours bloqués:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Vérifier si une date est bloquée
export const checkDateBlocked = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "La date est requise"
      });
    }

    const blockedDate = await BlockedDate.findOne({
      where: { blocked_date: date }
    });

    res.json({
      success: true,
      isBlocked: !!blockedDate,
      data: blockedDate
    });

  } catch (error) {
    console.error("Erreur vérification date bloquée:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Supprimer un jour bloqué
export const deleteBlockedDate = async (req, res) => {
  try {
    const { id } = req.params;

    const blockedDate = await BlockedDate.findByPk(id);

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: "Date bloquée non trouvée"
      });
    }

    await blockedDate.destroy();

    res.json({
      success: true,
      message: "Date débloquée avec succès"
    });

  } catch (error) {
    console.error("Erreur suppression jour bloqué:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Supprimer un jour bloqué par date
export const deleteBlockedDateByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "La date est requise"
      });
    }

    const blockedDate = await BlockedDate.findOne({
      where: { blocked_date: date }
    });

    if (!blockedDate) {
      return res.status(404).json({
        success: false,
        message: "Date bloquée non trouvée"
      });
    }

    await blockedDate.destroy();

    res.json({
      success: true,
      message: "Date débloquée avec succès"
    });

  } catch (error) {
    console.error("Erreur suppression jour bloqué:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

