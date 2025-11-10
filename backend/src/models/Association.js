// models/associations.js
import User from "./User.js";
import Appointment from "./Appointment.js";

export const setupAssociations = () => {
  // Un User peut avoir plusieurs Appointments
  User.hasMany(Appointment, {
    foreignKey: 'user_id',
    as: 'appointments'
  });

  // Un Appointment appartient à un User
  Appointment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  console.log('✅ Associations between User and Appointment have been set up');
};