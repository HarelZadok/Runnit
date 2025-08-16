import Desktop from "@/lib/features/dekstop/Desktop";
import StoreProvider from "@/app/providers/StoreProvider";

export default async function Home() {
  return (
    <div className='overflow-hidden'>
      <main className='overflow-hidden'>
        <StoreProvider>
          <Desktop />
        </StoreProvider>
      </main>
    </div>
  );
}
