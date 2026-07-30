import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { updateProfile } from "@/server/actions/profile";
import { ActionForm } from "@/components/action-form";
import { Field, PageHeader } from "@/components/ui";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=%2Fprofile");

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.roleCatalogEntry.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Set your display name and the default target role used when you start a new interview."
      />

      <ActionForm action={updateProfile} className="card flex flex-col gap-6 p-6">
        <Field label="Email" htmlFor="email" hint="Managed by your sign-in provider">
          <input
            id="email"
            value={user?.email ?? session.user.email ?? ""}
            readOnly
            className="input"
          />
        </Field>

        <Field label="Display name" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            defaultValue={user?.name ?? ""}
            className="input"
            placeholder="Your name"
          />
        </Field>

        <Field label="Default target role" htmlFor="defaultRoleId">
          <select
            id="defaultRoleId"
            name="defaultRoleId"
            required
            defaultValue={user?.defaultRoleId ?? ""}
            className="select"
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
        </Field>

        <button type="submit" className="btn btn-primary w-fit">
          Save profile
        </button>
      </ActionForm>
    </main>
  );
}
