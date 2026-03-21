import { useEffect, useState } from "react";
import { getOwnerSales } from "../../services/ownerSalesService";
import "../sales/Sales.css";

const OwnerSales = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      const data = await getOwnerSales(franchiseId, month);
      setSales(data || []);
      setLoading(false);
    };
    fetchSales();
  }, [franchiseId, month]);

  const filtered = sales.filter((sale) => {
    const matchSearch =
      sale.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.branch_location?.toLowerCase().includes(search.toLowerCase());

    const matchPayment =
      paymentMethod === "" || sale.payment_method === paymentMethod;

    return matchSearch && matchPayment;
  });

  const total = filtered.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  const openInvoice = (sale) => {
    setSelectedSale(sale);
    setShowInvoice(true);
  };

  const paymentMethods = [
    ...new Set(sales.map((s) => s.payment_method)),
  ];

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>Franchise Sales</h1>
      </div>

      <div className="sales-filters">
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
          type="text"
          placeholder="Search branch / product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">
            All Payment Methods
          </option>
          {paymentMethods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <div className="total">
          Total ₹{total.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="sales-table-card">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Receipt</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.sale_id}
                style={{ cursor: "pointer" }}
                onClick={() => openInvoice(s)}
              >
                <td>{s.branch_location}</td>
                <td>{s.receipt_no}</td>
                <td>{s.product_name}</td>
                <td>{s.customer_name}</td>
                <td>
                  ₹{Number(s.amount).toLocaleString("en-IN")}
                </td>
                <td>{s.payment_method}</td>
                <td>
                  {new Date(
                    s.sale_date
                  ).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvoice && selectedSale && (
        <div className="invoice-overlay">
          <div className="invoice-card">
            <h2>Sale Invoice</h2>

            <div className="invoice-amount">
              ₹{Number(
                selectedSale.amount
              ).toLocaleString("en-IN")}
            </div>

            <div className="invoice-row">
              <span>Branch</span>
              <span>
                {selectedSale.branch_location}
              </span>
            </div>

            <div className="invoice-row">
              <span>Receipt</span>
              <span>
                {selectedSale.receipt_no}
              </span>
            </div>

            <div className="invoice-row">
              <span>Product</span>
              <span>
                {selectedSale.product_name}
              </span>
            </div>

            <div className="invoice-row">
              <span>Customer</span>
              <span>
                {selectedSale.customer_name}
              </span>
            </div>

            <div className="invoice-row">
              <span>Payment</span>
              <span>
                {selectedSale.payment_method}
              </span>
            </div>

            <div className="invoice-row">
              <span>Date</span>
              <span>
                {new Date(
                  selectedSale.sale_date
                ).toLocaleDateString()}
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

export default OwnerSales;