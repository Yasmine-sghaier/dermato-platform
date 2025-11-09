import express from "express";
import { confirmAppointment } from "../controllers/secretaryController.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/confirm/:id",
  verifyToken,
  authorizeRoles("secretary"),
  confirmAppointment
);


export default router;
