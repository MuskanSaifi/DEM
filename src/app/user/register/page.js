import Register from "./RegisterPage";

export const metadata = {
  title: "Register | Join DialExportMart | Start Your Global Trade Journey",
  description: "Create your account on Dial Export Mart and connect with verified global buyers and suppliers. Join India’s trusted export-import platform today.",
  keywords: ["Register Dial Export Mart", "Sign Up Export Platform", "Join Global Trade", "Export Import India", "B2B Marketplace Registration"],
  alternates: {
    canonical: "https://www.dialexportmart.com/register",
  },
  openGraph: {
    title: "Register | Join DialExportMart | Start Your Global Trade Journey",
    description: "Create your account on Dial Export Mart and connect with verified global buyers and suppliers. Join India’s trusted export-import platform today.",
    url: "https://www.dialexportmart.com/register",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/Login.png", // Use a relevant image path
        width: 1200,
        height: 630,
        alt: "Register on Dial Export Mart",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <Register />;
}
