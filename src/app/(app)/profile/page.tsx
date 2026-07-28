import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { updateProfile } from "@/server/actions/profile";
import { ActionForm } from "@/components/action-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fprofile");

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.roleCatalogEntry.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Set your display name and default target role for new interviews.
        </p>
      </div>

      <ActionForm action={updateProfile} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            value={user?.email ?? session.user.email ?? ""}
            readOnly
            className="h-11 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Display name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={user?.name ?? ""}
            className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="defaultRoleId" className="text-sm font-medium">
            Default target role
          </label>
          <select
            id="defaultRoleId"
            name="defaultRoleId"
            required
            defaultValue={user?.defaultRoleId ?? ""}
            className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save profile
        </button>
      </ActionForm>
    </main>
  );
}
