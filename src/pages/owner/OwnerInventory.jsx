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

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      if (franchiseId) {
        try {
          const data = await getOwnerInventory(franchiseId);
          setInventory(data || []);
        } catch (err) {
          console.error("Inventory fetch error:", err);
          setInventory([]);
        }
      } else {
        setInventory([]);
      }
      setLoading(false);
    };
    fetchInventory();
  }, [franchiseId]);

  const filtered = inventory.filter((item) => {
    const matchSearch =
      (item.product_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.branch_location?.toLowerCase() || "").includes(search.toLowerCase());
    const matchLowStock = lowStockOnly ? item.quantity <= item.reorder_level : true;
    return matchSearch && matchLowStock;
  });

  const lowCount = inventory.filter(i => i.quantity <= i.reorder_level).length;

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h1>Franchise Inventory</h1>
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>Loading inventory...</div>
      ) : (
        <>
          <div className="expenses-controls">
            <input placeholder="Search by product or branch" value={search} onChange={(e) => setSearch(e.target.value)} />
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
              Low Stock Only
            </label>
            <div className="total">
              Total Items: {filtered.length}
              {lowCount > 0 && <span style={{ marginLeft: "12px", color: "#ef4444" }}>⚠️ {lowCount} low stock</span>}
            </div>
          </div>

          <div className="expenses-table">
            <table>
              <thead>
                <tr>
                  <th>Branch</th><th>Product Name</th><th>Quantity</th>
                  <th>Unit</th><th>Reorder Level</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.inventory_id}>
                    <td>{item.branch_location || "-"}</td>
                    <td>{item.product_name || "-"}</td>
                    <td>{item.quantity || "0"}</td>
                    <td>{item.unit || "-"}</td>
                    <td>{item.reorder_level || "0"}</td>
                    <td>
                      {item.quantity <= item.reorder_level ? (
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>⚠️ Low</span>
                      ) : (
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓ OK</span>
                      )}
                    </td>
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

export default OwnerInventory;
