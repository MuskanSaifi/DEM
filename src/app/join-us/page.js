import JoinUs from "./JoinUs";

export const metadata = {
  title: "Join Us - Register with Dial Export Mart | Connect with Global Buyers and Suppliers",
  description: "Register with Dial Export Mart to connect with buyers and suppliers. Start your B2B journey today for global business opportunities.",
  keywords: ["Join Dial Export Mart", "Buy and Sell", "Register", "Business Growth", "Export", "Import"],
  alternates: {
    canonical: "https://www.dialexportmart.com/join-us",
  },
  openGraph: {
    title: "Join Us - Register with Dial Export Mart | Connect with Global Buyers and Suppliers",
    description: "Sign up today to buy or sell products on Dial Export Mart. Connect with global buyers and sellers.",
    url: "https://www.dialexportmart.com/join-us",
    siteName: "Dial Export Mart",
    images: [
      {
        url: "https://www.dialexportmart.com/assets/join-us.png", // make sure this path is accessible
        width: 1200,
        height: 630,
        alt: "Join Us Banner",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <JoinUs />;
}
