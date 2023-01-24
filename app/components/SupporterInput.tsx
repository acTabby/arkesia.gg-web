import { Anchor, Loader, TextInput } from "@mantine/core";
import type { FormEvent } from "react";
import { useState } from "react";
import useSupabase from "~/hooks/useSupabase";
import AcceptAction from "./AcceptAction";

const SupporterInput = () => {
  const { user, isSupporter } = useSupabase();
  const [supporterSecret, setSupporterSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ supporterSecret }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        disabled={!user || isSupporter}
        label="Supporter Secret"
        name="supporterSecret"
        error={error}
        description={
          isSupporter ? (
            "You are already a supporter ❤"
          ) : (
            <>
              Become a supporter on{" "}
              <Anchor href="https://www.patreon.com/devleon" target="_blank">
                Patreon
              </Anchor>{" "}
              to disable ads and get the Discord supporter role 🤘
            </>
          )
        }
        placeholder={user ? "Enter your secret" : "Please sign in"}
        rightSection={
          loading ? (
            <Loader size="xs" />
          ) : (
            <AcceptAction
              disabled={!supporterSecret}
              ariaLabel="Save supporter secret"
            />
          )
        }
        value={supporterSecret}
        onChange={(event) => setSupporterSecret(event.target.value)}
      />
    </form>
  );
};

export default SupporterInput;
