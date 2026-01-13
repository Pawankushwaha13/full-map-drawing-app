
import * as turf from "@turf/turf";
import { Feature, Polygon } from "geojson";

export function handlePolygonOverlap(
  newPoly: Feature<Polygon>,
  existing: Feature<Polygon>[]
): { allowed: boolean; result?: Feature<Polygon> } {
  let result: Feature<Polygon> | null = newPoly;

  for (const ex of existing) {
    if (turf.booleanContains(ex, result!)) {
      return { allowed: false };
    }
    if (turf.booleanOverlap(ex, result!)) {
      const diff = turf.difference(result!, ex);
      if (!diff) return { allowed: false };
      result = diff as Feature<Polygon>;
    }
  }
  return { allowed: true, result: result! };
}
