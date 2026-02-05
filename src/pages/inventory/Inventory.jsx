import { useState } from "react";
import "./Inventory.css";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [inventory, setInventory] = useState([
    { id: 1, name: "Shampoo", category: "Groceries", stock: 5, min: 10 },
    { id: 2, name: "Soap", category: "Groceries", stock: 3, min: 8 },
    { id: 3, name: "Laptop", category: "Electronics", stock: 5, min: 3 },
    { id: 4, name: "Rice Bags", category: "Raw Material", stock: 0, min: 8 },
    { id: 5, name: "Syrup", category: "Beverages", stock: 11, min: 6 }
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    min: ""
  });

  const getStatus = (stock, min) => {
    if (stock === 0) return "out";
    if (stock < min) return "low";
    return "in";
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const isLowStock = item.stock < item.min;
    return lowStockOnly ? matchesSearch && isLowStock : matchesSearch;
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) return;

    setInventory([
      ...inventory,
      {
        id: Date.now(),
        name: newItem.name,
        category: newItem.category,
        stock: Number(newItem.stock),
        min: Number(newItem.min)
      }
    ]);

    setNewItem({ name: "", category: "", stock: "", min: "" });
    setShowAddModal(false);
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const confirmRemove = () => {
    setInventory(inventory.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setRemoveMode(false);
  };

  const updateStock = (id, value) => {
    setInventory(
      inventory.map(item =>
        item.id === id ? { ...item, stock: Number(value) } : item
      )
    );
  };

  return (
    <div>
      <div className="inventory-header">
        <h1>Inventory Management</h1>

        <div className="inventory-buttons">
              <button className="primary-btn" onClick={() => setShowAddModal(true)}>
                + Add Item
              </button>

              <button
                className="primary-btn danger-outline"
                onClick={() => setRemoveMode(!removeMode)}
              >
                Remove Items
              </button>

              {removeMode && (
                <button className="danger-btn" onClick={confirmRemove}>
                  Confirm Remove
                </button>
              )}
        </div>
      </div>

      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={() => setLowStockOnly(!lowStockOnly)}
          />
          Low Stock Only
        </label>
      </div>

      <div className="inventory-table-wrapper">
        <table className="inventory-table">
        <thead>
          <tr>
            {removeMode && <th></th>}
            <th>Item</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Min Required</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredInventory.map(item => {
            const status = getStatus(item.stock, item.min);

            return (
              <tr key={item.id}>
                {removeMode && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                )}
                <td>{item.name}</td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td>
                  <input
                    type="number"
                    className="stock-input"
                    value={item.stock}
                    onChange={(e) =>
                      updateStock(item.id, e.target.value)
                    }
                  />
                </td>
                <td>{item.min}</td>
                <td>
                  <span className={`status ${status}`}>
                    {status === "in"
                      ? "In Stock"
                      : status === "low"
                      ? "Low Stock"
                      : "Out of Stock"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Inventory Item</h2>

            <input
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
            />

            <input
              placeholder="Category"
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={newItem.stock}
              onChange={(e) =>
                setNewItem({ ...newItem, stock: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Minimum Required"
              value={newItem.min}
              onChange={(e) =>
                setNewItem({ ...newItem, min: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleAddItem}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
