import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/patient/dashboard", verifyToken, authorizeRoles("patient"), (req, res) => {
  res.json({ message: "Bienvenue dans l’espace Patient " });
});

router.get("/secretary/dashboard", verifyToken, authorizeRoles("secretary"), (req, res) => {
  res.json({ message: "Bienvenue dans l’espace Secrétaire " });
});

router.get("/dermatologist/dashboard", verifyToken, authorizeRoles("dermatologist"), (req, res) => {
  res.json({ message: "Bienvenue dans l’espace Dermatologue " });
});

export default router;
