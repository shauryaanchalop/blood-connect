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
  users: User[];
  donors: Donor[];
  hospitals: Hospital[];
  requests: BloodRequest[];
  donations: Donation[];
  notifications: Notification[];

  setLang: (l: Lang) => void;
  switchTo: (userId: string) => void;
  ensureSeed: () => void;

  updateDonor: (donorId: string, patch: Partial<Donor>) => void;
  updateHospital: (hospitalId: string, patch: Partial<Hospital>) => void;

  createRequest: (input: {
    hospitalId: string;
    bloodType: BloodType;
    units: number;
    urgency: Urgency;
    note?: string;
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
    { id: "u_admin", role: "admin", name: "System Admin" },
    { id: "u_h1", role: "hospital", name: "City General" },
    { id: "u_h2", role: "hospital", name: "St. Mary's" },
    { id: "u_d1", role: "donor", name: "Aditi Sharma" },
    { id: "u_d2", role: "donor", name: "Rahul Verma" },
    { id: "u_d3", role: "donor", name: "Maria Lopez" },
    { id: "u_d4", role: "donor", name: "James Chen" },
    { id: "u_d5", role: "donor", name: "Priya Nair" },
  ];

  const hospitals: Hospital[] = [
    {
      id: "h1",
      userId: "u_h1",
      name: "City General Hospital",
      city: "Mumbai",
      address: "1 Marine Drive",
      inventory: { ...emptyInventory(), "O-": 2, "O+": 8, "A+": 5, "B+": 4, "AB+": 1 },
    },
    {
      id: "h2",
      userId: "u_h2",
      name: "St. Mary's Medical Center",
      city: "Delhi",
      address: "45 Rajpath",
      inventory: { ...emptyInventory(), "O+": 10, "A-": 3, "B-": 2, "AB+": 4 },
    },
  ];

  const donors: Donor[] = [
    { id: "d1", userId: "u_d1", name: "Aditi Sharma", bloodType: "O-", city: "Mumbai", phone: "+91 90000 00001", lastDonation: "2025-03-10", donationCount: 4 },
    { id: "d2", userId: "u_d2", name: "Rahul Verma", bloodType: "O+", city: "Mumbai", phone: "+91 90000 00002", lastDonation: "2025-06-01", donationCount: 2 },
    { id: "d3", userId: "u_d3", name: "Maria Lopez", bloodType: "A+", city: "Mumbai", phone: "+91 90000 00003", lastDonation: null, donationCount: 0 },
    { id: "d4", userId: "u_d4", name: "James Chen", bloodType: "B+", city: "Delhi", phone: "+91 90000 00004", lastDonation: "2025-01-15", donationCount: 6 },
    { id: "d5", userId: "u_d5", name: "Priya Nair", bloodType: "AB-", city: "Mumbai", phone: "+91 90000 00005", lastDonation: "2024-12-01", donationCount: 3 },
  ];

  const openRequest: BloodRequest = {
    id: "r_seed",
    hospitalId: "h1",
    bloodType: "O-",
    units: 2,
    urgency: "critical",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    note: "Trauma patient in ER",
    responses: [],
  };

  return {
    users,
    hospitals,
    donors,
    requests: [openRequest],
    donations: [],
    notifications: [
      { id: uid(), userId: "u_d1", message: "Urgent O- request nearby", read: false, at: new Date().toISOString() },
    ],
    currentUserId: null,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      lang: "en",
      users: [],
      donors: [],
      hospitals: [],
      requests: [],
      donations: [],
      notifications: [],

      setLang: (l) => set({ lang: l }),
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

      createRequest: (input) => {
        const req: BloodRequest = {
          id: "r_" + uid(),
          hospitalId: input.hospitalId,
          bloodType: input.bloodType,
          units: input.units,
          urgency: input.urgency,
          note: input.note,
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
    { name: "bloodbridge-store-v1" },
  ),
);

export function useCurrentUser() {
  const { currentUserId, users } = useStore();
  return users.find((u) => u.id === currentUserId) ?? null;
}
