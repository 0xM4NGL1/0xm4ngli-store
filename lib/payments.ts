import { OFFICIAL_DONATION } from "@/config/donation";

export type BankDetails = {
  configured: boolean;
  accountName: string;
  iban: string;
  bic: string;
  bankName: string;
  country: string;
};

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

export function isValidIban(value: string) {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)) return false;
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let digits = "";
  for (const character of rearranged) {
    digits += /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character;
  }
  let remainder = 0;
  for (const digit of digits) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function getBankDetails(): BankDetails {
  const accountName =
    clean(process.env.BANK_ACCOUNT_NAME) || OFFICIAL_DONATION.accountName;
  const rawIban = (
    clean(process.env.BANK_IBAN) || OFFICIAL_DONATION.iban
  )
    .replace(/\s+/g, "")
    .toUpperCase();
  const bic = (clean(process.env.BANK_BIC) || OFFICIAL_DONATION.bic).toUpperCase();
  const bankName = clean(process.env.BANK_NAME) || OFFICIAL_DONATION.bankName;
  const country = (
    clean(process.env.BANK_COUNTRY) || OFFICIAL_DONATION.country
  ).toUpperCase();
  const validIban = isValidIban(rawIban);

  return {
    configured: Boolean(accountName && validIban),
    accountName,
    iban: rawIban,
    bic,
    bankName,
    country,
  };
}

export function isBankTransferConfigured() {
  return getBankDetails().configured;
}

export function formatIban(iban: string) {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}
