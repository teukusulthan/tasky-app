import {
  type CollisionDetection,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import { COLUMN_PREFIX } from "./constants";

// prioritas ke area kolom (drop saat kosong)
export const columnFirstCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length) {
    const colHit = pointerHits.find((c) =>
      String(c.id).startsWith(COLUMN_PREFIX)
    );
    return [colHit ?? pointerHits[0]];
  }
  const rectHits = rectIntersection(args);
  if (rectHits.length) {
    const colHit = rectHits.find((c) => String(c.id).startsWith(COLUMN_PREFIX));
    return [colHit ?? rectHits[0]];
  }
  return [];
};
