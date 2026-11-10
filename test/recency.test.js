import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const context = {window:{}};
runInNewContext(readFileSync(new URL("../election-data.js",import.meta.url),"utf8"),context);
const E = context.window.ELECTION_DATA;
const quality = context.window.ELECTION_POLL_QUALITY;

test("shorter half-lives configured across election models", () => {
  assert.equal(E.model.localHalfLifeDays,30);
  assert.equal(E.model.councilHalfLifeDays,90);
  assert.equal(E.model.presidentialHalfLifeDays,180);
});

test("newest polls get highest temporal weight", () => {
  const H=E.model.localHalfLifeDays;
  assert.equal(quality.recencyFactor(0,H),1);
  assert.ok(Math.abs(quality.recencyFactor(30,H)-0.5)<1e-12);
  assert.ok(Math.abs(quality.recencyFactor(90,H)-0.125)<1e-12);
  assert.ok(Math.abs(quality.recencyFactor(120,H)-0.0625)<1e-12);
  assert.ok(quality.recencyFactor(7,H)>quality.recencyFactor(60,H));
  assert.equal(quality.recencyFactor(-1,H),0);
  assert.equal(quality.recencyFactor(7,0),0);
});

test("November Taoyuan probability surveys are eligible", () => {
  const ids=["huang","chang"];
  const chosen=E.mayorPolls.filter(p=>p.county==="桃園市" && ["2026-11-06","2026-11-04"].includes(p.fieldEnd) && p.useInModel===true);
  assert.equal(chosen.length,2);
  for(const p of chosen) assert.equal(quality.modelEligible(p,ids),true,quality.reason(p,ids));
});

test("nonprobability internet survey is background only", () => {
  const p=E.mayorPolls.find(p=>p.county==="桃園市" && p.pollster==="ETtoday民調雲" && p.fieldEnd==="2026-11-01");
  assert.ok(p);
  assert.equal(quality.modelEligible(p,["huang","chang"]),false);
});

test("forecast uses shared tested time-decay formula", () => {
  const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
  assert.ok(app.includes("const recency=quality.recencyFactor(age,halfLife);"));
});
