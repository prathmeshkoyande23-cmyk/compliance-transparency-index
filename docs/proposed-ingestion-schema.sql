-- PROPOSAL, NOT IMPLEMENTED.
-- A sketch of a middle database that could receive compliance metrics from
-- many banks and many vendor tools in one format, and feed the dashboard.
-- PostgreSQL syntax. See docs/ROADMAP.md.

-- Who is reporting.
CREATE TABLE bank (
  bank_id         SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  cohort          TEXT NOT NULL,              -- e.g. 'PSU — Large'
  regulator_code  TEXT UNIQUE                 -- the regulator's own identifier
);

-- Which tool the data came from.
CREATE TABLE source_system (
  source_id   SERIAL PRIMARY KEY,
  bank_id     INT NOT NULL REFERENCES bank(bank_id),
  vendor      TEXT NOT NULL,
  tool_type   TEXT NOT NULL,                  -- e.g. 'KYC', 'transaction monitoring', 'regulatory reporting'
  version     TEXT
);

-- The data dictionary. The most important table: it says exactly how each
-- metric is counted, so banks are comparable. Versioned, never edited in place.
CREATE TABLE metric_definition (
  metric_id    SERIAL PRIMARY KEY,
  dimension    TEXT NOT NULL,                 -- enforcement | health | grievance | disclosure | kyc | trend
  name         TEXT NOT NULL,
  unit         TEXT NOT NULL,                 -- count | percent | days | rupees
  definition   TEXT NOT NULL,                 -- the precise counting rule
  frequency    TEXT NOT NULL,                 -- monthly | quarterly | annual
  version      INT  NOT NULL DEFAULT 1,
  UNIQUE (name, version)
);

-- One delivery from one bank and tool for one period. The audit trail.
CREATE TABLE submission (
  submission_id  SERIAL PRIMARY KEY,
  bank_id        INT  NOT NULL REFERENCES bank(bank_id),
  source_id      INT  REFERENCES source_system(source_id),
  period_start   DATE NOT NULL,
  period_end     DATE NOT NULL,
  received_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         TEXT NOT NULL DEFAULT 'received',   -- received | validated | rejected | superseded
  checksum       TEXT NOT NULL
);

-- The numbers themselves: aggregated metrics, never customer-level records.
CREATE TABLE metric_value (
  submission_id  INT NOT NULL REFERENCES submission(submission_id),
  metric_id      INT NOT NULL REFERENCES metric_definition(metric_id),
  period_end     DATE NOT NULL,
  value          NUMERIC,                     -- NULL means not reported, never zero
  numerator      NUMERIC,
  denominator    NUMERIC,
  segment        TEXT NOT NULL DEFAULT 'all',
  PRIMARY KEY (submission_id, metric_id, segment)
);

-- Data quality checks, including reconciliation against public filings.
CREATE TABLE validation_result (
  submission_id  INT NOT NULL REFERENCES submission(submission_id),
  rule           TEXT NOT NULL,
  passed         BOOLEAN NOT NULL,
  note           TEXT
);

-- Public enforcement events, as in src/data/banks.js.
CREATE TABLE penalty_event (
  penalty_id   SERIAL PRIMARY KEY,
  bank_id      INT  NOT NULL REFERENCES bank(bank_id),
  event_date   DATE NOT NULL,                 -- announcement or disclosure date
  regulator    TEXT NOT NULL,
  amount_inr   BIGINT NOT NULL CHECK (amount_inr > 0),
  reason       TEXT NOT NULL,
  source_url   TEXT                           -- NULL = pending verification
);

-- What the dashboard shows, tied to the method that produced it.
CREATE TABLE score_snapshot (
  bank_id         INT  NOT NULL REFERENCES bank(bank_id),
  as_of           DATE NOT NULL,
  dimension       TEXT NOT NULL,
  score           NUMERIC,
  coverage        NUMERIC NOT NULL,           -- 0 to 1
  method_version  TEXT NOT NULL,
  PRIMARY KEY (bank_id, as_of, dimension, method_version)
);
