import axios from "axios";

const API = "http://localhost:5000/api/inventory";

/* =========================
   GET INVENTORY
========================= */
export const getInventory = (branchId) =>
  axios.get(`${API}/${branchId}`);

/* =========================
   ADD INVENTORY ITEM
========================= */
export const addItem = (data) =>
  axios.post(`${API}/add`, data);

/* =========================
   UPDATE STOCK (+ / -)
========================= */
export const updateStock = (inventoryId, quantity) =>
  axios.put(
    `${API}/update-quantity/${inventoryId}`,
    { quantity }
  );

/* =========================
   DELETE INVENTORY ITEM
========================= */
export const deleteItem = (inventoryId) =>
  axios.delete(`${API}/${inventoryId}`);
