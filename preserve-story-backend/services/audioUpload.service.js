import {
  getStoryById,
  updateStoryById,
} from "./storyStorage.service.js";

export async function saveStoryAudio(storyId, file) {
  const story = await getStoryById(storyId);

  if (!story) {
    return null;
  }

  if (story.status !== "draft") {
    throw new Error("Only draft stories can receive audio.");
  }

  const updatedStory = await updateStoryById(storyId, {
    audioFile: file.filename,
    audioOriginalName: file.originalname,
    audioMimeType: file.mimetype,
    audioSize: file.size,
    status: "recorded",
  });

  return updatedStory;
}