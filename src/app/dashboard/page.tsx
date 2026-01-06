import Header from "@/components/shared/Header";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:gap-12 p-4 md:p-8">
      <Skeleton className="h-[400px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardClient />
        </Suspense>
      </main>
    </div>
  );
}
