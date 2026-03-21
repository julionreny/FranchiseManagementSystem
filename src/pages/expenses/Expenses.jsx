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
  const [prioritySort, setPrioritySort] = useState("date");

  const [showModal, setShowModal] = useState(false);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [formData, setFormData] = useState({
    expense_type: "",
    amount: "",
    expense_date: "",
    description: "",
  });

  useEffect(() => {
    if (!branchId) return;
    fetchExpenses();
  }, [branchId, month]);

  const fetchExpenses = async () => {
    const data = await getExpensesByBranch(branchId, month);
    setExpenses(data || []);
  };

  /* FILTER */

  let filteredExpenses = expenses.filter((exp) =>
    exp.expense_type
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* SORT */

  if (prioritySort === "priority") {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    filteredExpenses.sort(
      (a, b) =>
        (priorityOrder[a.priority] || 4) -
        (priorityOrder[b.priority] || 4)
    );
  } else {
    filteredExpenses.sort(
      (a, b) =>
        new Date(b.expense_date) -
        new Date(a.expense_date)
    );
  }

  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  /* ADD EXPENSE */

  const handleAddExpense = async () => {
    await addExpense({
      ...formData,
      branch_id: branchId,
    });

    setShowModal(false);

    setFormData({
      expense_type: "",
      amount: "",
      expense_date: "",
      description: "",
    });

    fetchExpenses();
  };

  /* OPEN BILL */

  const openInvoice = (expense) => {
    setSelectedExpense(expense);
    setShowInvoice(true);
  };

  if (!branchId) {
    return (
      <div className="empty-card">
        <h2>No Branch Assigned</h2>
      </div>
    );
  }

  return (
    <div className="manager-expenses-page">

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

      {/* FILTER BAR */}
      <div className="filter-card">
        <div className="filter-row">

          <div className="filter-group">
            <label>Select Month</label>
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
              placeholder="Search expense..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="filter-group">
            <label>Sort</label>
            <select
              value={prioritySort}
              onChange={(e) =>
                setPrioritySort(e.target.value)
              }
            >
              <option value="date">By Date</option>
              <option value="priority">
                By Priority
              </option>
            </select>
          </div>

        </div>

        <div className="filter-footer">
          <div className="total-display">
            Total ₹{total.toLocaleString("en-IN")}
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
              <th>Priority</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((exp) => (
              <tr
                key={exp.expense_id}
                style={{ cursor: "pointer" }}
                onClick={() => openInvoice(exp)}
              >
                <td>{exp.expense_type}</td>

                <td>
                  ₹{Number(exp.amount).toLocaleString("en-IN")}
                </td>

                <td>
                  {new Date(
                    exp.expense_date
                  ).toLocaleDateString()}
                </td>

                <td>
                  <span
                    className={`priority ${exp.priority}`}
                  >
                    {exp.priority}
                  </span>
                </td>

                <td>{exp.description}</td>
              </tr>
            ))}
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
                onClick={() =>
                  setShowModal(false)
                }
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

      {/* ⭐ BILL POPUP */}
      {showInvoice && selectedExpense && (
        <div className="invoice-overlay">

          <div className="invoice-card">

            <div className="invoice-header">
              <h2>Expense Bill</h2>
              <span className={`bill-priority ${selectedExpense.priority}`}>
                {selectedExpense.priority}
              </span>
            </div>

            <div className="invoice-amount">
              ₹{Number(selectedExpense.amount).toLocaleString("en-IN")}
            </div>

            <div className="invoice-divider" />

            <div className="invoice-row">
              <span>ID</span>
              <span>{selectedExpense.expense_id}</span>
            </div>

            <div className="invoice-row">
              <span>Type</span>
              <span>{selectedExpense.expense_type}</span>
            </div>

            <div className="invoice-row">
              <span>Date</span>
              <span>
                {new Date(selectedExpense.expense_date).toLocaleDateString()}
              </span>
            </div>

            <div className="invoice-row">
              <span>Description</span>
              <span>
                {selectedExpense.description || "None"}
              </span>
            </div>

            <div className="invoice-divider" />

            <div className="invoice-footer">
              <button
                className="close-bill-btn"
                onClick={() => setShowInvoice(false)}
              >
                Close
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}