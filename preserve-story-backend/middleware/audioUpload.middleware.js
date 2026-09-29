import multer from "multer";
import fs from "node:fs";
import path from "node:path";

const audioDirectory = path.resolve(
  "preserve-story-backend/uploads/story-audio"
);

const allowedTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "application/octet-stream",
  "audio/webm",
  "audio/ogg",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir(audioDirectory, { recursive: true }, (error) => {
      cb(error, audioDirectory);
    });
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
      .toLowerCase();

    cb(null, `${req.params.id}-${Date.now()}${extension}`);
  },
});

export const uploadStoryAudio = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Unsupported audio format.")
      );
    }

    cb(null, true);
  },
});