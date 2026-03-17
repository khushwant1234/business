export const BRAND_NAME = "[BRAND_NAME]";

export const CATEGORIES = [
  "All",
  "Motors",
  "Sensors",
  "Microcontrollers",
  "Wiring",
  "Chassis",
] as const;

export const PRODUCT_CATEGORIES = CATEGORIES.filter(
  (category) => category !== "All"
);

export const DELIVERY_TYPES = ["EXPRESS", "NORMAL"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED"] as const;

export const PAYMENT_DETAILS = {
  accountName: `${BRAND_NAME} Components`,
  bankName: "Industrial Trust Bank",
  accountNumber: "00123456789",
  note: "Use your order ID as the payment reference. Orders remain pending until payment is confirmed manually by the admin.",
};

export function getProductImage(imageUrl?: string | null) {
  return (
    imageUrl ||
    "https://placehold.co/800x800/202020/ffffff?text=Robotic+Part"
  );
}