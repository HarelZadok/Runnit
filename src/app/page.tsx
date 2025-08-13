import Desktop from "@/lib/features/dekstop/Desktop";
import StoreProvider from "@/app/providers/StoreProvider";
import { headers } from "next/headers";
import { isMobile } from "@/lib/functions";

export default async function Home() {
  const userAgent = (await headers()).get("user-agent") || "";
  const mobileCheck = isMobile(userAgent);

  if (mobileCheck)
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <p>Mobile view is not available for the OS currently.</p>
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
