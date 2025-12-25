import { Suspense } from "react";
import InitiatePayment from "./InitiatePayment";

export const dynamic = "force-dynamic"; // prevent static generation

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InitiatePayment />
    </Suspense>
  );
}
