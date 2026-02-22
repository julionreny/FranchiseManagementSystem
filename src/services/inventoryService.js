import axios from "axios";

const API = "http://localhost:5000/api/inventory";


/* =========================
   GET INVENTORY
   Returns all items including unit
========================= */
export const getInventory = async (branchId) => {

  try {

    const response = await axios.get(`${API}/${branchId}`);

    return response;

  } catch (error) {

    console.error("Get Inventory Error:", error);

    throw error;
  }
};


/* =========================
   ADD INVENTORY ITEM
   Includes unit field
========================= */
export const addItem = async (data) => {

  try {

    const response = await axios.post(
      `${API}/add`,
      {
        branch_id: data.branch_id,
        product_name: data.product_name,
        quantity: data.quantity,
        unit: data.unit,
        reorder_level: data.reorder_level
      }
    );

    return response;

  } catch (error) {

    console.error("Add Item Error:", error);

    throw error;
  }
};


/* =========================
   UPDATE STOCK (+ / -)
   Unit remains unchanged
========================= */
export const updateStock = async (inventoryId, quantity) => {

  try {

    const response = await axios.put(
      `${API}/update-quantity/${inventoryId}`,
      { quantity }
    );

    return response;

  } catch (error) {

    console.error("Update Stock Error:", error);

    throw error;
  }
};


/* =========================
   DELETE INVENTORY ITEM
========================= */
export const deleteItem = async (inventoryId) => {

  try {

    const response = await axios.delete(
      `${API}/${inventoryId}`
    );

    return response;

  } catch (error) {

    console.error("Delete Item Error:", error);

    throw error;
  }
};
