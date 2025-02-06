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
exports.resetPasswordWithToken = exports.forgetpassword = exports.resetPassword = exports.loginUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const db_1 = __importDefault(require("../config/db")); // Database connection pool
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
// Setup Nodemailer transporter
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Create a new user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, user_email, password, age } = req.body;
    try {
        // Check if the username already exists
        const userExists = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }
        // Check if the email already exists
        const emailExists = yield db_1.default.query("SELECT * FROM users WHERE user_email = $1", [user_email]);
        if (emailExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }
        // Hash the password before saving
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insert the new user into the database and return the created row
        const result = yield db_1.default.query("INSERT INTO users (username, user_email, password, age) VALUES ($1, $2, $3, $4) RETURNING *", [username, user_email, hashedPassword, age]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        const error = err;
        console.log(err);
        res.status(500).json({ error: error.message });
    }
});
exports.createUser = createUser;
// Get all users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT * FROM users");
        res.status(200).json(result.rows);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.getUsers = getUsers;
// Get a single user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.getUserById = getUserById;
// Update user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, user_email, password, age } = req.body;
    try {
        let hashedPassword = password;
        if (password) {
            hashedPassword = yield bcrypt_1.default.hash(password, 10);
        }
        const result = yield db_1.default.query("UPDATE users SET username = $1, user_email = $2, password = $3, age = $4 WHERE id = $5 RETURNING *", [username, user_email, hashedPassword, age, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.updateUser = updateUser;
// Delete user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.deleteUser = deleteUser;
// Login user
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const result = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const user = result.rows[0];
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid username or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    }
    catch (err) {
        const error = err;
        console.error("Error:", err);
        res.status(500).json({ error: error.message });
    }
});
exports.loginUser = loginUser;
// reset Password (Old Password Required)
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_email, oldPassword, newPassword } = req.body;
    try {
        const result = yield db_1.default.query('SELECT * FROM users WHERE user_email =$1', [user_email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        // Verify old password
        const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Old password is incorrect" });
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        //update new password
        yield db_1.default.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
        return res.status(200).json({ message: "Password changed successfully" });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message, message: "Error occurred during password change" });
    }
});
exports.resetPassword = resetPassword;
//forgot password
const forgetpassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_email } = req.body;
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE user_email = $1", [user_email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = yield bcrypt_1.default.hash(resetToken, 10);
        // Set expiration time in milliseconds (1 hour from now)
        const resetTokenExpires = Date.now() + 3600000; // 1 hour in milliseconds
        yield db_1.default.query("UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3", [hashedToken, resetTokenExpires, user.id]);
        // Create a reset link with the token and user email
        const resetLink = `token=${resetToken}`;
        // Send email
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user_email,
            subject: "Password Reset Request",
            html: `<p>Hi ${user.username},</p>
             <p>You requested a password reset.</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
        });
        res.status(200).json({ message: "Reset link sent to email" });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message, message: "Error occurred during password change" });
    }
});
exports.forgetpassword = forgetpassword;
//reset password with forgot password token
const resetPasswordWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, user_email, newPassword } = req.body;
    console.log("Received token: ", token); // Log received token for debugging
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE user_email = $1", [user_email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        console.log("User found: ", user); // Log user details for debugging
        console.log("Stored reset_token: ", user.reset_token); // Log stored reset_token for debugging
        // Check if token exists in the user data and compare it
        if (!user.reset_token) {
            return res.status(400).json({ error: "Reset token not found for this user" });
        }
        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        const isTokenValid = yield bcrypt_1.default.compare(token, user.reset_token);
        console.log("Is token valid: ", isTokenValid); // Log result of comparison
        if (!isTokenValid) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }
        // Check if token is expired by comparing it to NOW()
        const currentTime = new Date();
        const resetTokenExpiry = user.reset_token_expires;
        console.log("Current Time: ", currentTime); // Log current time
        console.log("Reset Token Expiry: ", resetTokenExpiry); // Log reset token expiry for debugging
        if (currentTime > resetTokenExpiry) {
            return res.status(400).json({ error: "Token has expired" });
        }
        // Hash the new password and update the user's password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_1.default.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2", [hashedPassword, user.id]);
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (err) {
        const error = err;
        console.log("Error: ", error.message); // Log the error
        res.status(500).json({ error: error.message });
    }
});
exports.resetPasswordWithToken = resetPasswordWithToken;
