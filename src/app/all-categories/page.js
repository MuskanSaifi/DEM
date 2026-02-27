import CategoryList from "./CategoryList";

export const metadata = {
  title: "Explore All Product Categories – Dial Export Mart",
  description:
    "Explore all product categories on Dial Export Mart. Find verified manufacturers, suppliers and exporters across India for bulk and wholesale sourcing.",
  keywords: [
    "manufacturers",
    "suppliers",
    "wholesalers",
    "B2B marketplace",
    "bulk suppliers India",
  ],
  alternates: {
    canonical: "https://www.dialexportmart.com/all-categories",
  },
};

export default function Page() {
  return <CategoryList />;
}