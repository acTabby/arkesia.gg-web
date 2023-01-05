import type { User } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { Session, SupabaseClient } from "@supabase/auth-helpers-remix";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useEffect, useState } from "react";
import { findOrCreateUser } from "~/lib/db.server";
import { createServerClient, referrerIsOverwolf } from "~/lib/supabase.server";

export type SupabaseContext = {
  supabase: SupabaseClient<any>;
  session: Session | null;
  user: User | null;
  isOverwolf: boolean;
};

export const loader = async ({ request }: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY!,
  };

  const response = new Response();
  const isOverwolf = referrerIsOverwolf(request);
  const supabase = createServerClient({ request, response }, isOverwolf);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session && (await findOrCreateUser(session.user.id));

  return json(
    {
      env,
      session,
      user,
      isOverwolf,
    },
    {
      headers: response.headers,
    }
  );
};

export default function Supabase() {
  const { env, session, user, isOverwolf } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY, {
      cookieOptions: { sameSite: "none", secure: !isOverwolf },
    })
  );
  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token !== serverAccessToken) {
        fetcher.submit(null, {
          method: "post",
          action: "/handle-supabase-auth",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [serverAccessToken, supabase, fetcher]);

  return <Outlet context={{ supabase, session, user, isOverwolf }} />;
}
