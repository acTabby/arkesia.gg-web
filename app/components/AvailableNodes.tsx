import { Avatar, List, Skeleton } from "@mantine/core";
import { useEffect, useState } from "react";
import useSupabase from "~/hooks/useSupabase";
import { ICON_BASE_URL, nodeTypesMap } from "~/lib/static";
import type { AreaNodeLocationDTO } from "~/lib/types";

type AvailableNodesProps = {
  areaName: string;
};
export function AvailableNodes({ areaName }: AvailableNodesProps) {
  const [typesCount, setTypesCount] = useState<
    { type: string; count: number }[] | null
  >(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    const countTypesByLocation = async (areaName: string) => {
      const result = await supabase
        .from("AreaNodeLocation")
        .select(
          `
          areaNodeId,
          areaNode:AreaNode (
            type
          )
        `
        )
        .eq("areaName", areaName);
      const data = (result.data || []) as AreaNodeLocationDTO[];
      const ids: number[] = [];
      const typesCount: {
        type: string;
        count: number;
      }[] = [];
      data.forEach((location) => {
        const nodeType = nodeTypesMap[location.areaNode.type];
        if (!nodeType || nodeType.hideInSummary) {
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

    setTypesCount(null);
    countTypesByLocation(areaName).then(setTypesCount);
  }, [areaName]);

  if (typesCount === null) {
    return (
      <>
        <Skeleton height={8} />
        <Skeleton mt={6} height={8} />
        <Skeleton mt={6} height={8} />
      </>
    );
  }
  return (
    <List center size="sm">
      {typesCount.map(({ type, count }) => (
        <List.Item
          key={type}
          icon={
            <Avatar
              src={`${ICON_BASE_URL}${nodeTypesMap[type]?.icon}`}
              alt=""
              size="sm"
            />
          }
        >
          {type}: {count}
        </List.Item>
      ))}
    </List>
  );
}
