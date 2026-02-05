import { useState } from "react";

export default function Sales() {
  const [salesData] = useState([
    { id: 1, product: "Product A", quantity: 10, price: 500, total: 5000, date: "2026-02-01" },
    { id: 2, product: "Product B", quantity: 5, price: 1000, total: 5000, date: "2026-02-02" },
    { id: 3, product: "Product C", quantity: 20, price: 250, total: 5000, date: "2026-02-03" }
  ]);

  return (
    <div>
      <h1 style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: "600", marginBottom: "20px" }}>
        Sales Management
      </h1>

      <div style={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Product</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Quantity</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Price</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Total</th>
              <th style={{ padding: "14px", textAlign: "left", color: "#94a3b8", fontWeight: "500" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{sale.product}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{sale.quantity}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>₹{sale.price}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>₹{sale.total}</td>
                <td style={{ padding: "14px", color: "#e5e7eb" }}>{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}