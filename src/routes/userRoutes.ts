import { Router } from "express";
import {createUser,getUsers, getUserById, updateUser, deleteUser, loginUser, resetPassword, forgetpassword, resetPasswordWithToken } from "../controllers/userController";

const router = Router();

// Route to create a user
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.patch("/resetPassword", resetPassword);
router.patch("/:id", updateUser);
router.post("/forgotPassword", forgetpassword);
router.post("/resetPasswordWithToken", resetPasswordWithToken);

export default router;
