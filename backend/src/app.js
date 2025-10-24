// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "./config/db.js";

const app = express();


app.use(helmet()); 
app.use(cors()); 
app.use(express.json());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
}));

app.get("/", (req, res) => {
  res.send(" API Dermatologie en ligne !");
});

export default app;
