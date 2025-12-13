import express from "express";
import { createAppointment, getAllAppointments , linkAppointmentsToUser} from "../controllers/appointmentController.js";
import { verifyToken, authorizeRoles, authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route pour créer un rendez-vous (authentification optionnelle)
// Si l'utilisateur est connecté, on utilise authenticateUser qui ne bloque pas si pas de token
router.post("/request", authenticateUser, createAppointment);
router.get("/patient/link", verifyToken, linkAppointmentsToUser);

router.get("/all", verifyToken, authorizeRoles("secretary"), getAllAppointments);




export default router;
