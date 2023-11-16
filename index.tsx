import { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";

type VehicleInfo = {
  id: string;
  lat: number;
  lng: number;
  alt: number;
  hdg: number;
  status: "OK" | "WARN" | "ERROR";
  type: "fixedwing" | "multirotor";
};

function FixedWingIcon({
  heading = 0,
  color = "black",
  style,
}: {
  heading?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const angle = heading - 45;
  return (
    <svg
      style={{
        transform: `rotate(${angle}deg)`,
        fill: color,
        display: "block",
        ...style,
      }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.612 11.842l1.452-2.622a1.954 1.954 0 0 0 .247-.95 1.572 1.572 0 0 0-.029-.28l2.364 2.364.707-.707-6-6-.707.707 2.365 2.364a1.572 1.572 0 0 0-.28-.029 1.958 1.958 0 0 0-.95.246l-2.623 1.453-7.092-7.092a1.019 1.019 0 0 0-1.435 0l-1.097 1.1a1.875 1.875 0 0 0-.295 2.264 30.92 30.92 0 0 0 5.349 6.612l.852.852-3.155 3.959-1.834-.936a1.06 1.06 0 0 0-1.295.162l-.851.851a1.032 1.032 0 0 0-.158 1.265l1.771 2.95-.772.772a.5.5 0 1 0 .707.707l.772-.771 2.951 1.77a1.03 1.03 0 0 0 1.264-.156l.851-.851a1.047 1.047 0 0 0 .178-1.267l-.951-1.863 3.959-3.155.845.844a30.966 30.966 0 0 0 6.619 5.357 1.876 1.876 0 0 0 2.266-.296l1.094-1.095a1.015 1.015 0 0 0 .001-1.437zm-.345-4.033a.956.956 0 0 1 .463-.12.58.58 0 0 1 .58.58.953.953 0 0 1-.12.465l-1.314 2.373-1.983-1.984zm5.632 12.95a.873.873 0 0 1-1.056.137 29.953 29.953 0 0 1-6.406-5.19l-1.484-1.484-5.297 4.22 1.323 2.591-.002.09.008.014-.895.858-2.736-1.642.5-.5a.5.5 0 0 0-.707-.706l-.497.496-1.64-2.776.853-.852 2.696 1.329 4.22-5.297-1.492-1.491a29.906 29.906 0 0 1-5.183-6.399.874.874 0 0 1 .137-1.055l1.12-1.098 17.634 17.658z" />
    </svg>
  );
}

function MultiRotorIcon({
  heading = 0,
  color = "black",
  style,
}: {
  heading?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const angle = heading;
  return (
    <svg
      style={{
        transform: `rotate(${angle}deg)`,
        fill: color,
        display: "block",
        ...style,
      }}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7,12a5,5,0,1,1,5-5H10a3,3,0,1,0-3,3Z" />
      <path d="M25,12V10a3,3,0,1,0-3-3H20a5,5,0,1,1,5,5Z" />
      <path d="M7,30A5,5,0,0,1,7,20v2a3,3,0,1,0,3,3h2A5.0055,5.0055,0,0,1,7,30Z" />
      <path d="M25,30a5.0055,5.0055,0,0,1-5-5h2a3,3,0,1,0,3-3V20a5,5,0,0,1,0,10Z" />
      <path d="M20,18.5859V13.4141L25.707,7.707a1,1,0,1,0-1.414-1.414l-4.4995,4.5a3.9729,3.9729,0,0,0-7.587,0L7.707,6.293a.9994.9994,0,0,0-1.414,0h0a.9994.9994,0,0,0,0,1.414L12,13.4141v5.1718L6.293,24.293a.9994.9994,0,0,0,0,1.414h0a.9994.9994,0,0,0,1.414,0l4.5-4.5a3.9729,3.9729,0,0,0,7.587,0l4.4995,4.5a1,1,0,0,0,1.414-1.414ZM18,20a2,2,0,0,1-4,0V12a2,2,0,0,1,4,0Z" />
    </svg>
  );
}

function ReactiveMarker({
  position,
  onClick,
  children,
}: {
  position: { lat: number; lng: number };
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const map = useMap();

  const getPosition = useCallback(() => {
    return map.latLngToContainerPoint(position);
  }, [map, position]);

  const [divPosition, setDivPosition] = useState(getPosition);

  const updatePosition = useCallback(() => {
    setDivPosition(getPosition());
  }, [getPosition, setDivPosition]);

  useEffect(() => {
    map.addEventListener("move", updatePosition);
    return () => {
      map.removeEventListener("move", updatePosition);
    };
  }, [updatePosition]);

  useEffect(updatePosition, [position]);

  // zIndex 625 is used here as it is between the indices for markerPane and tooltipPane
  // See: https://leafletjs.com/reference.html#map-pane
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: divPosition.x,
        top: divPosition.y,
        transform: "translate(-50%, -50%)",
        zIndex: 625,
      }}
    >
      {children}
    </div>
  );
}

function Vehicle({ info }: { info: VehicleInfo }) {
  const [showTooltip, setShowTooltip] = useState(false);

  let Icon = MultiRotorIcon;
  switch (info.type) {
    case "fixedwing":
      Icon = FixedWingIcon;
      break;
    default:
      break;
  }
  let color = "black";
  switch (info.status) {
    case "WARN":
      color = "#fba609";
      break;
    case "ERROR":
      color = "red";
      break;
    default:
      break;
  }
  return (
    <>
      <ReactiveMarker
        position={{ lat: info.lat, lng: info.lng }}
        onClick={() => setShowTooltip((s) => !s)}
      >
        <Icon
          style={{ width: 50, height: 50 }}
          heading={info.hdg}
          color={color}
        />
      </ReactiveMarker>
      <ReactiveMarker
        position={{ lat: info.lat, lng: info.lng }}
        onClick={() => setShowTooltip(false)}
      >
        <div
          style={{
            display: showTooltip ? "block" : "none",
            transform: "translateY(110%)",
          }}
        >
          <p>{`ID: ${info.id}`}</p>
          <p>{`Alt: ${info.alt}`}</p>
          {/* <button>!NAPALM!</button> */}
        </div>
      </ReactiveMarker>
    </>
  );
}

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    function connectToWebSocket() {
      const ws = new WebSocket("ws://localhost:8000");
      ws.onmessage = (ev) => {
        const newVehicles = JSON.parse(ev.data);
        setVehicles(newVehicles);
      };
      ws.onclose = connectToWebSocket;
      ws.onerror = connectToWebSocket;
    }
    connectToWebSocket();
  }, []);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vehicles.map((vehicle) => (
        <Vehicle info={vehicle} key={vehicle.id} />
      ))}
    </MapContainer>
  );
}

const reactRoot = document.getElementById("reactRoot");
createRoot(reactRoot).render(<App />);
