import axios from "axios";
import { FALLBACK_STORIES, FALLBACK_PARTITION_PATH } from "../data/fallbackStories";

// Single place all API configuration lives. In dev, Vite's proxy (see
// vite.config.js) forwards "/api/*" to http://localhost:5000, so leaving
// VITE_API_BASE_URL empty and using relative paths just works. Set
// VITE_API_BASE_URL in frontend/.env if the backend runs somewhere else
// (e.g. a deployed URL) and you want to bypass the dev proxy.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 6000,
});

function filterFallback(stories, { category, language, year, search } = {}) {
  let result = stories;

  if (category && category !== "All") {
    result = result.filter((s) => s.category === category);
  }
  if (language && language !== "All") {
    result = result.filter((s) => (s.language || "").includes(language));
  }
  if (year && year !== "All") {
    const y = Number(year);
    result = result.filter(
      (s) => Array.isArray(s.journey) && s.journey.some((p) => Number(p.year) === y)
    );
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.location || "").toLowerCase().includes(q)
    );
  }
  return result;
}

/**
 * Fetch stories from the backend, optionally filtered by category / language /
 * year / search text. Falls back to local mock data if the backend is
 * unreachable, so the page still works during frontend-only development or
 * if the backend process wasn't started before a demo.
 */
export async function fetchStories({ category, language, year, search } = {}) {
  try {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (language && language !== "All") params.language = language;
    if (year && year !== "All") params.year = year;
    if (search) params.search = search;

    const { data } = await client.get("/api/stories", { params });
    return { stories: data.stories, source: "api" };
  } catch (err) {
    console.warn("[storiesApi] Falling back to local story data:", err.message);
    const stories = filterFallback(FALLBACK_STORIES, { category, language, year, search });
    return { stories, source: "fallback" };
  }
}

/** Fetch a single story by id (used for deep-linking / detail refresh). */
export async function fetchStoryById(id) {
  try {
    const { data } = await client.get(`/api/stories/${id}`);
    return { story: data, source: "api" };
  } catch (err) {
    const story = FALLBACK_STORIES.find((s) => s.id === id) || null;
    if (!story) throw new Error("Story not found");
    return { story, source: "fallback" };
  }
}

/**
 * Fetch just the migration journey for a story. Returns null (not a thrown
 * error) when the story has no journey data, so callers can quietly treat
 * that story as a simple single-point pin instead of showing an error.
 */
export async function fetchStoryJourney(id) {
  try {
    const { data } = await client.get(`/api/stories/${id}/journey`);
    return { journey: data.journey, source: "api" };
  } catch (err) {
    const story = FALLBACK_STORIES.find((s) => s.id === id);
    if (story && Array.isArray(story.journey) && story.journey.length) {
      return { journey: story.journey, source: "fallback" };
    }
    return { journey: null, source: err.response?.status === 404 ? "none" : "fallback" };
  }
}

export async function fetchPartitionPath() {
  try {
    const { data } = await client.get("/api/partition-path");
    return data;
  } catch (err) {
    console.warn("[storiesApi] Falling back to local partition path data:", err.message);
    return FALLBACK_PARTITION_PATH;
  }
}

export async function fetchLanguages() {
  try {
    const { data } = await client.get("/api/stories/languages");
    return data.languages;
  } catch (err) {
    const langs = [...new Set(FALLBACK_STORIES.map((s) => s.language).filter(Boolean))];
    return langs;
  }
}

/** Add a new story pin (used by the "Preserve a Story" / Admin flows). */
export async function createStory(payload) {
  const { data } = await client.post("/api/stories", payload);
  return data;
}

export async function updateStory(id, payload) {
  const { data } = await client.put(`/api/stories/${id}`, payload);
  return data;
}

export async function deleteStory(id) {
  await client.delete(`/api/stories/${id}`);
}
