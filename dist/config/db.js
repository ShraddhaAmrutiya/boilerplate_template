"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Create a new PostgreSQL pool connection
const pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password: 'user12345',
    port: 5432,
});
exports.default = pool;
