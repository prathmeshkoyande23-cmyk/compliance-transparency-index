import { BANKS as REAL } from "./banks.js";
import { BANKS as SAMPLE } from "./banks.sample.js";

// Build-time switch. VITE_DATASET=sample builds the app with the fictional
// sample dataset only (the safe default for a public demo); anything else uses
// the compiled dataset in banks.js. See README.md, "Choosing what to publish".
export const DATASET = import.meta.env.VITE_DATASET === "sample" ? "sample" : "real";
export const BANKS = DATASET === "sample" ? SAMPLE : REAL;
