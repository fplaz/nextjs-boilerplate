import Link from "next/link";
import { MarketingNavBar } from "../marketing-nav-bar";
import { FooterSection } from "../footer-section";

export const metadata = {
  title: "Terms & Conditions | LaunchKit",
  description:
    "Terms of Service, Privacy Policy, and Refund Policy for LaunchKit.",
};

const sections = [
  { id: "terms-of-service", label: "Terms of Service" },
  { id: "reseller-disclaimer", label: "Reseller Disclaimer" },
  { id: "refund-policy", label: "Refund Policy" },
  { id: "privacy-policy", label: "Privacy Policy" },
  { id: "data-protection", label: "Data Protection" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsPage() {
  return (
    <>
      <MarketingNavBar />

      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: February 18, 2026
        </p>

        {/* Table of contents */}
        <nav className="mt-8 rounded-lg border p-4">
          <p className="mb-2 text-sm font-semibold">Contents</p>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 1. Terms of Service ── */}
        <section id="terms-of-service" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">1. Terms of Service</h2>

          <h3 className="text-lg font-medium">Acceptance of Terms</h3>
          <p className="text-muted-foreground">
            By accessing or using LaunchKit (the &ldquo;Service&rdquo;), operated
            by Propti SpA (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;), you agree to be bound by these Terms &amp;
            Conditions. If you do not agree, do not use the Service.
          </p>

          <h3 className="text-lg font-medium">Eligibility</h3>
          <p className="text-muted-foreground">
            You must be at least 18 years old and capable of entering into a
            legally binding agreement to use the Service.
          </p>

          <h3 className="text-lg font-medium">Account Responsibilities</h3>
          <p className="text-muted-foreground">
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your
            account. Notify us immediately at{" "}
            <a
              href="mailto:support@example.com"
              className="underline hover:text-foreground"
            >
              support@example.com
            </a>{" "}
            if you suspect unauthorized access.
          </p>

          <h3 className="text-lg font-medium">License</h3>
          <p className="text-muted-foreground">
            We grant you a limited, non-exclusive, non-transferable, revocable
            license to use the Service for your personal or internal business
            purposes, subject to these Terms.
          </p>

          <h3 className="text-lg font-medium">Prohibited Conduct</h3>
          <p className="text-muted-foreground">You agree not to:</p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Use the Service for any unlawful purpose.</li>
            <li>
              Interfere with or disrupt the integrity or performance of the
              Service.
            </li>
            <li>
              Attempt to gain unauthorized access to the Service or its related
              systems.
            </li>
            <li>
              Create customer resources that link to malicious, fraudulent, or harmful
              content.
            </li>
          </ul>

          <h3 className="text-lg font-medium">Termination</h3>
          <p className="text-muted-foreground">
            We may suspend or terminate your account at any time if you violate
            these Terms. Upon termination, your right to use the Service ceases
            immediately.
          </p>
        </section>

        {/* ── 2. Reseller Disclaimer ── */}
        <section id="reseller-disclaimer" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">2. Reseller Disclaimer</h2>
          <p className="text-muted-foreground">
            Our order process is conducted by our online reseller Paddle.com.
            Paddle.com is the Merchant of Record for all our orders. Paddle
            provides all customer service inquiries and handles returns.
          </p>
          <p className="text-muted-foreground">
            By purchasing a subscription to LaunchKit, you also agree to
            Paddle&apos;s{" "}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Checkout Buyer Terms
            </a>
            .
          </p>
        </section>

        {/* ── 3. Refund Policy ── */}
        <section id="refund-policy" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">3. Refund Policy</h2>

          <h3 className="text-lg font-medium">30-Day Money-Back Guarantee</h3>
          <p className="text-muted-foreground">
            If you are not satisfied with LaunchKit, you may request a full
            refund within 30 days of your initial purchase&mdash;no questions
            asked.
          </p>

          <h3 className="text-lg font-medium">EU Right of Withdrawal</h3>
          <p className="text-muted-foreground">
            If you are a consumer in the European Union, you have the right to
            withdraw from your purchase within 14 days without giving any
            reason, in accordance with the EU Consumer Rights Directive.
          </p>

          <h3 className="text-lg font-medium">How Refunds Are Processed</h3>
          <p className="text-muted-foreground">
            All refunds are processed by Paddle as the Merchant of Record.
            Refunds are returned to the original payment method and typically
            appear within 5&ndash;10 business days.
          </p>

          <h3 className="text-lg font-medium">How to Request a Refund</h3>
          <p className="text-muted-foreground">
            To request a refund, contact us at{" "}
            <a
              href="mailto:support@example.com"
              className="underline hover:text-foreground"
            >
              support@example.com
            </a>{" "}
            with your order details. You may also contact Paddle directly. For
            full refund conditions, please refer to Paddle&apos;s{" "}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Checkout Buyer Terms
            </a>
            .
          </p>
        </section>

        {/* ── 4. Privacy Policy ── */}
        <section id="privacy-policy" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">4. Privacy Policy</h2>

          <h3 className="text-lg font-medium">Data We Collect</h3>
          <p className="text-muted-foreground">
            We collect the following types of data:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <strong>Account data</strong> &mdash; email address and password
              hash when you create an account.
            </li>
            <li>
              <strong>Usage data</strong> &mdash; customer resources you create, scan
              counts, and general usage analytics.
            </li>
          </ul>

          <h3 className="text-lg font-medium">Payment Data &amp; Paddle</h3>
          <p className="text-muted-foreground">
            We do not collect or store payment information (credit card numbers,
            billing addresses, etc.). All payment data is collected and
            processed by{" "}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Paddle
            </a>{" "}
            as an independent data controller. Please review Paddle&apos;s{" "}
            <a
              href="https://www.paddle.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </a>{" "}
            for details on how your payment data is handled.
          </p>

          <h3 className="text-lg font-medium">Legal Bases for Processing</h3>
          <p className="text-muted-foreground">
            We process your personal data under the following legal bases:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <strong>Performance of a contract</strong> &mdash; to provide the
              Service and fulfill your subscription.
            </li>
            <li>
              <strong>Legitimate interest</strong> &mdash; to improve the
              Service, prevent fraud, and ensure security.
            </li>
          </ul>

          <h3 className="text-lg font-medium">Data Sharing</h3>
          <p className="text-muted-foreground">
            We share data with Paddle to process payments and manage
            subscriptions. We do not sell your personal data to third parties.
          </p>

          <h3 className="text-lg font-medium">Cookies</h3>
          <p className="text-muted-foreground">
            We use essential cookies to maintain your session and authentication
            state. We do not use advertising or third-party tracking cookies.
          </p>

          <h3 className="text-lg font-medium">Data Retention</h3>
          <p className="text-muted-foreground">
            We retain your account data for as long as your account is active.
            If you delete your account, your personal data is removed within 30
            days, except where retention is required by law.
          </p>

          <h3 className="text-lg font-medium">Your Rights (GDPR)</h3>
          <p className="text-muted-foreground">
            If you are in the European Economic Area, you have the following
            rights regarding your personal data:
          </p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>
              <strong>Access</strong> &mdash; request a copy of your data.
            </li>
            <li>
              <strong>Rectification</strong> &mdash; correct inaccurate data.
            </li>
            <li>
              <strong>Erasure</strong> &mdash; request deletion of your data.
            </li>
            <li>
              <strong>Portability</strong> &mdash; receive your data in a
              structured, machine-readable format.
            </li>
            <li>
              <strong>Objection</strong> &mdash; object to processing based on
              legitimate interest.
            </li>
          </ul>
          <p className="text-muted-foreground">
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:support@example.com"
              className="underline hover:text-foreground"
            >
              support@example.com
            </a>
            .
          </p>
        </section>

        {/* ── 5. Data Protection ── */}
        <section id="data-protection" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Protection</h2>

          <h3 className="text-lg font-medium">GDPR Compliance</h3>
          <p className="text-muted-foreground">
            We are committed to complying with the General Data Protection
            Regulation (GDPR) and other applicable data protection laws.
          </p>

          <h3 className="text-lg font-medium">
            Paddle&apos;s Data Processing
          </h3>
          <p className="text-muted-foreground">
            Paddle processes payment data as an independent data controller
            under its own{" "}
            <a
              href="https://www.paddle.com/legal/dpa"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Data Processing Addendum
            </a>
            .
          </p>

          <h3 className="text-lg font-medium">International Data Transfers</h3>
          <p className="text-muted-foreground">
            Where data is transferred outside the EEA, we rely on Standard
            Contractual Clauses (SCCs) or other approved transfer mechanisms to
            ensure adequate protection.
          </p>

          <h3 className="text-lg font-medium">Security Measures</h3>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational measures to
            protect your data, including encryption in transit (TLS), secure
            password hashing, and access controls.
          </p>
        </section>

        {/* ── 6. Contact Us ── */}
        <section id="contact" className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold">6. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms, your privacy, or anything
            else, reach out to us:
          </p>
          <p className="text-muted-foreground">
            <strong>Propti SpA</strong>
            <br />
            Email:{" "}
            <a
              href="mailto:support@example.com"
              className="underline hover:text-foreground"
            >
              support@example.com
            </a>
          </p>
        </section>
      </main>

      <FooterSection />
    </>
  );
}
