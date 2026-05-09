import connectdb from "@/lib/dbConnect";
import Certificate from "@/models/Certificate";

function normalizeCertNo(value) {
  return (value || "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export async function GET(_req, { params }) {
  try {
    await connectdb();
    const { certNo: raw } = await params;
    const certNo = normalizeCertNo(raw || "");
    if (!certNo) {
      return Response.json({ success: false, message: "Certificate number required" }, { status: 400 });
    }

    const cert = await Certificate.findOne({ certificateNumber: certNo })
      .select("certificateNumber companyName issuedAt validUntil status")
      .lean();

    if (!cert) {
      return Response.json({ success: false, message: "Certificate not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        companyName: cert.companyName,
        issuedAt: cert.issuedAt,
        validUntil: cert.validUntil,
        status: cert.status,
      },
    });
  } catch (error) {
    console.error("Certificate verify error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
