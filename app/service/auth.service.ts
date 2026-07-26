// app/service/auth.service.ts

export interface LoginPayload {
  username: string;
  password: string;
  role: "user" | "admin";
}

export const authService = {
  /**
   * Dispatches credentials to your Spring Boot REST API.
   * Returns the RAW HTTP Response object so the React Router SSR layout
   * can intercept and parse the "Set-Cookie" security header wrapper.
   */
  async loginResponse(payload: LoginPayload): Promise<Response> {
    return fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Dispatches new standard profile details down to the database registration gate.
   */
  async register(payload: Omit<LoginPayload, "role">): Promise<void> {
    const response = await fetch("http://localhost:8080/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
        role: "user", // Enforces standard user role context natively
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Registration failed. Profile username may be already taken.",
      );
    }
  },

  /**
   * Pulls all accounts out of MongoDB for the admin data grid table ledger views.
   * Accepts the Spring Boot cookie string explicitly from the server layout loaders.
   */
  async getAllUsers(springCookie: string | null): Promise<any[]> {
    const response = await fetch("http://localhost:8080/api/v1/admin/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: springCookie || "", // Appends the true backend cookie string
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load user dataset from database repository.");
    }

    return response.json();
  },

  /**
   * Toggles account NonLocked permissions flags directly inside MongoDB.
   */
  async toggleBlockUser(id: string, springCookie: string | null): Promise<any> {
    const response = await fetch(
      `http://localhost:8080/api/v1/admin/users/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: springCookie || "", // Passes token context safely via server headers
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "Failed to modify user operational block configurations.",
      );
    }

    return response.json();
  },

  /**
   * Permanently purges an account from the system collection ledger.
   */
  async deleteUser(id: string, springCookie: string | null): Promise<boolean> {
    const response = await fetch(
      `http://localhost:8080/api/v1/admin/users/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: springCookie || "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to execute account purge request.");
    }

    return response.json(); // Returns true or false matching your backend configuration
  },
};
