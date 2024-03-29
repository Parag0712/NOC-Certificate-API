import { Router } from "express";
import { ForgetPassword, ResetPassword, changePassword, deleteUser, getAllUser, getCurrentUser, login, logout, register, updateAccountDetails, updateIsAdminField } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyRootAdmin } from "../middleware/rootAdmin.middleware.js";

const router = Router();
// Register Route
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/changePassword").patch(verifyJWT, changePassword);
router.route("/deleteAccount").delete(verifyJWT, deleteUser);
router.route("/forgetPassword").post(ForgetPassword);
router.route("/resetPassword/:token").put(ResetPassword);
router.route("/updateIsAdminField").patch(verifyRootAdmin, updateIsAdminField);

// Route UpdateProfile
router.route("/updateProfile").patch(verifyJWT, upload.single("profileImage"), updateAccountDetails);

// Admin Verify
router.route("/getAllUser").get(verifyAdmin, getAllUser);
router.route("/deleteAnyAccount").delete(verifyAdmin, deleteUser);
export default router