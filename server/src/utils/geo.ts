import type { LatLng } from "../../../shared/quiz-contract";

/** Great-circle distance in kilometres (haversine formula). O(1). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough bounding box of India, used to reject nonsense pins. */
export function isInsideIndiaBox(p: LatLng): boolean {
  return p.lat >= 5 && p.lat <= 38 && p.lng >= 67 && p.lng <= 98;
}
