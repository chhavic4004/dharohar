const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function readMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) return reject(new Error("invalid_multipart"));

    const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_IMAGE_BYTES) {
        reject(new Error("file_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("error", reject);
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const boundaryBytes = Buffer.from(`\r\n${boundary}`);
      const parts = [];
      let cursor = 0;
      while (true) {
        const start = body.indexOf(Buffer.from(boundary), cursor);
        if (start < 0) break;
        const contentStart = body.indexOf(Buffer.from("\r\n\r\n"), start);
        if (contentStart < 0) break;
        const nextBoundary = body.indexOf(boundaryBytes, contentStart + 4);
        if (nextBoundary < 0) break;
        const headers = body.subarray(start + boundary.length + 2, contentStart).toString("utf8");
        parts.push({ headers, data: body.subarray(contentStart + 4, nextBoundary) });
        cursor = nextBoundary + boundaryBytes.length;
      }

      const filePart = parts.find((part) => /name="file"/.test(part.headers));
      const langPart = parts.find((part) => /name="lang"/.test(part.headers));
      if (!filePart) return reject(new Error("missing_file"));

      const type = filePart.headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || "";
      resolve({ image: filePart.data, mimeType: type, lang: langPart?.data.toString("utf8").trim() || "en" });
    });
  });
}

export async function detectHandler(req, res) {
  try {
    const { image, mimeType, lang } = await readMultipart(req);
    if (!/^image\/(jpeg|png|webp|gif)$/.test(mimeType)) {
      return res.status(400).json({ error: "Please upload a JPG, PNG, WEBP or GIF image." });
    }

    const { generateHeritageImageAnswer } = await import("./chatbot-services/chatbot-ai.js");
    const information = await generateHeritageImageAnswer({
      image,
      mimeType,
      language: lang,
    });
    return res.json({ information });
  } catch (error) {
    console.error("Photo detection error:", error?.message || error);
    const message = error?.message === "file_too_large"
      ? "The image must be smaller than 10 MB."
      : error?.message === "missing_file"
        ? "Please upload an image."
        : "Photo detection is unavailable right now. Please try again later.";
    return res.status(error?.message === "file_too_large" || error?.message === "missing_file" ? 400 : 502).json({ error: message });
  }
}