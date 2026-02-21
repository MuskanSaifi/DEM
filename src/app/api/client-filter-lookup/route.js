import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import Buyer from "@/models/Buyer";
import SalesLead from "@/models/SalesLead";
import { NextResponse } from "next/server";

/**
 * GET: Lookup User, Buyer, SalesLead by name / email / phone / business name.
 * Uses each model's actual keys:
 * - User: fullname, email, mobileNumber, companyName, alternateMobileNumber, whatsappNumber
 * - Buyer: fullname, email, mobileNumber, companyName, productname
 * - SalesLead: clientName, email, mobile, companyName, product
 * Returns list with detail + paid/unpaid per model.
 */
export async function GET(req) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const name = (searchParams.get("name") || "").trim();
    const email = (searchParams.get("email") || "").trim();
    const phone = (searchParams.get("phone") || "").trim();
    const businessName = (searchParams.get("businessName") || "").trim();

    const terms = [name, email, phone, businessName].filter(Boolean);
    if (terms.length === 0) {
      return NextResponse.json({
        success: true,
        users: { total: 0, paid: 0, unpaid: 0, list: [] },
        buyers: { total: 0, paid: 0, unpaid: 0, list: [] },
        salesLeads: { total: 0, paid: 0, unpaid: 0, list: [] },
      });
    }

    const safeRegex = (t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    // User: fullname, email, mobileNumber, companyName, alternateMobileNumber, whatsappNumber
    const userOr = [];
    for (const t of terms) {
      const re = safeRegex(t);
      userOr.push(
        { fullname: re },
        { email: re },
        { mobileNumber: re },
        { companyName: re },
        { alternateMobileNumber: re },
        { whatsappNumber: re }
      );
    }

    // Buyer: fullname, email, mobileNumber, companyName, productname
    const buyerOr = [];
    for (const t of terms) {
      const re = safeRegex(t);
      buyerOr.push(
        { fullname: re },
        { email: re },
        { mobileNumber: re },
        { companyName: re },
        { productname: re }
      );
    }

    // SalesLead: clientName, email, mobile, companyName, product (number field is "mobile")
    const leadOr = [];
    for (const t of terms) {
      const re = safeRegex(t);
      leadOr.push(
        { clientName: re },
        { email: re },
        { mobile: re },
        { companyName: re },
        { product: re }
      );
    }

    const [users, buyers, leads] = await Promise.all([
      User.find({ $or: userOr })
        .select("fullname email mobileNumber companyName alternateMobileNumber whatsappNumber paymentStatus")
        .lean()
        .limit(50),
      Buyer.find({ $or: buyerOr })
        .select("fullname email mobileNumber companyName productname paymentStatus")
        .lean()
        .limit(50),
      SalesLead.find({ $or: leadOr })
        .select("clientName email mobile companyName product status paymentStatus")
        .lean()
        .limit(50),
    ]);

    const usersPaid = users.filter((d) => (d.paymentStatus || "unpaid") === "paid").length;
    const buyersPaid = buyers.filter((d) => (d.paymentStatus || "unpaid") === "paid").length;
    const leadsPaid = leads.filter((d) => (d.paymentStatus || "pending") === "paid").length;

    // Normalize to same keys so form can show full details from any model
    return NextResponse.json({
      success: true,
      users: {
        total: users.length,
        paid: usersPaid,
        unpaid: users.length - usersPaid,
        list: users.map((u) => ({
          name: u.fullname || "",
          email: u.email || "",
          phone: u.mobileNumber || u.alternateMobileNumber || u.whatsappNumber || "",
          businessName: u.companyName || "",
          product: "",
          status: "",
          paymentStatus: u.paymentStatus || "unpaid",
        })),
      },
      buyers: {
        total: buyers.length,
        paid: buyersPaid,
        unpaid: buyers.length - buyersPaid,
        list: buyers.map((b) => ({
          name: b.fullname || "",
          email: b.email || "",
          phone: b.mobileNumber || "",
          businessName: b.companyName || "",
          product: b.productname || "",
          status: "",
          paymentStatus: b.paymentStatus || "unpaid",
        })),
      },
      salesLeads: {
        total: leads.length,
        paid: leadsPaid,
        unpaid: leads.length - leadsPaid,
        list: leads.map((l) => ({
          name: l.clientName || "",
          email: l.email || "",
          phone: l.mobile || "",
          businessName: l.companyName || "",
          product: l.product || "",
          status: l.status || "",
          paymentStatus: (l.paymentStatus || "pending") === "paid" ? "paid" : "unpaid",
        })),
      },
    });
  } catch (error) {
    console.error("client-filter-lookup error:", error);
    return NextResponse.json(
      { success: false, message: "Lookup failed" },
      { status: 500 }
    );
  }
}
