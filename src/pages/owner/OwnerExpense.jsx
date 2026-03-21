import { useEffect, useState } from "react";
import { getOwnerExpenses } from "../../services/ownerExpenseService";
import "./OwnerExpenses.css";

const OwnerExpense = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortType, setSortType] = useState("date");

  /* ⭐ BILL STATE */
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getOwnerExpenses(franchiseId);
      setExpenses(data || []);
    };

    if (franchiseId) fetchExpenses();
  }, [franchiseId]);

  const types = [...new Set(expenses.map(e => e.expense_type))];

  /* ================= FILTER ================= */

  let filtered = expenses.filter(exp => {

    const matchSearch =
      exp.branch_location?.toLowerCase().includes(search.toLowerCase()) ||
      exp.expense_type?.toLowerCase().includes(search.toLowerCase());

    const matchType =
      type === "" || exp.expense_type === type;

    const matchFrom =
      fromDate === "" || exp.expense_date >= fromDate;

    const matchTo =
      toDate === "" || exp.expense_date <= toDate;

    return matchSearch && matchType && matchFrom && matchTo;
  });

  /* ================= SORT ================= */

  if (sortType === "priority") {

    const order = { high: 1, medium: 2, low: 3 };

    filtered.sort(
      (a, b) =>
        (order[a.priority] || 4) -
        (order[b.priority] || 4)
    );

  } else {

    filtered.sort(
      (a, b) =>
        new Date(b.expense_date) -
        new Date(a.expense_date)
    );

  }

  const total = filtered.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  /* ⭐ OPEN BILL */
  const openInvoice = (expense) => {
    setSelectedExpense(expense);
    setShowInvoice(true);
  };

  return (
    <div className="owner-expense-page">

      <h1 className="owner-title">
        Franchise Expenses
      </h1>

      {/* FILTER BAR */}
      <div className="owner-filter-bar">

        <input
          className="owner-input"
          placeholder="🔍 Search branch / type"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="owner-input"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {types.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div className="date-box">
          <span>📅</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>

        <div className="date-box">
          <span>📅</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>

        <select
          className="owner-input"
          value={sortType}
          onChange={e => setSortType(e.target.value)}
        >
          <option value="date">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
        </select>

        <div className="owner-total">
          Total ₹{total.toLocaleString("en-IN")}
        </div>

      </div>

      {/* TABLE */}
      <div className="owner-table-card">
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Priority</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(exp => (
              <tr
                key={exp.expense_id}
                style={{ cursor: "pointer" }}
                onClick={() => openInvoice(exp)}
              >
                <td>{exp.branch_location}</td>
                <td>{exp.expense_type}</td>
                <td>
                  ₹{Number(exp.amount).toLocaleString("en-IN")}
                </td>
                <td>
                  {new Date(exp.expense_date).toLocaleDateString()}
                </td>
                <td>
                  <span className={`priority ${exp.priority}`}>
                    {exp.priority}
                  </span>
                </td>
                <td>{exp.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⭐ BILL POPUP */}
      {showInvoice && selectedExpense && (
        <div className="invoice-overlay">

          <div className="invoice-card">

            <h2>Expense Bill</h2>

            <div className="invoice-amount">
              ₹{Number(selectedExpense.amount).toLocaleString("en-IN")}
            </div>

            <div className="invoice-row">
              <span>Branch</span>
              <span>{selectedExpense.branch_location}</span>
            </div>

            <div className="invoice-row">
              <span>Expense ID</span>
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
              <span>Priority</span>
              <span>{selectedExpense.priority}</span>
            </div>

            <div className="invoice-row">
              <span>Description</span>
              <span>{selectedExpense.description || "None"}</span>
            </div>

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
};

export default OwnerExpense;