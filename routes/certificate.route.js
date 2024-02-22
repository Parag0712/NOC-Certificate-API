import { Router } from "express";
import { deleteCertificateRequest, registerCertificateReq } from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

// registerCertificateReq
const router = Router();

router.route("/reqForCertificate").post(verifyJWT,registerCertificateReq);
router.route("/certificateReqDelete/:id").delete(verifyAdmin,deleteCertificateRequest);


export default router;