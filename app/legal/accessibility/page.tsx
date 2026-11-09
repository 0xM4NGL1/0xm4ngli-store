import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "0xm4ngli's accessibility commitment, measures and feedback route.",
  alternates: { canonical: "/legal/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalShell
      title="Accessibility"
      description="Technology should be usable by more people, not fewer. This page explains what we have done and how to tell us when we fall short."
      updated="9 November 2026"
    >
      <h2 id="commitment">1. Our commitment</h2>
      <p>
        We aim to meet WCAG 2.2 level AA for the storefront. Accessibility is treated
        as an ongoing engineering requirement, not a one-off badge.
      </p>

      <h2 id="measures">2. Measures in place</h2>
      <ul>
        <li>Semantic landmarks, headings and lists.</li>
        <li>Keyboard-operable navigation, menus, filters and forms.</li>
        <li>Visible focus indicators and a skip-to-content link.</li>
        <li>Form labels, descriptions and accessible error messages.</li>
        <li>Text alternatives for meaningful images; decorative graphics are hidden.</li>
        <li>Colour combinations designed for contrast on a dark theme.</li>
        <li>Support for reduced-motion preferences.</li>
        <li>Responsive layout that reflows on small screens.</li>
        <li>Accessible price-history data tables alongside charts.</li>
      </ul>

      <h2 id="limitations">3. Known limitations</h2>
      <ul>
        <li>
          Bank transfer instructions are shown as selectable text and are also sent
          by email. If you need them read aloud, enlarged or in another format,
          contact us and we will help.
        </li>
        <li>
          Product photography and third-party data feeds may arrive without complete
          alternative text or captions. We use the product name as alt text and ask
          feed providers for better metadata.
        </li>
        <li>
          This page is a statement of intent; it is not a formal third-party audit.
        </li>
      </ul>

      <h2 id="feedback">4. Feedback and enforcement</h2>
      <p>
        If a page, component or checkout step is difficult to use with assistive
        technology, email <a href={`mailto:${site.email}`}>{site.email}</a> with the
        page URL, the browser or assistive technology you use, and what happened. We
        will try to provide the information in another format and fix the issue.
      </p>
      <p>
        EU/EEA consumers may also have access to accessibility or equality enforcement
        bodies in their country. We will cooperate with reasonable requests.
      </p>

      <h2 id="review">5. Review</h2>
      <p>
        We review keyboard navigation, focus states, contrast and form errors when
        making material changes. Automated checks are used as a supplement, never a
        substitute, for manual testing.
      </p>
    </LegalShell>
  );
}
