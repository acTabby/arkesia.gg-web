import { useEffect } from "react";
import useSupabase from "~/hooks/useSupabase";

// Used if website is opened in an iframe
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
