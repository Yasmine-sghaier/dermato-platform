import express from "express";
const router = express.Router();
import  { createPrescription, getPrescriptionsByPatient ,generatePdf} from "../controllers/prescriptionController.js";
import {   authenticateUser } from "../middlewares/authMiddleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

router.post('/create', verifyToken,authorizeRoles('dermatologist'), createPrescription);
router.get('/list/:patientId', verifyToken,authorizeRoles('dermatologist'), getPrescriptionsByPatient);
router.get("/pdf/:id", verifyToken,authorizeRoles('dermatologist'), generatePdf);




export default router;
