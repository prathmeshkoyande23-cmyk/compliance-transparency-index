# Roadmap

## Data completeness

- Pull each remaining bank's September 2026 results as they are published.
- Sweep penalties for December 2023 to March 2024 and for October 2022 to March 2023, so the 48-month decay window is fully covered.
- Search SEBI orders and stock-exchange fines; widen FIU-IND and IRDAI coverage.
- Replace press links with the RBI press release or exchange filing wherever one exists.
- Resolve the two penalties that still have no source link.

## Methodology

- Add a severity tier for penalties of ₹5 crore and above.
- Turn Trend into a true four-quarter measure by adding year-ago NPA.
- Normalise scores within peer cohorts, not just rank within them.
- Add a minor-penalty counter for operational fines (currency chest and similar) instead of scoring them individually.
- Soften the 24-month cliff in the Trend penalty comparison.
- Version the methodology so a published score always states which version produced it.

## New dimensions

- **Customer Grievance (20%):** pull bank-level complaint disclosures for all banks, agree a normalisation for how banks count complaints, then score. The annual-report disclosure already lists complaints received, disposed, pending beyond 30 days, Ombudsman escalations and awards.
- **Disclosure Completeness (15%):** whether and how promptly mandated disclosures are published.
- **KYC/AML indicators (10%):** public indicators specific to KYC and AML.

## From public outcomes to how compliance is run

Public data shows outcomes. It cannot show whether a bank runs compliance as a continuous discipline or as a periodic exercise, because that sits inside the bank. A path to that:

1. **Ingest exchange filings automatically.** SEBI LODR Regulation 30 (penalties and orders) and Regulation 33 (quarterly results) are published as structured announcements on NSE and BSE. An ingestion job over those feeds needs no integration with any bank.
2. **A common data format for banks to submit.** A small, versioned metric dictionary (about 15 to 25 aggregated metrics such as KYC pending counts, STRs filed on time and alert closure rates), delivered monthly by file, then by connector, then by API. Banks already compute these for board MIS. The aim is one format per vendor tool instead of one custom integration per bank per tool. A draft schema is in [`proposed-ingestion-schema.sql`](proposed-ingestion-schema.sql).
3. **Governance before scale.** Someone has to own the metric dictionary and its versions, and self-reported data has to be reconciled against public filings before a regulator can rely on it.

Who bears the cost of integration is the open question. The realistic options are a deliberately tiny first ask (a monthly summary file), vendors absorbing the connector as a product feature, regulatory sponsorship, or funding a pilot with one or two willing banks.

## AI assistance

AI is used to read filings, extract candidate records and draft code. The design rule is that every extracted figure must keep a link to its source and be checked before it enters the dataset. The longer-term idea is AI that reads filings as they land, maps them to controls, flags drift and explains each score, with a person signing off. This repository is built with that rule applied by hand.
