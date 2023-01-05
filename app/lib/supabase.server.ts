import { createServerClient as _createServerClient } from "@supabase/auth-helpers-remix";

export const createServerClient = (
  {
    request,
    response,
  }: {
    request: Request;
    response: Response;
  },
  isOverwolf: boolean
) =>
  _createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLIC_KEY!,
    {
      request,
      response,
      cookieOptions: {
        sameSite: "none",
        secure: !isOverwolf,
      },
    }
  );

export const referrerIsOverwolf = (request: Request) =>
  Boolean(request.headers.get("user-agent")?.includes("OverwolfClient"));
