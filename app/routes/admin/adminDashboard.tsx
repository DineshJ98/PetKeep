import { authService } from "~/service/auth.service";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { serverSessionService } from "~/service/session.server";
import type { Route } from "./+types/adminDashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard | PetKeep" },
    { name: "description", content: "User information and functions" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const springCookie = await serverSessionService.getBackendCookie(request);
    if (!springCookie) {
      throw new Error("No active governance session found. Please sign in.");
    }

    const users = await authService.getAllUsers(springCookie);
    return { users, error: null };
  } catch (error: any) {
    return { users: [], error: error.message as string };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const userId = formData.get("userId")?.toString() || "";

  try {
    const springCookie = await serverSessionService.getBackendCookie(request);

    if (intent === "toggleBlock") {
      await authService.toggleBlockUser(userId, springCookie);
      return {
        success: true,
        message: "Status updated successfully.",
        error: null,
      };
    }

    if (intent === "delete") {
      await authService.deleteUser(userId, springCookie);
      return {
        success: true,
        message: "User permanently deleted.",
        error: null,
      };
    }
    return null;
  } catch (error: any) {
    return {
      success: false,
      message: null,
      error: error.message as string,
    };
  }
}

export default function UserDashboard() {
  const { users, error: loaderError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isMutating = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-slate-900 dark:text-slate-100 p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dashboard Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            System Control Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Platform governance, telemetry controls, and user database
            configurations.
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {(loaderError || actionData?.error) && (
          <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl">
            ⚠️ System Exception: {loaderError || actionData?.error}
          </div>
        )}

        {actionData?.success && (
          <div className="p-4 text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl">
            ✅ Success: {actionData.message}
          </div>
        )}

        {/* Master Users Administrative Table */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4">Role Cleared</th>
                <th className="p-4">Pet Companion</th>
                <th className="p-4">Status Flag</th>
                <th className="p-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user: any) => {
                // Map your real Spring Security boolean to frontend state
                // If accountNonLocked is false, it means the user is blocked/suspended
                const isUserBlocked = !user.accountNonLocked;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-100/50 dark:hover:bg-slate-850/20 transition-colors"
                  >
                    {/* Column 1: Username */}
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {user.username}
                    </td>

                    {/* Column 2: Role */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${user.role === "ADMIN" ? "bg-purple-950 text-purple-400 border border-purple-800" : "bg-slate-800 text-slate-300"}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Column 3: Pet Name */}
                    <td className="p-4 italic text-slate-500 dark:text-slate-400">
                      {user.pet ? user.pet.name : "No Pet Adopted"}
                    </td>

                    {/* Column 4: Account Status */}
                    <td className="p-4">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium ${isUserBlocked ? "text-red-400" : "text-emerald-400"}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${isUserBlocked ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                        {isUserBlocked ? "Suspended" : "Active Clearance"}
                      </span>
                    </td>

                    {/* Column 5: Action Controls */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        {/* Toggle Block Button Form */}
                        <Form method="post">
                          <input type="hidden" name="userId" value={user.id} />
                          <input
                            type="hidden"
                            name="intent"
                            value="toggleBlock"
                          />
                          <button
                            type="submit"
                            disabled={isMutating}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all ${
                              isUserBlocked
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "bg-amber-600 hover:bg-amber-500 text-white"
                            } disabled:opacity-50`}
                          >
                            {isUserBlocked ? "🔓 Unblock" : "🚫 Block"}
                          </button>
                        </Form>

                        {/* Delete User Button Form */}
                        <Form
                          method="post"
                          onSubmit={(e) => {
                            if (
                              !confirm(
                                `Are you sure you want to permanently delete user ${user.username}?`,
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="intent" value="delete" />
                          <button
                            type="submit"
                            disabled={isMutating}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow transition-all disabled:opacity-50"
                          >
                            🗑️ Delete
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loaderError && (
          <p className="text-center text-sm text-slate-500 italic p-4">
            No user records present within the database collection ledger.
          </p>
        )}
      </div>
    </div>
  );
}
