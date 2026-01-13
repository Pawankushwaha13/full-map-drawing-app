
export function exportGeoJSON(fc: GeoJSON.FeatureCollection) {
  const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "features.geojson";
  a.click();
  URL.revokeObjectURL(url);
}
