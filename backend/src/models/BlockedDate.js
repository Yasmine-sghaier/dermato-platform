// models/BlockedDate.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class BlockedDate extends Model {}

BlockedDate.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  blocked_date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false,
    unique: true,
    field: 'blocked_date'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Congé médecin'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de la secrétaire qui a bloqué la date'
  }
}, {
  sequelize,
  modelName: 'BlockedDate',
  tableName: "blocked_dates",
  underscored: true,
  timestamps: true
});

export default BlockedDate;


