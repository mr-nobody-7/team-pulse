
import express from "express";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API running 🚀" });
});
