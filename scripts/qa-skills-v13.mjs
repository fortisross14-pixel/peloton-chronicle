import { createUniverse, currentAbility, openNextSeason, simulateSeason, stageSkillRating } from '../src/engine.js';

const seeds=[130013];
const reports=[];
for(const seed of seeds){
  const state=createUniverse({seed});
  const bases=new Map(state.riders.map(r=>[r.id,r.baseSkill]));
  const yearly=[];
  const gtWinners=[];
  for(let index=0;index<5;index++){
    simulateSeason(state);
    const grandTours=state.eventResults.filter(x=>x.kind==='grand-tour').map(result=>{
      const rider=state.riders.find(r=>r.id===result.winnerId);
      return {year:state.year,race:result.eventName,rider:rider.name,rarity:rider.rarity,base:rider.baseSkill,rating:currentAbility(rider),program:rider.program,terrain:rider.terrain};
    });
    gtWinners.push(...grandTours);
    yearly.push({year:state.year,topRating:Math.max(...state.riders.filter(r=>!r.retired).map(currentAbility)),grandTours});
    openNextSeason(state);
  }
  const active=state.riders.filter(r=>!r.retired);
  const baseDrift=[...bases].filter(([id,base])=>state.riders.find(r=>r.id===id)?.baseSkill!==base).length;
  const mountainWinners=state.events.flatMap(e=>(e.editions||[]).flatMap(ed=>(ed.stageWinners||[]).filter(x=>x.profile==='mountain').map(x=>state.riders.find(r=>r.id===x.riderId))).filter(Boolean));
  const flatWinners=state.events.flatMap(e=>(e.editions||[]).flatMap(ed=>(ed.stageWinners||[]).filter(x=>x.profile==='flat').map(x=>state.riders.find(r=>r.id===x.riderId))).filter(Boolean));
  reports.push({
    seed,year:state.year,baseDrift,
    skillAverageErrors:active.filter(r=>Math.abs(Object.values(r.skills).reduce((a,b)=>a+b,0)/Object.values(r.skills).length-currentAbility(r))>.001).length,
    rarityRanges:Object.fromEntries(['generational','legend','epic','rare','uncommon','common'].map(rarity=>[rarity,{min:Math.min(...active.filter(r=>r.rarity===rarity).map(r=>r.baseSkill)),max:Math.max(...active.filter(r=>r.rarity===rarity).map(r=>r.baseSkill))}])),
    gtWinners,
    lowBaseGtWinners:gtWinners.filter(x=>x.base<80),
    mountainWinnerClimbing:mountainWinners.length?mountainWinners.reduce((s,r)=>s+r.skills.climbing,0)/mountainWinners.length:0,
    mountainWinnerStageFit:mountainWinners.length?mountainWinners.reduce((s,r)=>s+stageSkillRating(r,'mountain'),0)/mountainWinners.length:0,
    flatWinnerSpeed:flatWinners.length?flatWinners.reduce((s,r)=>s+r.skills.speed,0)/flatWinners.length:0,
    flatWinnerStageFit:flatWinners.length?flatWinners.reduce((s,r)=>s+stageSkillRating(r,'flat'),0)/flatWinners.length:0,
    yearly
  });
}
console.log(JSON.stringify(reports,null,2));
