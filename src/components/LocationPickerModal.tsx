import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { type LatLngExpression, LatLng } from "leaflet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

// Component to handle map events like recentering
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
}: LocationPickerModalProps) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition(new LatLng(latitude, longitude));
          setIsLocating(false);
        },
        () => {
          // Fallback to a default location if user denies permission
          setPosition(new LatLng(51.505, -0.09));
          setIsLocating(false);
        }
      );
    }
  }, [isOpen]);

  const markerEventHandlers = useMemo(
    () => ({
      dragend(event: unknown) {
        const target = (event as { target?: { getLatLng: () => LatLng } }).target;
        if (target && typeof target.getLatLng === "function") {
          setPosition(target.getLatLng());
        }
      },
    }),
    []
  );

  const handleConfirmLocation = async () => {
    if (!position) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
      );
      if (!response.ok) throw new Error("Failed to fetch address.");
      
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county;
      const state = data.address.state;
      
      if (city && state) {
        onLocationSelect(`${city}, ${state}`);
      } else {
        alert("Could not determine a valid location from the selected point.");
      }
      onClose();
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      alert("Failed to retrieve location address.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-[600px] h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        <div className="flex-grow relative">
          {isLocating || !position ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <p>Finding your location...</p>
            </div>
          ) : (
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[position.lat, position.lng]}
                draggable={true}
                eventHandlers={markerEventHandlers}
              />
              <MapController center={[position.lat, position.lng]} />
            </MapContainer>
          )}
        </div>
        <DialogFooter className="px-6 py-4 border-t">
          <Button onClick={handleConfirmLocation} disabled={!position}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
