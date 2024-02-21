import { Router } from "express";
import { register } from "../controllers/user.controller.js";

const router = Router();
// Register Route
router.route("/register").get(register);

export default router
