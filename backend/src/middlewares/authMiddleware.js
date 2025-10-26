import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé : token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
