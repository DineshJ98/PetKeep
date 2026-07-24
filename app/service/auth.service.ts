import { jwtDecode } from "jwt-decode";
import { register } from "module";

export interface LoginPayload {
  username: string;
  password: string;
  role: "user" | "admin";
}

interface JWTPayload {
  sub: string;
  roles: Array<{ authority: string }>;
  exp: number;
}

export const authService = {
  async login(
    payload: LoginPayload,
  ): Promise<{ username: string; role: string }> {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        "Invalid username, password or user level (user or admin manager)!",
      );
    }

    const data: { token: string } = await response.json();
    console.log(data);

    if (!data.token) {
      throw new Error("Authentication token not found in the response!");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("jwt_token", data.token);
    }

    const decoded = jwtDecode<JWTPayload>(data.token);

    const serverRole =
      decoded.roles[0].authority.replace("ROLE_", "") || "USER";

    return {
      username: decoded.sub,
      role: serverRole,
    };
  },

  async register(payload: Omit<LoginPayload, "role">): Promise<void> {
    const response = await fetch("http://localhost:8080/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
        role: "user",
      }),
    });
    if (!response.ok) {
      throw new Error("Registration failed.");
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("jwt_token");
  },

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.roles[0]?.authority.replace("ROLE_", "") || "USER";
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("jwt_token");
    }
  },
};
