import { useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "react-leaflet";
import {
  Form,
  useActionData,
  useLocation,
  useTransition,
} from "@remix-run/react";
import { showNotification, updateNotification } from "@mantine/notifications";
import type { Area, Tile } from "~/lib/types";
import {
  Anchor,
  Button,
  Drawer,
  Input,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import ImageDropzone from "./ImageDropzone";
import type { PostNodeActionData } from "~/lib/validation";
import RichTextEditor from "@mantine/rte";
import IconMarker from "./IconMarker";
import {
  useDrawerPosition,
  useEditingNodeLocation,
  useLastType,
  useSetEditingNodeLocation,
} from "~/lib/store";
import TypeSelect from "./TypeSelect";
import { trackOutboundLinkClick } from "~/lib/stats";
import { useLocalStorage } from "@mantine/hooks";

type UpsertMarkerProps = {
  area: Area;
  tile: Tile;
};

export default function UpsertMarker({ area, tile }: UpsertMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const location = useLocation();
  const [fileScreenshot, setFileScreenshot] = useState<File | null>(null);
  const nodeLocation = useEditingNodeLocation();
  const setEditingNodeLocation = useSetEditingNodeLocation();
  const [lastType, setLastType] = useLastType();

  const transition = useTransition();
  const [userToken] = useLocalStorage<string>({
    key: "user-token",
    defaultValue: "",
  });
  const actionData = useActionData<PostNodeActionData>();
  const drawerPosition = useDrawerPosition();
  const [prevState, setPrevState] = useState(transition.state);

  useEffect(() => {
    if (!nodeLocation) {
      return;
    }
    if (
      transition.state === "submitting" &&
      transition.submission?.method === "POST"
    ) {
      showNotification({
        id: "notification",
        loading: true,
        title: "Submitting node",
        message: "",
        autoClose: false,
        disallowClose: true,
      });
      setPrevState(transition.state);
    } else if (transition.state === "idle" && prevState !== "idle") {
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
          title: userToken ? "Node added 🤘" : "Node added for review 🤘",
          message: "",
        });
        setFileScreenshot(null);
        setEditingNodeLocation(null);
      }
      setPrevState(transition.state);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition.state, actionData, transition.submission?.method]);

  const base64Image = useMemo(
    () => fileScreenshot && URL.createObjectURL(fileScreenshot),
    [fileScreenshot]
  );

  return (
    <>
      {nodeLocation?.position && (
        <IconMarker
          type={nodeLocation.areaNode?.type || lastType}
          draggable={true}
          verified
          zIndexOffset={9000}
          eventHandlers={{
            dragend() {
              const marker = markerRef.current;
              if (marker != null) {
                const latLng = marker.getLatLng();
                setEditingNodeLocation({
                  ...nodeLocation,
                  position: [latLng.lat, latLng.lng],
                });
              }
            },
          }}
          position={nodeLocation?.position as [number, number]}
          ref={markerRef}
        >
          <Tooltip permanent direction="top" offset={[0, -15]}>
            {nodeLocation.areaNode?.type || "Choose marker"}
          </Tooltip>
        </IconMarker>
      )}
      <Drawer
        id="upsert-marker-drawer"
        opened={Boolean(nodeLocation?.position)}
        zIndex={8950}
        closeOnClickOutside={false}
        withOverlay={false}
        padding="md"
        position={drawerPosition}
        onClose={() => {
          setEditingNodeLocation(null);
          setFileScreenshot(null);
        }}
        title={nodeLocation?.areaNode?.name || nodeLocation?.areaNode?.type}
        styles={{
          body: {
            height: "calc(100% - 50px)",
          },
        }}
      >
        <ScrollArea style={{ height: "100%" }}>
          {nodeLocation?.position && (
            <>
              <Form
                action={`${location.pathname}${location.search}`}
                method="post"
                className="node-form"
                encType="multipart/form-data"
                onSubmit={(event) => {
                  event.currentTarget.onformdata = (event) => {
                    if (fileScreenshot) {
                      event.formData.append(
                        "fileScreenshot",
                        fileScreenshot,
                        "fileScreenshot"
                      );
                    }
                  };
                }}
              >
                <input
                  type="hidden"
                  name="_action"
                  value={nodeLocation?.id ? "update" : "create"}
                />
                <input
                  type="hidden"
                  name="id"
                  value={nodeLocation.areaNode?.id}
                />
                <input
                  type="hidden"
                  name="locationId"
                  value={nodeLocation?.id}
                />
                <input type="hidden" name="userToken" value={userToken} />
                <TypeSelect
                  category={area.category}
                  name="type"
                  zIndex={8960}
                  value={nodeLocation.areaNode?.type || lastType}
                  onChange={(type) => {
                    if (type) {
                      setEditingNodeLocation({
                        ...nodeLocation,
                        areaNode: { ...nodeLocation.areaNode, type: type },
                      });
                      setLastType(type);
                    }
                  }}
                />
                <TextInput
                  label="Name"
                  placeholder="A node needs a name"
                  value={nodeLocation.areaNode?.name || ""}
                  onChange={(event) =>
                    setEditingNodeLocation({
                      ...nodeLocation,
                      areaNode: {
                        ...nodeLocation.areaNode,
                        name: event.target.value,
                      },
                    })
                  }
                  max={30}
                  name="name"
                  error={actionData?.fieldErrors?.name}
                />
                <Input.Wrapper
                  label="Description (optional)"
                  error={actionData?.fieldErrors?.description}
                >
                  <RichTextEditor
                    value={nodeLocation.areaNode?.description || ""}
                    onChange={(description) =>
                      setEditingNodeLocation({
                        ...nodeLocation,
                        areaNode: {
                          ...nodeLocation.areaNode,
                          description,
                        },
                      })
                    }
                    placeholder="Additional information about this node"
                    controls={[
                      ["bold", "italic", "underline", "clean", "link"],
                    ]}
                    sx={() => ({
                      zIndex: 1,
                    })}
                  />
                  <input
                    type="hidden"
                    value={nodeLocation.areaNode?.description || ""}
                    name="description"
                  />
                </Input.Wrapper>
                <TextInput
                  label="Transit to node ID (optional)"
                  placeholder="Enter node ID"
                  type="number"
                  value={nodeLocation.areaNode?.transitToId || "0"}
                  onChange={(event) =>
                    setEditingNodeLocation({
                      ...nodeLocation,
                      areaNode: {
                        ...nodeLocation.areaNode,
                        transitToId: +event.target.value,
                      },
                    })
                  }
                  name="transitToId"
                  error={actionData?.fieldErrors?.transitToId}
                />
                <ImageDropzone
                  onDrop={(files: File[]) => setFileScreenshot(files[0])}
                  onClear={() => {
                    setEditingNodeLocation({
                      ...nodeLocation,
                      areaNode: {
                        ...nodeLocation.areaNode,
                        screenshot: null,
                      },
                    });
                    setFileScreenshot(null);
                  }}
                  onReject={() =>
                    showNotification({
                      title: "Upload failed",
                      message: "",
                      color: "red",
                    })
                  }
                  src={base64Image || nodeLocation.areaNode?.screenshot}
                />
                <input
                  type="hidden"
                  name="screenshot"
                  value={nodeLocation.areaNode?.screenshot || ""}
                />
                <input
                  type="hidden"
                  name="lat"
                  value={nodeLocation?.position[0]}
                />
                <input
                  type="hidden"
                  name="lng"
                  value={nodeLocation?.position[1]}
                />
                <input type="hidden" name="areaName" value={area.name} />
                <input type="hidden" name="tileId" value={tile.id} />
                <Button
                  type="submit"
                  loading={transition.state !== "idle"}
                  variant="gradient"
                >
                  {userToken ? "Save" : "Submit for review"}
                </Button>
                {!userToken && (
                  <Text size="xs">
                    Join us in{" "}
                    <Anchor
                      size="xs"
                      href="https://discord.com/invite/NTZu8Px"
                      target="_blank"
                      onClick={() =>
                        trackOutboundLinkClick(
                          "https://discord.com/invite/NTZu8Px"
                        )
                      }
                      rel="noreferrer"
                    >
                      Discord
                    </Anchor>{" "}
                    to help maintaining nodes
                  </Text>
                )}
              </Form>
              {!nodeLocation?.id && userToken && (
                <Form
                  action={`${location.pathname}${location.search}`}
                  method="post"
                  className="node-form"
                >
                  <Text size="xs" align="center" mt="md">
                    Or add as location to existing node
                  </Text>
                  <input type="hidden" name="_action" value="location" />
                  <input
                    type="hidden"
                    name="lat"
                    value={nodeLocation?.position[0]}
                  />
                  <input
                    type="hidden"
                    name="lng"
                    value={nodeLocation?.position[1]}
                  />
                  <input type="hidden" name="areaName" value={area.name} />
                  <input type="hidden" name="tileId" value={tile.id} />
                  <input type="hidden" name="userToken" value={userToken} />
                  <TextInput
                    name="nodeId"
                    type="number"
                    placeholder="Node ID"
                  />
                  <Button
                    type="submit"
                    loading={transition.state !== "idle"}
                    variant="gradient"
                  >
                    Add location
                  </Button>
                </Form>
              )}
            </>
          )}
        </ScrollArea>
      </Drawer>
    </>
  );
}
