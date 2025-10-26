
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, 
      rejectUnauthorized: false
    }
  },
  logging: false, 
});


try {
  await sequelize.authenticate();
  console.log(" Connexion PostgreSQL Render réussie ");
} catch (error) {
  console.error(" Erreur de connexion PostgreSQL :", error.message);
}

export default sequelize;
