import MetaAdsForm from "./MetaAdsForm";
import ScrollToFormButton from "@/components/ScrollToFormButton";
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
                    👥
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      Verified Bulk Buyers
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Connect only with genuine & verified buyers looking for bulk orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-orange-500 text-white">
                    📦
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      Regular Bulk Orders
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Get consistent inquiries and bulk orders for your products.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-blue-900 text-white">
                    📈
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      Grow Your Business
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Increase your sales, expand your reach and grow your brand.
                    </p>
                  </div>
                </div>

              </div>

              {/* BOTTOM BLUE SECTION */}
              <div className="bg-blue-900 text-white px-4 sm:px-6 py-6">
                <h4 className="text-xs sm:text-sm font-semibold tracking-wide mb-4 text-center">
                  WHY JOIN DIAL EXPORT MART?
                </h4>

                <div className="grid grid-cols-2 gap-4 text-center text-xs sm:text-sm">
                  <div>
                    <div className="text-lg mb-1">✔️</div>
                    <p>Verified Buyers</p>
                  </div>
                  <div>
                    <div className="text-lg mb-1">🤝</div>
                    <p>Business Connections</p>
                  </div>
                  <div>
                    <div className="text-lg mb-1">💰</div>
                    <p>More Profit</p>
                  </div>
                  <div>
                    <div className="text-lg mb-1">🎧</div>
                    <p>Support Team</p>
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

      </div>
    </section>
  );
};

export default Page;