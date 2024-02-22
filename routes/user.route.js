import { Router } from "express";
import { register } from "../controllers/user.controller.js";

const router = Router();
// Register Route
router.route("/register").post(register);

export default router
