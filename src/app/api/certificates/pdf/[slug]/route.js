import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectdb from "@/lib/dbConnect";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Certificate from "@/models/Certificate";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

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

const PAGE_W = 610;
const PAGE_H = 842;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getCompanyNameFontSize(companyName) {
  const len = (companyName || "").trim().length;
  if (len <= 18) return 30;
  if (len <= 26) return 27;
  if (len <= 34) return 23;
  return clamp(620 / Math.max(1, len), 17, 23);
}

let cachedTemplateBytes;
async function getCertificateTemplateBytes() {
  if (cachedTemplateBytes) return cachedTemplateBytes;
  const templatePath = path.join(process.cwd(), "public", "assets", "certificate-template.pdf");
  cachedTemplateBytes = await fs.readFile(templatePath);
  return cachedTemplateBytes;
}

function topToY(topPxFromTop, fontSize) {
  return PAGE_H - topPxFromTop - fontSize;
}

function centerXForText(text, font, size) {
  const w = font.widthOfTextAtSize(text, size);
  return (PAGE_W - w) / 2;
}

export async function GET(_req, { params }) {
  try {
    await connectdb();
    const { slug } = await params;
    const { searchParams } = new URL(_req.url);
    const certNoParam = (searchParams.get("certNo") || "").trim();

    let cert = null;
    let companyName = "";

    const user = await User.findOne({ userProfileSlug: slug }).lean();
    if (user) {
      const businessProfile = await BusinessProfile.findOne({ userId: user._id }).lean();
      cert = await Certificate.findOne({ userId: user._id, status: "active" }).lean();
      if (!cert) {
        return NextResponse.json({ success: false, message: "Certificate not found" }, { status: 404 });
      }
      companyName = (cert.companyName || businessProfile?.companyName || user.companyName || user.fullname || "—")
        .toString()
        .trim();
    } else {
      const certNo = certNoParam || slug;
      cert = await Certificate.findOne({ certificateNumber: certNo }).lean();
      if (!cert) {
        return NextResponse.json(
          { success: false, message: "User not found and no certificate matched" },
          { status: 404 }
        );
      }
      companyName = (cert.companyName || "—").toString().trim();
    }

    const templateBytes = await getCertificateTemplateBytes();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const companyText = companyName.toUpperCase();
    const companyFontSize = getCompanyNameFontSize(companyText);
    const companyTop = 296;
    const companyY = topToY(companyTop, companyFontSize);
    const companyX = centerXForText(companyText, boldFont, companyFontSize);

    page.drawText(companyText, {
      x: companyX,
      y: companyY,
      size: companyFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(companyText, {
      x: companyX + 0.4,
      y: companyY,
      size: companyFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(companyText, {
      x: companyX,
      y: companyY + 0.4,
      size: companyFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    const datesText = `issue Date ${formatMonthYear(cert.issuedAt)} / Valid Upto ${formatMonthYear(cert.validUntil)}`;
    const datesSize = 12;
    const datesTop = 342;
    const datesY = topToY(datesTop, datesSize);
    const datesX = centerXForText(datesText, regularFont, datesSize);

    page.drawText(datesText, {
      x: datesX,
      y: datesY,
      size: datesSize,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    const certNoText = (cert.certificateNumber || "").toString();
    const certNoSize = 10;
    const certNoBottom = 120;
    const certNoRight =   170;
    const certNoW = boldFont.widthOfTextAtSize(certNoText, certNoSize);
    const certNoX = PAGE_W - certNoRight - certNoW;
    const certNoY = certNoBottom;

    if (certNoText) {
      page.drawText(certNoText, {
        x: certNoX,
        y: certNoY,
        size: certNoSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
    }

    const buffer = Buffer.from(await pdfDoc.save());

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

  