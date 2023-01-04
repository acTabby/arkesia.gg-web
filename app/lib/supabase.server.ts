import { createServerClient as _createServerClient } from "@supabase/auth-helpers-remix";

export const createServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) =>
  _createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLIC_KEY!,
    { request, response, cookieOptions: { sameSite: "none", secure: true } }
  );
