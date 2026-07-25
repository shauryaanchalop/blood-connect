import { jsPDF } from "jspdf";
import type { Donation } from "./types";

export function generateCertificatePdf(opts: {
  donation: Donation;
  donorName: string;
  hospitalName: string;
}) {
  const { donation, donorName, hospitalName } = opts;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Border
  doc.setDrawColor(180, 30, 40);
  doc.setLineWidth(6);
  doc.rect(24, 24, w - 48, h - 48);
  doc.setLineWidth(1);
  doc.rect(36, 36, w - 72, h - 72);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 30, 40);
  doc.setFontSize(36);
  doc.text("Certificate of Donation", w / 2, 130, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(14);
  doc.text("BloodBridgeAI proudly recognizes", w / 2, 170, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(30);
  doc.text(donorName, w / 2, 220, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `for donating ${donation.units} unit(s) of ${donation.bloodType} blood`,
    w / 2,
    260,
    { align: "center" },
  );
  doc.text(`at ${hospitalName}`, w / 2, 282, { align: "center" });
  doc.text(
    `on ${new Date(donation.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    w / 2,
    304,
    { align: "center" },
  );

  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  doc.text(`Certificate ID: ${donation.certificateId}`, w / 2, h - 90, { align: "center" });
  doc.text("Every donation saves up to three lives. Thank you.", w / 2, h - 70, {
    align: "center",
  });

  doc.save(`${donation.certificateId}.pdf`);
}
