// app/routes/logout.tsx

import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/utils/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
