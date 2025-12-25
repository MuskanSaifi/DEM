import connectDB from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch users with selected fields
    const allPayments = await User.find({}, {
      fullname: 1,
      email: 1,
      mobileNumber: 1,
      userPackage: 1,
      userPackageHistory: 1,
    });

    // Count how many users have at least one payment
    const totalPayingUsers = allPayments.filter(user =>
      Array.isArray(user.userPackage) && user.userPackage.length > 0
    ).length;

    return new Response(JSON.stringify({
      success: true,
      totalPayingUsers, // 👈 sending total users who made payments
      data: allPayments,
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error fetching payments:", error);

    return new Response(JSON.stringify({
      success: false,
      message: "Failed to fetch payment records.",
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
