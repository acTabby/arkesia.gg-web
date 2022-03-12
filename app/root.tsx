import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";
import styles from "~/styles/global.css";
import leafletStyles from "leaflet/dist/leaflet.css";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import AppSpotlightProvider from "./components/AppSpotlightProvider";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: leafletStyles },
  ];
}

export const meta: MetaFunction = () => {
  return { title: "Arkesia - Lost Ark Map" };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider
          theme={{ fontFamily: "NunitoVariable", colorScheme: "dark" }}
        >
          <NotificationsProvider
            zIndex={900}
            position="top-right"
            autoClose={2500}
          >
            <AppSpotlightProvider>
              <Outlet />
            </AppSpotlightProvider>
          </NotificationsProvider>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
