import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI?.trim() || "",
  mongoDb: process.env.MONGODB_DB?.trim() || "dharohar",
  dataFile: process.env.DATA_FILE?.trim() || "data/db.json",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173,http://localhost:8443")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isTest: process.env.NODE_ENV === "test",
};
