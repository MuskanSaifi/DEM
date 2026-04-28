import { Suspense } from "react";
import GrcCertificateClient from "./GrcCertificateClient";

export const metadata = {
  title: "GRC Certificate Verification",
  description: "Search and open a GRC certificate using certificate number.",
};

export default async function Page({ searchParams }) {
  const params = await searchParams; // ✅ important

  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <GrcCertificateClient initialCertNo={params.certNo || ""} />
    </Suspense>
  );
}