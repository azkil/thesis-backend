import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as formsPdfController from "../controllers/formsPdfController.js";

const router = express.Router();

/* ==========================================
   MULTER STORAGE SETUP (FIXED VERSION)
========================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    // Absolute path (safer)
    const uploadPath = path.join(process.cwd(), "uploads", "pdf");

    // Create folder automatically if missing
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `file-${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

/* ==========================================
   ROUTES
========================================== */

router.post(
  "/upload",
  upload.single("file"),
  formsPdfController.uploadPdfController
);

router.get(
  "/student/:student_id",
  formsPdfController.getPdfByStudentController
);

router.delete(
  "/student/:student_id/:type",
  formsPdfController.deletePdfController
);

router.get(
  "/theses",
  formsPdfController.getAllThesesWithPdfsController
);

router.get(
  "/theses/student/:student_id",
  formsPdfController.getThesisWithPdfsByStudentController
);

router.get("/theses/search", formsPdfController.searchThesesController);
router.get("/theses/year", formsPdfController.filterByYearController);
router.get("/theses/student/:id/pdfs", formsPdfController.getThesisWithPdfsByStudentIdController);

export default router;