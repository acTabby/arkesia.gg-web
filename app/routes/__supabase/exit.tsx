import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { useEffect, useState } from "react";

// Used if website is opened in an iframe
export default function ExitPage() {
  const [seconds, setSeconds] = useState(5);
  const interval = useInterval(() => setSeconds((s) => s - 1), 1000);

  useEffect(() => {
    if (seconds < 1) {
      window.close();
    }
  }, [seconds]);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <Center sx={{ height: "100vh" }}>
      <Stack>
        <Title align="center">Successfully logged in 🤘</Title>
        <Text color="dimmed" size="lg" align="center">
          This window will be self-destroyed in {seconds} seconds
        </Text>
        <Group position="center">
          <Button variant="subtle" size="md" onClick={() => window.close()}>
            Close now 🚀
          </Button>
        </Group>
      </Stack>
    </Center>
  );
}
