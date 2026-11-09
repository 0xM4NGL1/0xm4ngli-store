/**
 * Official 0xm4ngli donation/payment destination.
 *
 * This file is intentionally public. The project owner asked for the IBAN to
 * appear in the repository so anyone can verify where official contributions
 * go. It is not a secret, but it is sensitive: publishing a bank account makes
 * invoice fraud and impersonation easier. The official deployment and the
 * support page display the same details.
 *
 * Under the repository licence, forks and public deployments must keep the
 * official donation notice and may not replace it in a way that suggests they
 * are the official 0xm4ngli project. A licence cannot technically stop a fork
 * from editing a file; enforcement is legal only.
 *
 * If the account changes, update this file, DONATIONS.md and the deployment
 * environment together. Never publish card numbers, passwords or one-time
 * banking codes here.
 */
export const OFFICIAL_DONATION = {
  accountName: "Tzouliano Mangli",
  iban: "GR8101712010006201168118306",
  bic: "",
  bankName: "",
  country: "GR",
  repository: "https://github.com/0xM4NGL1/0xm4ngli-store",
  site: "0xm4ngli",
} as const;
