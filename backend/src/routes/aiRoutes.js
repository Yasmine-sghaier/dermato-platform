import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const predictPath = join(__dirname, "../ai/predict.py"); // chemin correct

  const python = spawn("python", [predictPath, req.file.path]);

  python.stdout.on("data", (data) => {
  const str = data.toString().trim();
  try {
    // On ne parse que si ça commence par { et se termine par }
    if (str.startsWith("{") && str.endsWith("}")) {
      const result = JSON.parse(str);
      res.json(result);
    } else {
      console.log("Python log (ignored):", str);
    }
  } catch (err) {
    console.error("Erreur parsing JSON:", err);
    res.status(500).json({ error: "Erreur lors de l'analyse IA" });
  }
});

  python.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });
});

export default router;
