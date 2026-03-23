import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

// Iska koi UI nahi hota, ye sirf logic handle karta hai
const RoutingControl = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Routing control instance
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 5, opacity: 0.8 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // Instructions panel hide karne ke liye
    }).addTo(map);

    // Jab component unmount ho toh purana rasta delete kar dein
    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};

export default RoutingControl;