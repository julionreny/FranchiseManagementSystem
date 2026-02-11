import axios from "axios";

const API = "http://localhost:5000/api/notifications";

export const getNotifications = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const clearNotifications = (branchId) =>
  axios.delete(`${API}/clear/${branchId}`);
