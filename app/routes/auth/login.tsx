import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import { authService } from "~/service/auth.service";
import type { Route } from "./+types/login";
import { serverSessionService } from "~/service/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }, { name: "description", content: "Login form" }];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  try {
    const backendResponse = await authService.loginResponse({
      username,
      password,
    });

    if (!backendResponse.ok) {
      throw new Error("Invalid username, password, or security clearance.");
    }

    const springCookie = backendResponse.headers.get("Set-Cookie");
    if (!springCookie) {
      throw new Error("Backend authentication failed to issue a valid cookie.");
    }

    const user = await backendResponse.json();
    if (!user.accountNonLocked) {
      throw new Error("This account has been administratively suspended.");
    }

    const frontendCookieString =
      await serverSessionService.createSession(springCookie);

    const headers = new Headers();
    headers.append("Set-Cookie", frontendCookieString);

    const destination =
      user.role.toUpperCase() === "ADMIN" ? "/admin/dashboard" : "/playground";
    return redirect(destination, { headers });
  } catch (error: any) {
    return { error: error.message as string };
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

        {actionData?.error && (
          <div className="p-3 text-xs text-red-500 bg-red-950/20 border border-red-900 rounded-lg">
            ⚠️ {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              placeholder="e.g. PetLover"
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
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="register"
            className="text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors"
          >
            Do not have an account yet? Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
