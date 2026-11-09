# Security policy

## Reporting a vulnerability

Please email the maintainer privately instead of opening a public issue for:

- authentication or session bugs
- payment or order manipulation
- SQL injection, XSS, CSRF or access-control issues
- exposed secrets or personal data

Use the contact email configured for the deployment. Include the affected route, a reproduction, and the impact. Do not include real customer data.

## Secrets

Never commit `.env.local`, `.env.production`, bank details, admin tokens or customer data. The public repository intentionally contains only `.env.example` placeholders.

## Scope

This is an open-source storefront. Each operator is responsible for their own deployment, seller identity, tax setup, bank account, product data and legal compliance.
