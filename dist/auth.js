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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Google OAuth Response:", profile); // Debugging
        const email = profile.emails ? profile.emails[0].value : null;
        if (!email) {
            console.log("Email not found in Google profile");
            return done(null, false);
        }
        // Check if user exists
        const result = yield db_1.default.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);
        let user = result.rows[0];
        if (!user) {
            // If user doesn't exist, create new user
            const insertResult = yield db_1.default.query("INSERT INTO users (username, user_email, google_id) VALUES ($1, $2, $3) RETURNING *", [profile.displayName, email, profile.id]);
            user = insertResult.rows[0];
        }
        return done(null, user);
    }
    catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, false);
    }
})));
// Serialize user
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
        const user = result.rows[0] || null;
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
}));
exports.default = passport_1.default;
