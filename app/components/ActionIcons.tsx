import type { CSSObject } from "@mantine/core";
import { Container } from "@mantine/core";
import {
  ActionIcon,
  Dialog,
  Group,
  MediaQuery,
  Popover,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconInfoCircle, IconMapPin, IconSettings } from "@tabler/icons";
import { useState } from "react";
import {
  useDrawerPosition,
  useMap,
  useSetEditingNodeLocation,
} from "~/lib/store";
import Settings from "./Settings";
import User from "./User";

export default function ActionIcons() {
  const [openedSettings, setOpenedSettings] = useState(false);
  const [opened, handlers] = useDisclosure(false);

  const drawerPosition = useDrawerPosition();
  const setEditingNodeLocation = useSetEditingNodeLocation();
  const map = useMap();

  const largeScreen = useMediaQuery("(min-width: 900px)");

  const css: CSSObject = {
    position: "absolute",
    top: 8,
    right: drawerPosition === "left" ? 7 : "auto",
    left: drawerPosition === "left" ? "auto" : 7,
    zIndex: 8900,
  };

  const content = (
    <Group spacing="xs">
      <Tooltip
        zIndex={9100}
        label={
          <Group>
            <Text>Propose a node</Text>
            <Text
              size="xs"
              sx={(theme) => ({
                marginLeft: 8,
                padding: "2px 4px",
                borderRadius: theme.radius.xs,
                background: "#0000005e",
              })}
            >
              CTRL + Click
            </Text>
          </Group>
        }
      >
        <ActionIcon
          onClick={() => {
            if (map) {
              const mapCenter = map.getCenter();
              setEditingNodeLocation({
                position: [mapCenter.lat, mapCenter.lng],
                areaNode: {},
              });
            }
          }}
          size="lg"
          aria-label="Propose a node"
          p={6}
          color="dark"
          variant="filled"
        >
          <IconMapPin color="#ced4da" width="100%" height="100%" />
        </ActionIcon>
      </Tooltip>
      <Tooltip zIndex={9100} label={<Text>Settings</Text>}>
        <ActionIcon
          onClick={() => setOpenedSettings((opened) => !opened)}
          size="lg"
          aria-label="Settings"
          p={6}
          color="dark"
          variant="filled"
        >
          <IconSettings color="#ced4da" width="100%" height="100%" />
        </ActionIcon>
      </Tooltip>

      <Tooltip zIndex={9100} label={<Text>Sign in</Text>}>
        <User />
      </Tooltip>
      <Dialog
        opened={openedSettings}
        withCloseButton
        onClose={() => setOpenedSettings(false)}
        size={largeScreen ? "lg" : "md"}
        radius="md"
        position={{
          top: 60,
          right: drawerPosition === "left" ? 5 : "auto",
          left: drawerPosition === "left" ? "auto" : 5,
        }}
        zIndex={9000}
      >
        <Settings />
      </Dialog>
    </Group>
  );

  return (
    <>
      <MediaQuery smallerThan="sm" styles={css}>
        <Popover
          opened={opened}
          onClose={handlers.close}
          position="bottom"
          withArrow
          zIndex={8900}
          radius="sm"
        >
          <Popover.Target>
            <ActionIcon
              onClick={handlers.toggle}
              size="lg"
              variant="filled"
              title="Actions"
              color="cyan"
              sx={{
                display: "none",
                "@media (max-width: 800px)": {
                  display: "block",
                },
              }}
            >
              <IconInfoCircle width="100%" />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>{content}</Popover.Dropdown>
        </Popover>
      </MediaQuery>
      <MediaQuery largerThan="sm" styles={css}>
        <Container
          sx={(theme) => ({
            padding: theme.spacing.xs,
            "@media (max-width: 800px)": {
              display: "none",
            },
          })}
        >
          {content}
        </Container>
      </MediaQuery>
    </>
  );
}
