
import User from "@/models/User";
import Product from "@/models/Product";
import connectdb from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import SupportPerson from "@/models/SupportPerson"; // ✅ Make sure this line is present
import Category from "@/models/Category"; // ✅ REQUIRED for .populate("category") to work
import SubCategory from "@/models/SubCategory";


export async function DELETE(req) {
  try {
    await connectdb(); // ✅ Ensure DB connection

    // ✅ Extract userId from request
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
    }

    // ✅ Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // ✅ Delete all products of this user
    await Product.deleteMany({ userId });

    // ✅ Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true, message: "User and their products deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return NextResponse.json({ success: false, message: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}


// app/api/adminprofile/users/route.js (Updated GET function)

// Define default limits
const DEFAULT_LIMIT = 50; 
const MAX_LIMIT = 100;

export async function GET(req) {
  try {
    await connectdb();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT, 10);

    // ✅ 1. नए फ़िल्टर पैरामीटर निकालें
    // Note: URLSearchParams automatically decodes, but handle null/undefined
    const searchTerm = searchParams.get('searchTerm') || '';
    const remarkFilter = searchParams.get('remarkFilter') || '';
    const searchDate = searchParams.get('searchDate') || '';

    limit = Math.min(limit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    // ✅ 2. डायनामिक फ़िल्टर क्वेरी ऑब्जेक्ट (Dynamic Filter Query Object)
    const query = {};

    // A. सर्च टर्म फ़िल्टर (Search Term Filter) - $or का उपयोग करें
    if (searchTerm) {
      // 'i' for case-insensitive
      const regex = new RegExp(searchTerm.trim(), 'i'); 
      query.$or = [
        { fullname: regex },
        { email: regex },
        { companyName: regex },
        { mobileNumber: regex }
      ];
    }
    
    // B. रिमार्क फ़िल्टर (Remark Filter)
    if (remarkFilter) {
      query.remark = remarkFilter;
    }

    // C. डेट फ़िल्टर (Date Filter)
    if (searchDate) {
      // searchDate 'YYYY-MM-DD' फॉर्मेट में होगा
      const startOfDay = new Date(searchDate);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1); // Get 24 hours range

      query.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    // ✅ 3. फ़िल्टर की गई कुल संख्या (Filtered Count)
    // अब हम केवल फ़िल्टर किए गए उपयोगकर्ताओं की संख्या गिनेंगे
    const totalFilteredCount = await User.countDocuments(query); 
    
    const sort = { createdAt: -1 }; 

    // ✅ 4. फ़िल्टर की गई और पेजिनेटेड क्वेरी (Filtered and Paginated Query)
    const users = await User.find(query) // ✅ query ऑब्जेक्ट का उपयोग करें
      .sort(sort) 
      .skip(skip) 
      .limit(limit) 
      .populate([
        // ... population array remains the same ...
        {
          path: "products",
          select: "name price currency minimumOrderQuantity description images state city createdAt updatedAt tradeInformation specifications tradeShopping category subCategory",
          populate: [
            { path: "category", select: "name" },
            { path: "subCategory", select: "name" },
          ],
        },
        {
          path: "supportPerson",
          select: "name email number",
        }
      ])
      .lean();

    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      users: users, 
      totalUsersCount: totalFilteredCount, // ✅ फ़िल्टर किया गया काउंट वापस करें
      currentPage: page,
      totalPages: Math.ceil(totalFilteredCount / limit),
      limit: limit,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return NextResponse.json({
      success: false,
      totalUsersCount: 0,
      message: `Internal Server Error: ${error.message}`,
    }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectdb();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  const body = await req.json();
  const { remark } = body;

  if (!remark) {
    return NextResponse.json({ message: "Remark is required" }, { status: 400 });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { remark },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Remark updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ message: "Error updating remark", error }, { status: 500 });
  }
}




