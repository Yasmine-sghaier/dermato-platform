
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Appointment = sequelize.define("Appointment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING },
  birthdate: { type: DataTypes.DATEONLY },
  requested_date: { 
    type: DataTypes.DATE, 
    allowNull: false,
    field: 'requested_date',
    comment: 'Date et heure du rendez-vous choisi par le patient' 
  },
  status: { 
    type: DataTypes.ENUM("pending", "confirmed", "done", "canceled"), 
    defaultValue: "pending"
  },
  confirmation_token: { type: DataTypes.STRING },
}, {
  tableName: "appointments",
  underscored: true,    
  timestamps: true     
});

export default Appointment;