
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { generateHeritageAnswer } from "./chatbot-services/chatbot-ai.js";
import { checkHeritageScope } from "./chatbot-safety/scope-check.js";
import { searchHeritage } from "./chatbot-services/heritage-search.js";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const REFUSAL_MESSAGE =
  "I am DHAROHAR, your Heritage and Culture Guide. " +
  "I can answer questions about monuments, history, " +
  "architecture, traditions, festivals, art and culture. " +
  "Please ask me something related to heritage!";

// Check that the backend is running
app.get("/", (req, res) => {
  res.json({
    message: "DHAROHAR Chatbot Backend is running!",
    status: "online"
  });
});

// AI chatbot endpoint
app.post("/api/ask", async (req, res) => {
  const { question, monumentId, language } = req.body ?? {};

  // Validate the question
  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({
      answer: "Please enter a question."
    });
  }

  if (question.trim().length > 500) {
    return res.status(400).json({
      answer: "Please keep your question under 500 characters."
    });
  }

  // Check whether the question is heritage-related
  const safety = checkHeritageScope(question, monumentId);

  console.log("Question:", question);
  console.log("Monument:", monumentId ?? "general");
  console.log("Language:", language ?? "en");
  console.log("Safety:", safety);

  // Reject unrelated questions
  if (!safety.allowed) {
    return res.json({
      answer: REFUSAL_MESSAGE,
      allowed: false,
      reason: safety.reason
    });
  }

  try {
    // Find relevant facts in the local knowledge base
    const results = searchHeritage(
      question,
      monumentId || "general"
    );

    // Ask Gemini to generate a natural-language answer
    const answer = await generateHeritageAnswer({
      question: question.trim(),
      monumentId: monumentId || "general",
      language: language || "en",
      context: results
    });

    return res.json({
      answer,
      allowed: true,
      reason: safety.reason,
      source: results[0]?.name || "Gemini AI"
    });

  } catch (error) {
    console.error("Chatbot AI error:", error.message);

    return res.status(502).json({
      answer:
        "Sorry, I couldn't generate an answer right now. " +
        "Please try again in a moment.",
      allowed: true,
      reason: "ai_service_error"
    });
  }
});

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