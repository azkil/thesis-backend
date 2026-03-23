import fs from "fs";
import { query } from "../db.js";

/* ==========================================
   Allowed PDF Types (SECURITY)
========================================== */
const allowedTypes = [
  "form2a","form2b","form2c","form2d","form2e",
  "form2f","form2g","form2h","form2i","form2j","form2k",
  "manuscript","other_pdf"
];

/* ==========================================
   Validate Type
========================================== */
const validateType = (type) => {
  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid file type");
  }
};

/* ==========================================
   Get PDF Record By Student
========================================== */
export const getPdfByStudent = async (student_id) => {
  const { rows } = await query(
    `SELECT * FROM formsPdf_files WHERE student_id = $1`,
    [student_id]
  );
  return rows[0] || null;
};

/* ==========================================
   Create Empty Record If Not Exists
========================================== */
export const createPdfRecordIfNotExists = async (student_id) => {
  const existing = await getPdfByStudent(student_id);
  if (existing) return existing;

  const { rows } = await query(
    `INSERT INTO formsPdf_files (student_id)
     VALUES ($1)
     RETURNING *`,
    [student_id]
  );

  return rows[0];
};

/* ==========================================
   Safely Delete Physical File
========================================== */
const deletePhysicalFile = async (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error("File deletion error:", error.message);
  }
};

/* ==========================================
   Upload / Replace PDF
========================================== */
export const uploadOrReplacePdf = async (
  student_id,
  type,
  filePath,
  originalName
) => {

  validateType(type);

  const columnPath = `${type}_path`;
  const columnName = `${type}_name`;

  await createPdfRecordIfNotExists(student_id);

  const { rows } = await query(
    `SELECT ${columnPath} FROM formsPdf_files WHERE student_id = $1`,
    [student_id]
  );

  if (!rows.length) {
    throw new Error("Student PDF record not found");
  }

  const oldFile = rows[0][columnPath];

  await deletePhysicalFile(oldFile);

  const { rows: updatedRows } = await query(
    `UPDATE formsPdf_files
     SET ${columnPath} = $1,
         ${columnName} = $2,
         uploaded_at = CURRENT_TIMESTAMP
     WHERE student_id = $3
     RETURNING *`,
    [filePath, originalName, student_id]
  );

  return updatedRows[0];
};

/* ==========================================
   Delete Specific PDF
========================================== */
export const deletePdfColumn = async (student_id, type) => {

  validateType(type);

  const columnPath = `${type}_path`;
  const columnName = `${type}_name`;

  const { rows } = await query(
    `SELECT ${columnPath} FROM formsPdf_files WHERE student_id = $1`,
    [student_id]
  );

  if (!rows.length) {
    throw new Error("Student PDF record not found");
  }

  const filePath = rows[0][columnPath];

  await deletePhysicalFile(filePath);

  const { rows: updatedRows } = await query(
    `UPDATE formsPdf_files
     SET ${columnPath} = NULL,
         ${columnName} = NULL,
         uploaded_at = CURRENT_TIMESTAMP
     WHERE student_id = $1
     RETURNING *`,
    [student_id]
  );

  return updatedRows[0];
};

/* ==========================================
   JOIN QUERY: Get All Theses With PDFs
========================================== */
export const getAllThesesWithPdfs = async () => {
  const { rows } = await query(`
    SELECT 
        -- =========================
        -- THESIS TABLE
        -- =========================
        t.thesis_id,
        t.student_id,
        t.faculty_id,
        t.adviser_name,
        t.student1_name,
        t.student1_idno,
        t.student2_name,
        t.student2_idno,
        t.student3_name,
        t.student3_idno,
        t.title,
        t.description,
        t.problem_stmt,
        t.objectives,
        t.status,
        t.created_at,
        t.updated_at,

        -- =========================
        -- FORMS PDF TABLE
        -- =========================
        f.id AS forms_pdf_id,

        f.form2a_path, f.form2a_name,
        f.form2b_path, f.form2b_name,
        f.form2c_path, f.form2c_name,
        f.form2d_path, f.form2d_name,
        f.form2e_path, f.form2e_name,
        f.form2f_path, f.form2f_name,
        f.form2g_path, f.form2g_name,
        f.form2h_path, f.form2h_name,
        f.form2i_path, f.form2i_name,
        f.form2j_path, f.form2j_name,
        f.form2k_path, f.form2k_name,
        f.manuscript_path, f.manuscript_name,
        f.other_pdf_path, f.other_pdf_name,
        f.uploaded_at AS pdf_uploaded_at

    FROM theses t
    LEFT JOIN formsPdf_files f
        ON t.student_id = f.student_id

    ORDER BY t.created_at DESC
  `);

  return rows;
};

/* ==========================================
   JOIN QUERY: Get Thesis With PDFs By Student
========================================== */
export const getThesisWithPdfsByStudent = async (student_id) => {
  const { rows } = await query(`
    SELECT t.*, f.*
    FROM theses t
    LEFT JOIN formsPdf_files f
      ON t.student_id = f.student_id
    WHERE t.student_id = $1
  `, [student_id]);

  return rows[0] || null;
};

/* ==========================================
   JOIN QUERY: Search Only
========================================== */
export const searchThesesWithPdfs = async (search) => {

  const { rows } = await query(
    `
    SELECT 
        t.*,
        f.*
    FROM theses t
    LEFT JOIN formsPdf_files f
      ON t.student_id = f.student_id
    WHERE
        LOWER(t.title) LIKE LOWER($1)
        OR LOWER(t.adviser_name) LIKE LOWER($1)
        OR LOWER(t.student1_name) LIKE LOWER($1)
        OR LOWER(t.student2_name) LIKE LOWER($1)
        OR LOWER(t.student3_name) LIKE LOWER($1)
    ORDER BY t.created_at DESC
    `,
    [`%${search}%`]
  );

  return rows;
};

/* ==========================================
   JOIN QUERY: Filter By Year Only
========================================== */
export const filterThesesByYear = async (year) => {

  const { rows } = await query(
    `
    SELECT 
        t.*,
        f.*
    FROM theses t
    LEFT JOIN formsPdf_files f
      ON t.student_id = f.student_id
    WHERE EXTRACT(YEAR FROM t.created_at) = $1
    ORDER BY t.created_at DESC
    `,
    [year]
  );

  return rows;
};

/* ==========================================
   JOIN QUERY: Get Thesis With PDFs By ID
========================================== */
export const getThesisWithPdfsByStudentId = async (studentId) => {
  const { rows } = await query(`
    SELECT 
        -- =========================
        -- THESIS TABLE
        -- =========================
        t.thesis_id,
        t.student_id,
        t.faculty_id,
        t.adviser_name,
        t.student1_name,
        t.student1_idno,
        t.student2_name,
        t.student2_idno,
        t.student3_name,
        t.student3_idno,
        t.title,
        t.description,
        t.problem_stmt,
        t.objectives,
        t.status,
        t.created_at,
        t.updated_at,

        -- =========================
        -- FORMS PDF TABLE
        -- =========================
        f.id AS forms_pdf_id,

        f.form2a_path, f.form2a_name,
        f.form2b_path, f.form2b_name,
        f.form2c_path, f.form2c_name,
        f.form2d_path, f.form2d_name,
        f.form2e_path, f.form2e_name,
        f.form2f_path, f.form2f_name,
        f.form2g_path, f.form2g_name,
        f.form2h_path, f.form2h_name,
        f.form2i_path, f.form2i_name,
        f.form2j_path, f.form2j_name,
        f.form2k_path, f.form2k_name,
        f.manuscript_path, f.manuscript_name,
        f.other_pdf_path, f.other_pdf_name,
        f.uploaded_at AS pdf_uploaded_at

    FROM theses t
    LEFT JOIN formsPdf_files f
        ON t.student_id = f.student_id
    WHERE t.student_id = $1
    LIMIT 1
  `, [studentId]);

  return rows[0] || null;
};