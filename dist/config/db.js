"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a new PostgreSQL pool connection
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password: 'user12345',
    port: 5432,
});
exports.default = pool;
