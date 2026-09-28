// Runs the Heritage Map API *inside* the Vite server, so `npm run dev`
// (or `npm run preview`) serves the website AND /api/* on one port.
// Same endpoints + same data files as backend/server.js, but with zero extra
// dependencies. (backend/server.js still works as an optional standalone server.)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const dataDir = () => path.resolve(process.cwd(), "backend", "data");
const storiesFile = () => path.join(dataDir(), "stories.json");
const readStories = () => JSON.parse(fs.readFileSync(storiesFile(), "utf-8"));
const writeStories = (s) => fs.writeFileSync(storiesFile(), JSON.stringify(s, null, 2), "utf-8");

function send(res, status, body) {
  if (status === 204) {
    res.statusCode = 204;
    return res.end();
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function filterStories(stories, q) {
  const { category, language, year, region, search } = q;
  if (category && category !== "All")
    stories = stories.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  if (language && language !== "All")
    stories = stories.filter((s) => (s.language || "").toLowerCase().includes(language.toLowerCase()));
  if (year && year !== "All") {
    const y = Number(year);
    stories = stories.filter(
      (s) => Array.isArray(s.journey) && s.journey.some((p) => Number(p.year) === y)
    );
  }
  if (region)
    stories = stories.filter((s) => (s.location || "").toLowerCase().includes(region.toLowerCase()));
  if (search) {
    const t = search.toLowerCase();
    stories = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        (s.description || "").toLowerCase().includes(t) ||
        (s.location || "").toLowerCase().includes(t) ||
        (s.person || "").toLowerCase().includes(t)
    );
  }
  return stories;
}

async function handle(req, res, next) {
  const url = new URL(req.originalUrl || req.url, "http://localhost");
  const p = url.pathname.replace(/\/+$/, "");
  if (!p.startsWith("/api/")) return next();
  const method = req.method;
  const q = Object.fromEntries(url.searchParams);

  try {
    if (p === "/api/health" && method === "GET")
      return send(res, 200, { status: "ok", service: "dharohar-map-api" });

    if (p === "/api/partition-path" && method === "GET")
      return send(res, 200, JSON.parse(fs.readFileSync(path.join(dataDir(), "partitionPath.json"), "utf-8")));

    if (!p.startsWith("/api/stories")) return next();
    const parts = p.split("/").slice(3); // after /api/stories

    if (parts.length === 0) {
      if (method === "GET") {
        const stories = filterStories(readStories(), q);
        return send(res, 200, { count: stories.length, stories });
      }
      if (method === "POST") {
        const b = await readBody(req);
        if (!b.category || !b.title || !b.location || b.lat === undefined || b.lng === undefined)
          return send(res, 400, { error: "category, title, location, lat and lng are required" });
        const stories = readStories();
        const story = {
          id: crypto.randomUUID(),
          category: b.category,
          title: b.title,
          location: b.location,
          lat: Number(b.lat),
          lng: Number(b.lng),
          description: b.description || "",
          contributor: b.contributor || "Anonymous",
          language: b.language || "",
          audioUrl: b.audioUrl || "",
          imageUrl: b.imageUrl || "",
          dateRecorded: new Date().toISOString().slice(0, 10),
          journey: Array.isArray(b.journey) ? b.journey : undefined,
        };
        stories.push(story);
        writeStories(stories);
        return send(res, 201, story);
      }
      return next();
    }

    if (parts[0] === "categories" && method === "GET")
      return send(res, 200, { categories: [...new Set(readStories().map((s) => s.category))] });
    if (parts[0] === "languages" && method === "GET")
      return send(res, 200, { languages: [...new Set(readStories().map((s) => s.language).filter(Boolean))] });

    const id = decodeURIComponent(parts[0]);
    const stories = readStories();
    const idx = stories.findIndex((s) => s.id === id);

    if (parts.length === 2 && parts[1] === "journey" && method === "GET") {
      if (idx === -1) return send(res, 404, { error: "Story not found" });
      const s = stories[idx];
      if (!Array.isArray(s.journey) || !s.journey.length)
        return send(res, 404, { error: "This story has no migration journey data" });
      return send(res, 200, {
        id: s.id,
        person: s.person || s.contributor || "",
        title: s.title,
        language: s.language || "",
        journey: s.journey,
      });
    }

    if (parts.length === 1) {
      if (method === "GET")
        return idx === -1 ? send(res, 404, { error: "Story not found" }) : send(res, 200, stories[idx]);
      if (method === "PUT") {
        if (idx === -1) return send(res, 404, { error: "Story not found" });
        stories[idx] = { ...stories[idx], ...(await readBody(req)), id: stories[idx].id };
        writeStories(stories);
        return send(res, 200, stories[idx]);
      }
      if (method === "DELETE") {
        if (idx === -1) return send(res, 404, { error: "Story not found" });
        stories.splice(idx, 1);
        writeStories(stories);
        return send(res, 204);
      }
    }
    return next();
  } catch (err) {
    return send(res, 500, { error: "API error", details: err.message });
  }
}

export default function heritageMapApi() {
  return {
    name: "heritage-map-api",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}
