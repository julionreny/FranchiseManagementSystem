import { useState } from "react";

export default function Employee() {
  const [employees] = useState([
    { id: 1, name: "John Doe", position: "Manager", email: "john@example.com", branch: "Branch A" },
    { id: 2, name: "Jane Smith", position: "Staff", email: "jane@example.com", branch: "Branch A" },
    { id: 3, name: "Mike Johnson", position: "Supervisor", email: "mike@example.com", branch: "Branch B" }
  ]);

  return (
    <div>
      <h1 style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: "600", marginBottom: "20px" }}>
        Employee Management
      </h1>

      <div style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Name</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Position</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Email</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Branch</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{emp.name}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{emp.position}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{emp.email}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{emp.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}