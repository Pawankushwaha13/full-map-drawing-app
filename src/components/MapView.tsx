
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

import { SHAPE_LIMITS } from "../utils/config";
import { handlePolygonOverlap } from "../utils/overlap";
import { exportGeoJSON } from "../services/exportGeoJSON";

export default function MapView() {
  const fgRef = useRef<L.FeatureGroup>(null);
  const [features, setFeatures] = useState<GeoJSON.Feature[]>([]);

  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    const map = fg._map!;

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: fg },
      draw: {
        polygon: true,
        rectangle: true,
        circle: true,
        polyline: true,
        marker: false
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      const geo = layer.toGeoJSON() as GeoJSON.Feature;

      const type = geo.geometry.type;
      const counts = features.filter(f => f.geometry.type === type).length;

      if (
        (type === "Polygon" && counts >= SHAPE_LIMITS.polygon) ||
        (type === "LineString" && counts >= SHAPE_LIMITS.line)
      ) {
        alert("Shape limit exceeded");
        return;
      }

      if (type === "Polygon") {
        const polys = features.filter(f => f.geometry.type === "Polygon") as any;
        const check = handlePolygonOverlap(geo as any, polys as any);
        if (!check.allowed) {
          alert("Polygon overlap not allowed");
          return;
        }
        fg.addLayer(L.geoJSON(check.result!));
        setFeatures([...features, check.result!]);
      } else {
        fg.addLayer(layer);
        setFeatures([...features, geo]);
      }
    });
  }, [features]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <button
        onClick={() =>
          exportGeoJSON({ type: "FeatureCollection", features })
        }
        style={{ position: "absolute", zIndex: 1000, left: 10, top: 10 }}
      >
        Export GeoJSON
      </button>

      <MapContainer center={[28.61, 77.2]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup ref={fgRef} />
      </MapContainer>
    </div>
  );
}
