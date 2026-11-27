# Methodology

Every number below is implemented in [`src/lib/scoring.js`](../src/lib/scoring.js) and configured in [`src/lib/config.js`](../src/lib/config.js). Change a value there and the whole app follows. [`tests/scoring.test.js`](../tests/scoring.test.js) pins the behaviour described here.

## Principles

1. **Gaps are shown as gaps.** A missing value is `null`. It is never zero-filled or estimated, and it lowers the confidence figure instead.
2. **Every figure has a source.** A penalty or NPA figure with no verified link is displayed as "source link pending verification".
3. **Absence is not proof.** "No penalty found" means none was found in the sources checked.
4. **Outcomes, not opinions.** The index only uses recorded events and reported ratios.

## Dimensions and weights

| Dimension | Weight | Status |
|---|---|---|
| Enforcement History | 25 | Scored |
| Prudential Health | 20 | Scored |
| Customer Grievance Signals | 20 | Designed; one bank's disclosure shown, not scored |
| Disclosure Completeness | 15 | Not integrated |
| KYC/AML public indicators | 10 | Not integrated |
| Trend | 10 | Scored, at half weight |

## Overall score and confidence

For each dimension that has data, the effective weight is `weight × coverage` (coverage is 1 unless stated below).

```
overall    = round( Σ value × weight × coverage  /  Σ weight × coverage )
confidence = Σ weight × coverage                       (out of 100)
```

With Enforcement, Health and Trend all available, confidence is 25 + 20 + 5 = 50. The confidence figure is shown as "data coverage" in the app. A dimension that is not available is absent from both sums.

## Enforcement History (25)

Start at 100 and deduct for each penalty.

```
deduction = severity(amount) × max(0, 1 − ageInMonths / 48)
score     = max(0, round(100 − Σ deductions))
```

| Penalty amount | Severity points |
|---|---|
| ₹1 crore and above | 35 |
| ₹50 lakh to under ₹1 crore | 22 |
| ₹10 lakh to under ₹50 lakh | 12 |
| Under ₹10 lakh | 4 |

- Age is measured from the penalty's announcement or disclosure date to the as-of date, in months of 30.44 days.
- A penalty decays linearly and has no effect after 48 months.
- The same tiers apply to every regulator (RBI, FIU-IND, IRDAI).
- Only penalties on the bank itself count. Tax assessments, penalties on subsidiaries or insurers, and stock-exchange fines are excluded.

## Prudential Health (20)

```
score = clamp( round( 100 − netNPA / 3.5 × 100 ), 0, 100 )
```

A net NPA of 0% scores 100, 0.35% scores 90, 1.0% scores 71, and 3.5% or more scores 0. The latest reported quarter on or before the as-of date is used.

## Trend (10, counts at half weight)

Centred on 50: 50 means no change, above 50 improving, below 50 deteriorating. It blends two components.

**NPA movement (60%)**, between the two most recent reporting periods on or before the as-of date:

```
netScore   = clamp( 50 − Δnet   / 0.20 × 50 )      (±0.20 pts spans 0–100)
grossScore = clamp( 50 − Δgross / 0.50 × 50 )      (±0.50 pts spans 0–100)
npaScore   = average of the scores that can be computed
```

**Penalty activity (40%)**, comparing undecayed severity points:

```
recent = points of penalties in the last 12 months
prior  = points of penalties in the 12 months before that
score  = clamp( 50 + (prior − recent) / 35 × 50 )
```

This needs at least 23.5 months of penalty coverage (the list starts in April 2024).

If a component cannot be computed it is dropped and the other is renormalised. Trend's coverage is `0.5 × (share of components available)`, so it moves the overall score and the confidence figure by at most half of its nominal weight. The cap exists because NPA history is one quarter, not the four the design calls for, and the penalty list is not exhaustive.

## "Data as of" filter

Each option is an as-of date applied to every dimension at once.

- **Enforcement:** penalties dated after the date are excluded and decay is measured from it. Before 31 March 2025, enforcement is shown as a gap, because the penalty list does not yet cover a full year before that.
- **Prudential Health:** the newest NPA period that ended on or before the date is used. If none did, the figure is a gap. A later figure is never borrowed.
- **Grievance:** the matching financial year's complaint disclosure, if one has been collected.

## Peer cohorts

Banks carry a cohort label (for example "PSU, Large" or "Private, Mid") and the app shows rank within the cohort. **Scores are not normalised by cohort.** Peer-relative scoring is a design intention, not an implemented feature.

## Known limitations

- Severity is capped at the top tier, so a ₹12 crore penalty counts the same as ₹1 crore. A tier for ₹5 crore and above is the obvious extension.
- The Trend penalty window has a cliff: a penalty drops out of the comparison abruptly at 24 months.
- Weights and thresholds are public. This is a deliberate transparency choice and makes the score easier to game than one with partly opaque weights.
- Penalty dates are announcement or disclosure dates and can differ from order dates by days.
- Where sources disagree on an amount, the figure within the same severity tier does not change any score, but the amount shown may differ from another source.
