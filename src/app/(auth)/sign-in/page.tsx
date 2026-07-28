import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { mapAuthError } from "@/lib/auth/errors";
import { resolveCallbackUrl } from "@/lib/auth/callback-url";
import { SignInForm } from "./sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = resolveCallbackUrl(params.callbackUrl);
  const errorMessage = params.error ? mapAuthError(params.error) : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <SignInForm callbackUrl={callbackUrl} errorMessage={errorMessage} />
    </main>
  );
}
