import { serverSessionService } from "~/service/session.server";
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/protected";
import { jwtDecode } from "jwt-decode";

interface SpringBootJWTPayload {
  sub: string;
  roles: Array<{ authority: string }>;
  exp: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const springCookie = await serverSessionService.getBackendCookie(request);

  if (!springCookie) {
    return redirect("/");
  }

  try {
    const tokenString = springCookie.replace("jwt_token=", "").trim();

    const decodedToken = jwtDecode<SpringBootJWTPayload>(tokenString);

    const userAuthority = decodedToken.roles[0]?.authority || "ROLE_USER";

    const targetUrlPath = new URL(request.url).pathname;

    if (targetUrlPath.startsWith("/admin") && userAuthority !== "ROLE_ADMIN") {
      return redirect("/");
    }
  } catch (error) {
    return redirect("/");
  }

  return null;
}

export default function ProtectedLayout() {
  return <Outlet />;
}
