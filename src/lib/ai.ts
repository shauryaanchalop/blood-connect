import type { BloodRequest, Donor, Hospital } from "./types";
import { isCompatible } from "./types";

// Deterministic pseudo-distance from donor+hospital ids (km)
export function estimateDistanceKm(donorId: string, hospitalId: string): number {
  let h = 0;
  const s = donorId + "|" + hospitalId;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return 1.2 + (h % 900) / 100; // 1.2 - 10.2 km
}

export function daysSince(iso: string | null): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/**
 * AI match score 0-100.
 * Weights: compatibility (40), distance (30), recency/eligibility (20), reliability (10)
 */
export function matchScore(donor: Donor, req: BloodRequest, hospital: Hospital): number {
  if (!isCompatible(donor.bloodType, req.bloodType)) return 0;
  // Exact-type match preferred
  const exact = donor.bloodType === req.bloodType ? 40 : 34;
  const dist = estimateDistanceKm(donor.id, hospital.id);
  const distScore = Math.max(0, 30 - dist * 2.4);
  const days = daysSince(donor.lastDonation);
  const eligibilityScore = days >= 90 ? 20 : days >= 56 ? 12 : 4;
  const urgencyBoost = req.urgency === "critical" ? 6 : req.urgency === "high" ? 3 : 0;
  const reliability = Math.min(10, donor.donationCount * 1.5);
  return Math.min(100, Math.round(exact + distScore + eligibilityScore + reliability + urgencyBoost));
}

export function livesSaved(unitsDonated: number): number {
  // WHO: one donation can save up to 3 lives
  return unitsDonated * 3;
}

export function eta(distanceKm: number): string {
  const min = Math.max(4, Math.round(distanceKm * 3.2));
  return `${min} min`;
}
