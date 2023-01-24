import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import type { ShouldReloadFunction } from "@remix-run/react";
import { db, updateUser } from "~/lib/db.server";
import { createServerClient, referrerIsOverwolf } from "~/lib/supabase.server";

export async function action({ request }: ActionArgs) {
  const body = await request.json();
  const response = new Response();

  const isOverwolf = referrerIsOverwolf(request);
  const supabase = createServerClient({ request, response }, isOverwolf);
  const supporterSecret = body.supporterSecret;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return json("Not authorized", 401);
  }
  if (!supporterSecret) {
    return json("Invalid request", 400);
  }
  const supporter = await db.supporter.findFirst({
    where: {
      secret: supporterSecret,
    },
  });
  if (!supporter) {
    return json("Invalid secret", 404);
  }

  await updateUser(session.user.id, {
    // Only changing supporterId is allowed right now
    supporterId: supporter.id,
  });
  return redirect("/");
}

export const unstable_shouldReload: ShouldReloadFunction = () => false;
