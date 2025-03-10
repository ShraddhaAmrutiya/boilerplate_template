"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route to create a user
router.post("/create", userController_1.createUser);
router.post("/login", userController_1.loginUser);
router.get("/", auth_1.verifyToken, userController_1.getUsers);
router.get("/:id", auth_1.verifyToken, userController_1.getUserById);
router.delete("/:id", auth_1.verifyToken, userController_1.deleteUser);
router.patch("/resetPassword", userController_1.resetPassword);
router.patch("/:id", auth_1.verifyToken, userController_1.updateUser);
router.post("/forgotPassword", userController_1.forgetpassword);
router.post("/resetPasswordWithToken/:token", userController_1.resetPasswordWithToken);
exports.default = router;
