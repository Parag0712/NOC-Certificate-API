import { Router } from "express";
import { ForgetPassword, ResetPassword, changePassword, deleteUser, getAllUser, getCurrentUser, login, logout, register, updateAccountDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
// Register Route
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout);
router.route("/getCurrentUser").get(getCurrentUser);
router.route("/changePassword").patch(verifyJWT,changePassword);
router.route("/deleteAccount").delete(verifyJWT,deleteUser);
router.route("/forgetPassword").post(ForgetPassword);
router.route("/resetPassword").put(ResetPassword);

// Route UpdateProfile
router.route("/updateProfile").patch(verifyJWT,upload.single("profileImage"),updateAccountDetails);

// Admin Verify
router.route("/getAllUser").get(verifyAdmin,getAllUser);
router.route("/deleteAnyAccount").delete(verifyAdmin,deleteUser);
export default router