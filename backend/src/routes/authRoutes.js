import express from "express";
import { registerFromToken, login } from "../controllers/auth.js";

const router = express.Router();


router.post("/register-token", registerFromToken);


router.post("/login", login);

export default router;
