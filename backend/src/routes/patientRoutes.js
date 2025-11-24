
import express from "express";
import { getPatientById, updatePatient,getPatientAppointments,getAllPatients } from "../controllers/patientController.js";

import {   authenticateUser } from "../middlewares/authMiddleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/patients",verifyToken, authorizeRoles("dermatologist"),getAllPatients)
router.get("/my-appointments", verifyToken , getPatientAppointments);
router.get("/:id", getPatientById);

router.put("/:id", updatePatient);




export default router;

