import MetaAdsForm from "./MetaAdsForm";
import ScrollToFormButton from "@/components/ScrollToFormButton";
import { 
  FaUsers, 
  FaBox, 
  FaChartLine, 
  FaCheckCircle, 
  FaHandshake, 
  FaRupeeSign, 
  FaHeadset 
} from "react-icons/fa";
export const metadata = {
  title: "Meta Ads | Dial Export Mart",
  description:
    "Meta Ads lead capture page for suppliers and manufacturers on Dial Export Mart.",
};

const Page = () => {
  return (
    <section className="bg-slate-50 py-8 md:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MAIN GRID */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
          
          {/* LEFT CONTENT */}
          <div className="space-y-6">
            
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-700">
              Only for Suppliers & Manufacturers
            </span>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Join Dial Export Mart
                <span className="block text-orange-600">
                  Grow Your Business
                </span>
                <span className="block text-xl sm:text-2xl lg:text-4xl font-bold text-slate-900">
                  Get Bulk Orders
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl">
                Connect with verified bulk buyers across India and expand your
                business to new heights.
              </p>
            </div>

            {/* FEATURE BOX */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              
          <div className="p-4 sm:p-6 space-y-5">
  
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-900 text-white">
      <FaUsers size={18} />
    </div>
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
        Verified Bulk Buyers
      </h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-600">
        Connect only with genuine & verified buyers looking for bulk orders.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-4">
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-orange-500 text-white">
      <FaBox size={18} />
    </div>
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
        Regular Bulk Orders
      </h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-600">
        Get consistent inquiries and bulk orders for your products.
      </p>
    </div>
  </div>

  <div className="flex items-start gap-4">
    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-900 text-white">
      <FaChartLine size={18} />
    </div>
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
        Grow Your Business
      </h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-600">
        Increase your sales, expand your reach and grow your brand.
      </p>
    </div>
  </div>

</div>

    {/* BOTTOM BLUE SECTION */}
<div className="bg-blue-900 text-white px-4 sm:px-6 py-6 rounded-b-3xl">
  
  {/* Heading */}
  <div className="flex items-center justify-center gap-3 mb-5">
    <div className="h-[1px] w-8 bg-orange-400"></div>
    <h4 className="text-xs sm:text-sm font-semibold tracking-wide">
      WHY JOIN DIAL EXPORT MART?
    </h4>
    <div className="h-[1px] w-8 bg-orange-400"></div>
  </div>

  {/* GRID */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs sm:text-sm">
    
    {/* ITEM 1 */}
    <div className="flex flex-col items-center gap-1">
      <FaCheckCircle className="text-orange-400 text-3xl mb-1" />
      <p className="text-white text-xs">100% Verified</p>
      <p className="text-gray-300 text-[11px]">Buyers</p>
    </div>

    {/* ITEM 2 */}
    <div className="flex flex-col items-center gap-1">
      <FaHandshake className="text-orange-400 text-3xl mb-1" />

      <p className="text-white text-xs">Genuine Business</p>
      <p className="text-gray-300 text-[11px]">Connections</p>
    </div>

    {/* ITEM 3 */}
    <div className="flex flex-col items-center gap-1">
      <FaRupeeSign className="text-orange-400 text-3xl mb-1" />
      <p className="text-white text-xs">More Orders</p>
      <p className="text-gray-300 text-[11px]">More Profit</p>
    </div>

    {/* ITEM 4 */}
    <div className="flex flex-col items-center gap-1">
      <FaHeadset className="text-orange-400 text-3xl mb-1" />
      <p className="text-white text-xs">Dedicated Support</p>
      <p className="text-gray-300 text-[11px]">Team</p>
    </div>

  </div>
</div>

            </div>

            {/* SCROLL ARROW (MOBILE ONLY) */}
       <ScrollToFormButton />

          </div>

          {/* RIGHT FORM */}
          <div id="lead-form">
            <MetaAdsForm />
          </div>
        </div>
{/* TRUSTED SECTION */}
<div className="mt-10 space-y-6">

  {/* TOP STATS */}
  <div className="bg-white rounded-xl shadow-sm py-6 px-4 text-center">
    <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-4">
      TRUSTED BY 1000+ SUPPLIERS ACROSS INDIA
    </h4>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div>
        <p className="text-xl font-bold text-blue-900">1000+</p>
        <p className="text-xs text-gray-500">Verified Suppliers</p>
      </div>
      <div>
        <p className="text-xl font-bold text-blue-900">5000+</p>
        <p className="text-xs text-gray-500">Bulk Buyers</p>
      </div>
      <div>
        <p className="text-xl font-bold text-blue-900">15000+</p>
        <p className="text-xs text-gray-500">Products Listed</p>
      </div>
      <div>
        <p className="text-xl font-bold text-blue-900">25+</p>
        <p className="text-xs text-gray-500">Industry Categories</p>
      </div>
    </div>
  </div>

{/* FEATURES STRIP */}
<div className="bg-white rounded-xl shadow-sm py-5 px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
  
  <div className="flex gap-3 items-start">
    <div className="text-green-600 text-xl">
    <FaCheckCircle className="text-orange-400 text-3xl mb-1" />

    </div>
    <div>
      <p className="font-semibold">Verified & Secure</p>
      <p className="text-xs text-gray-500">
        We verify every buyer so you get genuine inquiries.
      </p>
    </div>
  </div>

  <div className="flex gap-3 items-start">
    <div className="text-orange-500 text-xl">
      <FaUsers className="text-orange-400 text-3xl mb-1" />
    </div>
    <div>
      <p className="font-semibold">Grow Your Network</p>
      <p className="text-xs text-gray-500">
        Connect with buyers from across India.
      </p>
    </div>
  </div>

  <div className="flex gap-3 items-start">
    <div className="text-blue-600 text-xl">
      <FaChartLine  className="text-orange-400 text-3xl mb-1"/>
    </div>
    <div>
      <p className="font-semibold">Boost Your Sales</p>
      <p className="text-xs text-gray-500">
        Get more inquiries and close more deals.
      </p>
    </div>
  </div>

  <div className="flex gap-3 items-start">
    <div className="text-purple-600 text-xl">
      <FaHeadset  className="text-orange-400 text-3xl mb-1"/>
    </div>
    <div>
      <p className="font-semibold">We Are Here to Help</p>
      <p className="text-xs text-gray-500">
        Our support team is always ready to assist you.
      </p>
    </div>
  </div>

</div>

  {/* OUR PROMISE */}
  <div className="bg-blue-900 text-white rounded-xl px-5 py-4 flex items-center gap-4">
    <div className="text-xl">🏆</div>
    <div>
      <p className="font-semibold">OUR PROMISE</p>
      <p className="text-xs text-blue-100">
        We are committed to helping suppliers grow by connecting them with the right buyers and business opportunities.
      </p>
    </div>
  </div>

</div>
      </div>
    </section>
  );
};

export default Page;