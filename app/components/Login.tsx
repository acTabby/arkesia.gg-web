import { Button, Group, Text } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import useSupabase from "~/hooks/useSupabase";
import { DiscordIcon } from "./DiscordIcon";

export default function Login() {
  const { supabase, session, user } = useSupabase();
  const fetcher = useFetcher();

  const handleDiscordLogin = async () => {
    if (window !== window.top && window.top) {
      // Website is loaded in an iframe. Tell parent to open `/login`
      window.top.postMessage({ provider: "discord" }, "*");

      // Wait for login
      const handleMessage = (message: MessageEvent) => {
        fetcher.submit(null, {
          method: "post",
          action: "/handle-supabase-auth",
        });
        window.removeEventListener("message", handleMessage);
      };
      window.addEventListener("message", handleMessage);
    } else {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
      });
      if (error) {
        console.log({ error });
      }
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log(error);
    }
  };

  return session ? (
    <>
      <Text align="center" color="dimmed" size="sm">
        User ID: {user?.id}
        <br />
        Role: {user?.isModerator ? "Moderator" : "User"}
      </Text>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  ) : (
    <>
      <Text align="center" color="dimmed" size="sm">
        For some features like creating and reporting nodes, an account is
        required. Please sign in:
      </Text>
      <Group grow>
        <Button onClick={handleDiscordLogin} leftIcon={<DiscordIcon />}>
          Discord login
        </Button>
      </Group>
    </>
  );
}
