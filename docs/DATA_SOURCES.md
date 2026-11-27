# Data sources

## Source hierarchy

When sources disagree, prefer them in this order:

1. **RBI press releases** and other regulators' own orders (FIU-IND, IRDAI).
2. **Exchange filings:** a listed bank must disclose penalties under SEBI LODR Regulation 30 and quarterly results under Regulation 33. These appear on NSE and BSE and on each bank's investor pages.
3. **Bank filings and presentations** (press releases, investor presentations).
4. **Financial press and aggregators.** Used where nothing better was found, and labelled as such in the source link.

Exchange filings are the cleanest source: they are the bank's own statement, they include small penalties that press coverage skips, and they are the legal disclosure route.

## Record format

The full schema, with every field in use, is demonstrated in [`src/data/banks.sample.js`](../src/data/banks.sample.js).

| Field | Meaning |
|---|---|
| `id`, `name`, `cohort` | Identity and peer group, e.g. `"PSU — Large"` or `"Private — Mid"` |
| `netNPA`, `grossNPA`, `pcr`, `npaSource` | Latest reported quarter, in percent. `null` if unknown. |
| `npaPrior` | The previous quarter, same fields plus `asOf` and `label` |
| `npaQ2` | The newest quarter, where the bank has reported |
| `penalties[]` | `date`, `regulator`, `amount` (rupees), `label`, `reason`, `source` |
| `grievance` | Optional complaint disclosure by financial year |

## Conventions

- **Dates** are ISO `YYYY-MM-DD` and are the announcement or disclosure date, not the order date.
- **Amounts** are in rupees; `label` is the human-readable form.
- **Percentages** are numbers (`0.35` means 0.35%).
- **`null` means unknown.** It never means zero. A penalty's `source: null` means "link pending verification".
- **Penalties are only counted** if they were imposed on the bank itself by a financial regulator. Tax assessments, penalties on subsidiaries or insurers, and stock-exchange fines are excluded.

## Coverage

| Area | Coverage |
|---|---|
| RBI penalties, Apr 2024 to Mar 2025 | Verified in full against a third-party compilation of all RBI actions that year (published by FACE) |
| RBI penalties, Apr 2023 to Mar 2024 | Partial. Public-sector orders reconciled to an aggregator's 2023 total (through November 2023); private banks only partly |
| RBI penalties, before Apr 2023 | Not swept. A few older entries exist. |
| Penalties since Apr 2025 | Found via RBI releases and exchange filings; not independently confirmed as complete |
| FIU-IND, IRDAI | Partial; whatever surfaced in exchange filings and press |
| SEBI orders, exchange fines | Not searched |
| NPA | Mar 2026 and Jun 2026 for all 20 banks; Sep 2026 for all 20 banks (as of 27 Nov 2026) |
| Customer grievance | One bank, shown but not scored |

Counts in the compiled dataset: 20 banks, 79 penalty records (75 RBI, 3 FIU-IND, 1 IRDAI), 56 distinct penalty source links.

Complaint counts are not comparable across banks: some banks net out same-day or duplicate complaints, others report raw counts.

## Adding or correcting a penalty

1. Find the source, ideally an RBI release or the bank's exchange filing.
2. Add an entry to the bank's `penalties` array in `src/data/banks.js`, keeping the array in date order:

   ```js
   {
     date: "2026-05-08",          // announcement or disclosure date
     regulator: "RBI",            // RBI | FIU-IND | IRDAI | SEBI
     amount: 3180000,             // rupees
     label: "₹31.8 lakh",
     reason: "What the order was for, in a line",
     source: { label: "Bank — Regulation 30 disclosure (8 May 2026)", url: "https://..." },
   },
   ```

3. Run `npm test`. The dataset tests check dates, amounts, regulators, ordering and links.
4. The golden score snapshot will fail because scores changed. Review the change, then run `UPDATE_GOLDEN=1 npm test`.

## Adding a quarter of NPA

Add `npaQ2` (or shift the current figures into `npaPrior` and update the top-level fields), with `asOf`, `label`, `netNPA`, `grossNPA`, `pcr` and a `source`. Net NPA cannot exceed gross NPA; the tests check this.
