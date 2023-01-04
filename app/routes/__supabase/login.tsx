import { useEffect } from "react";
import useSupabase from "~/hooks/useSupabase";

export default function LoginPage() {
  const { supabase } = useSupabase();

  useEffect(() => {
    supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: location.origin + "/exit",
      },
    });
  }, []);

  return <></>;
}
