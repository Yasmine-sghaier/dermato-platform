import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé : token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifiez que decoded contient un ID numérique
    if (!decoded.id || isNaN(decoded.id)) {
      return res.status(401).json({ message: "Token invalide : ID utilisateur manquant ou incorrect." });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erreur de vérification du token :", error.message);
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé : rôle requis (${roles.join(", ")})`,
      });
    }
    next();
  };
};
export const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Non autorisé" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decode le token
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};