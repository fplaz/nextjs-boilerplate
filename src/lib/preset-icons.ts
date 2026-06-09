export type PresetIconCategory =
  | "social"
  | "communication"
  | "business"
  | "payment"
  | "apps";

export type PresetIcon = {
  key: string;
  label: string;
  category: PresetIconCategory;
  src: string;
};

export const PRESET_ICON_CATEGORIES: {
  key: PresetIconCategory;
  label: string;
}[] = [
  { key: "social", label: "Social" },
  { key: "communication", label: "Communication" },
  { key: "business", label: "Business" },
  { key: "payment", label: "Payment" },
  { key: "apps", label: "App Stores" },
];

export const PRESET_ICONS: PresetIcon[] = [
  // Social
  { key: "whatsapp", label: "WhatsApp", category: "social", src: "/icons/preset/whatsapp.svg" },
  { key: "instagram", label: "Instagram", category: "social", src: "/icons/preset/instagram.svg" },
  { key: "facebook", label: "Facebook", category: "social", src: "/icons/preset/facebook.svg" },
  { key: "tiktok", label: "TikTok", category: "social", src: "/icons/preset/tiktok.svg" },
  { key: "x", label: "X", category: "social", src: "/icons/preset/x.svg" },
  { key: "youtube", label: "YouTube", category: "social", src: "/icons/preset/youtube.svg" },
  { key: "linkedin", label: "LinkedIn", category: "social", src: "/icons/preset/linkedin.svg" },
  { key: "snapchat", label: "Snapchat", category: "social", src: "/icons/preset/snapchat.svg" },
  { key: "pinterest", label: "Pinterest", category: "social", src: "/icons/preset/pinterest.svg" },
  { key: "telegram", label: "Telegram", category: "social", src: "/icons/preset/telegram.svg" },

  // Communication
  { key: "email", label: "Email", category: "communication", src: "/icons/preset/email.svg" },
  { key: "phone", label: "Phone", category: "communication", src: "/icons/preset/phone.svg" },
  { key: "sms", label: "SMS", category: "communication", src: "/icons/preset/sms.svg" },

  // Business
  { key: "globe", label: "Website", category: "business", src: "/icons/preset/globe.svg" },
  { key: "location", label: "Location", category: "business", src: "/icons/preset/location.svg" },
  { key: "wifi", label: "Wi-Fi", category: "business", src: "/icons/preset/wifi.svg" },
  { key: "calendar", label: "Calendar", category: "business", src: "/icons/preset/calendar.svg" },
  { key: "restaurant", label: "Restaurant", category: "business", src: "/icons/preset/restaurant.svg" },

  // Payment
  { key: "paypal", label: "PayPal", category: "payment", src: "/icons/preset/paypal.svg" },
  { key: "venmo", label: "Venmo", category: "payment", src: "/icons/preset/venmo.svg" },

  // App Stores
  { key: "appstore", label: "App Store", category: "apps", src: "/icons/preset/appstore.svg" },
  { key: "googleplay", label: "Google Play", category: "apps", src: "/icons/preset/googleplay.svg" },
];

export function getPresetIcon(key: string): PresetIcon | undefined {
  return PRESET_ICONS.find((i) => i.key === key);
}

export function isPresetIcon(qrIcon: string | null): boolean {
  return qrIcon?.startsWith("preset:") ?? false;
}

export function getPresetIconKey(qrIcon: string): string {
  return qrIcon.replace("preset:", "");
}

export function getPresetIconSrc(qrIcon: string): string | null {
  const key = getPresetIconKey(qrIcon);
  return getPresetIcon(key)?.src ?? null;
}
