import { jsPDF } from "jspdf";
import type { Donation } from "./types";

/**
 * Premium donation certificate PDF.
 * - Landscape A4, elegant double border, crimson + gold accents
 * - Gold medallion seal, ribbon banner, tabular donation details
 * - Verification block with certificate ID and issue timestamp
 */
export function generateCertificatePdf(opts: {
  donation: Donation;
  donorName: string;
  hospitalName: string;
}) {
  const { donation, donorName, hospitalName } = opts;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Cream background
  doc.setFillColor(252, 249, 244);
  doc.rect(0, 0, w, h, "F");

  // Outer crimson border
  doc.setDrawColor(155, 25, 40);
  doc.setLineWidth(6);
  doc.rect(24, 24, w - 48, h - 48);

  // Inner hairline border
  doc.setDrawColor(200, 160, 90);
  doc.setLineWidth(1);
  doc.rect(38, 38, w - 76, h - 76);

  // Decorative corners (small crosses)
  const corner = (x: number, y: number) => {
    doc.setDrawColor(200, 160, 90);
    doc.setLineWidth(1.2);
    doc.line(x - 8, y, x + 8, y);
    doc.line(x, y - 8, x, y + 8);
  };
  corner(48, 48);
  corner(w - 48, 48);
  corner(48, h - 48);
  corner(w - 48, h - 48);

  // Top ribbon banner
  doc.setFillColor(155, 25, 40);
  doc.rect(w / 2 - 130, 60, 260, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(252, 249, 244);
  doc.text("BLOODBRIDGE  ·  AI EMERGENCY NETWORK", w / 2, 77, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 20, 25);
  doc.setFontSize(40);
  doc.text("Certificate of Donation", w / 2, 140, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 90, 60);
  doc.setFontSize(13);
  doc.text("Officially recognizing an act of extraordinary humanity", w / 2, 165, { align: "center" });

  // "This is to certify"
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 70, 60);
  doc.setFontSize(12);
  doc.text("This is to certify that", w / 2, 200, { align: "center" });

  // Donor name (large, in serif-like presentation)
  doc.setFont("times", "bolditalic");
  doc.setTextColor(30, 25, 30);
  doc.setFontSize(38);
  doc.text(donorName, w / 2, 240, { align: "center" });

  // Underline flourish
  doc.setDrawColor(200, 160, 90);
  doc.setLineWidth(0.8);
  const nameW = doc.getTextWidth(donorName);
  doc.line(w / 2 - nameW / 2 - 20, 250, w / 2 + nameW / 2 + 20, 250);

  // Details paragraph
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 55, 55);
  doc.setFontSize(13);
  doc.text(
    `has voluntarily donated ${donation.units} unit${donation.units > 1 ? "s" : ""} of ${donation.bloodType} blood`,
    w / 2, 285, { align: "center" }
  );
  doc.text(`at ${hospitalName}`, w / 2, 305, { align: "center" });
  doc.text(
    `on ${new Date(donation.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`,
    w / 2, 325, { align: "center" }
  );

  // Impact statement
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(155, 25, 40);
  doc.setFontSize(14);
  doc.text(`— potentially saving up to ${donation.units * 3} lives —`, w / 2, 355, { align: "center" });

  // Gold medallion seal (right side)
  const sx = w - 130;
  const sy = h - 130;
  doc.setFillColor(200, 160, 90);
  doc.circle(sx, sy, 42, "F");
  doc.setFillColor(220, 185, 115);
  doc.circle(sx, sy, 34, "F");
  doc.setDrawColor(155, 25, 40);
  doc.setLineWidth(1.5);
  doc.circle(sx, sy, 34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 25, 30);
  doc.setFontSize(9);
  doc.text("VERIFIED", sx, sy - 6, { align: "center" });
  doc.setFontSize(18);
  doc.text("♥", sx, sy + 10, { align: "center" });
  doc.setFontSize(7);
  doc.text("BLOODBRIDGE", sx, sy + 24, { align: "center" });

  // Signature line (left)
  doc.setDrawColor(120, 100, 80);
  doc.setLineWidth(0.6);
  doc.line(80, h - 110, 260, h - 110);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 85, 75);
  doc.text("Medical Director · BloodBridge", 80, h - 96);
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(60, 40, 45);
  doc.text("Dr. A. Kapoor", 100, h - 115);

  // Certificate ID block (bottom center)
  doc.setDrawColor(200, 160, 90);
  doc.setLineWidth(0.5);
  doc.rect(w / 2 - 130, h - 78, 260, 26);
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(60, 30, 35);
  doc.text(`ID: ${donation.certificateId}`, w / 2, h - 62, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 120, 105);
  doc.text(
    `Issued ${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC · verifiable at bloodbridge.ai/verify`,
    w / 2, h - 42,
    { align: "center" }
  );

  doc.save(`${donation.certificateId}.pdf`);
}
