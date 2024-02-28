import { Router } from "express";
import { deleteCertificateRequest, getAllCertificate, registerCertificateReq, updateStateCertificate } from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

// registerCertificateReq
const router = Router();

router.route("/reqForCertificate").post(verifyJWT,registerCertificateReq);
router.route("/certificateReqDelete/:id").delete(verifyAdmin,deleteCertificateRequest);
router.route("/updateStateCertificate/:id").patch(verifyAdmin,updateStateCertificate);
router.route("/getAllCertificate").patch(verifyAdmin,getAllCertificate);


export default router;