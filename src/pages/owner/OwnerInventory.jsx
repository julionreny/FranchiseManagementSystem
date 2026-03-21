import { useEffect, useState } from "react";
import { getOwnerInventory } from "../../services/ownerInventoryService";
import "../expenses/Expenses.css";

const OwnerInventory = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const franchiseId = user?.franchise_id;

  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =============================
     FETCH INVENTORY
  ============================= */
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        if (franchiseId) {
          const data = await getOwnerInventory(franchiseId);
          setInventory(data || []);
        }
      } catch (err) {
        console.error("Inventory fetch error:", err);
        setInventory([]);
      }
      setLoading(false);
    };

    fetchInventory();
  }, [franchiseId]);

  /* =============================
     FILTER + SEARCH + LOW STOCK
  ============================= */
  const filtered = inventory
    .filter((item) => {
      const matchSearch =
        (item.product_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.branch_location?.toLowerCase() || "").includes(search.toLowerCase());

      const matchLowStock = lowStockOnly
        ? item.quantity <= item.reorder_level
        : true;

      return matchSearch && matchLowStock;
    })
    .sort((a, b) => a.quantity - b.quantity);   // sort by lowest quantity first

  const lowCount = inventory.filter(
    (i) => i.quantity <= i.reorder_level
  ).length;

  /* =============================
     LOADING STATE
  ============================= */
  if (loading) {
    return (
      <div className="expenses-page">
        <h2 style={{ textAlign: "center", padding: "40px" }}>
          Loading Inventory...
        </h2>
      </div>
    );
  }

  return (
    <div className="expenses-page">

      {/* HEADER */}
      <div className="expenses-header">
        <h1>Franchise Inventory</h1>
      </div>

      {/* CONTROLS */}
      <div className="inventory-controls">

        {/* SEARCH */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search product or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LOW STOCK TOGGLE */}
        <div className="toggle-box">
          <label className="switch">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
          <span className="toggle-text">Low Stock Only</span>
        </div>

        {/* TOTAL */}
        <div className="inventory-total">
          Total Items: {filtered.length}
          {lowCount > 0 && (
            <span className="low-warning">
              ⚠ {lowCount} low stock
            </span>
          )}
        </div>

      </div>

      {/* TABLE */}
      <div className="expenses-table">
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  No inventory found
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.inventory_id}>
                  <td>{item.branch_location || "-"}</td>
                  <td>{item.product_name || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.reorder_level}</td>
                  <td>
                    {item.quantity === 0 ? (
                      <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                        Out of Stock
                      </span>
                    ) : item.quantity <= item.reorder_level ? (
                      <span style={{ color: "#f59e0b", fontWeight: "bold" }}>
                        Low
                      </span>
                    ) : (
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default OwnerInventory;