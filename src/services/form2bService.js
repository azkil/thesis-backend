import { query } from "../db.js";

/* ==========================================================
   🟩 BASIC CRUD SERVICES
   ========================================================== */

// Get all Form 2B
export const getAllForm2B = async () => {
  const { rows } = await query(`SELECT * FROM form2b ORDER BY id DESC`);
  return rows;
};

// Get ALL Form 2B where faculty is part of panel
export const getForm2BByPanelFaculty = async (faculty_id) => {
  const { rows } = await query(
    `SELECT *
     FROM form2b
     WHERE $1 IN (
       chairperson_id,
       member1_id,
       member2_id,
       secretary_id
     )
     ORDER BY created_at DESC`,
    [faculty_id]
  );

  return rows;
};

// Get Form 2B by ID
export const getForm2BById = async (id) => {
  const { rows } = await query(`SELECT * FROM form2b WHERE id = $1`, [id]);
  return rows[0];
};

// Create new Form 2B
export const createForm2B = async (data) => {
  const {
    student_id,
    thesis_id,
    faculty_id,
    defense_type,
    capstone_thesis_title,
    proponent_name,
    department,
    defense_date,

    adviser_id,
    adviser_name,
    chairperson_id,
    chairperson_name,
    member1_id,
    member1_name,
    member2_id,
    member2_name,
    secretary_id,
    secretary_name,

    chairperson_department_name,
    approved_by,
    posted_by,

    status,
    file_path,
  } = data;

  if (!student_id || !thesis_id || !faculty_id) {
    throw new Error("Missing required fields: student_id, thesis_id, faculty_id");
  }

  const { rows } = await query(
    `INSERT INTO form2b (
      student_id, thesis_id, faculty_id,
      defense_type, capstone_thesis_title, proponent_name,
      department, defense_date,
      adviser_id, adviser_name,
      chairperson_id, chairperson_name,
      member1_id, member1_name,
      member2_id, member2_name,
      secretary_id, secretary_name,
      chairperson_department_name,
      approved_by, posted_by,
      status, file_path
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
    )
    RETURNING *`,
    [
      student_id,
      thesis_id,
      faculty_id, // ensures the assigned adviser is saved
      defense_type,
      capstone_thesis_title,
      proponent_name,
      department,
      defense_date,

      adviser_id || faculty_id, // fallback to faculty_id if adviser_id not provided
      adviser_name || null,     // ensure adviser name is saved
      chairperson_id,
      chairperson_name,
      member1_id,
      member1_name,
      member2_id,
      member2_name,
      secretary_id,
      secretary_name,

      chairperson_department_name,
      approved_by,
      posted_by,
      status || "pending",
      file_path || null,
    ]
  );

  return rows[0];
};

// Update Form 2B
export const updateForm2B = async (id, data) => {
  const {
    faculty_id,
    defense_type,
    capstone_thesis_title,
    proponent_name,
    department,
    defense_date,

    adviser_id,
    adviser_name,
    chairperson_id,
    chairperson_name,
    member1_id,
    member1_name,
    member2_id,
    member2_name,
    secretary_id,
    secretary_name,

    chairperson_department_name,
    approved_by,
    posted_by,

    status,
    file_path,
  } = data;

  const { rows } = await query(
    `UPDATE form2b SET
      faculty_id=$1,
      defense_type=$2,
      capstone_thesis_title=$3,
      proponent_name=$4,
      department=$5,
      defense_date=$6,
      adviser_id=$7,
      adviser_name=$8,
      chairperson_id=$9,
      chairperson_name=$10,
      member1_id=$11,
      member1_name=$12,
      member2_id=$13,
      member2_name=$14,
      secretary_id=$15,
      secretary_name=$16,
      chairperson_department_name=$17,
      approved_by=$18,
      posted_by=$19,
      status=$20,
      file_path=$21,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$22
    RETURNING *`,
    [
      faculty_id,              // update adviser/faculty
      defense_type,
      capstone_thesis_title,
      proponent_name,
      department,
      defense_date,
      adviser_id || faculty_id, // update adviser_id if changed
      adviser_name || null,     // update adviser_name if provided
      chairperson_id,
      chairperson_name,
      member1_id,
      member1_name,
      member2_id,
      member2_name,
      secretary_id,
      secretary_name,
      chairperson_department_name,
      approved_by,
      posted_by,
      status,
      file_path,
      id,
    ]
  );

  return rows[0];
};
// Delete Form 2B
export const deleteForm2B = async (id) => {
  const { rows } = await query(`DELETE FROM form2b WHERE id=$1 RETURNING *`, [
    id,
  ]);
  return rows[0];
};

/* ==========================================================
   🟦 FILTERED FETCH SERVICES
   ========================================================== */

// Get latest Form 2B by student_id
export const getForm2BByStudent = async (student_id) => {
  const { rows } = await query(
    `SELECT * FROM form2b WHERE student_id=$1 ORDER BY created_at DESC`,
    [student_id]
  );
  return rows;
};

// Get ALL Form 2B assigned to a faculty
export const getForm2BByFaculty = async (faculty_id) => {
  const { rows } = await query(
    `SELECT * FROM form2b WHERE faculty_id=$1 ORDER BY created_at DESC`,
    [faculty_id]
  );
  return rows;
};
