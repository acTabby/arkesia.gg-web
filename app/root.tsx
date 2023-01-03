import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { ShouldReloadFunction } from "@remix-run/react";
import styles from "~/styles/global.css";
import leafletStyles from "leaflet/dist/leaflet.css";
import { MantineProvider, createEmotionCache } from "@mantine/core";
import { StylesPlaceholder } from "@mantine/remix";
import { initPlausible } from "./lib/stats";
import { useEffect } from "react";
import { json } from "@remix-run/node";
import theme from "./theme";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: leafletStyles },
  ];
}

export const meta = () => {
  return {
    title: "Arkesia.gg - Lost Ark Map",
    charset: "utf-8",
    description:
      "Arkesia.gg is an interactive map with mokoko seeds, hidden stories and more for Lost Ark.",
    keywords: "Lost Ark,Arkesia,Map,World,Mokoko seeds",
    viewport: "width=device-width,initial-scale=1",
  };
};

export const loader = async () => {
  return json({
    env: {
      PLAUSIBLE_API_HOST: process.env.PLAUSIBLE_API_HOST!,
      PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN!,
    },
  });
};

// Only load `envLoader` once
export const unstable_shouldReload: ShouldReloadFunction = () => false;

createEmotionCache({ key: "mantine" });

export default function App() {
  const {
    env: { PLAUSIBLE_DOMAIN, PLAUSIBLE_API_HOST },
  } = useLoaderData<typeof loader>();
  useEffect(() => {
    if (PLAUSIBLE_DOMAIN && PLAUSIBLE_API_HOST) {
      initPlausible(PLAUSIBLE_DOMAIN, PLAUSIBLE_API_HOST);
    }
  }, []);

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <html lang="en">
        <head>
          <StylesPlaceholder />
          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </MantineProvider>
  );
}
