import { Router } from "express";
import { ForgetPassword, deleteUser, getAllUser, getCurrentUser, login, logout, register, updateAccountDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
// Register Route
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout);
router.route("/getCurrentUser").get(getCurrentUser);
router.route("/forgotPassword").patch(verifyJWT,ForgetPassword);
router.route("/forgotPassword").patch(verifyJWT,ForgetPassword);
router.route("/deleteAccount").delete(verifyJWT,deleteUser);

// Route UpdateProfile
router.route("/updateProfile").patch(verifyJWT,upload.single("profileImage"),updateAccountDetails);

// Admin Verify
router.route("/getAllUser").get(verifyAdmin,getAllUser);
router.route("/deleteAnyAccount").delete(verifyAdmin,deleteUser);
export default router