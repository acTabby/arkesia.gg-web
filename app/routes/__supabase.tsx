import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/auth-helpers-remix";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useState } from "react";

export type TypedSupabaseClient = SupabaseClient<any>;
export type SupabaseContext = {
  supabase: TypedSupabaseClient;
};

export const loader = async () => {
  const response = new Response();

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY!,
  };

  return json(
    {
      env,
    },
    {
      headers: response.headers,
    }
  );
};

export default function Supabase() {
  const { env } = useLoaderData<typeof loader>();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY)
  );
  return <Outlet context={{ supabase }} />;
}
