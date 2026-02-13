import { useEffect, useState } from "react";
import {
  getExpensesByBranch,
  addExpense,
} from "../../services/expenseService";
import "./Expenses.css";

export default function Expenses() {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [expenses, setExpenses] = useState([]);
  const [month, setMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    expense_type: "",
    amount: "",
    expense_date: "",
    description: "",
  });

  /* =========================
     FETCH EXPENSES (MONTH-WISE)
  ========================= */
  useEffect(() => {
    if (!branchId) return;

    const fetchExpenses = async () => {
      const data = await getExpensesByBranch(branchId, month);
      setExpenses(data || []);
    };

    fetchExpenses();
  }, [branchId, month]);

  /* =========================
     COMBINED FILTER LOGIC
  ========================= */
  const filteredExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.expense_date);

    const matchesSearch =
      exp.expense_type
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      exp.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      exp.amount.toString().includes(searchTerm);

    const matchesType =
      selectedType === "" || exp.expense_type === selectedType;

    const matchesFrom =
      !fromDate || expDate >= new Date(fromDate);

    const matchesTo =
      !toDate || expDate <= new Date(toDate);

    return (
      matchesSearch &&
      matchesType &&
      matchesFrom &&
      matchesTo
    );
  });

  /* =========================
     TOTAL CALCULATION
  ========================= */
  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  /* =========================
     ADD EXPENSE
  ========================= */
  const handleAddExpense = async () => {
    await addExpense({ ...formData, branch_id: branchId });

    setShowModal(false);
    setFormData({
      expense_type: "",
      amount: "",
      expense_date: "",
      description: "",
    });

    const data = await getExpensesByBranch(branchId, month);
    setExpenses(data || []);
  };

  /* =========================
     NO BRANCH CASE
  ========================= */
  if (!branchId) {
    return (
      <div className="empty-card">
        <h2>No Branch Assigned</h2>
        <p>Only branch managers can view expenses.</p>
      </div>
    );
  }

  return (
    <div className="expenses-page">
      {/* HEADER */}
      <div className="expenses-header">
        <h1>Expenses</h1>
        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Expense
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="filter-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Expense Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              {[...new Set(expenses.map(e => e.expense_type))].map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-footer">
          <div className="total-display">
            {month
              ? `Total for ${month}: ₹${total}`
              : `Total: ₹${total}`}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="expenses-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  No expenses found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.expense_id}>
                  <td>
                    <span className="category-badge">
                      {exp.expense_type}
                    </span>
                  </td>
                  <td>
                    <span className="amount-badge">
                      ₹{Number(exp.amount).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td>{exp.description}</td>
                </tr>
              ))
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
              type="text"
              placeholder="Expense Type"
              value={formData.expense_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expense_type: e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value,
                })
              }
            />

            <input
              type="date"
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expense_date: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleAddExpense}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
