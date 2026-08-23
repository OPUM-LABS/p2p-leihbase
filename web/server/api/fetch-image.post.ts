import { defineEventHandler, readBody, createError, setHeader } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: string }>(event);
  const targetUrl = body?.url?.trim();

  if (!targetUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "URL is required",
    });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid URL format",
    });
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only HTTP and HTTPS URLs are allowed",
    });
  }

  // Fetch the remote image
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to download image: ${response.statusText}`,
      });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw createError({
        statusCode: 400,
        statusMessage: "The provided URL did not return an image",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    // Max 20MB limit
    if (arrayBuffer.byteLength > 20 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: "Image file exceeds maximum allowed size (20MB)",
      });
    }

    setHeader(event, "Content-Type", contentType);
    setHeader(event, "Cache-Control", "no-cache");
    return Buffer.from(arrayBuffer);
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 502,
      statusMessage: `Could not fetch image from URL: ${err.message}`,
    });
  }
});
