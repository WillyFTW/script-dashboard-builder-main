import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://uebungsprojekt-maria-db.vercel.app/api"
    : "http://localhost:3000/api";

const api = axios.create({
  baseURL,
});

export default api;
