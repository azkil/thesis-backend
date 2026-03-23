import * as formsPdfService from "../services/formsPdfService.js";

/* ==========================================
   Get PDF Record By Student
========================================== */
export const getPdfByStudentController = async (req, res) => {
  try {
    const { student_id } = req.params;

    const data = await formsPdfService.getPdfByStudent(student_id);

    if (!data) {
      return res.status(404).json({ message: "No PDF record found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   Upload / Replace PDF
========================================== */
export const uploadPdfController = async (req, res) => {
  try {
    const { student_id, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await formsPdfService.uploadOrReplacePdf(
      student_id,
      type,
      req.file.path,
      req.file.originalname
    );

    res.json({
      message: "File uploaded successfully",
      data: result
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ==========================================
   Delete Specific PDF
========================================== */
export const deletePdfController = async (req, res) => {
  try {
    const { student_id, type } = req.params;

    const result = await formsPdfService.deletePdfColumn(
      student_id,
      type
    );

    res.json({
      message: "File deleted successfully",
      data: result
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ==========================================
   Get ALL Theses With PDFs (JOIN)
========================================== */
export const getAllThesesWithPdfsController = async (req, res) => {
  try {
    const data = await formsPdfService.getAllThesesWithPdfs();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   Get Thesis With PDFs By Student
========================================== */
export const getThesisWithPdfsByStudentController = async (req, res) => {
  try {
    const { student_id } = req.params;

    const data = await formsPdfService.getThesisWithPdfsByStudent(student_id);

    if (!data) {
      return res.status(404).json({ message: "Thesis not found" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchThesesController = async (req, res) => {
  try {
    const { search } = req.query;
    const data = await formsPdfService.searchThesesWithPdfs(search);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const filterByYearController  = async (req, res) => {
  try {
    const { year } = req.query;
    const data = await formsPdfService.filterThesesByYear(year);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ==========================================================
   🟩 GET THESIS WITH PDFs BY ID
========================================================== */
export const getThesisWithPdfsByStudentIdController = async (req, res) => {
  const { id } = req.params;

  try {
    const thesis = await formsPdfService.getThesisWithPdfsByStudentId(id);

    if (!thesis) {
      return res.status(404).json({ message: "Thesis not found" });
    }

    res.json(thesis);
  } catch (err) {
    console.error("❌ Error fetching thesis with PDFs by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};