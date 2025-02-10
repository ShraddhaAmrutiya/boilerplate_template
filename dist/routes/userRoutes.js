"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Route to create a user
router.post("/create", userController_1.createUser);
router.post("/login", userController_1.loginUser);
router.get("/", userController_1.getUsers);
router.get("/:id", userController_1.getUserById);
router.delete("/:id", userController_1.deleteUser);
router.patch("/resetPassword", userController_1.resetPassword);
router.patch("/:id", userController_1.updateUser);
router.post("/forgotPassword", userController_1.forgetpassword);
router.post("/resetPasswordWithToken", userController_1.resetPasswordWithToken);
exports.default = router;
