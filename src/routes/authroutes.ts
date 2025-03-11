import express from "express";
import passport from "../config/passport";
import { googleCallback, logout, protectedRoute } from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";

const authRouter = express.Router();

// Google OAuth Login Route
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback Route
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), googleCallback);

// Logout Route
authRouter.get("/logout", logout);

// Protected Route Example
authRouter.get("/protected", isAuthenticated, protectedRoute);

export default authRouter;
