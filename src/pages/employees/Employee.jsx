import { useEffect, useState } from "react";
import "./Employee.css";

import {
  getEmployees,
  addEmployee,
  removeEmployee,
} from "../../services/employeeService";

const Employee = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    designation: "",
    address: "",
    mobile_no: "",
    experience: "",
    salary: "",
  });

  /* =========================
     FETCH EMPLOYEES
  ========================= */
  const fetchEmployees = async () => {
    try {
      const res = await getEmployees(branchId);
      setEmployees(res.data || []);
      setFilteredEmployees(res.data || []);
    } catch (err) {
      alert("Failed to load employees");
    }
  };

  useEffect(() => {
    if (!branchId) {
      alert("Unauthorized access");
      return;
    }
    fetchEmployees();
  }, [branchId]);

  /* =========================
     SEARCH FILTER
  ========================= */
  useEffect(() => {
    const filtered = employees.filter((e) =>
      `${e.name} ${e.designation} ${e.mobile_no}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [search, employees]);

  /* =========================
     ADD EMPLOYEE
  ========================= */
  const handleAdd = async () => {
    try {
      await addEmployee({ ...form, branch_id: branchId });

      alert("Employee added successfully");
      setShowForm(false);

      setForm({
        name: "",
        email: "",
        age: "",
        designation: "",
        address: "",
        mobile_no: "",
        experience: "",
        salary: "",
      });

      fetchEmployees();
    } catch (err) {
      alert("Failed to add employee");
    }
  };

  /* =========================
     REMOVE EMPLOYEE
  ========================= */
  const handleRemove = async (id) => {
    if (!window.confirm("Remove this employee?")) return;

    try {
      await removeEmployee(id);
      alert("Employee removed");
      fetchEmployees();
    } catch (err) {
      alert("Failed to remove employee");
    }
  };

  return (
    <div className="employee-page">
      {/* HEADER */}
      <div className="employee-header">
        <h1 className="employee-title">Employees</h1>
        <button
          className="add-employee-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Employee
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="auth-input"
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ADD EMPLOYEE FORM */}
      {showForm && (
        <div className="employee-modal">
          <h3>Add Employee</h3>

          {Object.keys(form).map((key) => (
            <input
              key={key}
              type={
                ["age", "experience", "salary"].includes(key)
                  ? "number"
                  : "text"
              }
              placeholder={key.replace("_", " ").toUpperCase()}
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          ))}

          <button className="add-employee-btn" onClick={handleAdd}>
            Save Employee
          </button>
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div className="employee-table-card">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Mobile</th>
              <th>Experience</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((e) => (
                <tr key={e.employee_id}>
                  <td>{e.name}</td>
                  <td>{e.designation}</td>
                  <td>{e.mobile_no}</td>
                  <td>
                    <span className="experience-badge">
                      {e.experience ? `${e.experience} yrs` : "0 yrs"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleRemove(e.employee_id)
                      }
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employee;
