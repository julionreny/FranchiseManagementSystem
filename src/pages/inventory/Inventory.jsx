import { useEffect, useState } from "react";
import "./Inventory.css";
import {
  getInventory,
  addItem,
  updateStock,
  deleteItem,
} from "../../services/inventoryService";

const Inventory = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    product_name: "",
    quantity: "",
    reorder_level: "",
  });

  const fetchInventory = async () => {
    const res = await getInventory(branchId);
    setItems(res.data);
  };

  useEffect(() => {
    if (branchId) fetchInventory();
  }, [branchId]);

  /* =========================
     ADD ITEM
  ========================= */
  const handleAdd = async () => {
    if (!form.product_name) return alert("Product name required");

    await addItem({
      ...form,
      branch_id: branchId,
    });

    setForm({ product_name: "", quantity: "", reorder_level: "" });
    setShowForm(false);
    fetchInventory();
  };

  /* =========================
     DELETE ITEM
  ========================= */
  const handleDelete = async (inventoryId) => {
    if (!window.confirm("Remove this item?")) return;
    await deleteItem(inventoryId);
    fetchInventory();
  };

  /* =========================
     CHANGE STOCK (+ / -)
  ========================= */
  const changeStock = async (item, delta) => {
    const newQuantity = Number(item.quantity) + delta;

    if (newQuantity < 0) return;

    await updateStock(item.inventory_id, newQuantity);
    fetchInventory();
  };

  /* =========================
     FILTER
  ========================= */
  const filtered = items.filter((item) => {
    const matchSearch = item.product_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchLow = lowOnly
      ? item.quantity < item.reorder_level
      : true;

    return matchSearch && matchLow;
  });

  return (
    <div className="inventory-page">
      {/* HEADER */}
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <button onClick={() => setShowForm(true)}>+ Add Item</button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LOW STOCK FILTER */}
      <label className="low-stock-toggle">
        <input
          type="checkbox"
          checked={lowOnly}
          onChange={() => setLowOnly(!lowOnly)}
        />
        Low Stock Only
      </label>

      {/* ADD ITEM MODAL */}
      {showForm && (
        <div className="inventory-modal">
          <h3>Add Inventory Item</h3>

          <input
            type="text"
            placeholder="Product Name"
            value={form.product_name}
            onChange={(e) =>
              setForm({ ...form, product_name: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Reorder Level"
            value={form.reorder_level}
            onChange={(e) =>
              setForm({ ...form, reorder_level: e.target.value })
            }
          />

          <div className="modal-actions">
            <button onClick={handleAdd}>Save Item</button>
            <button
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* INVENTORY TABLE */}
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  No inventory items found
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const status =
                  item.quantity === 0
                    ? "out"
                    : item.quantity < item.reorder_level
                    ? "low"
                    : "ok";

                return (
                  <tr key={item.inventory_id}>
                    <td>{item.product_name}</td>

                    <td>
                      <div className="stock-controls">
                        <button
                          onClick={() => changeStock(item, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => changeStock(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{item.reorder_level}</td>

                    <td>
                      <span className={`status ${status}`}>
                        {status === "ok"
                          ? "In Stock"
                          : status === "low"
                          ? "Low Stock"
                          : "Out of Stock"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(item.inventory_id)
                        }
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
