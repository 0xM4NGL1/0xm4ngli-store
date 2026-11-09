/**
 * Official seller identity.
 *
 * These details are public business information required on the legal pages
 * and contact page. They are used as fallbacks when the corresponding
 * environment variables are not set in a deployment.
 *
 * A registered business address is still required for a complete imprint and
 * EU consumer information. Add it here or via LEGAL_ADDRESS in the deployment.
 */
export const OFFICIAL_SELLER = {
  name: "Tzouliano Mangli",
  vatId: "174119176",
  email: "0xm4ngli@gmail.com",
  privacyEmail: "0xm4ngli@gmail.com",
  jurisdiction: "Greece",
  address: "Kavala, 65400, Greece",
} as const;
