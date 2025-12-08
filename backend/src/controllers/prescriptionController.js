import Prescription from "../models/Prescription.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";

export const createPrescription = async (req, res) => {
  try {
    const { patientId, medications, dosage, frequency, duration, notes } = req.body;

    // Vérifier que patientId est présent
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId est requis"
      });
    }

    // Vérifier que le patient existe et est bien un patient
    const patient = await User.findOne({ where: { id: patientId, role: 'patient' } });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient introuvable ou rôle invalide"
      });
    }

    // Création de la prescription
    const prescription = await Prescription.create({
      patientId,
      medications,
      dosage,
      frequency,
      duration,
      notes: notes || ""    // notes optionnel
    });

    res.status(201).json({
      success: true,
      message: "Prescription créée avec succès",
      data: prescription
    });

  } catch (err) {
    console.error("Erreur création prescription:", err);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
};

export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const prescriptions = await Prescription.findAll({
      where: { patientId },
      include: [{
        model: User,
        as: 'patient',
        attributes: ['name', 'birthdate', 'phone', 'address'] 
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const generatePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: "patient",
          attributes: ["name", "birthdate", "phone", "address"]
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription introuvable" });
    }

    // Informations fixes
    const CLINIC_INFO = {
      name: "Clinique Médicale DermaCare",
      phone: "73 288 345",
      address: "123 Avenue de la Santé, Tunis, Tunisie"
    };

    const DOCTOR_INFO = {
      name: "Dr. Yasmine Sghaier",
      specialty: "Dermatologie",
      rpps: "12345678901"
    };

    // Fonction âge
    const calculateAge = (birthdate) => {
      if (!birthdate) return null;
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const mdiff = today.getMonth() - birth.getMonth();
      if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const patientAge = calculateAge(prescription.patient?.birthdate);

    // Format date
    const formatDate = (d) => {
      if (!d) return "Non spécifié";
      const date = new Date(d);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    };

    // Génération PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ordonnance-${id}.pdf"`
    );

    doc.pipe(res);

    /* ------------------ HEADER ------------------ */
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1e40af")
      .text(CLINIC_INFO.name, { align: "center" });

    doc.fontSize(10).font("Helvetica").fillColor("#666")
      .text(CLINIC_INFO.address, { align: "center" });

    doc.text(`Tél: ${CLINIC_INFO.phone}`, { align: "center" });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#1e40af").stroke();
    doc.moveDown(1);

    doc.fontSize(22).font("Helvetica-Bold").fillColor("#000")
      .text("ORDONNANCE MÉDICALE", { align: "center", underline: true });

    doc.moveDown(1);

    // Numéro et date
    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text(`N°: ${id}`, { align: "right" });
    doc.text(`Date: ${formatDate(prescription.createdAt)}`, { align: "right" });

    doc.moveDown(2);

    /* ------------------ PATIENT ------------------ */
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000")
      .text("INFORMATIONS PATIENT");

    doc.moveDown(0.5);
    
    const pY = doc.y;
    doc.rect(50, pY, 500, 70).fill("#f5f5f5").stroke("#ddd");
    
    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text(`Nom: ${prescription.patient?.name || "Non spécifié"}`, 60, pY + 15);
    doc.text(`ID: ${prescription.patientId || "N/A"}`, 60, pY + 35);

    doc.text(`Âge: ${patientAge ? `${patientAge} ans` : "Non spécifié"}`, 300, pY + 15);
    if (prescription.patient?.birthdate) {
      doc.text(`Naissance: ${formatDate(prescription.patient.birthdate)}`, 300, pY + 35);
    }

    doc.y = pY + 80;
    doc.moveDown(1);

    /* ------------------ DOCTEUR ------------------ */
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000")
      .text("MÉDECIN PRESCRIPTEUR");

    doc.moveDown(0.5);
    
    const dY = doc.y;
    doc.rect(50, dY, 500, 55).fill("#e8f4f8").stroke("#b8dde9");
    
    doc.fontSize(11).font("Helvetica").fillColor("#333")
      .text(`Docteur: ${DOCTOR_INFO.name}`, 60, dY + 15);
    doc.text(`Spécialité: ${DOCTOR_INFO.specialty}`, 60, dY + 35);
    doc.text(`RPPS: ${DOCTOR_INFO.rpps}`, 300, dY + 15);

    doc.y = dY + 70;
    doc.moveDown(2);

    /* ------------------ PRESCRIPTION ------------------ */
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af")
      .text("PRESCRIPTION MÉDICALE", { underline: true });

    doc.moveDown(1);

    /* Médicaments */
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333")
      .text("MÉDICAMENTS :");

    const medY = doc.y + 5;
    doc.rect(50, medY, 500, 80).fill("#f0f9ff").stroke("#bae6fd");
    
    doc.fontSize(11).font("Helvetica").fillColor("#0c4a6e")
      .text(prescription.medications || "Non spécifié", 60, medY + 15, {
        width: 480,
        align: "left"
      });

    doc.y = medY + 90;
    doc.moveDown(2);

    /* ------------------ FRÉQUENCE ET DURÉE ------------------ */
    // Section simple pour fréquence et durée
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333")
      .text("POSOLOGIE :");
    
    const posoY = doc.y + 5;
    doc.rect(50, posoY, 500, 60).fill("#fefce8").stroke("#fde047");
    
    // Positionnement horizontal
    doc.fontSize(11).font("Helvetica").fillColor("#713f12")
      .text(`Fréquence: ${prescription.frequency || "Non spécifié"}`, 60, posoY + 20);
    
    doc.text(`Durée: ${prescription.duration || "Non spécifié"}`, 300, posoY + 20);
    
    // Dosage si existe
    if (prescription.dosage) {
      doc.text(`Dosage: ${prescription.dosage}`, 60, posoY + 40);
    }

    doc.y = posoY + 70;
    doc.moveDown(2);

    /* ------------------ NOTES ------------------ */
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#7c2d12")
      .text("INSTRUCTIONS SPÉCIALES :");

    const notesY = doc.y + 5;
    const notesHeight = 80;
    doc.rect(50, notesY, 500, notesHeight).fill("#fffbeb").stroke("#fbbf24");

    doc.fontSize(11).font("Helvetica").fillColor("#92400e")
      .text(prescription.notes || "Aucune instruction spéciale", 60, notesY + 15, {
        width: 480,
        align: "left"
      });

    doc.y = notesY + notesHeight + 10;

    /* ------------------ SIGNATURE ------------------ */
    // S'assurer d'être assez bas sur la page
    if (doc.y < 650) {
      doc.moveDown(4);
    } else {
      doc.addPage();
      doc.y = 100;
    }

    // Ligne de signature
    const signatureY = doc.y;
    doc.moveTo(330, signatureY).lineTo(550, signatureY).stroke("#000");

    doc.fontSize(10).font("Helvetica-Oblique").fillColor("#666")
      .text("Signature et cachet", 330, signatureY + 5, {
        width: 220,
        align: "center"
      });

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#000")
      .text(DOCTOR_INFO.name, 330, signatureY + 25, {
        width: 220,
        align: "center"
      });

    doc.fontSize(10).font("Helvetica").fillColor("#666")
      .text(DOCTOR_INFO.specialty, 330, signatureY + 45, {
        width: 220,
        align: "center"
      });

    doc.text(CLINIC_INFO.name, 330, signatureY + 60, {
      width: 220,
      align: "center"
    });

    /* ------------------ FOOTER ------------------ */
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#999")
      .text(
        `Document généré électroniquement le ${new Date().toLocaleDateString("fr-FR")}`,
        50,
        800,
        { align: "center", width: 500 }
      );

    doc.end();
  } catch (err) {
    console.error("Erreur génération PDF:", err);
    res.status(500).json({
      message: "Erreur lors de la génération du PDF",
      error: err.message
    });
  }
};