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

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      if (franchiseId) {
        try {
          const data = await getOwnerSales(franchiseId, month);
          setSales(data || []);
        } catch (err) {
          console.error("Sales fetch error:", err);
          setSales([]);
        }
      } else {
        setSales([]);
      }
      setLoading(false);
    };
    fetchSales();
  }, [franchiseId, month]);

  const filtered = sales.filter((sale) => {
    const matchSearch =
      (sale.product_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (sale.customer_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (sale.branch_location?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (sale.receipt_no?.toLowerCase() || "").includes(search.toLowerCase());
    const matchPayment = paymentMethod === "" || sale.payment_method === paymentMethod;
    return matchSearch && matchPayment;
  });

  const total = filtered.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const paymentMethods = [...new Set(sales.map((s) => s.payment_method).filter(Boolean))];

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h1>Franchise Sales</h1>
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>Loading sales...</div>
      ) : (
        <>
          <div className="sales-filters">
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Select Month" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">All Payment Methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            <div className="total">Total: ₹{total.toLocaleString("en-IN")}</div>
          </div>

          <div className="sales-table-card">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Branch</th><th>Receipt No</th><th>Product</th>
                  <th>Customer</th><th>Contact</th><th>Amount</th>
                  <th>Payment</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td>{sale.branch_location || "-"}</td>
                    <td>{sale.receipt_no || "-"}</td>
                    <td>{sale.product_name || "-"}</td>
                    <td>{sale.customer_name || "-"}</td>
                    <td>{sale.contact || "-"}</td>
                    <td>₹{Number(sale.amount).toLocaleString("en-IN")}</td>
                    <td>{sale.payment_method || "-"}</td>
                    <td>{sale.sale_date || "-"}</td>
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

export default OwnerSales;
