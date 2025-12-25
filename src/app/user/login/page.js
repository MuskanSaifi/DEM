import Login from "./Login";

export const metadata = {
  title: "Login | Access Your DialExportMart Account | B2B Export Platform",
  description:
    "Securely log in to your Dial Export Mart account to manage your business profile, connect with global buyers, and grow your export opportunities.",
  keywords: [
    "Login Dial Export Mart",
    "Export Platform Login",
    "B2B Marketplace Access",
    "Global Trade Account",
    "Export Import Dashboard",
  ],
  alternates: {
    canonical: "https://www.dialexportmart.com/login",
  },
  openGraph: {
    title: "Login | Access Your DialExportMart Account | B2B Export Platform",
    description:
      "Securely log in to your Dial Export Mart account to manage your business profile, connect with global buyers, and grow your export opportunities.",
    url: "https://www.dialexportmart.com/login",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/pagesbanner/Login.png", // Make sure the image exists
        width: 1200,
        height: 630,
        alt: "Login to Dial Export Mart",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <Login />;
}
