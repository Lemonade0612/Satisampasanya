// Reports & guides shown on the Help page.
// TODO: replace every [placeholder] with a real document, and "#" with its URL.
export type ReportCategory = "trafficking" | "scams" | "parents";

export interface Report {
  title: string;
  agency: string;
  year: string;
  language: string;
  url: string;
  category: ReportCategory;
  kind: "PDF" | "GUIDE";
}

export const REPORTS: Report[] = [
  { title: "[Report title]", agency: "[Ministry / agency]", year: "[Year]", language: "Lao / English", url: "#", category: "trafficking", kind: "PDF" },
  { title: "[Report title]", agency: "[Ministry / agency]", year: "[Year]", language: "Lao", url: "#", category: "scams", kind: "PDF" },
  { title: "[Guide title]", agency: "[Organisation]", year: "[Year]", language: "English", url: "#", category: "parents", kind: "GUIDE" },
  { title: "[Report title]", agency: "[Ministry / agency]", year: "[Year]", language: "Lao / English", url: "#", category: "trafficking", kind: "PDF" },
];
