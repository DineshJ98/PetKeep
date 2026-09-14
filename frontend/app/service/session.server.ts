import { createCookieSessionStorage } from "react-router";

const storage = createCookieSessionStorage({
  cookie: {
    name: "__petkeep_server_session",
    secure: false, // Set to true in production HTTPS
    secrets: ["super-secret-mvp-encryption-key-12345"],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export const serverSessionService = {
  /**
   * Helper utility to clean up the backend Set-Cookie header string
   * and isolate just the "jwt_token=ey..." assignment rule.
   */
  parseSpringCookie(setCookieHeader: string | null): string | null {
    if (!setCookieHeader) return null;

    // Spring Boot cookie strings look like: "jwt_token=ey...; Path=/; HttpOnly"
    // Split by semicolons and find the chunk starting with the cookie name
    const parts = setCookieHeader.split(";");
    const jwtPart = parts.find((part) => part.trim().startsWith("jwt_token="));

    return jwtPart ? jwtPart.trim() : null;
  },

  /**
   * Saves the isolated Spring Boot cookie string into the React Router server storage wrapper
   */
  async createSession(springCookieHeader: string) {
    const session = await storage.getSession();

    // Clean the header so it only contains "jwt_token=ey..."
    const cleanCookie = this.parseSpringCookie(springCookieHeader);

    session.set("backend_cookie", cleanCookie);
    return storage.commitSession(session);
  },

  /**
   * Extracts the Spring Boot cookie string from the incoming frontend request
   */
  async getBackendCookie(request: Request): Promise<string | null> {
    const session = await storage.getSession(request.headers.get("Cookie"));
    return session.get("backend_cookie") || null;
  },

  async destroySession(request: Request) {
    const session = await storage.getSession(request.headers.get("Cookie"));
    return storage.destroySession(session);
  },
};
