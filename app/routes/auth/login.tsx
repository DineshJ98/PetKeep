import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { authService } from "~/service/auth.service";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "Login page for PetKeep", content: "Login form" },
  ];
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const role = formData.get("role")?.toString() as "user" | "admin";

  try {
    const userSession = await authService.login({ username, password, role });

    if (userSession.role === "ADMIN") {
      return redirect("/admin/dashboard");
    } else {
      return redirect("/petdashboard");
    }
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-md space-y-6 p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            PetKeep Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Secure Token Verification Sandbox
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedRole("user")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedRole === "user" ? "bg-teal-500 text-white shadow" : "text-slate-400"}`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("admin")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedRole === "admin" ? "bg-purple-600 text-white shadow" : "text-slate-400"}`}
          >
            Admin Management
          </button>
        </div>

        {actionData?.error && (
          <div className="p-3 text-xs text-red-500 bg-red-950/20 border border-red-900 rounded-lg">
            ⚠️ {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <input type="hidden" name="role" value={selectedRole} />

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              placeholder="e.g. Dinesh Jeewantha"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-teal-500 to-blue-600 text-white font-medium py-2.5 rounded-lg text-sm shadow transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Decoding Core Signatures..." : "Sign In"}
          </button>
        </Form>
      </div>
    </div>
  );
}
