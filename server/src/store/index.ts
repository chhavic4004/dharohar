import { config } from "../config";
import { FileStore } from "./fileStore";
import { MongoStore } from "./mongoStore";
import type { Store } from "./types";

export type { Store } from "./types";

export async function createStore(): Promise<Store> {
  if (config.mongoUri) {
    const store = await MongoStore.connect(config.mongoUri, config.mongoDb);
    console.log(`[store] Connected to MongoDB database "${config.mongoDb}"`);
    return store;
  }
  console.log(`[store] Using JSON file store at ${config.dataFile} (set MONGODB_URI to use MongoDB)`);
  return new FileStore(config.dataFile);
}
