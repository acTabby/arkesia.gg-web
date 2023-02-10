import {
  ActionIcon,
  Anchor,
  Divider,
  Group,
  Popover,
  Stack,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandGithub,
  IconUserCheck,
  IconUserExclamation,
} from "@tabler/icons";
import { useState } from "react";
import useSupabase from "~/hooks/useSupabase";
import { trackOutboundLinkClick } from "~/lib/stats";
import { DiscordIcon } from "./DiscordIcon";
import Login from "./Login";

export default function User() {
  const [opened, setOpened] = useState(false);
  const { user } = useSupabase();
  return (
    <Popover
      width={300}
      withArrow
      shadow="md"
      position="bottom"
      opened={opened}
      onChange={setOpened}
      withinPortal
      zIndex={10000}
    >
      <Popover.Target>
        <Tooltip zIndex={9100} label="Sign in for full features">
          <ActionIcon
            size="md"
            color="teal"
            variant="filled"
            onClick={() => setOpened((o) => !o)}
          >
            {user ? <IconUserCheck /> : <IconUserExclamation />}
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Login />
          <Divider />
          <Group position="center">
            <Tooltip zIndex={9100} label="Contribute or give feedback">
              <ActionIcon
                component="a"
                href="https://github.com/lmachens/arkesia.gg-web"
                target="_blank"
                size="lg"
                aria-label="Contribute or give feedback"
                p={4}
                onClick={() =>
                  trackOutboundLinkClick(
                    "https://github.com/lmachens/arkesia.gg-web"
                  )
                }
                color="dark"
                variant="filled"
              >
                <IconBrandGithub width="100%" height="100%" />
              </ActionIcon>
            </Tooltip>
            <Tooltip zIndex={9100} label="Join the community">
              <ActionIcon
                component="a"
                href="https://discord.com/invite/NTZu8Px"
                target="_blank"
                size="lg"
                sx={{
                  backgroundColor: "#5865f2",
                  "&:hover": {
                    backgroundColor: "#6974f3",
                  },
                }}
                aria-label="Join the community"
                p={4}
                onClick={() =>
                  trackOutboundLinkClick("https://discord.com/invite/NTZu8Px")
                }
              >
                <DiscordIcon color="#ced4da" width="100%" height="100%" />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group spacing="xs" position="center">
            <Anchor
              size="xs"
              href="https://www.hogwarts.gg/"
              title="Hogwarts Legacy Fansite"
              target="_blank"
            >
              Hogwarts.gg
            </Anchor>
            <Anchor
              size="xs"
              href="https://aeternum-map.gg/"
              title="Interactive map for New World"
              target="_blank"
            >
              Aeternum Map
            </Anchor>
            <Anchor
              size="xs"
              href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
              title="Aeternum Map Companion"
              target="_blank"
            >
              Overwolf App
            </Anchor>
            <Anchor
              size="xs"
              href="https://www.nwmap.info/"
              title="New World Faction Territory Map"
              target="_blank"
            >
              nwmap
            </Anchor>
            <Anchor
              size="xs"
              href="https://th.gl/"
              title="Trophies app for League of Legends"
              target="_blank"
            >
              Trophy Hunter
            </Anchor>
            <Anchor
              size="xs"
              href="https://www.soc.gg/"
              title="A Songs of Conquest fansite"
              target="_blank"
            >
              SoC.gg
            </Anchor>
            <Anchor
              size="xs"
              href="https://github.com/lmachens/skeleton"
              title="Simply display any website as customizable Overlay"
              target="_blank"
            >
              Skeleton
            </Anchor>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
