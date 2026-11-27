import { test } from "node:test";
import assert from "node:assert/strict";
import { BANKS as REAL } from "../src/data/banks.js";
import { BANKS as SAMPLE } from "../src/data/banks.sample.js";

const REGULATORS = new Set(["RBI", "FIU-IND", "IRDAI", "SEBI"]);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (s) => ISO.test(s) && !Number.isNaN(new Date(s).getTime());
const numOrNull = (v) => v === null || (typeof v === "number" && Number.isFinite(v));
const goodSource = (s) => s === null || (typeof s.label === "string" && s.label.length > 0 && s.url.startsWith("https://"));

for (const [name, banks] of [["compiled dataset", REAL], ["sample dataset", SAMPLE]]) {
  test(`${name}: every bank is well-formed`, () => {
    assert.ok(banks.length > 0);
    assert.equal(new Set(banks.map((b) => b.id)).size, banks.length, "ids must be unique");
    for (const b of banks) {
      for (const k of ["id", "name", "cohort"]) assert.equal(typeof b[k], "string", `${b.id}.${k}`);
      assert.ok(Array.isArray(b.penalties), `${b.id}.penalties`);
      assert.ok(numOrNull(b.netNPA) && numOrNull(b.grossNPA) && numOrNull(b.pcr), `${b.id} NPA fields`);
      if (b.netNPA != null && b.grossNPA != null) assert.ok(b.netNPA <= b.grossNPA, `${b.id}: net NPA cannot exceed gross NPA`);
      assert.ok(goodSource(b.npaSource ?? null), `${b.id}.npaSource`);
      for (const key of ["npaPrior", "npaQ2"]) {
        const p = b[key];
        if (!p) continue;
        assert.ok(isDate(p.asOf), `${b.id}.${key}.asOf`);
        assert.equal(typeof p.label, "string", `${b.id}.${key}.label`);
        assert.ok(numOrNull(p.netNPA) && numOrNull(p.grossNPA) && numOrNull(p.pcr), `${b.id}.${key} figures`);
        if (p.netNPA != null && p.grossNPA != null) assert.ok(p.netNPA <= p.grossNPA, `${b.id}.${key}: net NPA cannot exceed gross`);
        assert.ok(goodSource(p.source ?? null), `${b.id}.${key}.source`);
      }
    }
  });

  test(`${name}: every penalty has a date, amount, regulator, reason and a source (or an explicit null)`, () => {
    for (const b of banks) {
      b.penalties.forEach((p, i) => {
        const where = `${b.id} penalty #${i}`;
        assert.ok(isDate(p.date), `${where}: date`);
        assert.ok(Number.isInteger(p.amount) && p.amount > 0, `${where}: amount in rupees`);
        assert.ok(REGULATORS.has(p.regulator), `${where}: regulator ${p.regulator}`);
        assert.ok(p.label && p.reason, `${where}: label and reason`);
        assert.ok("source" in p && goodSource(p.source), `${where}: source must be {label, url: https://...} or null`);
      });
    }
  });

  test(`${name}: penalties are in date order`, () => {
    for (const b of banks) {
      const dates = b.penalties.map((p) => p.date);
      assert.deepEqual([...dates].sort(), dates, `${b.id}`);
    }
  });
}
