import { useEffect, useState } from "react";
import { getOwnerExpenses } from "../../services/ownerExpenseService";
import "../expenses/Expenses.css";

const MOCK_EXPENSES = [
  { expense_id: 1,  branch_location: "Bengaluru",  expense_type: "Rent",       amount: 85000,  expense_date: "2026-03-01", description: "Monthly office & kitchen rent" },
  { expense_id: 2,  branch_location: "Bengaluru",  expense_type: "Salaries",   amount: 145000, expense_date: "2026-03-01", description: "Staff salaries for February" },
  { expense_id: 3,  branch_location: "Bengaluru",  expense_type: "Utilities",  amount: 18000,  expense_date: "2026-03-03", description: "Electricity and water bills" },
  { expense_id: 4,  branch_location: "Chennai",    expense_type: "Rent",       amount: 65000,  expense_date: "2026-03-01", description: "Monthly rent — Chennai branch" },
  { expense_id: 5,  branch_location: "Chennai",    expense_type: "Salaries",   amount: 110000, expense_date: "2026-03-01", description: "Staff salaries for February" },
  { expense_id: 6,  branch_location: "Chennai",    expense_type: "Marketing",  amount: 25000,  expense_date: "2026-03-04", description: "Local flyer and social media ads" },
  { expense_id: 7,  branch_location: "Sonathira",  expense_type: "Rent",       amount: 42000,  expense_date: "2026-03-01", description: "Monthly rent — Sonathira branch" },
  { expense_id: 8,  branch_location: "Sonathira",  expense_type: "Maintenance",amount: 12000,  expense_date: "2026-03-05", description: "Kitchen equipment servicing" },
  { expense_id: 9,  branch_location: "Sonathira",  expense_type: "Salaries",   amount: 78000,  expense_date: "2026-03-01", description: "Staff salaries for February" },
  { expense_id: 10, branch_location: "Calicut",    expense_type: "Rent",       amount: 35000,  expense_date: "2026-03-01", description: "Monthly rent — Calicut branch" },
  { expense_id: 11, branch_location: "Calicut",    expense_type: "Utilities",  amount: 9000,   expense_date: "2026-03-04", description: "Electricity and gas bills" },
  { expense_id: 12, branch_location: "Calicut",    expense_type: "Salaries",   amount: 62000,  expense_date: "2026-03-01", description: "Staff salaries for February" },
];

const OwnerExpense = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      if (franchiseId) {
        try {
          const data = await getOwnerExpenses(franchiseId);
          setExpenses(data?.length ? data : MOCK_EXPENSES);
        } catch {
          setExpenses(MOCK_EXPENSES);
        }
      } else {
        setExpenses(MOCK_EXPENSES);
      }
      setLoading(false);
    };
    fetchExpenses();
  }, [franchiseId]);

  const filtered = expenses.filter(exp => {
    const matchSearch =
      (exp.branch_location?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (exp.expense_type?.toLowerCase() || "").includes(search.toLowerCase());
    const matchType = type === "" || exp.expense_type === type;
    const matchFrom = fromDate === "" || exp.expense_date >= fromDate;
    const matchTo = toDate === "" || exp.expense_date <= toDate;
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const types = [...new Set(expenses.map(e => e.expense_type))];

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h1>Franchise Expenses</h1>
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>Loading expenses...</div>
      ) : (
        <>
          <div className="expenses-controls">
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            <div className="total">Total: ₹{total.toLocaleString("en-IN")}</div>
          </div>

          <div className="expenses-table">
            <table>
              <thead>
                <tr>
                  <th>Branch Location</th><th>Type</th><th>Amount</th>
                  <th>Date</th><th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.expense_id}>
                    <td>{exp.branch_location}</td>
                    <td>{exp.expense_type}</td>
                    <td>₹{Number(exp.amount).toLocaleString("en-IN")}</td>
                    <td>{exp.expense_date}</td>
                    <td>{exp.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerExpense;