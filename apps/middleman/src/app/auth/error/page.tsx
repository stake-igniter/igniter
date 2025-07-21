import CurrentUser from "@/app/components/CurrentUser";
import React from "react";

function SiteNotReady() {
    return (
      <>
        <h1>Sign In not allowed</h1>
        <p>
          Seems like you're trying to access this application before it has been opened to the public.
        </p>
        <p className={'mb-3'}>
          If you are the owner, try again with a different account.
        </p>
        <CurrentUser />
      </>
    );
}

function UnknownError() {
  return (
    <>
      <h1 className={'font-semibold'}>Authentication Error</h1>
      <p className={'mb-3'}>
        An unknown error occurred while trying to authenticate the account. You can try again.
      </p>
      <CurrentUser />
    </>
  );
}

export default async function AuthError({searchParams}: {
  searchParams: Promise<Record<string, string | Array<string> | undefined>>
}) {
  const awaitedSearchParams = await searchParams;

  let content: React.ReactNode

  if (awaitedSearchParams.type === "NotReady") {
    content = <SiteNotReady />
  } else {
    content = <UnknownError />
  }

  return (
    <div
      className={"flex flex-col items-center justify-center w-full max-w-[400px] gb- py-10 px-4 text-center gap-4 sm:border border-[color:var(--divider)] rounded-lg"}
    >
      {content}
    </div>
  );
}
