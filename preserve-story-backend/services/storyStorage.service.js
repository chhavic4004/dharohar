
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const storiesFile = path.join(
  currentDir,
  "../data/stories.json"
);

async function readStories() {
  try {
    const data = await fs.readFile(storiesFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(storiesFile, "[]", "utf-8");
      return [];
    }
    throw error;
  }
}

async function writeStories(stories) {
  await fs.writeFile(
    storiesFile,
    JSON.stringify(stories, null, 2),
    "utf-8"
  );
}

export async function createStory(story) {
  const stories = await readStories();
  stories.push(story);
  await writeStories(stories);
  return story;
}

export async function getStoryById(id) {
  const stories = await readStories();
  return stories.find((story) => story.id === id) || null;
}

export async function getAllStories() {
  return await readStories();
}

export async function updateStoryById(id, updates) {
  const stories = await readStories();
  const index = stories.findIndex(
    (story) => story.id === id
  );

  if (index === -1) return null;

  stories[index] = {
    ...stories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeStories(stories);
  return stories[index];
}