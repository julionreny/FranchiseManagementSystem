import axios from "axios";

const API = "http://localhost:5000/api/notifications";

export const getNotifications = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const clearNotifications = (branchId) =>
  axios.delete(`${API}/clear/${branchId}`);

/* READ (delete single notification) */
export const deleteNotification = (id) =>
  axios.delete(`${API}/${id}`);