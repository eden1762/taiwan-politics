import test from "node:test";
import assert from "node:assert/strict";
globalThis.window = {};
await import("../election-data.js");
const E=window.ELECTION_DATA, q=window.ELECTION_POLL_QUALITY, ids=["chiang","puma"];
const poll=E.mayorPolls.find(p=>p.county==="臺北市"&&p.fieldEnd==="2026-10-07");
test("telephone poll with 1054 effective respondents remains eligible",()=>{
  assert.ok(poll); assert.equal(poll.voteN,1054); assert.equal(q.modelEligible(poll,ids),true);
});
test("non-probability sampling never enters the model",()=>{
  assert.equal(q.modelEligible({...poll,sampling:"online_nonprobability"},ids),false);
});
test("publication before survey end is rejected",()=>{
  assert.equal(q.modelEligible({...poll,publishedAt:"2026-10-01"},ids),false);
});
test("effective sample larger than full sample is rejected",()=>{
  assert.equal(q.modelEligible({...poll,voteN:1200},ids),false);
});
test("undeclared candidate options are rejected",()=>{
  assert.equal(q.modelEligible({...poll,values:{...poll.values,other_candidate:0.2}},ids),false);
});
test("invalid disclosed totals are rejected",()=>{
  assert.equal(q.modelEligible({...poll,other:100},ids),false);
});
test("multi-candidate polls without matching model choices remain background",()=>{
  for(const day of ["2026-10-16","2026-10-19"]){
    const p=E.mayorPolls.find(x=>x.county==="臺北市"&&x.fieldEnd===day);
    assert.ok(p);assert.equal(q.modelEligible(p,ids),false);
  }
});
test("dates cannot fall after data cutoff",()=>{
  for(const p of E.mayorPolls)assert.ok(p.fieldEnd<=E.asOf,p.pollster+" "+p.fieldEnd);
});

test("new published surveys remain contextual when candidate response options are incomplete",()=>{
  for(const [county,date] of [["臺北市","2026-10-25"],["新竹縣","2026-10-26"]]){
    const p=E.mayorPolls.find(x=>x.county===county && x.fieldEnd===date);
    assert.ok(p, county); assert.equal(p.useInModel,false);
    assert.ok(p.n>=1000 && p.moe>=2 && p.moe<=4);
    assert.ok(p.url.startsWith("https://"));
    assert.equal(q.modelEligible(p,E.mayorRaces[county].candidates.map(x=>x.id)),false);
  }
});
test("22 county historical vote distributions are numeric and near 100 percent",()=>{
  assert.equal(E.counties.length,22);
  assert.equal(new Set(E.counties.map(c=>c.name)).size,22);
  for(const c of E.counties){
    assert.ok(Number.isInteger(c.presidentVotes2024) && c.presidentVotes2024>0,c.name);
    for(const k of ["DPP","KMT","TPP"])assert.ok(Number.isFinite(c.p2024[k]) && c.p2024[k]>=0,c.name+":"+k);
    assert.ok(Math.abs(Object.values(c.p2024).reduce((a,b)=>a+b,0)-100)<0.1,c.name);
  }
});
