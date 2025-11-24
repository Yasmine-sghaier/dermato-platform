import express from "express";
const router = express.Router();
import  { createPrescription, getPrescriptionsByPatient } from "../controllers/prescriptionController.js";
import {   authenticateUser } from "../middlewares/authMiddleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post('/create', verifyToken,authorizeRoles('dermatologist'), createPrescription);
router.get('/patient/:patientId', verifyToken,authorizeRoles('dermatologist'), getPrescriptionsByPatient);


export default router;
