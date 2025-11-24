import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

import User  from "./User.js"; 

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  medications: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'prescriptions',
});

Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });


export default  Prescription;
