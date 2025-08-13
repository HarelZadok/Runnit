import Desktop from "@/lib/features/dekstop/Desktop";
import StoreProvider from "@/app/providers/StoreProvider";
import { headers } from "next/headers";
import { isMobile } from "@/lib/functions";

export default async function Home() {
  const userAgent = (await headers()).get("user-agent") || "";
  const mobileCheck = isMobile(userAgent);

  if (mobileCheck)
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">We&apos;re sorry!</h1>
        <br />
        <h2 className="text-xl text-center">
          Mobile view is not available for the OS currently.
        </h2>
      </div>
    );

  return (
    <div className="overflow-hidden">
      <main className="overflow-hidden">
        <StoreProvider>
          <Desktop />
        </StoreProvider>
      </main>
    </div>
  );
}
