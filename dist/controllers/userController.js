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
exports.logout = exports.googleCallback = exports.resetPasswordWithToken = exports.forgetpassword = exports.resetPassword = exports.loginUser = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
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
    }
});
// Create a new user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, user_email, password } = req.body;
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
        const result = yield db_1.default.query("INSERT INTO users (username, user_email, password, login_by_google) VALUES ($1, $2, $3, $4) RETURNING *", [username, user_email, hashedPassword, false] // Setting `login_by_google` to `false`
        );
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
    const updates = req.body; // This will contain only the fields the user wants to update
    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: "No fields to update" });
    }
    try {
        // If the update includes a password, hash it
        if (updates.password) {
            updates.password = yield bcrypt_1.default.hash(updates.password, 10);
        }
        // Construct dynamic query
        const fields = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
        const values = Object.values(updates);
        // Add ID as the last value
        values.push(id);
        const query = `UPDATE users SET ${fields} WHERE id = $${values.length} RETURNING *`;
        const result = yield db_1.default.query(query, values);
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
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
        const result = yield db_1.default.query("SELECT * FROM users WHERE user_email =$1", [user_email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
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
        yield db_1.default.query("UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3", [
            hashedToken,
            resetTokenExpires,
            user.id,
        ]);
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
        res.status(200).json({ message: "Reset token sent to email" });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message, message: "Error occurred during password change" });
    }
});
exports.forgetpassword = forgetpassword;
// Reset password with forgot password token
const resetPasswordWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_email, newPassword } = req.body;
    const { token } = req.params; // Get token from request params
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE user_email = $1", [user_email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        if (!user.reset_token) {
            return res.status(400).json({ error: "Reset token not found for this user" });
        }
        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        const isTokenValid = yield bcrypt_1.default.compare(token, user.reset_token);
        if (!isTokenValid) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }
        const currentTime = new Date();
        const resetTokenExpiry = user.reset_token_expires;
        if (currentTime > resetTokenExpiry) {
            return res.status(400).json({ error: "Token has expired" });
        }
        // **Hash the new password**
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // **Update the user's password and clear the reset token**
        yield db_1.default.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_email = $2", [hashedPassword, user_email]);
        res
            .status(200)
            .json({ message: "Password has been reset successfully. You can now log in with the new password." });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.resetPasswordWithToken = resetPasswordWithToken;
// export const googleCallback = (req: Request, res: Response) => {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   // Generate JWT token
//   const token = jwt.sign(
//     { id: (req.user as any).id, email: (req.user as any).user_email },
//     process.env.JWT_SECRET as string,
//     { expiresIn: "1h" }
//   );
//   console.log("Google Callback Called", req.user); // Debugging
//   res.json({ message: "Login successful", token });
// };
const googleCallback = (req, res) => {
    if (!req.user) {
        console.log("User Not Found After Google OAuth");
        return res.status(401).json({ error: "Unauthorized" });
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, email: req.user.user_email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
};
exports.googleCallback = googleCallback;
const logout = (req, res) => {
    req.logout(() => {
        res.json({ message: "Logged out successfully" });
    });
};
exports.logout = logout;
