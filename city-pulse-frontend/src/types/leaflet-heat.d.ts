import * as L from "leaflet";

declare module "leaflet" {
  function heatLayer(
    latlngs: L.LatLngExpression[] | [number, number, number?][],
    options?: {
      radius?: number;
      blur?: number;
      minOpacity?: number;
      maxZoom?: number;
      maxOpacity?: number;
      gradient?: Record<number, string>;
    }
  ): L.Layer;
}