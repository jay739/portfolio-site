import fs from "fs";
import path from "path";

// Shape of one entry in public/images/gallery/manifest.json. Kept in sync with
// the GalleryItem interface used by the carousel and the gallery API route.
export interface GalleryImage {
  id: string;
  filename: string;
  prompt: string;
  style: string;
  speedMode: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  createdAt: string;
}

const GALLERY_DIR = path.join(process.cwd(), "public/images/gallery");
const MANIFEST_FILE = path.join(GALLERY_DIR, "manifest.json");

// Read on every call (the manifest lives on a runtime-mounted volume and
// changes as new images are saved, so it must not be cached at build time).
export function getGalleryImages(): GalleryImage[] {
  try {
    const raw = fs.readFileSync(MANIFEST_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GalleryImage[]) : [];
  } catch {
    return [];
  }
}

export function getGalleryImage(id: string): GalleryImage | null {
  // Guard against path traversal in callers that pass the id into fs reads.
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return getGalleryImages().find((image) => image.id === id) ?? null;
}

// Absolute path to the rendered PNG, used by the OG route to embed the bytes.
export function galleryImagePath(filename: string): string {
  return path.join(GALLERY_DIR, filename);
}
