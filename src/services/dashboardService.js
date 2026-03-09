import axios from "axios";

const API =
"http://localhost:5000/api/dashboard";


export const getSummary =
(branchId) =>
axios.get(`${API}/summary/${branchId}`);


export const getSalesChart =
(branchId) =>
axios.get(`${API}/sales-chart/${branchId}`);


export const getOwnerStats = (franchiseId) =>
  axios.get(`${API}/owner-stats/${franchiseId}`);

export const getOwnerBranchTrend = (franchiseId) =>
  axios.get(`${API}/owner-branch-trend/${franchiseId}`);

export const getOwnerBranchPerformance = (franchiseId) =>
  axios.get(`${API}/owner-branch-performance/${franchiseId}`);

export const getSalesForecast = (franchiseId) =>
  axios.get(`${API}/forecast/${franchiseId}`);
