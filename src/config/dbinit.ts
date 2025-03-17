import pool from "./db"; 
import dotenv from "dotenv";

dotenv.config();

const createUsersTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        login_by_google BOOLEAN DEFAULT FALSE,
        google_id VARCHAR(255) UNIQUE,
        age INT,
        reset_token TEXT,
        reset_token_expires TIMESTAMP
      );
    `;

    await pool.query(query);
    console.log("Users table created");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

createUsersTable();
