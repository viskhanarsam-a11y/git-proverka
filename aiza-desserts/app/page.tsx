import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <HomeClient />
    </Suspense>
  );
}
