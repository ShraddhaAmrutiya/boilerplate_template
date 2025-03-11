"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../config/passport"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const authRouter = express_1.default.Router();
// Google OAuth Login Route
authRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Google OAuth Callback Route
authRouter.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), userController_1.googleCallback);
// Logout Route
authRouter.get("/logout", userController_1.logout);
// Protected Route Example
authRouter.get("/protected", auth_1.isAuthenticated, userController_1.protectedRoute);
exports.default = authRouter;
