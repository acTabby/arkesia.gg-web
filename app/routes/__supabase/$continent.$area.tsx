import { AppShell, LoadingOverlay } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import type {
  HeadersFunction,
  LoaderArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { ClientOnly } from "remix-utils";
import ActionIcons from "~/components/ActionIcons";
import AppBreadcrumbs from "~/components/AppBreadcrumbs";
import AppSpotlightProvider from "~/components/AppSpotlightProvider";
import FiltersSelect from "~/components/FiltersSelect";
import Footer from "~/components/Footer";
import MapView from "~/components/MapView.client";
import NitroPay from "~/components/NitroPay";
import NodeDetails from "~/components/NodeDetails";
import Notifications from "~/components/Notifications";
import { nodeAction } from "~/lib/actions.server";
import { findNodeLocations } from "~/lib/db.server";
import { arkesiaArea, continents } from "~/lib/static";
import type { AreaNodeLocationDTO } from "~/lib/types";

export const loader = async ({ params }: LoaderArgs) => {
  const response = new Response();

  const areaName = params.area || arkesiaArea.name;
  const nodeLocations = await findNodeLocations({ areaName });

  response.headers.set("cache-control", "s-maxage=60, stale-while-revalidate");
  return json(
    {
      nodeLocations,
    },
    {
      headers: response.headers,
    }
  );
};
export const action = nodeAction;

export const meta: MetaFunction = ({ params, data, location }) => {
  if (location.search && data.nodeLocations) {
    const searchParams = new URLSearchParams(location.search);
    const nodeId = +(searchParams.get("node") || "");
    const nodeLocation = (data.nodeLocations as AreaNodeLocationDTO[]).find(
      (nodeLocation) => nodeLocation.areaNodeId === nodeId
    );
    if (nodeLocation?.areaNode) {
      const cleanDescription = nodeLocation.areaNode.description?.replace(
        /<\/?[^>]+(>|$)/g,
        ""
      );

      const title = `${
        nodeLocation.areaNode.name || nodeLocation.areaNode.type
      } in ${params.area}, ${params.continent} - Arkesia.gg - Lost Ark Map`;
      const description = `${cleanDescription ? `${cleanDescription} ` : ""}${
        nodeLocation.areaNode.name
          ? `${nodeLocation.areaNode.name} is a ${nodeLocation.areaNode.type}`
          : nodeLocation.areaNode.type
      } is located in ${params.continent} / ${params.area} in Lost Ark.`;
      const continent =
        continents.find((continent) =>
          continent.areas.some((area) => area.name === nodeLocation.areaName)
        ) ?? continents[0];
      const url = `https://www.arkesia.gg/${encodeURIComponent(
        continent.name
      )}/${encodeURIComponent(nodeLocation.areaName)}/?tileId=${
        nodeLocation.tileId
      }&node=${nodeLocation.areaNodeId}&location=${nodeLocation.id}`;
      return {
        title,
        description,
        "twitter:card": nodeLocation.areaNode.screenshot
          ? "summary_large_image"
          : "summary",
        "twitter:site": url,
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": nodeLocation.areaNode.screenshot,
        "og:type": "article",
        "og:title": title,
        "og:description": description,
        "og:url": url,
        "og:image": nodeLocation.areaNode.screenshot,
      };
    }
  }
  if (params.area && params.continent) {
    const title = `${params.area} in ${params.continent} - Arkesia.gg - Lost Ark Map`;
    const description = `Interactive map with mokoko seeds, hidden stories and more resources in ${params.continent} / ${params.area} for Lost Ark.`;
    return {
      title,
      description,
      "twitter:card": "summary",
      "twitter:title": title,
      "twitter:description": description,
      "og:type": "article",
      "og:title": title,
      "og:description": description,
    };
  }

  const title = "Arkesia.gg - Lost Ark Map";
  const description =
    "Arkesia is an interactive map with mokoko seeds, hidden stories and more for Lost Ark.";
  return {
    title,
    description,
    "twitter:card": "summary",
    "twitter:title": title,
    "twitter:description": description,
    "og:type": "article",
    "og:title": title,
    "og:description": description,
  };
};

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
  return Boolean(submission);
};

export const headers: HeadersFunction = () => {
  return {
    "cache-control": "s-maxage=60, stale-while-revalidate",
  };
};

export default function WorldPage() {
  return (
    <>
      <NotificationsProvider
        zIndex={9000}
        position="top-right"
        autoClose={2500}
      >
        <AppSpotlightProvider>
          <AppShell
            padding={0}
            style={{ overflow: "hidden" }}
            styles={(theme) => ({
              main: {
                backgroundColor: theme.colors.dark[8],
                color: theme.colors.dark[0],
                height: "100vh",
              },
            })}
          >
            <AppBreadcrumbs />
            <ClientOnly fallback={<LoadingOverlay visible />}>
              {() => <MapView />}
            </ClientOnly>
            <NodeDetails />
            <FiltersSelect />
            <ActionIcons />
            <Footer />
            <NitroPay />
            <Notifications />
          </AppShell>
        </AppSpotlightProvider>
      </NotificationsProvider>
    </>
  );
}
