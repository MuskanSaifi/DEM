// src/app/state/[state]/page.js
import connectdb from "@/lib/dbConnect";
import Product from "@/models/Product";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 600;

export default async function StatePage({ params }) {

  const { state } = await params;

  const stateLower = state.toLowerCase();

  await connectdb();

  const data = await Product.aggregate([

    {
      $match: { state: stateLower }
    },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },

    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subcategory"
      }
    },

    { $unwind: "$category" },
    { $unwind: "$subcategory" },

    {
      $group: {
        _id: {
          categoryId: "$category._id",
          subId: "$subcategory._id"
        },
        categoryName: { $first: "$category.name" },
        categorySlug: { $first: "$category.categoryslug" },
        categoryIcon: { $first: "$category.icon" },

        subName: { $first: "$subcategory.name" },
        subSlug: { $first: "$subcategory.subcategoryslug" },
        subIcon: { $first: "$subcategory.icon" }
      }
    },

    {
      $sort: { categoryName: 1 }
    }
  ]);

  const categoryMap = {};

  data.forEach(item => {

    const catId = item._id.categoryId;

    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        name: item.categoryName,
        slug: item.categorySlug,
        icon: item.categoryIcon,
        subcategories: []
      };
    }

    categoryMap[catId].subcategories.push({
      name: item.subName,
      slug: item.subSlug,
      icon: item.subIcon
    });
  });

  const categories = Object.values(categoryMap);
  return (

    <div className="container mx-auto max-w-7xl p-4">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        Suppliers in {state}
      </h1>
    
      {categories.map((cat, index) => (

        <div key={index} className="mb-10 border-b pb-6">

          {/* Category Header */}
          <div className="flex items-center gap-3 mb-4">

            {cat.icon && (
              <Image
                src={cat.icon}
                width={40}
                height={40}
                alt={cat.name}
              />
            )}

            <h2 className="text-2xl font-bold">
              {cat.name}
            </h2>
          </div>

          {/* Subcategories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

            {cat.subcategories.map((sub) => (

              <Link
                key={sub.slug}
                href={`/state/${state}/${sub.slug}`}
                className="border rounded-lg p-3 hover:shadow-lg text-center"
              >

                {sub.icon && (
                  <div className="flex justify-center mb-2">

                    <Image
                      src={sub.icon}
                      width={60}
                      height={60}
                      alt={sub.name}
                    />
                  </div>
                )}

                <p className="text-sm font-semibold">
                  {sub.name}
                </p>

              </Link>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}