import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a new PostgreSQL pool connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: 'user12345',
  port: 5432,

});

export default pool;


