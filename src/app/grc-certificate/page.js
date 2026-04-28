import GrcCertificateClient from "./GrcCertificateClient";

export const metadata = {
  title: "GRC Certificate Verification",
  description: "Search and open a GRC certificate using certificate number.",
};

export default function Page() {
  return <GrcCertificateClient />;
}

