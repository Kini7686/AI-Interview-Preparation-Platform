import { auth } from "@/lib/auth";
import { signOutAction } from "@/server/actions/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const identity =
    session.user.name?.trim() ||
    session.user.email?.trim() ||
    "Signed-in user";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          You are signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {identity}
          </span>
          {session.user.email && session.user.name ? (
            <>
              {" "}
              (<span>{session.user.email}</span>)
            </>
          ) : null}
          .
        </p>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
