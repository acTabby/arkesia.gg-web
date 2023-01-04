import {
  Input,
  SegmentedControl,
  Slider,
  Space,
  Switch,
  Text,
} from "@mantine/core";
import { useEffect } from "react";
import {
  useDrawerPosition,
  useMarkerSize,
  useSetDrawerPosition,
  useSetMarkerSize,
  useShowNameOnMap,
  useToggleShowNameOnMap,
} from "~/lib/store";
import { DiscoveredNodes } from "./DiscoveredNodes";

const Settings = () => {
  const setDrawerPosition = useSetDrawerPosition();
  const showNameOnMap = useShowNameOnMap();
  const toggleShowNameOnMap = useToggleShowNameOnMap();
  const markerSize = useMarkerSize();
  const setMarkerSize = useSetMarkerSize();
  const drawerPosition = useDrawerPosition();

  useEffect(() => {
    // @ts-ignore
    if (window["__cmp"]) {
      // @ts-ignore
      window["__cmp"]("addConsentLink");
    }
  }, []);

  return (
    <>
      <Text style={{ marginBottom: 10 }} weight={500}>
        Map
      </Text>
      <Switch
        label="Show name on map"
        checked={showNameOnMap}
        onChange={toggleShowNameOnMap}
      />
      <Input.Wrapper label="Marker size" style={{ marginTop: 5 }}>
        <Slider
          value={markerSize}
          onChange={setMarkerSize}
          min={15}
          max={60}
          label={null}
        />
      </Input.Wrapper>
      <Space h="md" />
      <DiscoveredNodes />
      <Text style={{ marginBottom: 10 }} weight={500}>
        Drawer position
      </Text>
      <SegmentedControl
        size="sm"
        value={drawerPosition}
        onChange={(value: "left" | "right") => setDrawerPosition(value)}
        sx={{ width: "100%" }}
        data={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
      />
      <Text
        id="ncmp-consent-link"
        color="blue"
        sx={{
          button: {
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
          },
        }}
      />
    </>
  );
};

export default Settings;
