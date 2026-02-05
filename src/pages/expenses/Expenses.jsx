import { useEffect, useState } from "react";
import {
  getExpensesByBranch,
  addExpense
} from "../../services/expenseService";
import "../inventory/Inventory.css";

export default function Expenses() {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    expense_type: "",
    amount: "",
    expense_date: "",
    description: ""
  });

  // Fetch expenses (month-wise)
  useEffect(() => {
    if (!branchId) return; // Skip if no branch ID

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const data = await getExpensesByBranch(branchId, month);
        setExpenses(data || []);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [month, branchId]);

  // Total calculation
  const totalExpense = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Add expense
  const handleAddExpense = async () => {
    if (!branchId) return;
    
    try {
      await addExpense({
        ...formData,
        branch_id: branchId
      });

      setShowModal(false);
      setFormData({
        expense_type: "",
        amount: "",
        expense_date: "",
        description: ""
      });

      // Refresh expenses list
      const data = await getExpensesByBranch(branchId, month);
      setExpenses(data || []);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <div>
      {!branchId ? (
        <div style={{ 
          padding: "20px", 
          background: "#020617", 
          border: "1px solid #1e293b", 
          borderRadius: "8px", 
          color: "#cbd5e1" 
        }}>
          <h2 style={{ color: "#f1f5f9" }}>No Branch Assigned</h2>
          <p>This page is only available for branch managers. As an owner, you can view all franchises in the owner dashboard.</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="inventory-header">
            <h2>Expenses</h2>
            <button className="primary-btn" onClick={() => setShowModal(true)}>
              + Add Expense
            </button>
          </div>

          {/* CONTROLS */}
          <div className="inventory-controls">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <div className="checkbox">
              <strong>Total:</strong> ₹{expenses.reduce((sum, e) => sum + Number(e.amount), 0)}
            </div>
          </div>

          {/* TABLE */}
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp.expense_id}>
                      <td>
                        <span className="category-badge">
                          {exp.expense_type}
                        </span>
                      </td>
                      <td>
                        <span className="status low">
                          ₹{exp.amount}
                        </span>
                      </td>
                      <td>
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </td>
                      <td>{exp.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#cbd5e1" }}>
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ADD EXPENSE MODAL */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Add Expense</h2>

                <input
                  placeholder="Expense Type"
                  value={formData.expense_type}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_type: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />

                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_date: e.target.value })
                  }
                />

                <input
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <div className="modal-actions">
                  <button
                    className="danger-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-btn" onClick={handleAddExpense}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
