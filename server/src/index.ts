import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { RequestHandler } from "express";
import { createApp, type WebExtras } from "./app";
import { config } from "./config";
import { createStore } from "./store";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Loads a plain-JS module from the repo root (map API, chatbot) without TypeScript resolving it. */
async function loadJs<T>(rel: string): Promise<T> {
  return (await import(pathToFileURL(path.join(repoRoot, rel)).href)) as T;
}

async function webExtras(): Promise<WebExtras> {
  const web: WebExtras = {
    detect: (await loadJs<{ detectHandler: RequestHandler }>("chatbot-backend/photoDetectionHandler.js")).detectHandler,
  };
  if (config.webDir) {
    const dir = path.resolve(repoRoot, config.webDir);
    if (fs.existsSync(path.join(dir, "index.html"))) {
      web.webDir = dir;
      try {
        web.mapApi = (await loadJs<{ handle: RequestHandler }>("backend/vitePlugin.mjs")).handle;
      } catch (e) {
        console.warn("[web] story map API not loaded:", (e as Error).message);
      }
      console.log(`[web] serving the website from ${dir}`);
    } else {
      console.warn(`[web] WEB_DIR is set but ${dir}/index.html was not found. Run "npm run build" first.`);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      web.ask = (await loadJs<{ askHandler: RequestHandler }>("chatbot-backend/askHandler.js")).askHandler;
      console.log("[web] AI chatbot enabled at POST /api/ask");
    } catch (e) {
      console.warn("[web] chatbot not loaded:", (e as Error).message);
    }
  }
  return web;
}

const store = await createStore();
const app = createApp(store, { web: await webExtras() });
const server = app.listen(config.port, () => {
  console.log(`[api] Dharohar API listening on http://localhost:${config.port}`);
});

const shutdown = async () => {
  server.close();
  await store.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
