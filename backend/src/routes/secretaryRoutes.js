import express from "express";
import { confirmAppointment ,createAppointmentForPatient} from "../controllers/secretaryController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/confirm/:id",
  verifyToken,
  authorizeRoles("secretary"),
  confirmAppointment
);

router.post("/appointments/create", verifyToken, authorizeRoles("secretary"), createAppointmentForPatient);

export default router;
