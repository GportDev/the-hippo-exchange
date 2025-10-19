declare module "react-leaflet" {
  import type { ComponentType } from "react";
  import type { LatLngExpression } from "leaflet";

  export const MapContainer: ComponentType<{
    center: LatLngExpression;
    zoom?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }>;

  export const TileLayer: ComponentType<{
    url: string;
    attribution?: string;
  }>;

  export const Marker: ComponentType<{
    position: LatLngExpression;
    draggable?: boolean;
    eventHandlers?: Record<string, (event: unknown) => void>;
  }>;

  export function useMap(): {
    setView(center: LatLngExpression, zoom?: number): void;
  };
}

declare module "leaflet" {
  export type LatLngExpression =
    | [number, number]
    | { lat: number; lng: number }
    | { latitude: number; longitude: number };

  export class LatLng {
    constructor(lat: number, lng: number);
    lat: number;
    lng: number;
  }
}
