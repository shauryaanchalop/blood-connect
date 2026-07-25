export type BloodType = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";
export type Role = "donor" | "hospital" | "admin";
export type Urgency = "critical" | "high" | "normal";
export type RequestStatus = "open" | "fulfilled" | "cancelled";
export type Lang = "en" | "hi" | "es";

export interface User {
  id: string;
  role: Role;
  name: string;
}

export interface Donor {
  id: string;
  userId: string;
  name: string;
  bloodType: BloodType;
  city: string;
  phone: string;
  lastDonation: string | null; // ISO date
  donationCount: number;
}

export interface Hospital {
  id: string;
  userId: string;
  name: string;
  city: string;
  address: string;
  inventory: Record<BloodType, number>;
}

export interface RequestResponse {
  donorId: string;
  status: "accepted" | "declined";
  at: string;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  bloodType: BloodType;
  units: number;
  urgency: Urgency;
  status: RequestStatus;
  createdAt: string;
  note?: string;
  responses: RequestResponse[];
}

export interface Donation {
  id: string;
  donorId: string;
  hospitalId: string;
  requestId: string;
  bloodType: BloodType;
  units: number;
  date: string;
  certificateId: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  at: string;
}

export const BLOOD_TYPES: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

// donor blood type -> recipient blood types they can give to
const CAN_GIVE_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export function isCompatible(donor: BloodType, recipient: BloodType): boolean {
  return CAN_GIVE_TO[donor].includes(recipient);
}
