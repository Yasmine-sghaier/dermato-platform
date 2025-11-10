// models/Appointment.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Appointment extends Model {}

Appointment.init({
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
    allowNull: false 
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  address: { 
    type: DataTypes.STRING 
  },
  birthdate: { 
    type: DataTypes.DATEONLY 
  },
  requested_date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    field: 'requested_date'
  },
  status: { 
    type: DataTypes.ENUM("pending", "confirmed", "done", "cancelled"), 
    defaultValue: "pending"
  },
  confirmation_token: { 
    type: DataTypes.STRING 
  },
  user_id: { 
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_by: {
    type: DataTypes.ENUM("patient", "secretary"),
    defaultValue: "patient"
  }
}, {
  sequelize,
  modelName: 'Appointment',
  tableName: "appointments",
  underscored: true,
  timestamps: true
});

export default Appointment;