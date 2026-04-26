import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onLocationSelect, readOnly }) {
  useMapEvents({
    click(e) {
      if (readOnly) return;

      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

function LocationPickerMap({
  selectedLocation,
  onLocationSelect,
  farmLocation = { lat: 18.9252275, lng: 78.8248532 },
  readOnly = false,
}) {
  return (
    <MapContainer
      center={[farmLocation.lat, farmLocation.lng]}
      zoom={13}
      style={{
        width: "100%",
        height: "350px",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler
        onLocationSelect={onLocationSelect}
        readOnly={readOnly}
      />

      <Marker position={[farmLocation.lat, farmLocation.lng]}>
        <Popup>Farm Location</Popup>
      </Marker>

      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
          <Popup>Selected Delivery Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default LocationPickerMap;