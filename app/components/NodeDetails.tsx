import {
  Button,
  Drawer,
  Group,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDidUpdate, useLocalStorage } from "@mantine/hooks";
import {
  Form,
  useActionData,
  useLocation,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import {
  useDiscoveredNodes,
  useDrawerPosition,
  useEditingNodeLocation,
  useSelectedNodeLocation,
  useSetEditingNodeLocation,
  useSetSelectedNodeLocation,
  useToggleDiscoveredNode,
} from "~/lib/store";
import { AvailableNodes } from "./AvailableNodes";
import ImagePreview from "./ImagePreview";
import NodeDescription from "./NodeDescription";
import { ClientOnly } from "remix-utils";
import IslandGuideLink from "./IslandGuideLink";
import ShareButton from "./ShareButton";
import type { nodeAction } from "~/lib/actions.server";
import { IconEye, IconEyeOff } from "@tabler/icons";
import { showNotification, updateNotification } from "@mantine/notifications";

export default function NodeDetails() {
  const location = useLocation();
  const selectedNodeLocation = useSelectedNodeLocation();
  const setSelectedNodeLocation = useSetSelectedNodeLocation();
  const editingNodeLocation = useEditingNodeLocation();
  const setEditingNodeLocation = useSetEditingNodeLocation();
  const transition = useTransition();
  const actionData = useActionData<typeof nodeAction>();
  const [userToken] = useLocalStorage<string>({
    key: "user-token",
    defaultValue: "",
  });
  const discoveredNodes = useDiscoveredNodes();
  const toggleDiscoveredNode = useToggleDiscoveredNode();
  const drawerPosition = useDrawerPosition();
  const [searchParams, setSearchParams] = useSearchParams();
  const nodeLocation = useEditingNodeLocation();

  useDidUpdate(() => {
    if (nodeLocation) {
      return;
    }
    if (transition.state === "submitting") {
      showNotification({
        id: "notification",
        loading: true,
        title: userToken ? "Submitting deletion request" : "Reporting issue",
        message: "",
        autoClose: false,
        disallowClose: true,
      });
    } else if (transition.state === "idle") {
      if (actionData) {
        updateNotification({
          id: "notification",
          title: "Something is wrong",
          message: "",
          color: "red",
        });
      } else {
        updateNotification({
          id: "notification",
          title: userToken ? "Node deleted 💀" : "Issue reported",
          message: "",
        });
        setSelectedNodeLocation(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition.state, actionData, transition.submission?.method]);

  useDidUpdate(() => {
    const newSearchParams: Parameters<typeof setSearchParams>[0] = {};
    const tileId = searchParams.get("tileId");
    if (tileId) {
      newSearchParams.tileId = tileId;
    }
    if (selectedNodeLocation) {
      newSearchParams.node = selectedNodeLocation.areaNodeId.toString();
      newSearchParams.location = selectedNodeLocation.id.toString();
    }
    setSearchParams(newSearchParams);
  }, [selectedNodeLocation]);

  return (
    <Drawer
      opened={Boolean(selectedNodeLocation && !editingNodeLocation)}
      zIndex={10950}
      withOverlay={false}
      padding="md"
      position={drawerPosition}
      onClose={() => setSelectedNodeLocation(null)}
      withinPortal={false}
      style={{
        position: "relative",
        zIndex: 10950,
      }}
      title={
        selectedNodeLocation?.areaNode.name ||
        selectedNodeLocation?.areaNode.type
      }
      styles={{
        body: {
          height: "calc(100% - 50px)",
        },
      }}
    >
      <Stack style={{ height: "100%" }} spacing={0}>
        {selectedNodeLocation && (
          <>
            <Text color="teal">{selectedNodeLocation.areaNode.type}</Text>
            <Text size="xs">
              Node ID: {selectedNodeLocation.areaNodeId} Location ID:{" "}
              {selectedNodeLocation.id}
            </Text>
            {(selectedNodeLocation.areaNode.type === "Island" ||
              selectedNodeLocation.areaNode.type === "PvP Island") && (
              <IslandGuideLink areaNode={selectedNodeLocation.areaNode} />
            )}
            {selectedNodeLocation.areaNode.description && (
              <NodeDescription
                html={selectedNodeLocation.areaNode.description}
              />
            )}
            {selectedNodeLocation.areaNode.screenshot && (
              <ImagePreview src={selectedNodeLocation.areaNode.screenshot} />
            )}
            <Space h="md" />
            <ScrollArea style={{ flex: 1 }}>
              {selectedNodeLocation.areaNode.transitTo && (
                <>
                  <AvailableNodes
                    areaName={
                      selectedNodeLocation.areaNode.transitTo
                        .areaNodeLocations[0].areaName
                    }
                  />
                  <Space h="md" />
                </>
              )}
            </ScrollArea>
            <Button
              onClick={() =>
                toggleDiscoveredNode(selectedNodeLocation.areaNode)
              }
              color="gray"
              variant="light"
              size="xs"
              compact
              mb="xs"
              sx={{
                "> *": {
                  justifyContent: "left",
                },
              }}
            >
              <Group>
                <ClientOnly>
                  {() =>
                    discoveredNodes.some(
                      (discoveredNode) =>
                        discoveredNode.id === selectedNodeLocation.areaNodeId
                    ) ? (
                      <>
                        <IconEyeOff /> Discovered
                      </>
                    ) : (
                      <>
                        <IconEye />
                        Not discovered
                      </>
                    )
                  }
                </ClientOnly>
              </Group>
            </Button>
            <ShareButton areaNodeLocation={selectedNodeLocation} />
            <Text size="xs">See all discovered nodes in the settings</Text>
            <Space h="md" />
            <ClientOnly>
              {() =>
                userToken ? (
                  <Form
                    action={`${location.pathname}${location.search}`}
                    method="delete"
                    className="node-form"
                  >
                    <input type="hidden" name="_action" value="delete" />
                    <input
                      type="hidden"
                      name="id"
                      value={selectedNodeLocation.id}
                    />
                    <input type="hidden" name="userToken" value={userToken} />
                    <Button
                      type="submit"
                      color="red"
                      loading={transition.state !== "idle"}
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
                      color="teal"
                      onClick={() => {
                        setEditingNodeLocation(selectedNodeLocation);
                        setSelectedNodeLocation(null);
                      }}
                    >
                      Edit
                    </Button>
                  </Form>
                ) : (
                  <Form
                    action={`${location.pathname}${location.search}`}
                    method="post"
                    className="node-form"
                  >
                    <input type="hidden" name="_action" value="report" />
                    <input
                      type="hidden"
                      name="id"
                      value={selectedNodeLocation.id}
                    />
                    <TextInput
                      label="Is there any issue with this node?"
                      placeholder="Give us details"
                      name="reason"
                      required
                    />
                    <Button
                      type="submit"
                      color="teal"
                      loading={transition.state !== "idle"}
                    >
                      Report issue
                    </Button>
                  </Form>
                )
              }
            </ClientOnly>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
