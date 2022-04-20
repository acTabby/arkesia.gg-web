import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { findNodeLocations } from "./db.server";
import { arkesiaArea } from "./static";
import type { AreaNodeLocationDTO } from "./types";

export type EnvLoaderData = {
  ENV: {
    SUPABASE_URL: string | undefined;
    SUPABASE_PUBLIC_KEY: string | undefined;
    PLAUSIBLE_API_HOST: string | undefined;
    PLAUSIBLE_DOMAIN: string | undefined;
  };
};

export const envLoader: LoaderFunction = async () => {
  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
      PLAUSIBLE_API_HOST: process.env.PLAUSIBLE_API_HOST,
      PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
    },
  } as EnvLoaderData);
};

export type AreaLoaderData = {
  nodeLocations: AreaNodeLocationDTO[];
};

export const areaLoader: LoaderFunction = async ({ params }) => {
  const areaName = params.area || arkesiaArea.name;
  const nodeLocations = await findNodeLocations({ areaName });

  return json(
    {
      nodeLocations,
      ENV: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
        PLAUSIBLE_API_HOST: process.env.PLAUSIBLE_API_HOST,
        PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
      },
    } as AreaLoaderData,
    {
      headers: {
        "cache-control": "s-maxage=60, stale-while-revalidate",
      },
    }
  );
};
