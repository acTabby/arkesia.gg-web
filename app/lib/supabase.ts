import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { AreaNodeLocationDTO, TransitTo } from "./types";

export let supabase: SupabaseClient;
export const initSupabase = (supabaseUrl: string, supabaseKey: string) => {
  if (supabase) {
    return;
  }
  supabase = createClient(supabaseUrl, supabaseKey);
};

export const searchNodesByName = async (query: string) => {
  const result = await supabase
    .from<TransitTo>("AreaNode")
    .select(
      `
      id,
      name,
      type,
      areaNodeLocations:AreaNodeLocation (
        areaName,
        tileId
      )
    `
    )
    .neq("type", "Map Transition")
    .neq("type", "Stairs (Up)")
    .neq("type", "Stairs (Down)")
    .ilike("name", `%${query}%`)
    .limit(10);
  return result.data || [];
};

export const countTypesByLocation = async (areaName: string) => {
  const result = await supabase
    .from<AreaNodeLocationDTO>("AreaNodeLocation")
    .select(
      `
      areaNodeId,
      areaNode:AreaNode (
        type
      )
    `
    )
    .eq("areaName", areaName);
  const data = result.data || [];
  const ids: number[] = [];
  const typesCount: {
    type: string;
    count: number;
  }[] = [];
  data.forEach((location) => {
    if (["Map Transition"].includes(location.areaNode.type)) {
      return;
    }

    if (ids.includes(location.areaNodeId) || !location.areaNode) {
      return;
    }
    ids.push(location.areaNodeId);
    let typeCount = typesCount.find(
      (count) => count.type === location.areaNode.type
    );
    if (!typeCount) {
      typeCount = {
        type: location.areaNode.type,
        count: 1,
      };
      typesCount.push(typeCount);
    } else {
      typeCount.count++;
    }
  });
  return typesCount;
};
