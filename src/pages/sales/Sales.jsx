import { useEffect, useState } from "react";
import {
  getSalesByBranch,
  addSale
} from "../../services/salesService";
import "./Sales.css";

const Sales = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [sales, setSales] = useState([]);
  const [month, setMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    customer_name: "",
    contact: "",
    amount: "",
    payment_method: "Cash",
    sale_date: ""
  });

  /* =========================
     FETCH SALES
  ========================= */
  const fetchSales = async () => {
    if (!branchId) return;
    try {
      const data = await getSalesByBranch(branchId, month);
      setSales(data || []);
    } catch (err) {
      alert("Failed to load sales");
    }
  };

  useEffect(() => {
    fetchSales();
  }, [branchId, month]);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredSales = sales.filter((s) =>
    s.product_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    s.customer_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    s.contact
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    s.payment_method
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    s.receipt_no
      ?.toString()
      .includes(searchTerm) ||
    s.amount
      ?.toString()
      .includes(searchTerm)
  );

  /* =========================
     TOTAL CALCULATION
  ========================= */
  const total = filteredSales.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  /* =========================
     ADD SALE
  ========================= */
  const handleAddSale = async () => {
    try {
      await addSale({
        ...form,
        branch_id: branchId,
        created_by: user?.user_id
      });

      alert("Sale added successfully");
      setShowModal(false);

      setForm({
        product_name: "",
        customer_name: "",
        contact: "",
        amount: "",
        payment_method: "Cash",
        sale_date: ""
      });

      fetchSales();
    } catch (err) {
      alert("Failed to add sale");
    }
  };

  if (!branchId) {
    return (
      <div className="empty-card">
        <h2>No Branch Assigned</h2>
        <p>Only branch managers can access sales.</p>
      </div>
    );
  }

  return (
    <div className="sales-page">
      {/* HEADER */}
      <div className="sales-header">
        <h1>Sales</h1>
        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Sale
        </button>
      </div>

      {/* FILTERS */}
      <div className="sales-controls">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sales-search"
        />

        <div className="total">
          {month
            ? `Total for ${month}: ₹${total}`
            : `Total: ₹${total}`}
        </div>
      </div>

      {/* TABLE */}
      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-sales">
                  No sales found
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => (
                <tr key={s.sale_id}>
                  <td className="receipt">{s.receipt_no}</td>
                  <td>{s.product_name}</td>
                  <td>{s.customer_name || "-"}</td>
                  <td>{s.contact || "-"}</td>
                  <td>
                    <span className="amount-badge">
                      ₹{Number(s.amount).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>{s.payment_method}</td>
                  <td>
                    {new Date(s.sale_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD SALE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Sale</h2>

            <input
              placeholder="Product Name"
              value={form.product_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  product_name: e.target.value
                })
              }
            />

            <input
              placeholder="Customer Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  customer_name: e.target.value
                })
              }
            />

            <input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value
                })
              }
            />

            <select
              value={form.payment_method}
              onChange={(e) =>
                setForm({
                  ...form,
                  payment_method: e.target.value
                })
              }
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>

            <input
              type="date"
              value={form.sale_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  sale_date: e.target.value
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
                onClick={handleAddSale}
              >
                Save Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;