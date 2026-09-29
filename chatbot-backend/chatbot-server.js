
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { askHandler } from "./askHandler.js";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// Check that the backend is running
app.get("/", (req, res) => {
  res.json({
    message: "DHAROHAR Chatbot Backend is running!",
    status: "online"
  });
});

// AI chatbot endpoint
app.post("/api/ask", askHandler);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    answer: "This chatbot endpoint was not found."
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `DHAROHAR Chatbot running at http://localhost:${PORT}`
  );
});