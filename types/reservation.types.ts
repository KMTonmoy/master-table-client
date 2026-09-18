export type Occasion =
  | "casual"
  | "birthday"
  | "anniversary"
  | "business"
  | "date"
  | "other";

export type ReservationForm = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion: Occasion;
  notes: string;
};

export const TIME_SLOTS = [
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
] as const;

export const OCCASIONS: { label: string; value: Occasion }[] = [
  { label: "Casual dining", value: "casual" },
  { label: "Birthday", value: "birthday" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Business meal", value: "business" },
  { label: "Date night", value: "date" },
  { label: "Other", value: "other" },
];

export const INITIAL_FORM: ReservationForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "19:00",
  guests: 2,
  occasion: "casual",
  notes: "",
};