import { Anchor, Box, Group, Modal, Text } from "@mantine/core";
import { useState } from "react";
import { useDrawerPosition } from "~/lib/store";
import PrivacyPolicy from "./PrivacyPolicy";

const Footer = () => {
  const drawerPosition = useDrawerPosition();
  const [openedPrivacyPolicy, setOpenedPrivacyPolicy] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Box
      sx={(theme) => ({
        position: "absolute",
        bottom: 0,
        left: drawerPosition === "left" ? 7 : "auto",
        right: drawerPosition === "left" ? "auto" : 7,
        zIndex: 8900,
        borderRadius: theme.radius.sm,
        color: "#ddd",
      })}
    >
      <Group spacing={2}>
        <Anchor
          sx={{
            color: "#ddd",
          }}
          size="xs"
          href="https://www.hogwarts.gg/"
          title="Hogwarts Legacy Fansite"
          target="_blank"
        >
          Hogwarts.gg
        </Anchor>
        <Text size="xs">|</Text>
        <Anchor
          href="https://aeternum-map.gg/"
          sx={{
            color: "#ddd",
          }}
          size="xs"
          target="_blank"
          title="Interactive map for New World"
        >
          Aeternum Map
        </Anchor>
        <Text size="xs">|</Text>
        <Anchor
          href="https://www.soc.gg/"
          sx={{
            color: "#ddd",
          }}
          size="xs"
          target="_blank"
          title="A Songs of Conquest fansite"
        >
          SoC.gg
        </Anchor>
        <Text size="xs">|</Text>
        <Anchor
          href="https://th.gl/"
          sx={{
            color: "#ddd",
          }}
          size="xs"
          target="_blank"
          title="Trophies app for League of Legends"
        >
          Trophy Hunter
        </Anchor>
        <Text size="xs">|</Text>
        <Anchor
          href="https://github.com/lmachens/skeleton"
          sx={{
            color: "#ddd",
          }}
          size="xs"
          target="_blank"
          title="Simply display any website as customizable Overlay"
        >
          Skeleton
        </Anchor>
        <Text size="xs">|</Text>
        <Anchor
          href="#"
          sx={{
            color: "#ddd",
          }}
          size="xs"
          onClick={() => setOpenedPrivacyPolicy(true)}
        >
          Privacy Policy
        </Anchor>
      </Group>
      <Modal
        opened={openedPrivacyPolicy}
        onClose={() => setOpenedPrivacyPolicy(false)}
        title="Privacy Policy"
        sx={{ zIndex: 10000 }}
        size="calc(100vw - 87px)"
        withinPortal={false}
      >
        <PrivacyPolicy />
      </Modal>
    </Box>
  );
};

export default Footer;
