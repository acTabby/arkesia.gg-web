import type { AreaNode, AreaNodeLocation } from "@prisma/client";
import type { ActionArgs, NodeOnDiskFile } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { json } from "@remix-run/node";
import {
  deleteNode,
  deleteNodeLocation,
  findNode,
  findNodeLocation,
  findNodeLocations,
  findOrCreateUser,
  insertNode,
  insertNodeLocation,
  updateNode,
  updateNodeLocation,
} from "./db.server";
import { postToDiscord } from "./discord";
import {
  deleteNodeScreenshot,
  imageToWebp,
  uploadHandler,
  uploadNodeScreenshot,
} from "./storage.server";
import type {
  CreateNodeForm,
  CreateNodeLocationForm,
  UpdateNodeForm,
} from "./types";
import type {
  AreaNodeLocationWithoutId,
  AreaNodeWithoutId,
  FieldErrors,
  PostNodeActionData,
} from "./validation";
import { validateNode } from "./validation";
import { createServerClient } from "./supabase.server";

export function parseFormData<T extends {}>(
  body: FormData,
  fields: { [key in keyof T]: "string" | "number" }
): Response | T {
  const fieldErrors: FieldErrors = {};
  const result: { [key: string]: string | number } = {};

  Object.entries(fields).forEach(([key, type]) => {
    const entryValue = body.get(key);
    if (entryValue === null) {
      fieldErrors[key] = `${key} is required`;
      return;
    }

    if (type === "string") {
      result[key] = entryValue.toString();
    } else if (type === "number") {
      result[key] = +entryValue.toString();
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return badRequest<PostNodeActionData>({
      fieldErrors: fieldErrors,
    });
  }
  return result as T;
}
export async function requestCreateNode(
  node: AreaNodeWithoutId,
  fileScreenshot?: NodeOnDiskFile | null
) {
  const fieldErrors = validateNode(node);
  if (Object.keys(fieldErrors).length > 0) {
    return badRequest<PostNodeActionData>({
      fieldErrors,
      fields: node,
    });
  }

  if (fileScreenshot) {
    const imageWebp = await imageToWebp(fileScreenshot);
    const filename = `${node.type}_${Date.now()}.webp`.replace(/\s/g, "_");
    node.screenshot = await uploadNodeScreenshot(filename, imageWebp);
  }

  const insertedNode = await insertNode(node);
  return insertedNode;
}

export async function requestUpdateNode(
  node: Omit<AreaNode, "validationNote">,
  fileScreenshot?: NodeOnDiskFile | null
) {
  const fieldErrors = validateNode(node);
  if (Object.keys(fieldErrors).length > 0) {
    return badRequest<PostNodeActionData>({
      fieldErrors,
      fields: node,
    });
  }
  const oldNode = await findNode(node.id);
  if (!oldNode) {
    return badRequest<PostNodeActionData>({
      formError: "Can not find node",
    });
  }

  if (oldNode.screenshot && oldNode.screenshot !== node.screenshot) {
    await deleteNodeScreenshot(oldNode.screenshot);
  }

  if (fileScreenshot) {
    const imageWebp = await imageToWebp(fileScreenshot);
    const filename = `${node.type}_${Date.now()}.webp`.replace(/\s/g, "_");
    node.screenshot = await uploadNodeScreenshot(filename, imageWebp);
  }

  const updatedNode = await updateNode(node);

  return updatedNode;
}

export async function requestDeleteNode(id: number) {
  try {
    const deletedNode = await deleteNode(id);
    if (deletedNode.screenshot) {
      await deleteNodeScreenshot(deletedNode.screenshot);
    }
    return deletedNode;
  } catch (error) {
    return badRequest<PostNodeActionData>({
      formError: "Deletion failed",
    });
  }
}

export async function requestReportNode(id: number, reason: string) {
  try {
    const nodeLocation = await findNodeLocation(id);
    if (!nodeLocation) {
      return badRequest<PostNodeActionData>({
        formError: "Can not find node",
      });
    }
    postToDiscord("report", nodeLocation.areaNode, nodeLocation, reason);
  } catch (error) {
    return badRequest<PostNodeActionData>({
      formError: "Report failed",
    });
  }
}

export async function requestVerifyNode(id: number, userId: number) {
  try {
    const node = await findNode(id);
    if (!node) {
      return badRequest<PostNodeActionData>({
        formError: "Can not find node",
      });
    }
    if (node.userId) {
      return badRequest<PostNodeActionData>({
        formError: "Already verified",
      });
    }
    node.userId = userId;
    await updateNode(node);

    const nodeLocations = await findNodeLocations({ areaNodeId: id });
    postToDiscord("verified", node, nodeLocations[0]);
  } catch (error) {
    return badRequest<PostNodeActionData>({
      formError: "Report failed",
    });
  }
}

export const nodeAction = async ({ request }: ActionArgs) => {
  try {
    const response = new Response();
    const supabase = createServerClient({ request, response });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session && (await findOrCreateUser(session.user.id));

    const contentType = request.headers.get("Content-Type") || "";
    const [type] = contentType.split(/\s*;\s*boundary=/);

    const body = await (type === "multipart/form-data"
      ? unstable_parseMultipartFormData(request, uploadHandler)
      : request.formData());

    const action = body.get("_action")?.toString();
    switch (action) {
      case "create":
        {
          const formData = parseFormData<CreateNodeForm>(body, {
            lat: "number",
            lng: "number",
            areaName: "string",
            type: "string",
            name: "string",
            tileId: "number",
            description: "string",
            screenshot: "string",
            transitToId: "number",
          });

          if (formData instanceof Response) {
            return formData;
          }
          const { lat, lng, areaName, tileId, ...partialFormData } = formData;
          const position = [lat, lng];

          const node: AreaNodeWithoutId = {
            ...partialFormData,
            description: formData.description.replace("<p><br></p>", ""),
            userId: user?.id || null,
            transitToId: formData.transitToId || null,
          };

          const fileScreenshot = body.get(
            "fileScreenshot"
          ) as NodeOnDiskFile | null;
          const createdNode = await requestCreateNode(node, fileScreenshot);

          if (!("id" in createdNode)) {
            return createdNode;
          }

          const location: AreaNodeLocationWithoutId = {
            areaNodeId: createdNode.id,
            areaName: areaName,
            position: position,
            tileId: tileId,
          };
          const createdNodeLocation = await insertNodeLocation(location);

          postToDiscord("inserted", createdNode, createdNodeLocation);
        }
        break;
      case "location":
        {
          if (!user) {
            return badRequest<PostNodeActionData>({
              formError: "You shall not pass",
            });
          }
          const formData = parseFormData<CreateNodeLocationForm>(body, {
            nodeId: "number",
            lat: "number",
            lng: "number",
            areaName: "string",
            tileId: "number",
          });

          if (formData instanceof Response) {
            return formData;
          }

          const location: AreaNodeLocationWithoutId = {
            areaNodeId: formData.nodeId,
            areaName: formData.areaName,
            position: [formData.lat, formData.lng],
            tileId: formData.tileId,
          };
          const node = await findNode(formData.nodeId);
          if (!node) {
            return badRequest<PostNodeActionData>({
              formError: "Node not found",
            });
          }
          const createdNodeLocation = await insertNodeLocation(location);
          postToDiscord("inserted", node, createdNodeLocation);
        }
        break;
      case "update":
        {
          const formData = parseFormData<UpdateNodeForm>(body, {
            id: "number",
            locationId: "number",
            lat: "number",
            lng: "number",
            areaName: "string",
            type: "string",
            name: "string",
            tileId: "number",
            description: "string",
            screenshot: "string",
            transitToId: "number",
          });

          if (formData instanceof Response) {
            return formData;
          }
          const existingNode = await findNode(formData.id);
          if (!existingNode) {
            return badRequest<PostNodeActionData>({
              formError: "Can not find node",
            });
          }
          console.log(existingNode.userId, user?.id, user?.isModerator);
          if (!user || (!user.isModerator && existingNode.userId !== user.id)) {
            return badRequest<PostNodeActionData>({
              formError: "You shall not pass",
            });
          }

          const { lat, lng, areaName, tileId, locationId, ...partialFormData } =
            formData;
          const position = [lat, lng];

          const node: Omit<AreaNode, "validationNote"> = {
            ...partialFormData,
            description: formData.description.replace("<p><br></p>", ""),
            userId: user ? user.id : null,
            transitToId: formData.transitToId || null,
          };
          const fileScreenshot = body.get(
            "fileScreenshot"
          ) as NodeOnDiskFile | null;
          const createdNode = await requestUpdateNode(node, fileScreenshot);
          if (!("id" in createdNode)) {
            return createdNode;
          }

          const location: AreaNodeLocation = {
            id: locationId,
            areaNodeId: createdNode.id,
            areaName: areaName,
            position: position,
            tileId: tileId,
          };
          const updatedNodeLocation = await updateNodeLocation(location);
          postToDiscord("updated", createdNode, updatedNodeLocation);
        }
        break;
      case "delete":
        {
          const formData = parseFormData<{ id: number }>(body, {
            id: "number",
          });
          if (formData instanceof Response) {
            return formData;
          }

          const nodeLocation = await findNodeLocation(formData.id);
          if (
            !user ||
            (!user.isModerator && nodeLocation?.areaNode.userId !== user.id)
          ) {
            return badRequest<PostNodeActionData>({
              formError: "You shall not pass",
            });
          }

          const deletedNodeLocation = await deleteNodeLocation(formData.id);
          const node = await findNode(deletedNodeLocation.areaNodeId);
          if (node) {
            const otherLocations = await findNodeLocations({
              areaNodeId: deletedNodeLocation.areaNodeId,
            });
            if (otherLocations.length === 0) {
              await requestDeleteNode(node.id);
            }
            postToDiscord("deleted", node, deletedNodeLocation);
          }
        }
        break;
      case "report":
        {
          const formData = parseFormData<{ id: number; reason: string }>(body, {
            id: "number",
            reason: "string",
          });

          if (formData instanceof Response) {
            return formData;
          }

          await requestReportNode(formData.id, formData.reason);
        }
        break;

      case "verify":
        {
          if (!user) {
            return badRequest<PostNodeActionData>({
              formError: "You shall not pass",
            });
          }
          const formData = parseFormData<{ id: number }>(body, {
            id: "number",
          });
          if (formData instanceof Response) {
            return formData;
          }
          await requestVerifyNode(formData.id, user.id);
        }
        break;
    }

    response.headers.set("Set-Cookie", "_vercel_no_cache=1;Max-Age=60");
    return json(null, {
      headers: response.headers,
    });
  } catch (error) {
    console.error(error);
    return badRequest<PostNodeActionData>({
      formError: "Something went wrong",
    });
  }
};
