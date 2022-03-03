import type { AreaNode } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import type { AreaNodeWithoutId } from "./validation";

export let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  db = global.__db;
}

export const requestDataAPI = async (resource: string, payload: any) => {
  if (
    !process.env.DATA_API_BASE_URL ||
    !process.env.DATA_API_KEY ||
    !process.env.CLUSTER_NAME
  ) {
    throw new Error("Missing DATA API environment variables");
  }

  const request = await fetch(`${process.env.DATA_API_BASE_URL}${resource}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
      "api-key": process.env.DATA_API_KEY,
    },
    body: JSON.stringify({
      database: "arkesia",
      dataSource: "Arkesia0",
      ...payload,
    }),
  });
  return await request.json();
};

export const findNode = async (id: number) => {
  const node = await db.areaNode.findUnique({ where: { id } });
  return node;
};

export const findNodes = async (areaName: string) => {
  const nodes = await db.areaNode.findMany({ where: { areaName } });
  return nodes;
};

export const insertNode = async (node: AreaNodeWithoutId) => {
  const result = await db.areaNode.create({ data: node });
  return result;
};

export const updateNode = async (node: AreaNode) => {
  const { id, ...data } = node;
  const result = await db.areaNode.update({ where: { id }, data });
  return result;
};

export const deleteNode = async (nodeId: number) => {
  const result = await db.areaNode.delete({ where: { id: nodeId } });
  return result;
};

export const findUser = async (token: string) => {
  const user = await db.user.findFirst({ where: { token } });
  return user;
};
