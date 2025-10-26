import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const seedDefaultUsers = async () => {
  const users = [
    {
      name: "Dr. Yasmine",
      email: "dermato@dermaCare.com",
      password: "123456",
      role: "dermatologist",
    },
    {
      name: "Selma Akkari",
      email: "secretary@dermaCare.com",
      password: "123456",
      role: "secretary",
    }
  ];

  for (const u of users) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      await User.create({ ...u, password: hashed });
      console.log(` Compte créé : ${u.role} (${u.email})`);
    } else {
      console.log(`ℹCompte déjà existant : ${u.role}`);
    }
  }
};
