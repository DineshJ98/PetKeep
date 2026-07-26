import type { Route } from "./+types/register";
import { authService } from "~/service/auth.service";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register | PetKeep" },
    { name: "description", content: "Create an account to adapt a pet" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const confirmPassword = formData.get("confirmPassword")?.toString() || "";

  if (password !== confirmPassword) {
    return {
      error: "Password do not match. Please verify again.",
    };
  }

  try {
    await authService.register({ username, password });
    return redirect("/");
  } catch (error: any) {
    return { error: error.message as string };
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Adopt a Pet
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create an account to begin your virtual companion journey
          </p>
        </div>

        {actionData?.error && (
          <div className="p-3 text-xs text-red-500 bg-red-950/20 border border-red-900 rounded-lg">
            ⚠️ {actionData.error}
          </div>
        )}

        <Form method="post" className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="e.g. Petlover"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-linear-to-r from-teal-500 to-blue-600 text-white font-medium py-2.5 rounded-lg text-sm shadow transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating Companion Profile..."
              : "Register Account"}
          </button>
        </Form>

        {/* Navigation link back to the login index file (/) */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            className="text-sm font-medium text-teal-500 hover:text-teal-400 transition-colors"
          >
            Already have an account? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
