import { Router } from "express";
import {createUser,getUsers, getUserById, updateUser, deleteUser, loginUser, resetPassword, forgetpassword, resetPasswordWithToken } from "../controllers/userController";
import {verifyToken} from "../middleware/auth"

const router = Router();

// Route to create a user
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/",verifyToken, getUsers);
router.get("/:id",verifyToken, getUserById);
router.delete("/:id",verifyToken, deleteUser);
router.patch("/resetPassword", resetPassword);
router.patch("/:id",verifyToken, updateUser);
router.post("/forgotPassword", forgetpassword);
router.post("/resetPasswordWithToken/:token", resetPasswordWithToken);

export default router;
