
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "./config/db.js";
import { seedDefaultUsers } from "./config/seedUsers.js";
import { setupAssociations } from './models/Association.js';
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import secretaryRoutes from "./routes/secretaryRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import User from "./models/User.js"; 
import Prescription from "./models/Prescription.js";
import sequelize from './config/db.js'; 
import Appointment from './models/Appointment.js';
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
const app = express();


app.use(helmet()); 
app.use(cors()); 
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
}));
(async () => {
 
  await User.sync({ alter: true });

  await seedDefaultUsers();
})();
const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base OK ✅');

    // Crée la table si elle n’existe pas
    await Appointment.sync({ alter: true }); 
    console.log('Table Appointment créée ou mise à jour ✅');
     await Prescription.sync({ alter: true });
    console.log('Table Prescription créée ou mise à jour ✅')
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  }
};
syncDB();
setupAssociations();
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patient",patientRoutes)
app.use("/api/secretary", secretaryRoutes);
app.use("/api/availability",availabilityRoutes)
app.use("/api/ai", aiRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use("/api", roleRoutes); 
app.get("/", (req, res) => {
  res.send("API Dermatologie en ligne !");
});

export default app;
