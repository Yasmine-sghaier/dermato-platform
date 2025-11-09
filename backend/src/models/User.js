// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birthdate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('patient', 'secretary', 'dermatologist'), // ⚠️ Supprimer 'dermatologist'
    defaultValue: 'patient'
  }
}, {
  tableName: "users",
  underscored: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      console.log(`🔐 Hachage du mot de passe pour: ${user.email}`);
      user.password = await bcrypt.hash(user.password, 12);
      console.log(`✅ Mot de passe hashé: ${user.password.substring(0, 20)}...`);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

export default User;