import { useState } from "react";

export default function Notifications() {
  const [notifications] = useState([
    { id: 1, title: "Low Stock Alert", message: "Product A is running low on inventory", timestamp: "2026-02-05 10:30 AM", status: "unread" },
    { id: 2, title: "New Order", message: "Order #1023 has been placed", timestamp: "2026-02-05 09:15 AM", status: "read" },
    { id: 3, title: "Employee Added", message: "New employee John Doe has been added", timestamp: "2026-02-04 03:45 PM", status: "read" }
  ]);

  return (
    <div>
      <h1 style={{ color: "#f1f5f9", fontSize: "28px", fontWeight: "600", marginBottom: "20px" }}>
        Notifications
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              background: notif.status === "unread" ? "#0f3a5f" : "#020617",
              border: `1px solid ${notif.status === "unread" ? "#1e5a8e" : "#1e293b"}`,
              borderRadius: "8px",
              padding: "14px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <h3 style={{ color: "#f1f5f9", margin: "0 0 6px 0", fontSize: "16px" }}>
              {notif.title}
            </h3>
            <p style={{ color: "#cbd5e1", margin: "0 0 6px 0", fontSize: "14px" }}>
              {notif.message}
            </p>
            <span style={{ color: "#64748b", fontSize: "12px" }}>
              {notif.timestamp}
            </span>
            {notif.status === "unread" && (
              <span
                style={{
                  display: "inline-block",
                  marginLeft: "8px",
                  background: "#3b82f6",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: "500"
                }}
              >
                NEW
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}