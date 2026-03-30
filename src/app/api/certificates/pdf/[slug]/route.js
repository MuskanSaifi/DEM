import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Certificate from "@/models/Certificate";
import { Document, Page, Text, View, Image, StyleSheet, pdf } from "@react-pdf/renderer";

function formatMonthYear(d) {
  const date = new Date(d);
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

function formatFullDate(d) {
  const date = new Date(d);
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  page: { position: "relative", width: "100%", height: "100%" },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  companyName: {
    position: "absolute",
    top: 295, // below "THIS IS TO CERTIFY THAT"
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  datesLine: {
    position: "absolute",
    top: 370, // below the blue line
    left: 80,
    right: 80,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
  },
  certNo: {
    position: "absolute",
    bottom: 120,
    right: 70,
    fontSize: 10,
    fontWeight: 700,
  },
});

function CertificatePdf({ bgDataUri, companyName, issueDate, validUpto, certificateNumber }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={bgDataUri} style={styles.bg} />
        <View style={styles.overlay}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.datesLine}>
            {`issue Date ${formatMonthYear(issueDate)} / Valid Upto ${formatMonthYear(validUpto)}`}
          </Text>
          <Text style={styles.certNo}>{certificateNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(_req, { params }) {
  try {
    await connectdb();
    const { slug } = await params;

    const user = await User.findOne({ userProfileSlug: slug }).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const businessProfile = await BusinessProfile.findOne({ userId: user._id }).lean();
    const cert = await Certificate.findOne({ userId: user._id, status: "active" }).lean();
    if (!cert) {
      return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
    }

    const bgPath = path.join(process.cwd(), "public", "assets", "certificate-bg.png");
    const bgBytes = await fs.readFile(bgPath);
    const bgDataUri = `data:image/png;base64,${bgBytes.toString("base64")}`;

    const companyName = (cert.companyName || businessProfile?.companyName || user.companyName || user.fullname || "—")
      .toString()
      .trim();

    const buffer = await pdf(
      <CertificatePdf
        bgDataUri={bgDataUri}
        companyName={companyName}
        issueDate={cert.issuedAt}
        validUpto={cert.validUntil}
        certificateNumber={cert.certificateNumber}
      />
    ).toBuffer();

    const filenameSafe = (companyName || "certificate").replace(/[^\w\-]+/g, "_").slice(0, 60);
    const issue = formatFullDate(cert.issuedAt);
    const valid = formatFullDate(cert.validUntil);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filenameSafe}.pdf"`,
        "X-Certificate-Issue": issue,
        "X-Certificate-Valid-Until": valid,
      },
    });
  } catch (error) {
    console.error("Certificate PDF error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

