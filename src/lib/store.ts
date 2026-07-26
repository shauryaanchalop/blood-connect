import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BloodRequest,
  BloodType,
  Donation,
  Donor,
  Hospital,
  Lang,
  Notification,
  Role,
  Urgency,
  User,
} from "./types";
import { isCompatible } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

interface State {
  currentUserId: string | null;
  lang: Lang;
  theme: "light" | "dark";
  teamOpen: boolean;
  users: User[];
  donors: Donor[];
  hospitals: Hospital[];
  requests: BloodRequest[];
  donations: Donation[];
  notifications: Notification[];

  setLang: (l: Lang) => void;
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  setTeamOpen: (o: boolean) => void;
  switchTo: (userId: string) => void;
  ensureSeed: () => void;

  updateDonor: (donorId: string, patch: Partial<Donor>) => void;
  updateHospital: (hospitalId: string, patch: Partial<Hospital>) => void;

  registerDonor: (input: {
    name: string;
    bloodType: BloodType;
    city: string;
    phone: string;
    age?: number;
  }) => { user: User; donor: Donor };

  createRequest: (input: {
    hospitalId: string;
    bloodType: BloodType;
    units: number;
    urgency: Urgency;
    note?: string;
    patientInfo?: string;
    contactName?: string;
    contactPhone?: string;
    deadlineMins?: number;
    locationOverride?: string;
  }) => BloodRequest;
  respondToRequest: (
    requestId: string,
    donorId: string,
    status: "accepted" | "declined",
  ) => void;
  completeDonation: (requestId: string, donorId: string) => Donation | null;

  notify: (userId: string, message: string) => void;
  markAllRead: (userId: string) => void;
}

function emptyInventory(): Record<BloodType, number> {
  return { "O-": 0, "O+": 0, "A-": 0, "A+": 0, "B-": 0, "B+": 0, "AB-": 0, "AB+": 0 };
}

function seed(): Partial<State> {
  const users: User[] = [
    { id: "u_admin", role: "admin", name: "Dr. Anjali Verma (Admin)" },
    { id: "u_admin2", role: "admin", name: "NBTC Coordinator" },
    { id: "u_h1", role: "hospital", name: "City General" },
    { id: "u_h2", role: "hospital", name: "St. Mary's" },
    { id: "u_h3", role: "hospital", name: "AIIMS Delhi" },
    { id: "u_h4", role: "hospital", name: "Apollo Bengaluru" },
    { id: "u_d1", role: "donor", name: "Aditi Sharma" },
    { id: "u_d2", role: "donor", name: "Rahul Verma" },
    { id: "u_d3", role: "donor", name: "Maria Lopez" },
    { id: "u_d4", role: "donor", name: "James Chen" },
    { id: "u_d5", role: "donor", name: "Priya Nair" },
    { id: "u_d6", role: "donor", name: "Vikram Singh" },
    { id: "u_d7", role: "donor", name: "Ananya Iyer" },
    { id: "u_d8", role: "donor", name: "Rohan Kapoor" },
    { id: "u_d9", role: "donor", name: "Neha Gupta" },
    { id: "u_d10", role: "donor", name: "Arjun Mehta" },
    { id: "u_d11", role: "donor", name: "Fatima Khan" },
    { id: "u_d12", role: "donor", name: "Sanjay Rao" },
    { id: "u_d13", role: "donor", name: "Ishita Bose" },
    { id: "u_d14", role: "donor", name: "Karan Malhotra" },
    { id: "u_d15", role: "donor", name: "Meera Pillai" },
    { id: "u_d16", role: "donor", name: "Devansh Joshi" },
  ];

  const hospitals: Hospital[] = [
    {
      id: "h1", userId: "u_h1", name: "City General Hospital", city: "Mumbai", address: "1 Marine Drive",
      inventory: { "O-": 2, "O+": 12, "A-": 3, "A+": 8, "B-": 1, "B+": 6, "AB-": 1, "AB+": 3 },
    },
    {
      id: "h2", userId: "u_h2", name: "St. Mary's Medical Center", city: "Delhi", address: "45 Rajpath",
      inventory: { "O-": 4, "O+": 10, "A-": 2, "A+": 5, "B-": 3, "B+": 7, "AB-": 2, "AB+": 4 },
    },
    {
      id: "h3", userId: "u_h3", name: "AIIMS Delhi", city: "Delhi", address: "Ansari Nagar",
      inventory: { "O-": 6, "O+": 18, "A-": 4, "A+": 11, "B-": 4, "B+": 9, "AB-": 3, "AB+": 5 },
    },
    {
      id: "h4", userId: "u_h4", name: "Apollo Bengaluru", city: "Bengaluru", address: "154 Bannerghatta Rd",
      inventory: { "O-": 1, "O+": 7, "A-": 2, "A+": 6, "B-": 2, "B+": 5, "AB-": 1, "AB+": 2 },
    },
  ];

  // Two donors per blood type across 3 cities — organized coverage of all 8 groups.
  const donors: Donor[] = [
    { id: "d1",  userId: "u_d1",  name: "Aditi Sharma",    bloodType: "O-",  city: "Mumbai",    phone: "+91 90000 00001", lastDonation: "2025-03-10", donationCount: 4, available: true,  reminderEnabled: true, age: 28 },
    { id: "d2",  userId: "u_d2",  name: "Rahul Verma",     bloodType: "O+",  city: "Mumbai",    phone: "+91 90000 00002", lastDonation: "2025-06-01", donationCount: 2, available: true,  reminderEnabled: true, age: 31 },
    { id: "d3",  userId: "u_d3",  name: "Maria Lopez",     bloodType: "A+",  city: "Mumbai",    phone: "+91 90000 00003", lastDonation: null,         donationCount: 0, available: true,  reminderEnabled: true, age: 24 },
    { id: "d4",  userId: "u_d4",  name: "James Chen",      bloodType: "B+",  city: "Delhi",     phone: "+91 90000 00004", lastDonation: "2025-01-15", donationCount: 6, available: true,  reminderEnabled: true, age: 34 },
    { id: "d5",  userId: "u_d5",  name: "Priya Nair",      bloodType: "AB-", city: "Mumbai",    phone: "+91 90000 00005", lastDonation: "2024-12-01", donationCount: 3, available: true,  reminderEnabled: true, age: 29 },
    { id: "d6",  userId: "u_d6",  name: "Vikram Singh",    bloodType: "O-",  city: "Delhi",     phone: "+91 90000 00006", lastDonation: "2024-11-20", donationCount: 9, available: true,  reminderEnabled: true, age: 41 },
    { id: "d7",  userId: "u_d7",  name: "Ananya Iyer",     bloodType: "A-",  city: "Bengaluru", phone: "+91 90000 00007", lastDonation: "2025-05-05", donationCount: 5, available: true,  reminderEnabled: true, age: 27 },
    { id: "d8",  userId: "u_d8",  name: "Rohan Kapoor",    bloodType: "A-",  city: "Mumbai",    phone: "+91 90000 00008", lastDonation: null,         donationCount: 0, available: true,  reminderEnabled: true, age: 22 },
    { id: "d9",  userId: "u_d9",  name: "Neha Gupta",      bloodType: "B-",  city: "Delhi",     phone: "+91 90000 00009", lastDonation: "2025-02-14", donationCount: 4, available: true,  reminderEnabled: true, age: 30 },
    { id: "d10", userId: "u_d10", name: "Arjun Mehta",     bloodType: "B-",  city: "Bengaluru", phone: "+91 90000 00010", lastDonation: "2024-10-01", donationCount: 7, available: false, reminderEnabled: true, age: 38 },
    { id: "d11", userId: "u_d11", name: "Fatima Khan",     bloodType: "AB+", city: "Mumbai",    phone: "+91 90000 00011", lastDonation: "2025-04-22", donationCount: 3, available: true,  reminderEnabled: true, age: 26 },
    { id: "d12", userId: "u_d12", name: "Sanjay Rao",      bloodType: "AB+", city: "Bengaluru", phone: "+91 90000 00012", lastDonation: "2025-07-10", donationCount: 8, available: true,  reminderEnabled: true, age: 45 },
    { id: "d13", userId: "u_d13", name: "Ishita Bose",     bloodType: "O+",  city: "Delhi",     phone: "+91 90000 00013", lastDonation: "2025-06-18", donationCount: 2, available: true,  reminderEnabled: true, age: 25 },
    { id: "d14", userId: "u_d14", name: "Karan Malhotra",  bloodType: "AB-", city: "Delhi",     phone: "+91 90000 00014", lastDonation: null,         donationCount: 1, available: true,  reminderEnabled: true, age: 33 },
    { id: "d15", userId: "u_d15", name: "Meera Pillai",    bloodType: "A+",  city: "Bengaluru", phone: "+91 90000 00015", lastDonation: "2024-09-05", donationCount: 11, available: true, reminderEnabled: true, age: 37 },
    { id: "d16", userId: "u_d16", name: "Devansh Joshi",   bloodType: "B+",  city: "Mumbai",    phone: "+91 90000 00016", lastDonation: "2025-05-30", donationCount: 5, available: true,  reminderEnabled: true, age: 29 },
  ];

  const now = Date.now();
  const requests: BloodRequest[] = [
    {
      id: "r_seed1", hospitalId: "h1", bloodType: "O-", units: 2, urgency: "critical", status: "open",
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
      note: "Trauma patient in ER — road accident",
      patientInfo: "Male, 34, poly-trauma", contactName: "Dr. Kapoor", contactPhone: "+91 98200 11122",
      deadlineMins: 60, responses: [],
    },
    {
      id: "r_seed2", hospitalId: "h3", bloodType: "AB-", units: 1, urgency: "high", status: "open",
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      note: "Pre-op cardiac surgery tomorrow morning",
      patientInfo: "Female, 58, CABG", contactName: "Nurse Rita", contactPhone: "+91 98111 22233",
      deadlineMins: 240, responses: [],
    },
    {
      id: "r_seed3", hospitalId: "h4", bloodType: "B+", units: 3, urgency: "high", status: "open",
      createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
      note: "Postpartum hemorrhage — labour ward",
      patientInfo: "Female, 29", contactName: "Dr. Iyer", contactPhone: "+91 98450 55566",
      deadlineMins: 90, responses: [],
    },
    {
      id: "r_seed4", hospitalId: "h2", bloodType: "A+", units: 2, urgency: "normal", status: "open",
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      note: "Scheduled surgery — Thursday",
      responses: [],
    },
  ];

  return {
    users, hospitals, donors, requests, donations: [],
    notifications: [
      { id: uid(), userId: "u_d1", message: "URGENT: City General needs 2u O- (5 km away)", read: false, at: new Date(now - 1000 * 60 * 40).toISOString() },
      { id: uid(), userId: "u_d6", message: "URGENT: City General needs 2u O- (Delhi)", read: false, at: new Date(now - 1000 * 60 * 40).toISOString() },
      { id: uid(), userId: "u_d5", message: "AIIMS Delhi requesting 1u AB-", read: false, at: new Date(now - 1000 * 60 * 100).toISOString() },
    ],
    currentUserId: null,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      lang: "en",
      theme: "light",
      teamOpen: false,
      users: [],
      donors: [],
      hospitals: [],
      requests: [],
      donations: [],
      notifications: [],

      setLang: (l) => set({ lang: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setTeamOpen: (o) => set({ teamOpen: o }),
      switchTo: (userId) => set({ currentUserId: userId }),

      ensureSeed: () => {
        if (get().users.length === 0) set(seed());
      },

      updateDonor: (donorId, patch) =>
        set({ donors: get().donors.map((d) => (d.id === donorId ? { ...d, ...patch } : d)) }),

      updateHospital: (hospitalId, patch) =>
        set({
          hospitals: get().hospitals.map((h) => (h.id === hospitalId ? { ...h, ...patch } : h)),
        }),

      registerDonor: (input) => {
        const userId = "u_" + uid();
        const donorId = "d_" + uid();
        const user: User = { id: userId, role: "donor", name: input.name };
        const donor: Donor = {
          id: donorId,
          userId,
          name: input.name,
          bloodType: input.bloodType,
          city: input.city,
          phone: input.phone,
          lastDonation: null,
          donationCount: 0,
          reminderEnabled: true,
          available: true,
          age: input.age,
        };
        set({
          users: [...get().users, user],
          donors: [...get().donors, donor],
          currentUserId: userId,
        });
        return { user, donor };
      },

      createRequest: (input) => {
        const req: BloodRequest = {
          id: "r_" + uid(),
          hospitalId: input.hospitalId,
          bloodType: input.bloodType,
          units: input.units,
          urgency: input.urgency,
          note: input.note,
          patientInfo: input.patientInfo,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          deadlineMins: input.deadlineMins,
          locationOverride: input.locationOverride,
          status: "open",
          createdAt: new Date().toISOString(),
          responses: [],
        };
        set({ requests: [req, ...get().requests] });
        // Notify compatible donors in same city
        const hospital = get().hospitals.find((h) => h.id === input.hospitalId);
        if (hospital) {
          const matches = get().donors.filter(
            (d) => isCompatible(d.bloodType, input.bloodType) && d.city === hospital.city,
          );
          const notes: Notification[] = matches.map((d) => ({
            id: uid(),
            userId: d.userId,
            message: `${input.urgency.toUpperCase()}: ${hospital.name} needs ${input.units}u ${input.bloodType}`,
            read: false,
            at: new Date().toISOString(),
          }));
          set({ notifications: [...notes, ...get().notifications] });
        }
        return req;
      },

      respondToRequest: (requestId, donorId, status) => {
        set({
          requests: get().requests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  responses: [
                    ...r.responses.filter((x) => x.donorId !== donorId),
                    { donorId, status, at: new Date().toISOString() },
                  ],
                }
              : r,
          ),
        });
        const req = get().requests.find((r) => r.id === requestId);
        const hosp = req && get().hospitals.find((h) => h.id === req.hospitalId);
        const donor = get().donors.find((d) => d.id === donorId);
        if (hosp && donor && status === "accepted") {
          get().notify(hosp.userId, `${donor.name} accepted your ${req.bloodType} request`);
        }
      },

      completeDonation: (requestId, donorId) => {
        const req = get().requests.find((r) => r.id === requestId);
        const donor = get().donors.find((d) => d.id === donorId);
        const hosp = req && get().hospitals.find((h) => h.id === req.hospitalId);
        if (!req || !donor || !hosp) return null;
        const donation: Donation = {
          id: "don_" + uid(),
          donorId,
          hospitalId: hosp.id,
          requestId,
          bloodType: donor.bloodType,
          units: 1,
          date: new Date().toISOString(),
          certificateId: "CERT-" + uid().toUpperCase(),
        };
        const newInv = { ...hosp.inventory };
        newInv[req.bloodType] = (newInv[req.bloodType] || 0) + 1;
        const remaining = req.units - 1;
        set({
          donations: [donation, ...get().donations],
          hospitals: get().hospitals.map((h) => (h.id === hosp.id ? { ...h, inventory: newInv } : h)),
          donors: get().donors.map((d) =>
            d.id === donorId
              ? { ...d, donationCount: d.donationCount + 1, lastDonation: donation.date }
              : d,
          ),
          requests: get().requests.map((r) =>
            r.id === requestId
              ? { ...r, units: Math.max(remaining, 0), status: remaining <= 0 ? "fulfilled" : "open" }
              : r,
          ),
        });
        get().notify(donor.userId, `Thank you! Certificate ${donation.certificateId} issued.`);
        return donation;
      },

      notify: (userId, message) =>
        set({
          notifications: [
            { id: uid(), userId, message, read: false, at: new Date().toISOString() },
            ...get().notifications,
          ],
        }),

      markAllRead: (userId) =>
        set({
          notifications: get().notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n,
          ),
        }),
    }),
    { name: "bloodbridge-store-v2" },
  ),
);

export function useCurrentUser() {
  const { currentUserId, users } = useStore();
  return users.find((u) => u.id === currentUserId) ?? null;
}
