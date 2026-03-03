import { useEffect, useState } from "react";
import "./Employee.css";

import {
  getEmployees,
  getEmployeesByFranchise,
  addEmployee,
  removeEmployee,
} from "../../services/employeeService";

const Employee = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;
  const franchiseId = user?.franchise_id;
  const isOwner = user?.role_id === 1;

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setLoading(true);
    setError(null);

    try {
      let data;
      
      if (isOwner && franchiseId) {
        // Owner: Fetch all employees from all branches
        console.log("👔 Owner fetching employees for franchise:", franchiseId);
        data = await getEmployeesByFranchise(franchiseId);
      } else if (!isOwner && branchId) {
        // Manager: Fetch employees from their branch
        console.log("👔 Manager fetching employees for branch:", branchId);
        const res = await getEmployees(branchId);
        data = res.data;
      } else {
        throw new Error("No franchiseId or branchId found");
      }

      setEmployees(data || []);
      setFilteredEmployees(data || []);
      console.log("✅ Employees loaded:", data);
    } catch (err) {
      console.error("❌ Error fetching employees:", err);
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((isOwner && franchiseId) || (!isOwner && branchId)) {
      fetchEmployees();
    }
  }, [franchiseId, branchId, isOwner]);

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
     ADD EMPLOYEE (Manager only)
  ========================= */
  const handleAdd = async () => {
    if (isOwner) {
      alert("Owners cannot add employees directly");
      return;
    }

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
     REMOVE EMPLOYEE (Manager only)
  ========================= */
  const handleRemove = async (id) => {
    if (isOwner) {
      alert("Owners cannot remove employees directly");
      return;
    }

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
        <h1 className="employee-title">
          {isOwner ? "All Employees" : "Branch Employees"}
        </h1>
        {!isOwner && (
          <button
            className="add-employee-btn"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Employee
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: "20px",
          color: "red",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px"
        }}>
          Loading employees...
        </div>
      )}

      {!loading && (
        <>
          {/* SEARCH */}
          <input
            className="auth-input"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* ADD EMPLOYEE FORM (Manager only) */}
          {showForm && !isOwner && (
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
                  {isOwner && <th>Branch</th>}
                  {!isOwner && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={isOwner ? 5 : 5} style={{ textAlign: "center" }}>
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
                      {isOwner && <td>{e.branch_location}</td>}
                      {!isOwner && (
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
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Employee;
