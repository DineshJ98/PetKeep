import { serverSessionService } from "~/service/session.server";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/protected";

export async function loader({ request }: Route.LoaderArgs) {
  const springCookie = await serverSessionService.getBackendCookie(request);

  if (!springCookie) {
    return redirect("/");
  }
  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}
