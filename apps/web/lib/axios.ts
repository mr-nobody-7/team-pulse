import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  // Send the httpOnly cookie on every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
