"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db")); // Ensure you have a proper database connection
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createUsersTable = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield db_1.default.query(query);
        console.log("✅ Users table created (if it didn't exist)");
    }
    catch (err) {
        console.error("❌ Error creating users table:", err);
    }
});
// Run the function when this file is executed
createUsersTable();
