const db = require("../config/db");
const { createNotification } = require("./notificationController");


// GET employees by branch
exports.getEmployees = async (req, res) => {
  const { branchId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM employees WHERE branch_id = $1 ORDER BY employee_id DESC",
      [branchId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load employees" });
  }
};

// ADD employee
exports.addEmployee = async (req, res) => {
  const {
    branch_id,
    name,
    email,
    age,
    designation,
    address,
    mobile_no,
    experience,
    salary
  } = req.body;

  try {
    await db.query(
      `
      INSERT INTO employees
      (
        branch_id,
        name,
        email,
        age,
        designation,
        address,
        mobile_no,
        experience,
        salary
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        branch_id,
        name,
        email,
        age,
        designation,
        address,
        mobile_no,
        experience,
        salary
      ]
    );

    res.status(201).json({ message: "Employee added successfully" });
  } catch (err) {
    console.error("Add employee error:", err);
    res.status(500).json({ message: "Failed to add employee" });
  }

  await createNotification({
  branch_id,
  role_id: 2,
  message: `👤 New Employee Added: ${name} (${designation})`,
  type: "EMPLOYEE",
});

};

// DELETE employee
exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM employees WHERE employee_id = $1", [id]);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
