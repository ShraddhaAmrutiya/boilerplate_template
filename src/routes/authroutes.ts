import express from "express";
import passport from "../config/passport";
import { googleCallback, logout } from "../controllers/userController";

const authRouter = express.Router();

// Google OAuth Login Route
authRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
// Google OAuth Callback Route
authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" ,session: false}), googleCallback);

// Logout Route
authRouter.get("/logout", logout);


export default authRouter;
