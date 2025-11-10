
import express from "express";
import { getPatientById, updatePatient } from "../controllers/patientController.js";

const router = express.Router();

// GET /api/patients/:id
router.get("/:id", getPatientById);

// PUT /api/patients/:id
router.put("/:id", updatePatient);



import { getPatientAppointments } from "../controllers/patientController.js";
import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";


router.get("/Myappointments", verifyToken, getPatientAppointments);

export default router;

