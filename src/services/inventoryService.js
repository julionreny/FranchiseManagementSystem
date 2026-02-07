import axios from "axios";

const API = "http://localhost:5000/api/inventory";

export const getInventory = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const addItem = (data) =>
  axios.post(`${API}/add`, data);

export const updateStock = (id, change) =>
  axios.put(`${API}/update-stock`, { id, change });

export const deleteItem = (id) =>
  axios.delete(`${API}/${id}`);
