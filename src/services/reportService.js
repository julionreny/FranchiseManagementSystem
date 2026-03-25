import axios from "axios";

const API = "http://localhost:5000/api/reports";

export const getHQReports = (franchiseId) => axios.get(`${API}/${franchiseId}`);
export const createHQReport = (data) => axios.post(API, data);
export const generateAutomatedReport = (data) => axios.post(`${API}/generate`, data);
