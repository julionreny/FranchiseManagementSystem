import axios from "axios";

const API = "http://localhost:5000/api/sales";

export const getSalesByBranch = async (branchId, month) => {
  const res = await axios.get(`${API}/${branchId}`, {
    params: { month }
  });
  return res.data;
};

export const addSale = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};
