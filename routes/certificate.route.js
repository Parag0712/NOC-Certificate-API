import { Router } from "express";
import { registerCertificateReq } from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

// registerCertificateReq
const router = Router();

router.route("/reqForCertificate").post(verifyJWT,registerCertificateReq);

export default router;