
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import preserveStoryRoutes from "./routes/preserveStory.routes.js";

dotenv.config({ path: "preserve-story-backend/.env" });

const app = express();
const PORT = process.env.PRESERVE_STORY_PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Dharohar Preserve a Story backend is running!",
  });
});

// Preserve a Story API
app.use("/api/stories", preserveStoryRoutes);

app.listen(PORT, () => {
  console.log(
    `Dharohar Preserve Story API running at http://localhost:${PORT}`
  );
});