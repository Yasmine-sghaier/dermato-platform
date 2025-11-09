
import express from "express";
import { getAvailableDates, getAvailableSlots,checkSlotAvailability } from "../controllers/availabilityController.js";

const router = express.Router();


router.get("/dates", getAvailableDates);
router.get("/slots/:date", getAvailableSlots);
router.get("/check/:date/:time", checkSlotAvailability);

export default router;