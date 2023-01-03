import {
  Button,
  Drawer,
  Group,
  ScrollArea,
  Skeleton,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
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
import {
  IconAlertTriangle,
  IconCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useState } from "react";
import useSupabase from "~/hooks/useSupabase";

export default function NodeDetails() {
  const location = useLocation();
  const selectedNodeLocation = useSelectedNodeLocation();
  const setSelectedNodeLocation = useSetSelectedNodeLocation();
  const editingNodeLocation = useEditingNodeLocation();
  const setEditingNodeLocation = useSetEditingNodeLocation();
  const transition = useTransition();
  const actionData = useActionData<typeof nodeAction>();
  const { user } = useSupabase();
  const discoveredNodes = useDiscoveredNodes();
  const toggleDiscoveredNode = useToggleDiscoveredNode();
  const drawerPosition = useDrawerPosition();
  const [searchParams, setSearchParams] = useSearchParams();
  const nodeLocation = useEditingNodeLocation();
  const [prevAction, setPrevAction] = useState<"delete" | "verify" | null>(
    null
  );
  useDidUpdate(() => {
    if (nodeLocation) {
      return;
    }
    if (transition.state === "submitting") {
      const action =
        transition.submission?.method === "PATCH" ? "verify" : "delete";
      const title =
        action === "verify"
          ? "Verifying node"
          : user?.isModerator
          ? "Submitting deletion request"
          : "Reporting issue";
      showNotification({
        id: "notification",
        loading: true,
        title,
        message: "",
        autoClose: false,
        disallowClose: true,
      });
      setPrevAction(action);
    } else if (transition.state === "idle" && prevAction) {
      if (actionData) {
        updateNotification({
          id: "notification",
          title: "Something is wrong",
          message: "",
          color: "red",
        });
      } else {
        const title =
          prevAction === "verify"
            ? "Verified node"
            : user?.isModerator
            ? "Node deleted 💀"
            : "Issue reported";
        updateNotification({
          id: "notification",
          title,
          message: "",
        });
        setSelectedNodeLocation(null);
      }
      setPrevAction(null);
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
        selectedNodeLocation?.areaNode?.name ||
        selectedNodeLocation?.areaNode?.type || (
          <Skeleton height={20} width={120} />
        )
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
            <Stack spacing="xs">
              {user &&
                (user.isModerator ||
                  user.id === selectedNodeLocation.areaNode.userId) && (
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
                    <Button
                      type="submit"
                      color="red"
                      loading={transition.state !== "idle"}
                    >
                      Delete
                    </Button>
                  </Form>
                )}
              {!user?.isModerator &&
                user?.id !== selectedNodeLocation.areaNode.userId && (
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
                      color="orange"
                      loading={transition.state !== "idle"}
                      leftIcon={<IconAlertTriangle />}
                    >
                      Report issue
                    </Button>
                  </Form>
                )}
              {user && !selectedNodeLocation.areaNode.userId && (
                <Form
                  action={`${location.pathname}${location.search}`}
                  method="patch"
                  className="node-form"
                >
                  <input type="hidden" name="_action" value="verify" />
                  <input
                    type="hidden"
                    name="id"
                    value={selectedNodeLocation.areaNode.id}
                  />
                  <Button
                    type="submit"
                    color="teal"
                    loading={transition.state !== "idle"}
                    leftIcon={<IconCheck />}
                  >
                    Verify node
                  </Button>
                </Form>
              )}
              <Text size="xs">
                Node ID: {selectedNodeLocation.areaNodeId} Location ID:{" "}
                {selectedNodeLocation.id} Verified By:{" "}
                {selectedNodeLocation.areaNode.userId || "-"}
              </Text>
            </Stack>
          </>
        )}
      </Stack>
    </Drawer>
  );
}
