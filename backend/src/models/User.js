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
    type: DataTypes.ENUM('patient', 'secretary', 'dermatologist'), 
    defaultValue: 'patient'
  }
}, {
  tableName: "users",
  underscored: true,
  timestamps: true,

});

export default User;