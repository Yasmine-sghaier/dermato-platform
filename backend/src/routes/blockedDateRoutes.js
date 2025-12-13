// routes/blockedDateRoutes.js
import express from "express";
import {
  createBlockedDate,
  createMultipleBlockedDates,
  getBlockedDates,
  checkDateBlocked,
  deleteBlockedDate,
  deleteBlockedDateByDate
} from "../controllers/blockedDateController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

// Seules les secrétaires peuvent créer/supprimer des jours bloqués
router.post("/", authorizeRoles("secretary"), createBlockedDate);
router.post("/multiple", authorizeRoles("secretary"), createMultipleBlockedDates);
router.delete("/:id", authorizeRoles("secretary"), deleteBlockedDate);
router.delete("/date/:date", authorizeRoles("secretary"), deleteBlockedDateByDate);

// Tous les utilisateurs authentifiés peuvent voir les jours bloqués
router.get("/", getBlockedDates);
router.get("/check/:date", checkDateBlocked);

export default router;

