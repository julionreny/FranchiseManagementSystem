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

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [form, setForm] = useState({
    product_name: "",
    customer_name: "",
    contact: "",
    amount: "",
    payment_method: "Cash",
    sale_date: ""
  });

  /* FETCH SALES */
  const fetchSales = async () => {
    if (!branchId) return;
    const data = await getSalesByBranch(branchId, month);
    setSales(data || []);
  };

  useEffect(() => {
    fetchSales();
  }, [branchId, month]);

  /* SEARCH */
  const filteredSales = sales.filter((s) =>
    s.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.receipt_no?.toString().includes(searchTerm)
  );

  const total = filteredSales.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  /* ADD SALE */
  const handleAddSale = async () => {

    await addSale({
      ...form,
      branch_id: branchId,
      created_by: user?.user_id
    });

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
  };

  /* OPEN BILL */
  const openInvoice = (sale) => {
    setSelectedSale(sale);
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

      {/* ⭐ PROFESSIONAL FILTER BAR */}
      <div className="manager-sales-filters">

        <div className="month-box">
          <span className="month-mini-label">
            Search Month
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <input
          className="manager-search"
          type="text"
          placeholder="Search product / customer / receipt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="manager-total">
          Total ₹{total.toLocaleString("en-IN")}
        </div>

      </div>

      {/* TABLE */}
      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.map((s) => (
              <tr
                key={s.sale_id}
                style={{ cursor: "pointer" }}
                onClick={() => openInvoice(s)}
              >
                <td>{s.receipt_no}</td>
                <td>{s.product_name}</td>
                <td>{s.customer_name}</td>
                <td>
                  ₹{Number(s.amount).toLocaleString("en-IN")}
                </td>
                <td>{s.payment_method}</td>
                <td>
                  {new Date(s.sale_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
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
                setForm({ ...form, product_name: e.target.value })
              }
            />

            <input
              placeholder="Customer Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />

            <input
              placeholder="Contact"
              value={form.contact}
              onChange={(e) =>
                setForm({ ...form, contact: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <select
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
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
                setForm({ ...form, sale_date: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button onClick={handleAddSale}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ SALE BILL POPUP */}
      {showInvoice && selectedSale && (
        <div className="invoice-overlay">
          <div className="invoice-card">

            <h2>Sale Invoice</h2>

            <div className="invoice-amount">
              ₹{Number(selectedSale.amount).toLocaleString("en-IN")}
            </div>

            <div className="invoice-row">
              <span>Receipt No</span>
              <span>{selectedSale.receipt_no}</span>
            </div>

            <div className="invoice-row">
              <span>Product</span>
              <span>{selectedSale.product_name}</span>
            </div>

            <div className="invoice-row">
              <span>Customer</span>
              <span>{selectedSale.customer_name}</span>
            </div>

            <div className="invoice-row">
              <span>Contact</span>
              <span>{selectedSale.contact}</span>
            </div>

            <div className="invoice-row">
              <span>Payment</span>
              <span>{selectedSale.payment_method}</span>
            </div>

            <div className="invoice-row">
              <span>Date</span>
              <span>
                {new Date(selectedSale.sale_date).toLocaleDateString()}
              </span>
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

export default Sales;