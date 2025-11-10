import express from "express";
import { createAppointment, getAllAppointments , linkAppointmentsToUser} from "../controllers/appointmentController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/request", createAppointment);
router.get("/patient/link", verifyToken, linkAppointmentsToUser);

router.get("/all", verifyToken, authorizeRoles("secretary"), getAllAppointments);




export default router;
