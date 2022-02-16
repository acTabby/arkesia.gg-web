import { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Tooltip } from "react-leaflet";
import { nodeTypes } from "~/lib/db";
import { toast } from "react-toastify";
import { Form, useActionData } from "remix";

type DraggableMarkerProps = {
  initialLatLng: L.LatLng;
  onClose: () => void;
};

export default function DraggableMarker({
  initialLatLng,
  onClose,
}: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const [latLng, setLatLng] = useState<L.LatLng>(initialLatLng);
  const [type, setType] = useState<string>("");
  const actionData = useActionData();

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setLatLng(marker.getLatLng());
        }
      },
    }),
    []
  );
  useEffect(() => {
    const marker = markerRef.current;
    if (marker != null) {
      marker.openPopup();
    }
  }, []);

  useEffect(() => {
    if (actionData) {
      console.log(actionData);
      toast.success(`Add ${actionData.type} 🤘`);
    }
  }, [actionData]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={latLng}
      ref={markerRef}
    >
      <Tooltip permanent interactive direction="top">
        <Form method="post">
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Select type</option>
            {nodeTypes.map((nodeType) => (
              <option key={nodeType.title}>{nodeType.title}</option>
            ))}
          </select>
          <input type="hidden" name="lat" value={latLng.lat} />
          <input type="hidden" name="lng" value={latLng.lng} />
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="submit" disabled={!type}>
            Save
          </button>
        </Form>
      </Tooltip>
    </Marker>
  );
}
