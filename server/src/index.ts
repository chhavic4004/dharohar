import { createApp } from "./app";
import { config } from "./config";
import { createStore } from "./store";

const store = await createStore();
const app = createApp(store);

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
