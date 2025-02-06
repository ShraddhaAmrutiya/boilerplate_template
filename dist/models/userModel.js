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
const db_1 = __importDefault(require("../config/db"));
const userModel = {
    findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM v_users WHERE username = $1";
            const { rows } = yield db_1.default.query(query, [username]);
            return rows;
        });
    },
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = "SELECT * FROM v_users WHERE user_email = $1";
            const { rows } = yield db_1.default.query(query, [email]);
            return rows;
        });
    },
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      INSERT INTO v_users (username, user_email, password, token, add_date)
      VALUES ($1, $2, $3, $4, $5) RETURNING user_uuid
    `;
            const { rows } = yield db_1.default.query(query, [
                userData.username,
                userData.user_email,
                userData.password,
            ]);
            return rows;
        });
    }
};
exports.default = userModel;
