import express from "express";
import { createAppointment, getPendingAppointments, confirmAppointment } from "../controllers/appointmentController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/request", createAppointment);


router.get("/pending", verifyToken, authorizeRoles("secretary"), getPendingAppointments);


router.post("/confirm/:id", verifyToken, authorizeRoles("secretary"), confirmAppointment);

export default router;
