import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

import User from "./User.js";

const Prescription = sequelize.define(
  "Prescription",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // table Users
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
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
  },
  {
    tableName: "prescriptions",  // indispensable !
    timestamps: true,           // createdAt / updatedAt
    underscored: false,
  }
);

// Relations
Prescription.belongsTo(User, {
  foreignKey: "patientId",
  as: "patient",
});

export default Prescription;
