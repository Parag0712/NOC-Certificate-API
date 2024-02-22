import { Router } from "express";
import { getAllUser, getCurrentUser, login, logout, register } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = Router();
// Register Route
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout);
router.route("/getCurrentUser").get(getCurrentUser);
router.route("/getAllUser").get(verifyAdmin,getAllUser);



export default router
