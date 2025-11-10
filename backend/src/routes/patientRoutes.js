import express from "express";
import { getPatientById, updatePatient } from "../controllers/patientController.js";

const router = express.Router();

// GET /api/patients/:id
router.get("/:id", getPatientById);

// PUT /api/patients/:id
router.put("/:id", updatePatient);

export default router;
