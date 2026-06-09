import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MarketingNavBar } from "./marketing-nav-bar";
import { GetStartedHero } from "./get-started/get-started-hero";
import { FeaturesSection } from "./features-section";
import { DesignShowcaseSection } from "./design-showcase-section";
import { SocialProofSection } from "./social-proof-section";
import { PricingSection } from "./pricing-section";
import { QrTypesSection } from "./qr-types-section";
import { FaqSection } from "./faq-section";
import { FooterSection } from "./footer-section";
import { WhyQrCodesSection } from "./why-qr-codes-section";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "LaunchKit – Next.js + Supabase SaaS Starter",
  description:
    "LaunchKit is a production-ready SaaS starter with auth, billing, admin tools, email flows, and a polished app shell.",
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "LaunchKit – Next.js + Supabase SaaS Starter",
    description:
      "Ship faster with a reusable SaaS starter built on Next.js, Supabase, Paddle, and modern UI primitives.",
    url: siteUrl,
    siteName: "LaunchKit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LaunchKit – Next.js + Supabase SaaS Starter",
    description:
      "A pragmatic starter kit for shipping SaaS products with auth, billing, admin, and onboarding built in.",
  },
};

export default async function MarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <MarketingNavBar />
      <GetStartedHero isAuthenticated={!!user} />
      <FeaturesSection />
      <DesignShowcaseSection />
      <QrTypesSection />
      <SocialProofSection />
      <PricingSection />
      <WhyQrCodesSection />
      <FaqSection />
      <FooterSection />
    </>
  );
}
