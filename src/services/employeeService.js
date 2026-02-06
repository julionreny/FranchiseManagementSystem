import axios from "axios";

const API = "http://localhost:5000/api/employees";

export const getEmployees = (branchId) =>
  axios.get(`${API}/${branchId}`);

export const addEmployee = (data) =>
  axios.post(`${API}/add`, data);

export const deleteEmployee = (id) =>
  axios.delete(`${API}/${id}`);

export const removeEmployee = (id) =>
  axios.delete(`${API}/${id}`);

