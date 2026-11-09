# Official donation and payment details

These are the official 0xm4ngli details. They are published intentionally so
customers and contributors can verify where money goes.

- **Account name:** Tzouliano Mangli — update `config/donation.ts` if your bank requires a different exact beneficiary name.
- **IBAN:** `GR81 0171 2010 0062 0116 8118 306`
- **BIC / SWIFT:** not listed — add the BIC in `config/donation.ts` and in the deployment environment if you need SWIFT outside SEPA
- **Country:** Greece
- **Currency:** EUR
- **Official source:** <https://github.com/0xM4NGL1/0xm4ngli-store>

## How official payments work

1. A customer places an order or creates a support request in the app.
2. The app shows the exact amount and a unique payment reference.
3. The customer sends the transfer from their bank.
4. The operator matches the transfer reference and marks the order paid.
5. No card details are ever requested or stored.

## Verify before sending

Only use the IBAN shown on this repository, on the official deployment, or on a
private order page created by the official deployment. A fork or copy of the
code can show different details. If a deployment changes the official donation
address and presents itself as 0xm4ngli, treat it as unofficial and verify
against this file before sending money.

## Licence note

This repository is **source-available**, not OSI open source. The licence
allows personal and educational use and requires attribution. Commercial use,
resale, or deployment as a competing store requires written permission. Forks
must keep the official donation notice and must not use the 0xm4ngli name or
logo to imply endorsement.

A licence is a legal rule, not a technical lock. Someone can technically edit a
file; the licence gives the project owner a legal claim if they do. If you want a
truly open-source project where anyone may fork and change everything, the MIT
licence is the correct choice instead of this one.
