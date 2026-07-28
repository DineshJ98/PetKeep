import { serverSessionService } from "~/service/session.server";
import type { Route } from "./+types/petdashboard";
import { authService } from "~/service/auth.service";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pet Dashboard | PetKeep" },
    { name: "description", content: "Manage and monitor your pet." },
  ];
}

export async function loader({ request }: Route.ActionArgs) {
  try {
    const springCookie = await serverSessionService.getBackendCookie(request);
    if (!springCookie) {
      throw new Error("No active credentials found. Please sign back in.");
    }
    const currentUser = await authService.getUserProfile(springCookie);

    return { loggedInUser: currentUser, error: null };
  } catch (error: any) {
    return { loggedInUser: null, error: error.message as string };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const userId = formData.get("userId")?.toString() || "";

  try {
    const springCookie = await serverSessionService.getBackendCookie(request);

    if (intent === "generate") {
      const petName = formData.get("petName")?.toString() || "Companion";
      const prompt = formData.get("prompt")?.toString() || "Pixel Art Slime";
      await authService.generatePet(userId, petName, prompt, springCookie);
      return {
        success: true,
        user: null,
        message: "Companion generated successfully!",
        error: null,
      };
    }

    if (intent === "feed") {
      const updatedUser = await authService.executePetAction(
        userId,
        "feed",
        20,
        springCookie,
      );
      return {
        success: true,
        user: updatedUser,
        message: "Nourished pet companion (+20)",
        error: null,
      };
    }

    if (intent === "clean") {
      const updatedUser = await authService.executePetAction(
        userId,
        "clean",
        20,
        springCookie,
      );
      return {
        success: true,
        user: updatedUser,
        message: "Sanitized companion shell (+20)",
        error: null,
      };
    }

    if (intent === "reset") {
      const updatedUser = await authService.deletePet(userId, springCookie);
      return {
        success: true,
        user: updatedUser,
        message: "Companion dropped from document registry.",
        error: null,
      };
    }

    return null;
  } catch (error: any) {
    return { success: false, user: null, error: error.message as string };
  }
}

export default function PetDashboard() {
  const { loggedInUser, error: loaderError } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const activeUser = actionData?.user || loggedInUser;
  const pet = activeUser?.pet;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-6">
        {/* Error Feedback Layout Display */}
        {(loaderError || actionData?.error) && (
          <div className="p-3 text-xs text-red-500 bg-red-950/20 border border-red-900 rounded-lg text-center">
            ⚠️ Exception Boundary: {loaderError || actionData?.error}
          </div>
        )}

        {/* Success Feedback Layout Display */}
        {actionData?.success && actionData?.message && (
          <div className="p-3 text-xs text-emerald-500 bg-emerald-950/20 border border-emerald-900 rounded-lg text-center">
            ✅ {actionData.message}
          </div>
        )}

        {/* ======================================================= */}
        {/* CONDITION STATE A: No Pet Present (Render Generator Form) */}
        {/* ======================================================= */}
        {!pet ? (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold tracking-tight">
                Adopt Companion
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                No active pet model detected inside your document profile
                matrix.
              </p>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="generate" />
              <input type="hidden" name="userId" value={activeUser?.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Companion Name
                </label>
                <input
                  name="petName"
                  type="text"
                  required
                  placeholder="e.g., Cyber Slime"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Generation Seed Prompt
                </label>
                <input
                  name="prompt"
                  type="text"
                  required
                  placeholder="e.g., cybernetic dragon, neon style, cute 8-bit"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-teal-500 to-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? "Synthesizing Core DNA..."
                  : "Spawn Pet Companion"}
              </button>
            </Form>
          </div>
        ) : (
          /* ======================================================= */
          /* CONDITION STATE B: Pet Is Present (Render Pet Dashboard) */
          /* ======================================================= */
          <div className="space-y-6">
            <div className="text-center">
              <span className="px-2 py-0.5 bg-teal-500/10 text-teal-500 border border-teal-500/20 text-[10px] tracking-widest uppercase font-bold rounded-md">
                Guardian Node: {activeUser?.username}
              </span>
              <h1 className="text-3xl font-extrabold text-teal-500 tracking-tight mt-2">
                {pet.name}
              </h1>
            </div>

            {/* Graphic Space Matrix Placeholder Box */}
            <div className="w-full h-44 bg-slate-200 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-inner">
              <span className="text-5xl animate-bounce duration-1000">👾</span>
            </div>

            {/* Metrics Dashboard Gauges Layout */}
            <div className="space-y-4">
              {/* Progress Bar 1: Energy Level */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-1">
                  <span className="text-slate-400">Energy Tracker</span>
                  <span
                    className={
                      pet.energy < 25
                        ? "text-red-500 font-black animate-pulse"
                        : "text-slate-300"
                    }
                  >
                    {pet.energy} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-red-500 to-orange-400 h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.max(pet.energy, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: Cleanliness Level */}
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wide mb-1">
                  <span className="text-slate-400">Hygiene Core</span>
                  <span className="text-slate-300">
                    {pet.cleanliness} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-linear-to-r from-blue-500 to-teal-400 h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.max(pet.cleanliness, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Interaction Operational Layout Grid Section */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {/* Feed Execution Button Form */}
              <Form method="post">
                <input type="hidden" name="intent" value="feed" />
                <input type="hidden" name="userId" value={activeUser?.id} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-teal-500 text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  🍖 Feed (+20)
                </button>
              </Form>

              {/* Clean Execution Button Form */}
              <Form method="post">
                <input type="hidden" name="intent" value="clean" />
                <input type="hidden" name="userId" value={activeUser?.id} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-blue-500 text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  🧼 Clean (+20)
                </button>
              </Form>
            </div>

            {/* Emergency Action Workspace Layout Container Area */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Form
                method="post"
                onSubmit={(e) => {
                  if (
                    !confirm(
                      "🚨 CRITICAL WARNING: Are you certain you want to permanently reset this pet companion instance? This will clear the sub-document model field directly inside MongoDB.",
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="intent" value="reset" />
                <input type="hidden" name="userId" value={activeUser?.id} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-medium py-2 rounded-xl text-xs transition-all active:scale-[0.99] disabled:opacity-40"
                >
                  💀 Reset Pet Companion (Delete)
                </button>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
