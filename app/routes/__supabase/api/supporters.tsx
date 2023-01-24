import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { v4 as uuid } from "uuid";
import { db } from "~/lib/db.server";
import { findPatron } from "~/lib/supporters";

export const action = async ({ request }: ActionArgs) => {
  switch (request.method) {
    case "POST": {
      try {
        const payload = await request.json();

        if (payload.secret !== process.env.UPDATE_SECRET) {
          return json("Not allowed", 401);
        }
        const secret = uuid();

        const patron = await findPatron(payload.patronEmail);
        if (!patron) {
          return json("Patron not found", 404);
        }

        const supporter = await db.supporter.findFirst({
          where: {
            patronId: patron.id,
          },
        });

        if (supporter) {
          return json("Patron already exist", 400);
        }
        const result = await db.supporter.create({
          data: {
            secret: uuid(),
            patronId: patron.id,
          },
        });
        if (!result.id) {
          return json("Couldn't create supporter secret", 500);
        }
        const message = `Thx for supporting me 🤘<br/><br/>
    Please enter this secret in your user profile to disable ads:<br/><br/>
    ${secret}<br/><br/>
    After you entered the secret and reloaded the app and website, the ads should disappear.
    Please let me know, if it works for you.<br/><br/>
    Best<br/>
    Leon
    `;
        return json(message, 200);
      } catch (error) {
        console.error(error);
        return json("You shall not pass", 500);
      }
    }
  }
};
