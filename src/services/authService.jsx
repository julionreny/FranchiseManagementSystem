import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

export const sendOwnerOtp = (email) =>
  API.post("/owner/send-otp", { email });

export const verifyOtp = (email, otp) =>
  API.post("/verify-otp", { email, otp });

export const registerOwner = (data) =>
  API.post("/owner/register", data);

export const registerManager = (data) =>
  API.post("/manager/register", data);

export const loginUser = (data) =>
  API.post("/login", data);
