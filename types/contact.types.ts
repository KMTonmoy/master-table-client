export type ContactSubject =
  | "general"
  | "reservation"
  | "feedback"
  | "careers"
  | "press"
  | "other";

export type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
};

export const SUBJECTS: { label: string; value: ContactSubject }[] = [
  { label: "General enquiry", value: "general" },
  { label: "Reservation help", value: "reservation" },
  { label: "Feedback", value: "feedback" },
  { label: "Careers", value: "careers" },
  { label: "Press", value: "press" },
  { label: "Other", value: "other" },
];

export const INITIAL_CONTACT: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "general",
  message: "",
};

export const CONTACT_INFO = {
  address: {
    line1: "128 Saffron Lane",
    line2: "Old Market District",
    city: "New Delhi 110001",
  },
  phone: "+1 (555) 021-9000",
  email: "hello@mastertable.com",
  hours: [
    { day: "Monday – Thursday", time: "11:00 AM – 10:00 PM" },
    { day: "Friday – Saturday", time: "11:00 AM – 12:00 AM" },
    { day: "Sunday", time: "11:00 AM – 9:00 PM" },
  ],
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=77.20%2C28.60%2C77.24%2C28.64&layer=mapnik",
};