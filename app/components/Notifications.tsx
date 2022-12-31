import { Button, Group, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { hideNotification, showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { trackOutboundLinkClick } from "~/lib/stats";

const Notifications = () => {
  const [hasContributorsSeen, setHasContributorsSeen] = useLocalStorage({
    key: "hasContributorsSeen",
    defaultValue: false,
  });

  useEffect(() => {
    if (hasContributorsSeen) {
      return;
    }
    const timeoutId = setTimeout(() => {
      showNotification({
        id: "hasContributorsSeen",
        title: "Join the team",
        message: (
          <>
            <Text size="sm" mb="sm">
              We are looking for help to add and verify nodes. Join our Discord
              if you would like to join the team 🤘.
            </Text>
            <Group>
              <Button
                component="a"
                href="https://discord.com/invite/NTZu8Px"
                target="_blank"
                compact
                aria-label="Join Discord"
                onClick={() =>
                  trackOutboundLinkClick("https://discord.com/invite/NTZu8Px")
                }
              >
                Join Discord
              </Button>
              <Button
                variant="outline"
                compact
                onClick={() => {
                  setHasContributorsSeen(true);
                  hideNotification("hasContributorsSeen");
                }}
              >
                Do not show again
              </Button>
            </Group>
          </>
        ),
        autoClose: false,
      });
    }, 5000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [hasContributorsSeen]);

  return <></>;
};

export default Notifications;
