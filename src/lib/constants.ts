export const QUESTION_CATEGORIES = [
  { value: "general",      label: "General",      emoji: "💬" },
  { value: "pests",        label: "Pests",         emoji: "🐛" },
  { value: "disease",      label: "Disease",       emoji: "🍂" },
  { value: "fertilizer",   label: "Fertilizer",    emoji: "🌿" },
  { value: "propagation",  label: "Propagation",   emoji: "✂️" },
  { value: "watering",     label: "Watering",      emoji: "💧" },
] as const;

export type QuestionCategoryValue = (typeof QUESTION_CATEGORIES)[number]["value"];

export function getQuestionCategoryLabel(value: string): string {
  return QUESTION_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getQuestionCategoryEmoji(value: string): string {
  return QUESTION_CATEGORIES.find((c) => c.value === value)?.emoji ?? "💬";
}

export const CATEGORIES = [
  { value: "indoor_plants", label: "Indoor plants" },
  { value: "outdoor_plants", label: "Outdoor plants" },
  { value: "fruit_trees", label: "Fruit trees" },
  { value: "herbs", label: "Herbs" },
  { value: "vegetables", label: "Vegetables" },
  { value: "seeds", label: "Seeds" },
  { value: "cuttings", label: "Cuttings" },
  { value: "homegrown_produce", label: "Homegrown produce" },
  { value: "gardening_supplies", label: "Gardening supplies" },
] as const;

export const LISTING_TYPES = [
  { value: "sell", label: "For sale" },
  { value: "trade", label: "Trade" },
  { value: "free", label: "Free" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
export type ListingTypeValue = (typeof LISTING_TYPES)[number]["value"];

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getListingTypeLabel(value: string): string {
  return LISTING_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function formatJoinDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatPrice(
  price: number | null,
  listingType: string
): string {
  if (listingType === "free") return "Free";
  if (listingType === "trade") return "Trade";
  if (price == null) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
