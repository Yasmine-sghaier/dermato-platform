import express from "express";
import { login } from "../controllers/auth.js";
import {registerFromAppointment} from "../controllers/auth.js"
const router = express.Router();
router.post("/login", login);

router.post("/register-from-appointment", registerFromAppointment);




export default router;
