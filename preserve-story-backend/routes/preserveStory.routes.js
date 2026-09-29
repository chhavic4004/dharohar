
import express from "express";

import {
  createStoryController,
  getStoryController,
  getAllStoriesController,
  uploadStoryAudioController,
} from "../controllers/preserveStory.controller.js";

import {
  uploadStoryAudio,
} from "../middleware/audioUpload.middleware.js";

const router = express.Router();

// CREATE A NEW STORY DRAFT
router.post("/", createStoryController);

// GET ALL STORIES
router.get("/", getAllStoriesController);

// UPLOAD AUDIO TO AN EXISTING STORY
router.post(
  "/:id/audio",
  uploadStoryAudio.single("audio"),
  uploadStoryAudioController
);

// GET ONE STORY BY ID
router.get("/:id", getStoryController);

export default router;