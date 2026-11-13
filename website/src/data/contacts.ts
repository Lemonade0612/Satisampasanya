// Verified emergency numbers (checked Nov 2026 per the design notes).
// Facebook links are placeholders — TODO: replace "#" with the real pages.
export interface EmergencyContact {
  id: "police" | "ambulance" | "fire" | "trafficking";
  number: string;
  tel: string;
  variant: "red" | "plain" | "purple";
}

export const EMERGENCY: EmergencyContact[] = [
  { id: "police", number: "1191", tel: "tel:1191", variant: "red" },
  { id: "ambulance", number: "1195", tel: "tel:1195", variant: "plain" },
  { id: "fire", number: "1190", tel: "tel:1190", variant: "plain" },
  { id: "trafficking", number: "1300", tel: "tel:1300", variant: "purple" },
];

export const WOMENS_UNION = {
  number: "1362",
  tel: "tel:1362",
  whatsapp: "https://wa.me/8562023241362",
  whatsappLabel: "020 2324 1362",
  facebook: "#", // TODO: real Facebook page
};

export const LABOUR = {
  number: "1512",
  tel: "tel:1512",
  facebook: "#", // TODO: real Facebook page
};

export const TOURIST_POLICE = {
  number: "021 251 128",
  tel: "tel:+85621251128",
};
