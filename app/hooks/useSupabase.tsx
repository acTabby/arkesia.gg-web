import { useOutletContext } from "@remix-run/react";
import type { SupabaseContext } from "~/routes/__supabase";

export default function useSupabase() {
  return useOutletContext<SupabaseContext>();
}
