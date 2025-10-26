// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "./config/db.js";
import { seedDefaultUsers } from "./config/seedUsers.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import secretaryRoutes from "./routes/secretaryRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import User from "./models/User.js"; 
const app = express();


app.use(helmet()); 
app.use(cors()); 
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
}));
(async () => {
 
  await User.sync({ alter: true });

  await seedDefaultUsers();
})();

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/secretary", secretaryRoutes);
app.use("/api", roleRoutes); 
app.get("/", (req, res) => {
  res.send("API Dermatologie en ligne !");
});

export default app;
