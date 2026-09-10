import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { serverSessionService } from "~/service/session.server";

// Loader fallback: If a user manually types /logout in the URL bar, treat it like an action click
export async function loader({ request }: Route.LoaderArgs) {
  const cookieString = await serverSessionService.destroySession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": cookieString, // Wipes the cookie wrapper out of browser memory
    },
  });
}

// Action Trigger: Handles secure programmatic logout form submissions
export async function action({ request }: Route.ActionArgs) {
  const cookieString = await serverSessionService.destroySession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": cookieString, // Clears the server session vault cookie completely
    },
  });
}
