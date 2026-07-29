import {
  BASE_EVENTS,
  COUNTRY_DATABASE,
  DEVELOPMENT_NATIONS,
  PRO_TEAMS,
  PROGRAM_TYPES,
  RARITIES,
  ROLES,
  TEAM_IDENTITIES,
  TERRAIN_TYPES,
  WORLD_TEAMS
} from './data.js';
import { clamp, hashString, mulberry32, pick, randInt, shuffle, uniqueId, weightedPick } from './utils.js';

const TIER_ROSTER = { worldtour: 25, proseries: 21, u23: 6, continental: 5 };
const EVENT_TEAM_LIMIT = { 'grand-tour': 23, stage: 20, 'one-day': 22, monument: 23, championship: 28, 'u23-stage': 18, 'u23-one-day': 22, 'u23-championship': 26 };
const TIER_KEYS = ['worldtour','proseries','continental','u23','national'];
const PROFILE_KEYS = ['flat','hilly','puncheur','mountain','time-trial','cobbles'];
const PROFILE_WEIGHTS = {
  flat: { sprinter:1.25, rouleur:1.08, 'time-trialist':1.02, 'all-rounder':1, cobbles:.98, puncheur:.92, climber:.78 },
  hilly: { puncheur:1.22, 'all-rounder':1.12, climber:1.07, rouleur:1.03, cobbles:1, 'time-trialist':.98, sprinter:.86 },
  puncheur: { puncheur:1.3, 'all-rounder':1.12, climber:1.08, cobbles:1.02, rouleur:.98, 'time-trialist':.94, sprinter:.78 },
  mountain: { climber:1.32, 'all-rounder':1.11, puncheur:1.03, 'time-trialist':.94, rouleur:.86, cobbles:.78, sprinter:.66 },
  'time-trial': { 'time-trialist':1.34, 'all-rounder':1.12, rouleur:1.08, climber:1.01, cobbles:.93, puncheur:.92, sprinter:.85 },
  cobbles: { cobbles:1.34, rouleur:1.13, puncheur:1.06, 'all-rounder':1.02, sprinter:.98, 'time-trialist':.94, climber:.72 }
};
const PROGRAM_EVENT_WEIGHTS = {
  'grand-tour': { 'grand-tour':1.28, stage:1.12, championship:1.04, monument:.9, 'one-day':.88 },
  'one-week': { stage:1.25, 'grand-tour':1.08, championship:1.04, monument:.94, 'one-day':.96 },
  monuments: { monument:1.3, 'one-day':1.22, championship:1.14, stage:.91, 'grand-tour':.82 },
  'stage-hunter': { 'grand-tour':1.08, stage:1.08, 'one-day':1.04, monument:1.02, championship:1 }
};
const ROLE_BY_TERRAIN = { sprinter:'Sprinter', cobbles:'Classics leader', puncheur:'Classics leader', climber:'Leader', 'time-trialist':'Leader', 'all-rounder':'Leader', rouleur:'Domestique' };
const INDEX_CACHE = new WeakMap();
const DIRECTOR_AGENCIES = ['Apex Cycling Management','VéloVision Agency','North Road Directors','Continental Tactics Group','ProLine Management','Summit Racecraft','Atlas Sporting Bureau','Grand Tour Partners'];

const UCI_POINTS = {
  tourGc:[1300,1040,880,760,675,575,475,400,325,275,225,175,150,125,100,85,70,60,50,40],
  giroVueltaGc:[1100,880,750,650,575,500,425,350,300,250,210,175,150,125,100,85,70,60,50,40],
  monument:[800,640,520,440,360,300,260,220,180,140,110,90,75,60,50,40,35,30,25,20],
  worlds:[900,700,560,460,380,320,280,240,200,170,140,120,100,85,70,60,50,40,30,20],
  wtMajorStage:[500,400,325,275,225,175,150,125,100,85,70,60,50,40,30,25,20,15,10,5],
  wtStage:[400,320,260,220,180,140,120,100,80,65,55,45,35,30,25,20,15,10,5],
  wtOneDay:[500,400,325,275,225,175,150,125,100,85,70,60,50,40,30,25,20,15,10,5],
  proStage:[200,150,125,100,85,70,60,50,40,35,30,25,20,15,10],
  proOneDay:[200,150,125,100,85,70,60,50,40,35,30,25,20,15,10],
  continental:[125,85,70,60,50,40,35,30,25,20,15,10,8,6,4],
  u23:[100,70,50,40,30,25,20,15,10,8],
  tourStage:[210,150,110,90,70,55,40,30,20,10],
  giroVueltaStage:[180,130,95,80,60,45,35,25,15,10],
  wtStageDay:[60,40,30,25,20,15,10,8,6,4],
  proStageDay:[20,15,10,8,6,5,4,3,2,1],
  continentalStageDay:[14,10,8,6,5,4,3,2,1],
  u23StageDay:[12,8,6,5,4,3,2,1]
};

function blankCoreStats(){
  return { starts:0,raceDays:0,raceWins:0,wins:0,stageWins:0,gcWins:0,podiums:0,top10:0,monuments:0,grandTours:0,weeklong:0,classics:0,championships:0,jerseys:0,uciPoints:0 };
}
function blankTierStats(){return {raceWins:0,wins:0,stageWins:0,grandTours:0,monuments:0,weeklong:0,classics:0,championships:0,jerseys:0,uciPoints:0};}
function freshStats(){
  return {
    ...blankCoreStats(),
    byTier:Object.fromEntries(TIER_KEYS.map(t=>[t,blankTierStats()])),
    stageWinsByProfile:Object.fromEntries(PROFILE_KEYS.map(p=>[p,0])),
    bestResults:[],grandTourResults:[],raceWinDetails:[],stageWinDetails:[],jerseyWinDetails:[]
  };
}
function freshCareer(){return {...freshStats(),seasonCount:0,seasons:[],teams:[],results:[]};}
function normalizeStats(stats={}){
  const normalized={...freshStats(),...stats};
  normalized.raceWins=stats.raceWins ?? stats.wins ?? 0; normalized.wins=normalized.raceWins;
  normalized.byTier={...freshStats().byTier,...(stats.byTier||{})};
  for(const tier of TIER_KEYS) normalized.byTier[tier]={...blankTierStats(),...(normalized.byTier[tier]||{})};
  normalized.stageWinsByProfile={...freshStats().stageWinsByProfile,...(stats.stageWinsByProfile||{})};
  normalized.bestResults=stats.bestResults||[];normalized.grandTourResults=stats.grandTourResults||[];normalized.raceWinDetails=stats.raceWinDetails||[];normalized.stageWinDetails=stats.stageWinDetails||[];normalized.jerseyWinDetails=stats.jerseyWinDetails||[];
  return normalized;
}
function normalizeCareer(career={}){
  const c={...freshCareer(),...normalizeStats(career),...career};
  c.seasonCount=career.seasonCount ?? (typeof career.seasons==='number'?career.seasons:(career.seasons?.length||0));
  c.seasons=Array.isArray(career.seasons)?career.seasons:[];c.teams=career.teams||[];c.results=career.results||[];
  return c;
}

function detailRiderId(value){return typeof value==='object'?value?.id:value;}
function historicalRiderTeamId(state,riderId,year){
  const rider=state.riders?.find(item=>item.id===riderId);if(!rider)return null;
  const season=rider.career?.seasons?.find(item=>item.year===year);return season?.teamId||rider.teamId||null;
}
function canonicalRiderSeasonDetails(state,riderId,year){
  const raceWinDetails=[],stageWinDetails=[],jerseyWinDetails=[],grandTourResults=[];
  for(const event of state.events||[]){
    const edition=(event.editions||[]).find(item=>item.year===year);if(!edition)continue;
    if(edition.winnerId===riderId)raceWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind});
    if((event.stageProfiles?.length||0)>1)for(const stage of edition.stageWinners||[])if(stage.riderId===riderId)stageWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,profile:stage.profile});
    const jerseys=edition.jerseyWinners||edition.jerseys||{};for(const[type,value]of Object.entries(jerseys))if(detailRiderId(value)===riderId)jerseyWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,type});
    if(event.kind==='grand-tour'){const row=(edition.top10||[]).find(item=>item.riderId===riderId);if(row)grandTourResults.push({eventId:event.id,event:event.name,rank:row.rank});}
  }
  return{raceWinDetails,stageWinDetails,jerseyWinDetails,grandTourResults};
}
function canonicalTeamSeasonDetails(state,teamId,year){
  const raceWinDetails=[],stageWinDetails=[],jerseyWinDetails=[];
  for(const event of state.events||[]){
    const edition=(event.editions||[]).find(item=>item.year===year);if(!edition)continue;
    if(edition.teamId===teamId)raceWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind});
    if((event.stageProfiles?.length||0)>1)for(const stage of edition.stageWinners||[])if((stage.teamId||historicalRiderTeamId(state,stage.riderId,year))===teamId)stageWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,profile:stage.profile});
    const jerseys=edition.jerseyWinners||edition.jerseys||{};for(const[type,value]of Object.entries(jerseys)){const riderId=detailRiderId(value),winnerTeamId=typeof value==='object'?value?.teamId:null;if((winnerTeamId||historicalRiderTeamId(state,riderId,year))===teamId)jerseyWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,type});}
  }
  return{raceWinDetails,stageWinDetails,jerseyWinDetails};
}
function repairDetailArray(record,key,canonical,expected){
  record[key]=Array.isArray(record[key])?record[key]:[];
  if(canonical.length&&(record[key].length===0||record[key].length<Math.min(Number(expected)||canonical.length,canonical.length)))record[key]=structuredClone(canonical);
}
function repairHistoricalDetails(state){
  const years=[...new Set((state.events||[]).flatMap(event=>(event.editions||[]).map(edition=>edition.year)))];
  for(const rider of state.riders||[]){
    for(const season of rider.career?.seasons||[]){const canonical=canonicalRiderSeasonDetails(state,rider.id,season.year);repairDetailArray(season,'raceWinDetails',canonical.raceWinDetails,season.raceWins);repairDetailArray(season,'stageWinDetails',canonical.stageWinDetails,season.stageWins);repairDetailArray(season,'jerseyWinDetails',canonical.jerseyWinDetails,season.jerseys);if((!season.grandTourResults||!season.grandTourResults.length)&&canonical.grandTourResults.length)season.grandTourResults=canonical.grandTourResults;}
    if(state.eventResults?.some(result=>result.year===state.year)){const canonical=canonicalRiderSeasonDetails(state,rider.id,state.year);repairDetailArray(rider.currentSeason,'raceWinDetails',canonical.raceWinDetails,rider.currentSeason.raceWins);repairDetailArray(rider.currentSeason,'stageWinDetails',canonical.stageWinDetails,rider.currentSeason.stageWins);repairDetailArray(rider.currentSeason,'jerseyWinDetails',canonical.jerseyWinDetails,rider.currentSeason.jerseys);}
    const all=years.map(year=>canonicalRiderSeasonDetails(state,rider.id,year));const allRaces=all.flatMap(x=>x.raceWinDetails),allStages=all.flatMap(x=>x.stageWinDetails),allJerseys=all.flatMap(x=>x.jerseyWinDetails);repairDetailArray(rider.career,'raceWinDetails',allRaces,rider.career.raceWins);repairDetailArray(rider.career,'stageWinDetails',allStages,rider.career.stageWins);repairDetailArray(rider.career,'jerseyWinDetails',allJerseys,rider.career.jerseys);if(allStages.length){rider.career.stageWinsByProfile=Object.fromEntries(PROFILE_KEYS.map(profile=>[profile,allStages.filter(item=>item.profile===profile).length]));}
  }
  for(const team of state.teams||[]){
    for(const season of team.career?.seasons||[]){const canonical=canonicalTeamSeasonDetails(state,team.id,season.year);repairDetailArray(season,'raceWinDetails',canonical.raceWinDetails,season.raceWins);repairDetailArray(season,'stageWinDetails',canonical.stageWinDetails,season.stageWins);repairDetailArray(season,'jerseyWinDetails',canonical.jerseyWinDetails,season.jerseys);}
    if(state.eventResults?.some(result=>result.year===state.year)){const canonical=canonicalTeamSeasonDetails(state,team.id,state.year);repairDetailArray(team.currentSeason,'raceWinDetails',canonical.raceWinDetails,team.currentSeason.raceWins);repairDetailArray(team.currentSeason,'stageWinDetails',canonical.stageWinDetails,team.currentSeason.stageWins);repairDetailArray(team.currentSeason,'jerseyWinDetails',canonical.jerseyWinDetails,team.currentSeason.jerseys);}
    const all=years.map(year=>canonicalTeamSeasonDetails(state,team.id,year));repairDetailArray(team.career,'raceWinDetails',all.flatMap(x=>x.raceWinDetails),team.career.raceWins);repairDetailArray(team.career,'stageWinDetails',all.flatMap(x=>x.stageWinDetails),team.career.stageWins);repairDetailArray(team.career,'jerseyWinDetails',all.flatMap(x=>x.jerseyWinDetails),team.career.jerseys);
  }
  for(const director of state.directors||[]){for(const season of director.career?.seasons||[]){if(!season.teamId)continue;const canonical=canonicalTeamSeasonDetails(state,season.teamId,season.year);repairDetailArray(season,'raceWinDetails',canonical.raceWinDetails,season.raceWins);repairDetailArray(season,'stageWinDetails',canonical.stageWinDetails,season.stageWins);repairDetailArray(season,'jerseyWinDetails',canonical.jerseyWinDetails,season.jerseys);}const seasons=director.career?.seasons||[];repairDetailArray(director.career,'raceWinDetails',seasons.flatMap(x=>x.raceWinDetails||[]),director.career.raceWins);repairDetailArray(director.career,'stageWinDetails',seasons.flatMap(x=>x.stageWinDetails||[]),director.career.stageWins);repairDetailArray(director.career,'jerseyWinDetails',seasons.flatMap(x=>x.jerseyWinDetails||[]),director.career.jerseys);}
}
function eventMetric(event){
  if(event.kind==='grand-tour')return'grandTours';
  if(event.kind==='monument')return'monuments';
  if(['stage','u23-stage'].includes(event.kind))return'weeklong';
  if(['one-day','u23-one-day'].includes(event.kind))return'classics';
  return'championships';
}
function increment(stats,key,amount=1,tier=null){
  stats[key]=(stats[key]||0)+amount;
  if(key==='raceWins')stats.wins=stats.raceWins;
  if(tier&&stats.byTier?.[tier]){stats.byTier[tier][key]=(stats.byTier[tier][key]||0)+amount;if(key==='raceWins')stats.byTier[tier].wins=stats.byTier[tier].raceWins;}
}
function recordWin(book,event,year){increment(book,'raceWins',1,event.tier);increment(book,'gcWins',event.stageProfiles.length>1?1:0,event.tier);increment(book,eventMetric(event),1,event.tier);book.raceWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind});}
function recordStage(book,event,profile,year){increment(book,'stageWins',1,event.tier);book.stageWinsByProfile[profile]=(book.stageWinsByProfile[profile]||0)+1;book.stageWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,profile});}
function recordJersey(book,event,type,year){increment(book,'jerseys',1,event.tier);book.jerseyWinDetails.push({year,eventId:event.id,event:event.name,tier:event.tier,kind:event.kind,type});}

function chooseNationality(random){return weightedPick(random,Object.entries(COUNTRY_DATABASE).map(([value,data])=>({value,weight:data.weight})));}
function nameForCountry(random,code,used){
  const pool=COUNTRY_DATABASE[code]||COUNTRY_DATABASE.FR;
  for(let attempt=0;attempt<80;attempt+=1){
    const first=pick(random,pool.first),last=pick(random,pool.last);
    const name=attempt<45?`${first} ${last}`:`${first} ${String.fromCharCode(65+randInt(random,0,25))}. ${last}`;
    if(!used.has(name)){used.add(name);return name;}
  }
  const fallback=`${pick(random,pool.first)} ${pick(random,pool.last)} ${randInt(random,10,99)}`;used.add(fallback);return fallback;
}
function rarityForRandom(random,tier='worldtour'){
  const tierBoost=tier==='worldtour'?1.45:tier==='proseries'?1:tier==='u23'?0.9:0.62;
  return weightedPick(random,Object.entries(RARITIES).map(([value,data])=>({value,weight:data.weight*(['generational','legend','epic'].includes(value)?tierBoost:1)})));
}
function developmentProfile(random){return weightedPick(random,[{value:'early-bloomer',weight:28},{value:'stable',weight:47},{value:'late-bloomer',weight:25}]);}
function careerFactorFor(rider,year){
  const age=rider.age;
  if(age<23){const base=.70+clamp((age-18)/4,0,1)*.20;return Math.min(.90,base+(rider.developmentProfile==='early-bloomer'?.025:rider.developmentProfile==='late-bloomer'?-.02:0));}
  const elapsed=Math.max(0,year-rider.debutYear);const progress=clamp(elapsed/Math.max(1,rider.careerLength-1),0,1);
  if(rider.developmentProfile==='early-bloomer'){
    if(progress<.28)return .91+(progress/.28)*.11;
    return 1.02-((progress-.28)/.72)*.17;
  }
  if(rider.developmentProfile==='late-bloomer'){
    if(progress<.62)return .85+(progress/.62)*.17;
    return 1.02-((progress-.62)/.38)*.12;
  }
  if(progress<.25)return .90+(progress/.25)*.09;
  if(progress<.7)return .99;
  return .99-((progress-.7)/.3)*.12;
}
function makeRider(random,{teamId,tier,usedNames,ageRange=null,year=2026}){
  const nationality=chooseNationality(random),name=nameForCountry(random,nationality,usedNames),rarity=rarityForRandom(random,tier),range=RARITIES[rarity];
  const tierPenalty=tier==='proseries'?randInt(random,0,2):tier==='continental'?randInt(random,2,6):0;
  const potential=clamp(randInt(random,range.min,range.max)-tierPenalty,60,98);
  const age=randInt(random,ageRange?.[0]??(tier==='u23'?18:20),ageRange?.[1]??(tier==='u23'?21:tier==='continental'?29:37));
  const terrain=pick(random,TERRAIN_TYPES),program=pick(random,PROGRAM_TYPES),profile=developmentProfile(random),careerLength=randInt(random,9,15),debutAge=tier==='u23'?18:randInt(random,18,22),debutYear=year-(age-debutAge);
  const rider={
    id:uniqueId('r',random),name,nationality,teamId,tier,age,rarity,potential,baseSkill:potential,program,terrain,role:ROLE_BY_TERRAIN[terrain]||pick(random,ROLES),
    developmentProfile:profile,careerLength,debutYear,retirementAge:debutAge+careerLength,careerFactor:.85,annualShape:1,form:randInt(random,48,72),fatigue:0,raceDays:0,
    injuryWeeks:0,morale:randInt(random,55,85),contractYears:tier==='u23'?1:randInt(random,1,3),salary:Math.round((potential**2)*(tier==='worldtour'?430:tier==='proseries'?180:40)),
    targetEvents:[],currentSeason:freshStats(),career:freshCareer(),history:[{year,text:`Entered the tracked ${tier} system.`}],retired:false,hallScore:0
  };
  setAnnualRiderValues(rider,year);return rider;
}
function setAnnualRiderValues(rider,year){
  rider.careerFactor=careerFactorFor(rider,year);
  const random=mulberry32(hashString(`${rider.id}|${year}|shape`));rider.annualShape=.97+random()*.06;rider.form=randInt(random,48,72);rider.fatigue=0;rider.raceDays=0;rider.currentSeason=freshStats();rider.targetEvents=[];
}
function makeTeam(random,row,tier){
  const[id,name,nationality,budget,attraction]=row,sponsorDuration=randInt(random,2,5);
  return {id,identity:TEAM_IDENTITIES[id]||`${name} Cycling`,name,nationality,tier,budget,attraction,sponsor:{name,investment:budget,attraction,expires:2026+sponsorDuration,started:2026},reputation:Math.round((budget+attraction)/2),uciPoints:0,cyclePoints:0,roster:[],directorId:null,currentSeason:freshStats(),career:freshCareer(),history:[{year:2026,type:'sponsor',name}],status:'active',founded:randInt(random,1985,2020)};
}
function makeDevelopmentTeams(random){return DEVELOPMENT_NATIONS.map(code=>({id:`u23-${code.toLowerCase()}`,identity:`${code} National Development`,name:`${code} U23 Selection`,nationality:code,tier:'u23',budget:50+randInt(random,0,20),attraction:55+randInt(random,0,20),sponsor:null,reputation:55+randInt(random,0,20),uciPoints:0,cyclePoints:0,roster:[],directorId:null,currentSeason:freshStats(),career:freshCareer(),history:[{year:2026,type:'founded',name:`${code} U23 Selection`}],status:'active',founded:2026}));}
function makeContinentalTeams(random){
  const continents=[['EUR',['FR','IT','ES','BE','NL']],['AME',['US','CO','CA','MX','EC']],['ASI',['JP','KR','CN','KZ','TR']],['AFR',['ZA','RW','ER','MA','KE']],['OCE',['AU','NZ']]],rows=[];
  for(const[continent,nations]of continents){const count=continent==='EUR'?10:continent==='OCE'?5:8;for(let index=0;index<count;index+=1){const nationality=nations[index%nations.length];rows.push({id:`ct-${continent.toLowerCase()}-${index+1}`,identity:`${nationality} Continental Project ${index+1}`,name:`${nationality} Continental ${index+1}`,nationality,continent,tier:'continental',budget:30+randInt(random,0,20),attraction:32+randInt(random,0,20),sponsor:null,reputation:35+randInt(random,0,20),uciPoints:0,cyclePoints:0,roster:[],directorId:null,currentSeason:freshStats(),career:freshCareer(),history:[{year:2026,type:'founded',name:`${nationality} Continental ${index+1}`}],status:'active',founded:randInt(random,2010,2026)});}}
  return rows;
}
function generateRosters(random,teams,year){const usedNames=new Set(),riders=[];for(const team of teams){while(team.roster.length<(TIER_ROSTER[team.tier]||5)){const rider=makeRider(random,{teamId:team.id,tier:team.tier,usedNames,year});riders.push(rider);team.roster.push(rider.id);}}return riders;}
function makeDirector(random,{teamId=null,agencyId=null,tier='agency',usedNames,year=2026}){
  const nationality=chooseNationality(random),name=nameForCountry(random,nationality,usedNames),rarity=rarityForRandom(random,tier==='worldtour'?'proseries':tier),range=RARITIES[rarity];
  const ability=clamp(randInt(random,range.min,range.max)-(tier==='continental'?randInt(random,0,4):0),58,97),age=randInt(random,33,61);
  return {id:uniqueId('d',random),name,nationality,age,rarity,ability,tactics:clamp(ability+randInt(random,-7,7),45,99),development:clamp(ability+randInt(random,-9,9),45,99),scouting:clamp(ability+randInt(random,-9,9),45,99),recruitment:clamp(ability+randInt(random,-8,8),45,99),teamId,agencyId,reputation:clamp(ability+randInt(random,-4,5),45,99),retirementAge:randInt(random,63,72),currentSeason:freshStats(),career:freshCareer(),history:[{year,text:teamId?'Appointed race director.':'Entered the director agency market.'}],retired:false};
}
function generateDirectors(random,teams,year){
  const usedNames=new Set(),agencies=DIRECTOR_AGENCIES.map((name,index)=>({id:`agency-${index+1}`,name,directorIds:[]})),directors=[];
  for(const team of teams){const director=makeDirector(random,{teamId:team.id,tier:team.tier,usedNames,year});team.directorId=director.id;directors.push(director);}
  for(const agency of agencies){for(let i=0;i<3;i+=1){const director=makeDirector(random,{agencyId:agency.id,usedNames,year});agency.directorIds.push(director.id);directors.push(director);}}
  return{directors,agencies};
}
function eventDateValue(event){return event.month*100+event.day;}
export function dayOfYear(year,month,day){return Math.floor((Date.UTC(year,month-1,day)-Date.UTC(year,0,0))/86400000);}
export function dateFromDay(year,day){const d=new Date(Date.UTC(year,0,Math.max(1,day)));return{month:d.getUTCMonth()+1,day:d.getUTCDate(),label:d.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'})};}
function startDay(state,event){return dayOfYear(state.year,event.month,event.day);}

export function createUniverse({name='Main Chronicle',seed=20260728}={}){
  const random=mulberry32(seed),teams=[...WORLD_TEAMS.map(row=>makeTeam(random,row,'worldtour')),...PRO_TEAMS.map(row=>makeTeam(random,row,'proseries')),...makeDevelopmentTeams(random),...makeContinentalTeams(random)],riders=generateRosters(random,teams,2026),{directors,agencies}=generateDirectors(random,teams,2026),events=structuredClone(BASE_EVENTS).sort((a,b)=>eventDateValue(a)-eventDateValue(b));
  const state={version:5,name,seed,year:2026,currentDay:1,eventIndex:0,seasonStatus:'active',reviewMode:false,pendingArchive:null,teams,riders,directors,directorAgencies:agencies,events,eventResults:[],currentResult:null,news:[],archives:[],transfers:[],directorMoves:[],sponsorLog:[],prospectSpawns:[],settings:{autosave:true,stageDetail:'winners'},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  prepareSeason(state);state.prospectSpawns=state.riders.filter(r=>r.tier==='u23'&&['generational','legend','epic'].includes(r.rarity)).map(r=>({year:2026,riderId:r.id,riderName:r.name,age:r.age,nationality:r.nationality,rarity:r.rarity,potential:r.potential,rating:Math.round(currentAbility(r)),teamId:r.teamId,teamName:teamById(state,r.teamId)?.name||'U23 program'}));openingNews(state);return state;
}

function rebuildUciPointEvents(state){
  const awards=[];
  const push=(year,event,riderId,teamId,points,category,offset=0,rank=1)=>{if(points&&riderId)awards.push({id:`${year}-${event.id}-${category}-${offset}-${rank}-${riderId}`,year,day:pointDate(year,event,offset),eventId:event.id,eventName:event.name,tier:event.tier,category,rank,points,riderId,teamId});};
  for(const event of state.events||[])for(const edition of event.editions||[]){const scale=eventPointScale(event);(edition.top10||[]).forEach((row,i)=>push(edition.year,event,row.riderId,row.teamId||historicalRiderTeamId(state,row.riderId,edition.year),scale[i]||0,'final',event.stageProfiles.length-1,i+1));const stageScale=stagePointScale(event);(edition.stageWinners||[]).forEach((row,i)=>push(edition.year,event,row.riderId,row.teamId||historicalRiderTeamId(state,row.riderId,edition.year),stageScale[0]||0,'stage',i,1));for(const[type,value]of Object.entries(edition.jerseys||edition.jerseyWinners||{})){const id=detailRiderId(value);push(edition.year,event,id,(value&&typeof value==='object'?value.teamId:null)||historicalRiderTeamId(state,id,edition.year),jerseyPoints(event),`jersey-${type}`,event.stageProfiles.length-1,1);}}
  state.uciPointEvents=awards;
}

function syncUciTotalsFromLedger(state){
  for(const rider of state.riders||[]){rider.currentSeason.uciPoints=0;rider.career.uciPoints=0;for(const tier of TIER_KEYS){rider.currentSeason.byTier[tier].uciPoints=0;rider.career.byTier[tier].uciPoints=0;}}
  for(const team of state.teams||[]){team.currentSeason.uciPoints=0;team.career.uciPoints=0;team.uciPoints=0;for(const tier of TIER_KEYS){team.currentSeason.byTier[tier].uciPoints=0;team.career.byTier[tier].uciPoints=0;}}
  for(const award of state.uciPointEvents||[]){const rider=riderById(state,award.riderId);if(rider){increment(rider.career,'uciPoints',award.points,award.tier);if(award.year===state.year)increment(rider.currentSeason,'uciPoints',award.points,award.tier);}const team=teamById(state,award.teamId);if(team){increment(team.career,'uciPoints',award.points,award.tier);if(award.year===state.year){increment(team.currentSeason,'uciPoints',award.points,award.tier);team.uciPoints+=award.points;}}}
}


export function upgradeUniverse(state){
  if(!state)return state;
  const previousVersion=state.version||1;
  state.version=5;state.seasonStatus=state.seasonStatus||(state.eventIndex>=state.events?.length?'complete':'active');state.pendingArchive=state.pendingArchive||null;state.reviewMode=state.seasonStatus==='complete';state.prospectSpawns=state.prospectSpawns||[];state.currentDay=state.currentDay||Math.max(1,state.events?.[state.eventIndex]?dayOfYear(state.year,state.events[state.eventIndex].month,state.events[state.eventIndex].day)-1:1);state.directorMoves=state.directorMoves||[];state.directorAgencies=state.directorAgencies||[];
  for(const event of state.events||[]){event.editions=event.editions||[];event.history=event.history||[];}
  for(const rider of state.riders||[]){rider.potential=rider.potential||rider.baseSkill||70;rider.baseSkill=rider.potential;rider.developmentProfile=rider.developmentProfile||'stable';rider.careerLength=rider.careerLength||12;rider.debutYear=rider.debutYear||state.year-(rider.age-20);rider.retirementAge=rider.retirementAge||38;rider.careerFactor=rider.careerFactor||.95;rider.currentSeason=normalizeStats(rider.currentSeason);rider.career=normalizeCareer(rider.career);}
  for(const team of state.teams||[]){team.currentSeason=normalizeStats(team.currentSeason);team.career=normalizeCareer(team.career);team.directorId=team.directorId||null;}
  if(!state.directors?.length){const random=mulberry32(hashString(`${state.seed}|upgrade-directors`)),usedNames=new Set(state.riders.map(r=>r.name));state.directorAgencies=DIRECTOR_AGENCIES.map((name,index)=>({id:`agency-${index+1}`,name,directorIds:[]}));state.directors=[];for(const team of state.teams){const d=makeDirector(random,{teamId:team.id,tier:team.tier,usedNames,year:state.year});team.directorId=d.id;state.directors.push(d);}for(const agency of state.directorAgencies){for(let i=0;i<2;i++){const d=makeDirector(random,{agencyId:agency.id,usedNames,year:state.year});agency.directorIds.push(d.id);state.directors.push(d);}}}
  for(const director of state.directors||[]){director.currentSeason=normalizeStats(director.currentSeason);director.career=normalizeCareer(director.career);}
  for(const archive of state.archives||[]){
    archive.riderRanking=archive.riderRanking||[];archive.teamRanking=archive.teamRanking||[];archive.directorRanking=archive.directorRanking||[];archive.raceWinners=archive.raceWinners||[];
    archive.summary=archive.summary||{topRider:archive.riderRanking[0]||null,topTeam:archive.teamRanking[0]||null,mostWins:[...archive.riderRanking].sort((a,b)=>(b.raceWins||0)-(a.raceWins||0))[0]||null,mostStages:[...archive.riderRanking].sort((a,b)=>(b.stageWins||0)-(a.stageWins||0))[0]||null};
  }
  if(previousVersion<4||!state.detailRepairV4){repairHistoricalDetails(state);state.detailRepairV4=true;}
  if(previousVersion<5||!Array.isArray(state.uciPointEvents)){rebuildUciPointEvents(state);syncUciTotalsFromLedger(state);state.uciRankingV5=true;}
  return state;
}

function openingNews(state){
  const top=state.riders.filter(r=>!r.retired).sort((a,b)=>currentAbility(b)-currentAbility(a)).slice(0,4);
  state.news=[
    {year:state.year,phase:'preseason',category:'Season preview',importance:'lead',headline:`Le Grand Braquet opens its ${state.year} annual`,body:`A fully procedural peloton begins a new history. ${top.map(r=>r.name).join(', ')} carry the strongest opening projections.`},
    {year:state.year,phase:'preseason',category:'Odds desk',importance:'major',headline:`${top[0].name} begins as the Tour benchmark`,body:`Potential, career curve, calendar sacrifices and team strength—not reputation alone—will decide whether the favorite reaches July at his peak.`},
    {year:state.year,phase:'preseason',category:'Team economy',importance:'normal',headline:'Sponsors shape the market',body:'Organizations persist beneath changing commercial identities, while sponsor investment governs budgets and rider attraction.'}
  ];
}
function prepareSeason(state){
  state.eventIndex=0;state.currentDay=1;state.currentResult=null;state.eventResults=[];state.seasonStatus='active';state.reviewMode=false;state.pendingArchive=null;
  for(const team of state.teams){team.uciPoints=0;team.currentSeason=freshStats();}
  for(const director of state.directors){if(!director.retired)director.currentSeason=freshStats();}
  for(const rider of state.riders){if(rider.retired)continue;setAnnualRiderValues(rider,state.year);rider.injuryWeeks=Math.max(0,rider.injuryWeeks-8);}
  planCalendars(state);
}
function planCalendars(state){
  const activeEvents=state.events.filter(e=>e.active);
  for(const rider of state.riders){
    if(rider.retired||rider.tier==='continental')continue;
    const candidates=activeEvents.filter(event=>eventEligibleForRider(event,rider));
    const scored=candidates.map(event=>({event,score:eventTargetScore(event,rider)+deterministicNoise(state,rider.id,event.id)*8})).sort((a,b)=>b.score-a.score);
    const targetDays=rider.tier==='u23'?randInt(mulberry32(hashString(rider.id+state.year)),18,30):rider.role==='Domestique'?68:56;let days=0;
    for(const{event}of scored){if(days>=targetDays)break;if(conflictsWithTargets(event,rider.targetEvents.map(id=>eventById(state,id)).filter(Boolean)))continue;rider.targetEvents.push(event.id);days+=event.stageProfiles.length;}
  }
}
function conflictsWithTargets(event,targets){const date=eventDateValue(event);return targets.some(target=>Math.abs(eventDateValue(target)-date)<(event.stageProfiles.length>8||target.stageProfiles.length>8?18:5));}
function eventEligibleForRider(event,rider){if(event.tier==='u23')return rider.age<=22;if(event.tier==='continental')return ['continental','proseries'].includes(rider.tier);if(event.tier==='national')return !['u23','continental'].includes(rider.tier);if(event.tier==='proseries')return ['worldtour','proseries'].includes(rider.tier);return ['worldtour','proseries'].includes(rider.tier);}
function eventTargetScore(event,rider){const kind=event.kind==='grand-tour'?'grand-tour':event.kind==='stage'?'stage':event.kind==='monument'?'monument':event.kind==='championship'?'championship':'one-day',program=PROGRAM_EVENT_WEIGHTS[rider.program]?.[kind]||1,terrain=Math.max(...event.stageProfiles.map(profile=>PROFILE_WEIGHTS[profile]?.[rider.terrain]||1)),prestige=event.prestige/100,agePenalty=rider.age>=35&&event.stageProfiles.length>10?.92:1;return 50*program+30*terrain+20*prestige*agePenalty;}
function deterministicNoise(state,...parts){return mulberry32(hashString([state.seed,state.year,...parts].join('|')))();}
export function currentAbility(rider){return clamp(rider.potential*(rider.careerFactor||.9)*(rider.annualShape||1)+(rider.form-60)*.08-rider.fatigue*.08-rider.injuryWeeks*2,42,99);}

function regionalAffinity(event,team){if(event.region!=='EUR')return team.nationality==='USA'&&event.region==='AME'?5:0;const c=event.id.includes('burgos')||event.id.includes('asturias')||event.id.includes('valenciana')?'ESP':event.id.includes('belg')||['omloop','e3','gent','dwars','flanders','brabant','wallonie'].includes(event.id)?'BEL':event.id.includes('ital')||['giro','strade','sanremo','lombardia','piemonte','tirreno'].includes(event.id)?'ITA':event.id.includes('fr')||['tour','dauphine','paris-nice','bretagne','paris-tours','dunkirk'].includes(event.id)?'FRA':null;return team.nationality===c?8:0;}
function selectionScore(state,rider,event){const targeted=rider.targetEvents.includes(event.id)?18:-8,profile=Math.max(...event.stageProfiles.map(type=>PROFILE_WEIGHTS[type]?.[rider.terrain]||1)),fatiguePenalty=rider.fatigue*1.1+rider.raceDays*.08;return currentAbility(rider)*profile+targeted+rider.morale*.03-fatiguePenalty+deterministicNoise(state,rider.id,event.id)*7;}
function nationalSelections(state,event,u23=false){
  const pool=state.riders.filter(r=>!r.retired&&(u23?r.age<=22:!['u23','continental'].includes(r.tier))),nations=[...new Set(pool.map(r=>r.nationality))];
  return nations.map(nation=>({id:`${u23?'u23-':''}nation-${nation}`,name:`${nation} ${u23?'U23 ':''}Selection`,nationality:nation,tier:u23?'u23':'national',roster:pool.filter(r=>r.nationality===nation).sort((a,b)=>selectionScore(state,b,event)-selectionScore(state,a,event)).slice(0,u23?6:8).map(r=>r.id)})).filter(t=>t.roster.length>=3).sort((a,b)=>b.roster.length-a.roster.length).slice(0,EVENT_TEAM_LIMIT[event.kind]||22);
}
function eventTeams(state,event){
  const active=state.teams.filter(t=>t.status==='active');if(event.tier==='u23')return nationalSelections(state,event,true);if(event.tier==='national')return nationalSelections(state,event,false);
  if(event.tier==='continental'){return active.filter(t=>t.tier==='continental'&&(t.continent===event.region||event.region==='EUR')).sort((a,b)=>b.reputation-a.reputation).slice(0,12).concat(active.filter(t=>t.tier==='proseries').sort((a,b)=>b.reputation-a.reputation).slice(0,4));}
  const world=active.filter(t=>t.tier==='worldtour'),pro=active.filter(t=>t.tier==='proseries').sort((a,b)=>(b.cyclePoints+b.reputation)-(a.cyclePoints+a.reputation));
  if(event.tier==='worldtour'){const auto=pro.slice(0,3),wild=pro.filter(t=>!auto.includes(t)).sort((a,b)=>regionalAffinity(event,b)-regionalAffinity(event,a)||b.reputation-a.reputation).slice(0,event.kind==='grand-tour'?2:3);return[...world,...auto,...wild].slice(0,EVENT_TEAM_LIMIT[event.kind]||22);}
  return[...world.sort((a,b)=>b.reputation-a.reputation).slice(0,event.kind==='stage'?8:10),...pro].slice(0,EVENT_TEAM_LIMIT[event.kind]||20);
}
function rosterForTeam(state,team,event){const source=team.roster.map(id=>riderById(state,id)).filter(r=>r&&!r.retired&&r.injuryWeeks===0&&eventEligibleForRider(event,r)),size=event.tier==='u23'?6:event.kind==='grand-tour'?8:7;return source.map(r=>({r,score:selectionScore(state,r,event)})).sort((a,b)=>b.score-a.score).slice(0,size).map(x=>x.r);}
function stagePerformance(state,rider,profile,event,team,randomness){
  const ability=currentAbility(rider),terrain=PROFILE_WEIGHTS[profile]?.[rider.terrain]||1,programKind=event.kind==='grand-tour'?'grand-tour':['stage','u23-stage'].includes(event.kind)?'stage':event.kind==='monument'?'monument':['championship','u23-championship'].includes(event.kind)?'championship':'one-day',program=PROGRAM_EVENT_WEIGHTS[rider.program]?.[programKind]||1,roleBonus=rider.role==='Leader'&&['mountain','time-trial'].includes(profile)?1.02:rider.role==='Sprinter'&&profile==='flat'?1.04:rider.role==='Classics leader'&&['cobbles','hilly','puncheur'].includes(profile)?1.035:1,targetBonus=rider.targetEvents.includes(event.id)?1.04:.985,freshness=clamp(1-rider.fatigue/180,.72,1.03),director=team?.directorId?directorById(state,team.directorId):null,directorBonus=director?1+(director.tactics-70)/1500:1;
  const fixedAffinity=(deterministicNoise(state,rider.id,event.id)-.5)*5.5,pastWins=(event.editions||[]).filter(e=>e.winnerId===rider.id).length,majorExperience=(event.kind==='grand-tour'||event.kind==='monument')?Math.min(3,pastWins)*.9:0;return ability*terrain*program*roleBonus*targetBonus*freshness*directorBonus+fixedAffinity+majorExperience+randomness;
}
function timeGapFromScore(top,score,profile){const factor=profile==='mountain'?7:profile==='time-trial'?6:['hilly','puncheur'].includes(profile)?4:1.5;return Math.max(0,Math.round((top-score)*factor));}
function normalizedClassification(final,event){
  const raw=final.map(entry=>entry.time-final[0].time),maxRaw=Math.max(1,...raw.slice(0,20));
  const category=event.kind==='grand-tour'?'grand':(['stage','u23-stage'].includes(event.kind)?'stage':'one');
  return final.slice(0,20).map((entry,rank)=>{
    if(rank===0)return{...entry,gap:0,time:0};
    const ratio=Math.pow(raw[rank]/maxRaw,.72),target=category==='grand'?3900:category==='stage'?1050:240;
    const ceiling=category==='grand'?(rank===1?360:rank===2?540:Math.min(4500,300+rank*210)):category==='stage'?(rank===1?150:rank===2?240:Math.min(1500,90+rank*85)):(rank===1?45:rank===2?75:Math.min(420,25+rank*24));
    const gap=Math.max(category==='one'&&rank<5?0:rank,Math.min(ceiling,Math.round(ratio*target)));
    return{...entry,gap,time:gap};
  });
}
function eventPointScale(event){
  if(event.id==='tour')return UCI_POINTS.tourGc;
  if(event.id==='giro'||event.id==='vuelta')return UCI_POINTS.giroVueltaGc;
  if(event.kind==='monument')return UCI_POINTS.monument;
  if(event.kind==='championship')return UCI_POINTS.worlds;
  if(event.tier==='worldtour'&&event.kind==='stage')return event.prestige>=86?UCI_POINTS.wtMajorStage:UCI_POINTS.wtStage;
  if(event.tier==='worldtour')return UCI_POINTS.wtOneDay;
  if(event.tier==='proseries')return event.kind==='stage'?UCI_POINTS.proStage:UCI_POINTS.proOneDay;
  if(event.tier==='u23')return UCI_POINTS.u23;
  return UCI_POINTS.continental;
}
function stagePointScale(event){if(event.id==='tour')return UCI_POINTS.tourStage;if(event.id==='giro'||event.id==='vuelta')return UCI_POINTS.giroVueltaStage;if(event.tier==='worldtour')return UCI_POINTS.wtStageDay;if(event.tier==='proseries')return UCI_POINTS.proStageDay;if(event.tier==='u23')return UCI_POINTS.u23StageDay;return UCI_POINTS.continentalStageDay;}
function jerseyPoints(event){if(event.id==='tour')return 500;if(event.id==='giro'||event.id==='vuelta')return 400;if(event.tier==='worldtour')return 100;if(event.tier==='proseries')return 50;if(event.tier==='u23')return 25;return 20;}
function pointDate(year,event,stageOffset=0){return Math.floor(Date.UTC(year,event.month-1,event.day+stageOffset)/86400000);}
function addUciAward(state,riderId,teamId,event,points,category,stageOffset=0,rank=1){if(!points||!riderId)return;state.uciPointEvents=state.uciPointEvents||[];const award={id:`${state.year}-${event.id}-${category}-${stageOffset}-${rank}-${riderId}`,year:state.year,day:pointDate(state.year,event,stageOffset),eventId:event.id,eventName:event.name,tier:event.tier,category,rank,points,riderId,teamId};state.uciPointEvents.push(award);const rider=riderById(state,riderId);if(rider){increment(rider.currentSeason,'uciPoints',points,event.tier);increment(rider.career,'uciPoints',points,event.tier);}const team=teamById(state,teamId);if(team){increment(team.currentSeason,'uciPoints',points,event.tier);increment(team.career,'uciPoints',points,event.tier);team.uciPoints+=points;team.cyclePoints+=points;const director=directorById(state,team.directorId);if(director){increment(director.currentSeason,'uciPoints',points,event.tier);increment(director.career,'uciPoints',points,event.tier);}}}
function awardUciPoints(state,event,result){
  const gcScale=eventPointScale(event);result.classification.forEach((row,index)=>addUciAward(state,row.riderId,row.teamId,event,gcScale[index]||0,'final',event.stageProfiles.length-1,index+1));
  if(event.stageProfiles.length>1){const scale=stagePointScale(event);for(const stage of result.stages)stage.top5.forEach((row,index)=>addUciAward(state,row.riderId,row.teamId,event,scale[index]||0,'stage',stage.number-1,index+1));for(const[type,riderId]of Object.entries(result.jerseys)){const rider=riderById(state,riderId);addUciAward(state,riderId,rider?.teamId,event,jerseyPoints(event),`jersey-${type}`,event.stageProfiles.length-1,1);}}
}
export function uciRankings(state,scope='rolling'){
  upgradeUniverse(state);const now=Math.floor(Date.UTC(state.year,dateFromDay(state.year,state.currentDay||1).month-1,dateFromDay(state.year,state.currentDay||1).day)/86400000),min=scope==='rolling'?now-364:Math.floor(Date.UTC(state.year,0,1)/86400000),max=scope==='rolling'?now:Math.floor(Date.UTC(state.year,11,31)/86400000),awards=(state.uciPointEvents||[]).filter(a=>a.day>=min&&a.day<=max),riders=new Map();for(const a of awards)riders.set(a.riderId,(riders.get(a.riderId)||0)+a.points);const riderRows=[...riders.entries()].map(([id,points])=>({id,points,rider:riderById(state,id)})).filter(x=>x.rider).sort((a,b)=>b.points-a.points).map((x,i)=>({rank:i+1,id:x.id,name:x.rider.name,nationality:x.rider.nationality,teamId:x.rider.teamId,tier:x.rider.tier,points:x.points}));const teamMap=new Map();for(const row of riderRows){const id=row.teamId;if(!id)continue;if(!teamMap.has(id))teamMap.set(id,[]);teamMap.get(id).push(row.points);}const teamRows=[...teamMap.entries()].map(([id,values])=>({id,team:teamById(state,id),points:values.sort((a,b)=>b-a).slice(0,20).reduce((a,b)=>a+b,0)})).filter(x=>x.team).sort((a,b)=>b.points-a.points).map((x,i)=>({rank:i+1,id:x.id,name:x.team.name,nationality:x.team.nationality,tier:x.team.tier,points:x.points}));return{riders:riderRows,teams:teamRows,scope};
}

function recoverBeforeEvent(state,event){const eventDay=startDay(state,event),gap=Math.max(0,eventDay-(state.lastRaceDay||1));for(const rider of state.riders){if(rider.retired)continue;rider.fatigue=clamp(rider.fatigue-gap*1.15,0,100);rider.form=clamp(rider.form+(rider.targetEvents.includes(event.id)?Math.min(6,gap*.12):gap>10?-1:0),35,90);rider.injuryWeeks=Math.max(0,rider.injuryWeeks-Math.floor(gap/7));}}

export function simulateNextEvent(state){
  upgradeUniverse(state);const event=state.events[state.eventIndex];if(!event)return completeSeason(state);recoverBeforeEvent(state,event);const random=mulberry32(hashString(`${state.seed}|${state.year}|${event.id}|simulation`)),teams=eventTeams(state,event);let participants=[];
  for(const team of teams){const roster=team.id.startsWith('nation-')||team.id.startsWith('u23-nation-')?team.roster.map(id=>riderById(state,id)).filter(Boolean):rosterForTeam(state,team,event);participants.push(...roster.map(rider=>({rider,team})));}
  {const seen=new Set();participants=participants.filter(entry=>!seen.has(entry.rider.id)&&seen.add(entry.rider.id));}if(!participants.length){state.eventIndex+=1;return simulateNextEvent(state);}
  const gc=new Map(participants.map(({rider})=>[rider.id,0])),points=new Map(participants.map(({rider})=>[rider.id,0])),mountains=new Map(participants.map(({rider})=>[rider.id,0])),stages=[];
  for(let index=0;index<event.stageProfiles.length;index+=1){const profile=event.stageProfiles[index],ranked=participants.map(entry=>({...entry,score:stagePerformance(state,entry.rider,profile,event,entry.team,(random()-.5)*13)})).sort((a,b)=>b.score-a.score),topScore=ranked[0].score;ranked.forEach((entry,rank)=>{const gap=timeGapFromScore(topScore,entry.score,profile);gc.set(entry.rider.id,(gc.get(entry.rider.id)||0)+gap);points.set(entry.rider.id,(points.get(entry.rider.id)||0)+Math.max(0,25-rank));if(['mountain','hilly','puncheur'].includes(profile))mountains.set(entry.rider.id,(mountains.get(entry.rider.id)||0)+Math.max(0,15-rank));});const winner=ranked[0];stages.push({number:index+1,profile,winnerId:winner.rider.id,winnerName:winner.rider.name,teamId:winner.rider.teamId,top5:ranked.slice(0,5).map((entry,rank)=>({rank:rank+1,riderId:entry.rider.id,name:entry.rider.name,teamId:entry.rider.teamId,gap:timeGapFromScore(topScore,entry.score,profile)}))});if(event.stageProfiles.length>1)awardStageWin(state,winner.rider,event,profile);}
  const rawFinal=[...gc.entries()].map(([riderId,time])=>({rider:riderById(state,riderId),time})).filter(x=>x.rider).sort((a,b)=>a.time-b.time),final=normalizedClassification(rawFinal,event),winner=final[0].rider,pointsWinner=event.stageProfiles.length>1?[...points.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]:null,mountainWinner=event.stageProfiles.length>1?[...mountains.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]:null,youngWinner=event.stageProfiles.length>1?(final.find(entry=>entry.rider.age<=25)?.rider.id||null):null;
  const result={id:uniqueId('result',random),year:state.year,eventId:event.id,eventName:event.name,tier:event.tier,kind:event.kind,prestige:event.prestige,stages,winnerId:winner.id,winnerName:winner.name,winnerTeamId:winner.teamId,classification:final.slice(0,20).map((entry,rank)=>({rank:rank+1,riderId:entry.rider.id,name:entry.rider.name,teamId:entry.rider.teamId,time:entry.time,gap:entry.gap})),jerseys:{points:pointsWinner,mountains:mountainWinner,young:youngWinner},teams:teams.map(t=>t.id),month:event.month,day:event.day};
  commitEvent(state,event,result,participants,final);state.currentResult=result;state.eventResults.push(result);state.eventIndex+=1;state.lastRaceDay=startDay(state,event)+event.stageProfiles.length-1;state.currentDay=Math.max(state.currentDay,state.lastRaceDay);return{state,result,results:[result],seasonComplete:false};
}
function awardStageWin(state,rider,event,profile){recordStage(rider.currentSeason,event,profile,state.year);recordStage(rider.career,event,profile,state.year);const team=teamById(state,rider.teamId);if(team){recordStage(team.currentSeason,event,profile,state.year);recordStage(team.career,event,profile,state.year);const director=directorById(state,team.directorId);if(director){recordStage(director.currentSeason,event,profile,state.year);recordStage(director.career,event,profile,state.year);}}}
function commitEvent(state,event,result,participants,final){
  const winner=riderById(state,result.winnerId);recordWin(winner.currentSeason,event,state.year);recordWin(winner.career,event,state.year);if(event.id==='worlds-road'||event.id==='worlds-tt')winner.career.worlds=(winner.career.worlds||0)+1;
  const winnerTeam=teamById(state,winner.teamId);if(winnerTeam){recordWin(winnerTeam.currentSeason,event,state.year);recordWin(winnerTeam.career,event,state.year);const director=directorById(state,winnerTeam.directorId);if(director){recordWin(director.currentSeason,event,state.year);recordWin(director.career,event,state.year);}}
  for(const [type,id] of Object.entries(result.jerseys).filter(([,value])=>Boolean(value))){const r=riderById(state,id);if(r){recordJersey(r.currentSeason,event,type,state.year);recordJersey(r.career,event,type,state.year);const t=teamById(state,r.teamId);if(t){recordJersey(t.currentSeason,event,type,state.year);recordJersey(t.career,event,type,state.year);const d=directorById(state,t.directorId);if(d){recordJersey(d.currentSeason,event,type,state.year);recordJersey(d.career,event,type,state.year);}}}}
  awardUciPoints(state,event,result);
  final.slice(0,10).forEach((entry,index)=>{const rider=entry.rider;increment(rider.currentSeason,'starts',1,event.tier);increment(rider.career,'starts',1,event.tier);if(index<3){increment(rider.currentSeason,'podiums',1,event.tier);increment(rider.career,'podiums',1,event.tier);}increment(rider.currentSeason,'top10',1,event.tier);increment(rider.career,'top10',1,event.tier);const rec={eventId:event.id,event:event.name,rank:index+1,year:state.year,tier:event.tier,kind:event.kind};rider.currentSeason.bestResults.push(rec);rider.currentSeason.bestResults.sort((a,b)=>resultValue(b,state)-resultValue(a,state));rider.currentSeason.bestResults=rider.currentSeason.bestResults.slice(0,10);if(index<5)rider.career.results.push({...rec,prestige:event.prestige});rider.career.results=rider.career.results.slice(-180);if(event.kind==='grand-tour')rider.currentSeason.grandTourResults.push({eventId:event.id,event:event.name,rank:index+1});});
  for(const{rider}of participants){const days=event.stageProfiles.length;rider.raceDays+=days;increment(rider.currentSeason,'raceDays',days,event.tier);increment(rider.career,'raceDays',days,event.tier);rider.fatigue=clamp(rider.fatigue+days*(event.kind==='grand-tour'?2.3:1.7),0,100);rider.form=clamp(rider.form+(rider.targetEvents.includes(event.id)?2:-1)-Math.max(0,rider.fatigue-70)*.05,30,92);}
  event.editions=event.editions||[];event.editions.push({year:state.year,winnerId:result.winnerId,winnerName:result.winnerName,teamId:result.winnerTeamId,tier:event.tier,top10:result.classification.slice(0,10),stageWinners:result.stages.map(s=>({riderId:s.winnerId,name:s.winnerName,teamId:s.teamId,profile:s.profile})),jerseys:result.jerseys,jerseyWinners:Object.fromEntries(Object.entries(result.jerseys).map(([type,id])=>[type,id?{id,name:riderById(state,id)?.name||id,teamId:riderById(state,id)?.teamId||null}:null]))});
  state.news.unshift(buildEventStory(state,event,result,final));state.news=state.news.slice(0,180);
}
function resultValue(result,state){const event=eventById(state,result.eventId);return(event?.prestige||50)*5-(result.rank||20)*10;}
function buildEventStory(state,event,result,final){const winner=riderById(state,result.winnerId),runner=final[1]?.rider,surprise=currentAbility(winner)<82,fatigueText=winner.raceDays>55?` after already accumulating ${winner.raceDays} race days`:' after a protected build-up',past=(event.editions||[]).filter(e=>e.winnerId===winner.id).length;let headline=`${winner.name} wins ${event.name}`;if(surprise)headline=`Shock in ${event.name}: ${winner.name} breaks through`;else if(past>1)headline=`${winner.name} masters ${event.name} again`;const body=event.stageProfiles.length>1?`${winner.name} completed the ${event.stageProfiles.length}-stage race ahead of ${runner?.name||'the field'}${fatigueText}. ${result.stages.filter(stage=>stage.winnerId===winner.id).length} stage win(s) supported the final classification.`:`${winner.name} defeated ${runner?.name||'the leading contenders'} in a ${event.stageProfiles[0].replace('-',' ')} contest.`;return{year:state.year,phase:'season',eventId:event.id,category:event.kind==='grand-tour'?'Grand Tour':event.kind==='monument'?'Monuments':event.tier==='u23'?'Young Wheels':'Race report',importance:event.prestige>=96?'lead':surprise?'major':'normal',headline,body,riderIds:[winner.id,...(runner?[runner.id]:[])]};}

export function simulateWeeks(state,weeks=1){
  upgradeUniverse(state);if(state.seasonStatus==='complete')return{state,results:[],seasonComplete:true,archive:state.pendingArchive};const target=Math.min(365,state.currentDay+Math.max(1,weeks)*7),results=[];while(state.eventIndex<state.events.length&&startDay(state,state.events[state.eventIndex])<=target){const out=simulateNextEvent(state);if(out.result)results.push(out.result);if(state.seasonStatus==='complete')break;}state.currentDay=Math.max(state.currentDay,target);if(state.currentDay>=365||state.eventIndex>=state.events.length){while(state.eventIndex<state.events.length){const out=simulateNextEvent(state);if(out.result)results.push(out.result);}const finish=completeSeason(state);return{...finish,results,seasonComplete:true};}return{state,results,seasonComplete:false};
}
export function simulateSeason(state){upgradeUniverse(state);if(state.seasonStatus==='complete')return{state,results:[],seasonComplete:true,archive:state.pendingArchive};const results=[];while(state.eventIndex<state.events.length){const out=simulateNextEvent(state);if(out.result)results.push(out.result);}const finish=completeSeason(state);return{...finish,results,seasonComplete:true};}
function seasonSnapshot(book){return{points:book.uciPoints,raceWins:book.raceWins,stageWins:book.stageWins,grandTours:book.grandTours,monuments:book.monuments,weeklong:book.weeklong,classics:book.classics,championships:book.championships,jerseys:book.jerseys,raceDays:book.raceDays,raceWinDetails:structuredClone(book.raceWinDetails||[]),stageWinDetails:structuredClone(book.stageWinDetails||[]),jerseyWinDetails:structuredClone(book.jerseyWinDetails||[]),stageWinsByProfile:structuredClone(book.stageWinsByProfile||{})};}
function archiveSeason(state){
  const riderRanking=state.riders.filter(r=>!r.retired||r.currentSeason.uciPoints>0).sort((a,b)=>b.currentSeason.uciPoints-a.currentSeason.uciPoints).slice(0,50).map((r,index)=>({rank:index+1,id:r.id,name:r.name,teamId:r.teamId,tier:r.tier,points:r.currentSeason.uciPoints,raceWins:r.currentSeason.raceWins,stageWins:r.currentSeason.stageWins,grandTours:r.currentSeason.grandTours,monuments:r.currentSeason.monuments}));
  const teamRanking=state.teams.filter(t=>t.status==='active').sort((a,b)=>b.uciPoints-a.uciPoints).map((t,index)=>({rank:index+1,id:t.id,name:t.name,tier:t.tier,points:t.uciPoints,raceWins:t.currentSeason.raceWins,stageWins:t.currentSeason.stageWins}));
  const directorRanking=state.directors.filter(d=>!d.retired).sort((a,b)=>b.currentSeason.uciPoints-a.currentSeason.uciPoints).slice(0,50).map((d,index)=>({rank:index+1,id:d.id,name:d.name,teamId:d.teamId,points:d.currentSeason.uciPoints,raceWins:d.currentSeason.raceWins}));
  const raceWinners=state.eventResults.map(r=>({eventId:r.eventId,eventName:r.eventName,winnerId:r.winnerId,winnerName:r.winnerName,teamId:r.winnerTeamId,tier:r.tier,stageWinners:r.stages.map(s=>({riderId:s.winnerId,profile:s.profile})),jerseys:r.jerseys}));
  for(const rider of state.riders){if(rider.retired&&rider.currentSeason.uciPoints===0)continue;rider.career.seasonCount+=1;rider.hallScore=hallScore(rider);rider.career.seasons.push({year:state.year,teamId:rider.teamId,teamName:teamById(state,rider.teamId)?.name||'Independent',tier:rider.tier,...seasonSnapshot(rider.currentSeason),grandTourResults:structuredClone(rider.currentSeason.grandTourResults)});const last=rider.career.teams.at(-1);if(last&&last.teamId===rider.teamId&&last.to===state.year-1)last.to=state.year;else if(!last||last.teamId!==rider.teamId)rider.career.teams.push({teamId:rider.teamId,from:state.year,to:state.year});}
  for(const team of state.teams){team.career.seasonCount+=1;team.career.seasons.push({year:state.year,name:team.name,tier:team.tier,...seasonSnapshot(team.currentSeason),directorId:team.directorId});}
  for(const director of state.directors){if(director.retired&&director.currentSeason.uciPoints===0)continue;director.career.seasonCount+=1;director.career.seasons.push({year:state.year,teamId:director.teamId,teamName:director.teamId?teamById(state,director.teamId)?.name:'Agency',tier:director.teamId?teamById(state,director.teamId)?.tier:'agency',...seasonSnapshot(director.currentSeason)});const last=director.career.teams.at(-1);if(director.teamId){if(last&&last.teamId===director.teamId&&last.to===state.year-1)last.to=state.year;else if(!last||last.teamId!==director.teamId)director.career.teams.push({teamId:director.teamId,from:state.year,to:state.year});}}
  const headline=riderRanking[0]?`${riderRanking[0].name} closes ${state.year} as world number one.`:'Season complete';
  return{year:state.year,riderRanking,teamRanking,directorRanking,raceWinners,headline,summary:{topRider:riderRanking[0]||null,topTeam:teamRanking[0]||null,mostWins:[...riderRanking].sort((a,b)=>b.raceWins-a.raceWins)[0]||null,mostStages:[...riderRanking].sort((a,b)=>b.stageWins-a.stageWins)[0]||null}};
}
function completeSeason(state){
  if(state.seasonStatus==='complete'&&state.pendingArchive)return{state,result:null,seasonComplete:true,archive:state.pendingArchive};const archive=archiveSeason(state);state.pendingArchive=archive;state.seasonStatus='complete';state.reviewMode=true;state.currentDay=dayOfYear(state.year,12,31);state.news.unshift({year:state.year,phase:'postseason',category:'Season review',importance:'lead',headline:archive.headline,body:`${archive.summary.topTeam?.name||'The leading team'} topped the team table. ${archive.summary.mostWins?.name||'The leading winner'} recorded the most race victories and ${archive.summary.mostStages?.name||'the leading sprinter'} collected the most stages.`});return{state,result:null,seasonComplete:true,archive};
}
export function openNextSeason(state){
  upgradeUniverse(state);if(state.seasonStatus!=='complete')return{state,opened:false};const archive=state.pendingArchive||archiveSeason(state);if(!state.archives.some(a=>a.year===archive.year))state.archives.push(archive);state.pendingArchive=null;state.year+=1;for(const rider of state.riders)if(!rider.retired)rider.age+=1;for(const director of state.directors)if(!director.retired)director.age+=1;applyRetirementsAndDevelopment(state);applyTeamLifecycle(state);applyTransfers(state);applySponsors(state);applyDirectorMarket(state);evolveEvents(state);prepareSeason(state);state.news.unshift({year:state.year,phase:'preseason',category:'New season',importance:'lead',headline:`Le Grand Braquet presents the ${state.year} peloton`,body:'New sponsors, promoted prospects, director moves and revised calendars open another season.'});return{state,opened:true,archive};
}

export function hallScore(rider){const c=rider.career,details=c.raceWinDetails||[];let major=0;if(details.length){for(const win of details){if(win.eventId==='tour')major+=2600;else if(win.eventId==='giro')major+=1900;else if(win.eventId==='vuelta')major+=1700;else if(win.kind==='monument')major+=900;else if(win.eventId==='worlds-road'||win.eventId==='worlds-tt')major+=1400;else if(win.kind==='championship')major+=600;else if(['stage','u23-stage'].includes(win.kind))major+=240;else major+=120;}}else major=(c.grandTours||0)*1950+(c.monuments||0)*900+(c.worlds||0)*1400+(c.weeklong||0)*240+(c.classics||0)*120;const dominance=Math.max(0,(c.grandTours||0)-2)*140+Math.max(0,(c.monuments||0)-5)*70;return Math.round(major+dominance+(c.stageWins||0)*32+(c.podiums||0)*12+(c.jerseys||0)*24+(c.uciPoints||0)*.06);}
export function teamHallScore(team){const c=team.career;return Math.round((c.grandTours||0)*1500+(c.monuments||0)*900+(c.weeklong||0)*240+(c.classics||0)*150+(c.raceWins||0)*85+(c.stageWins||0)*38+(c.jerseys||0)*25+(c.uciPoints||0)*.08);}
export function directorHallScore(director){const c=director.career;return Math.round((c.grandTours||0)*1250+(c.monuments||0)*750+(c.weeklong||0)*210+(c.raceWins||0)*70+(c.stageWins||0)*30+(c.uciPoints||0)*.06+director.ability*8);}

function applyRetirementsAndDevelopment(state){
  const random=mulberry32(hashString(`${state.seed}|${state.year}|development`)),usedNames=new Set(state.riders.map(r=>r.name));
  for(const rider of state.riders.filter(r=>!r.retired)){const agePressure=rider.age<rider.retirementAge?0:clamp(.22+(rider.age-rider.retirementAge)*.18,.22,.9);if(random()<agePressure){rider.retired=true;rider.history.push({year:state.year,text:'Retired from the tracked peloton.'});const team=teamById(state,rider.teamId);if(team)team.roster=team.roster.filter(id=>id!==rider.id);}}
  const continental=state.teams.filter(t=>t.tier==='continental'&&t.status==='active');
  for(const rider of state.riders.filter(r=>!r.retired&&r.tier==='u23'&&r.age>=23)){const old=teamById(state,rider.teamId);if(old)old.roster=old.roster.filter(id=>id!==rider.id);const destination=continental.sort((a,b)=>a.roster.length-b.roster.length||b.reputation-a.reputation)[0];if(destination&&currentAbility(rider)>=65){if(destination.roster.length>=TIER_ROSTER.continental){const weakest=destination.roster.map(id=>riderById(state,id)).filter(Boolean).sort((a,b)=>currentAbility(a)-currentAbility(b))[0];if(weakest&&currentAbility(weakest)<currentAbility(rider)){weakest.retired=true;destination.roster=destination.roster.filter(id=>id!==weakest.id);}}if(destination.roster.length<TIER_ROSTER.continental){rider.teamId=destination.id;rider.tier='continental';destination.roster.push(rider.id);rider.history.push({year:state.year,text:`Moved into the continental market with ${destination.name}.`});}else rider.retired=true;}else rider.retired=true;}
  for(const team of state.teams.filter(t=>t.tier==='u23'))while(team.roster.length<TIER_ROSTER.u23){const rider=makeRider(random,{teamId:team.id,tier:'u23',usedNames,ageRange:[18,19],year:state.year});state.riders.push(rider);team.roster.push(rider.id);if(['generational','legend','epic'].includes(rider.rarity)){state.prospectSpawns.unshift({year:state.year,riderId:rider.id,riderName:rider.name,age:rider.age,nationality:rider.nationality,rarity:rider.rarity,potential:rider.potential,rating:Math.round(currentAbility(rider)),teamId:team.id,teamName:team.name});state.prospectSpawns=state.prospectSpawns.slice(0,300);}}
  for(const team of continental)while(team.roster.length<TIER_ROSTER.continental){const rider=makeRider(random,{teamId:team.id,tier:'continental',usedNames,ageRange:[20,27],year:state.year});state.riders.push(rider);team.roster.push(rider.id);}
}
function candidateScoreForTeam(state,rider,team,random){const ability=currentAbility(rider),potential=rider.potential,profileNeed=team.roster.map(id=>riderById(state,id)).filter(Boolean).filter(r=>r.terrain===rider.terrain).length<3?6:0,tierPenalty=team.tier==='worldtour'&&ability<72?-20:team.tier==='proseries'&&ability>91?-8:0;return ability*.55+potential*.35+team.attraction*.18+profileNeed+tierPenalty+random()*8;}
function moveRider(state,rider,destination,year,type='transfer',fromId=null){
  const old=teamById(state,rider.teamId);const origin=fromId||old?.id||rider.marketFrom||'free';
  if(old)old.roster=old.roster.filter(id=>id!==rider.id);
  if(!destination.roster.includes(rider.id))destination.roster.push(rider.id);
  rider.teamId=destination.id;rider.tier=destination.tier;rider.marketFrom=null;rider.contractYears=randInt(mulberry32(hashString(`${rider.id}|${year}|contract`)),2,4);
  rider.history.push({year,text:`Joined ${destination.name}.`});const previousArchive=state.archives.at(-1),lastYearRank=previousArchive?.riderRanking?.find(x=>x.id===rider.id)?.rank||null,originTeam=teamById(state,origin);state.transfers.unshift({year,riderId:rider.id,riderName:rider.name,from:origin,to:destination.id,type,age:rider.age,rarity:rider.rarity,potential:rider.potential,rating:Math.round(currentAbility(rider)),lastYearRank,fromName:originTeam?.name||origin,toName:destination.name,fromTier:originTeam?.tier||rider.tier,toTier:destination.tier});
}
function cleanRosters(state){
  for(const team of state.teams){const seen=new Set();team.roster=(team.roster||[]).filter(id=>{const rider=riderById(state,id);if(!rider||rider.retired||rider.teamId!==team.id||seen.has(id))return false;seen.add(id);return true;});}
}
function refillLowerTiers(state,random){
  const usedNames=new Set(state.riders.map(r=>r.name));
  for(const team of state.teams.filter(t=>t.status==='active'&&t.tier==='u23'))while(team.roster.length<TIER_ROSTER.u23){const rider=makeRider(random,{teamId:team.id,tier:'u23',usedNames,ageRange:[18,19],year:state.year});state.riders.push(rider);team.roster.push(rider.id);if(['generational','legend','epic'].includes(rider.rarity)){state.prospectSpawns.unshift({year:state.year,riderId:rider.id,riderName:rider.name,age:rider.age,nationality:rider.nationality,rarity:rider.rarity,potential:rider.potential,rating:Math.round(currentAbility(rider)),teamId:team.id,teamName:team.name});state.prospectSpawns=state.prospectSpawns.slice(0,300);}}
  for(const team of state.teams.filter(t=>t.status==='active'&&t.tier==='continental'))while(team.roster.length<TIER_ROSTER.continental){const rider=makeRider(random,{teamId:team.id,tier:'continental',usedNames,ageRange:[20,27],year:state.year});state.riders.push(rider);team.roster.push(rider.id);}
}
function applyTransfers(state){
  const random=mulberry32(hashString(`${state.seed}|${state.year}|transfers`)),proTeams=state.teams.filter(t=>['worldtour','proseries'].includes(t.tier)&&t.status==='active');
  cleanRosters(state);for(const rider of state.riders.filter(r=>!r.retired))setAnnualRiderValues(rider,state.year);
  const expired=[];
  for(const rider of state.riders.filter(r=>!r.retired&&['worldtour','proseries'].includes(r.tier))){
    rider.contractYears=(rider.contractYears||1)-1;
    if(rider.contractYears<=0){const old=teamById(state,rider.teamId);rider.marketFrom=old?.id||null;if(old)old.roster=old.roster.filter(id=>id!==rider.id);rider.teamId=null;expired.push(rider);}
  }
  const signed=new Set();
  const available=()=>[
    ...expired.filter(r=>!r.retired&&!signed.has(r.id)&&!r.teamId),
    ...state.riders.filter(r=>!r.retired&&!signed.has(r.id)&&r.tier==='u23'&&r.age>=21),
    ...state.riders.filter(r=>!r.retired&&!signed.has(r.id)&&r.tier==='continental')
  ];
  const ordered=[...proTeams].sort((a,b)=>b.attraction-a.attraction||b.reputation-a.reputation);
  for(const team of ordered){
    while(team.roster.length<TIER_ROSTER[team.tier]){
      const candidates=available().filter(r=>team.tier!=='worldtour'||r.potential>=78||currentAbility(r)>=76).map(r=>({r,score:candidateScoreForTeam(state,r,team,random)})).sort((a,b)=>b.score-a.score);
      let choice=candidates[0]?.r;
      if(!choice){const used=new Set(state.riders.map(r=>r.name));choice=makeRider(random,{teamId:null,tier:team.tier,usedNames:used,ageRange:[21,24],year:state.year});choice.marketFrom='new-pro';state.riders.push(choice);}
      const origin=choice.teamId||choice.marketFrom||'development';signed.add(choice.id);moveRider(state,choice,team,state.year,choice.tier==='u23'?'promotion':'transfer',origin);
    }
  }
  // Unsigned professionals fall into the continental/free-agency layer or leave the tracked world.
  const continental=state.teams.filter(t=>t.tier==='continental'&&t.status==='active').sort((a,b)=>a.roster.length-b.roster.length||b.reputation-a.reputation);
  for(const rider of expired.filter(r=>!signed.has(r.id))){const destination=continental.find(t=>t.roster.length<TIER_ROSTER.continental);if(destination&&currentAbility(rider)>=61)moveRider(state,rider,destination,state.year,'free-agent',rider.marketFrom);else{rider.retired=true;rider.marketFrom=null;rider.history.push({year:state.year,text:'Left the tracked professional market after contract expiry.'});}}
  cleanRosters(state);refillLowerTiers(state,random);cleanRosters(state);
  state.transfers=state.transfers.slice(0,500);
}
const SPONSOR_NAMES=['Aurora Mobility','Helix Nutrition','NordBank','VeloNova','Atlas Energy','Redwood Systems','Solara','Terra Foods','Axiom Cloud','Pioneer Health','Granite Finance','BluePeak','Mercury Telecom','NovaSport','Orion Motors','Summit Insurance'];
const TEAM_IDENTITY_WORDS=['Velocity','Endurance','Summit','Horizon','Pioneer','Heritage','National','Performance','Road','Grand Tour'];
function newProfessionalTeam(state,random,tier='proseries'){
  const nationality=chooseNationality(random),sponsor=pick(random,SPONSOR_NAMES),id=uniqueId('org',random),budget=tier==='worldtour'?randInt(random,72,86):randInt(random,55,74),attraction=clamp(budget+randInt(random,-4,7),45,94),team=makeTeam(random,[id,`${sponsor} ${tier==='worldtour'?'Cycling Team':'Pro Cycling'}`,nationality,budget,attraction],tier);
  team.identity=`${nationality} ${pick(random,TEAM_IDENTITY_WORDS)} Cycling Project`;team.founded=state.year;team.history=[{year:state.year,type:'founded',name:team.name},{year:state.year,type:'sponsor',name:team.name}];team.sponsor={name:sponsor,investment:budget,attraction,started:state.year,expires:state.year+randInt(random,2,5)};return team;
}
function releaseTeamRider(state,team,rider,reason){team.roster=team.roster.filter(id=>id!==rider.id);rider.marketFrom=team.id;rider.teamId=null;rider.contractYears=0;rider.history.push({year:state.year,text:reason});}
function applyTeamLifecycle(state){
  const random=mulberry32(hashString(`${state.seed}|${state.year}|team-lifecycle`));cleanRosters(state);
  if((state.year-2026)%3===0){
    const world=state.teams.filter(t=>t.status==='active'&&t.tier==='worldtour').sort((a,b)=>a.cyclePoints-b.cyclePoints),pro=state.teams.filter(t=>t.status==='active'&&t.tier==='proseries').sort((a,b)=>b.cyclePoints-a.cyclePoints),changes=Math.min(2,world.length,pro.length);
    for(let i=0;i<changes;i+=1){const relegated=world[i],promoted=pro[i];relegated.tier='proseries';promoted.tier='worldtour';relegated.history.push({year:state.year,type:'relegation',from:'worldtour',to:'proseries'});promoted.history.push({year:state.year,type:'promotion',from:'proseries',to:'worldtour'});while(relegated.roster.length>TIER_ROSTER.proseries){const weakest=relegated.roster.map(id=>riderById(state,id)).filter(Boolean).sort((a,b)=>currentAbility(a)-currentAbility(b))[0];if(!weakest)break;releaseTeamRider(state,relegated,weakest,`Released after ${relegated.identity} was relegated to ProSeries.`);}}
    for(const team of [...world,...pro])team.cyclePoints=0;
  }
  // Financial failure is uncommon, but the professional world is not immortal.
  for(const team of state.teams.filter(t=>t.status==='active'&&t.tier==='proseries')){
    const weakSeason=(team.currentSeason?.uciPoints||0)<120,foldChance=weakSeason?.025:.006;if(random()>=foldChance)continue;
    team.status='inactive';team.history.push({year:state.year,type:'dissolved',name:team.name});for(const id of [...team.roster]){const rider=riderById(state,id);if(rider)releaseTeamRider(state,team,rider,`${team.name} dissolved; entered the open market.`);}const director=directorById(state,team.directorId);if(director){setDirectorAgency(state,director,pick(random,state.directorAgencies));team.directorId=null;}
  }
  while(state.teams.filter(t=>t.status==='active'&&t.tier==='proseries').length<16){const team=newProfessionalTeam(state,random,'proseries');state.teams.push(team);state.news.unshift({year:state.year,phase:'preseason',category:'New project',importance:'major',headline:`${team.name} enters professional cycling`,body:`The new ${team.nationality} organization begins in ProSeries with a ${team.budget}-level budget and an open roster.`});}
  cleanRosters(state);
}
function applySponsors(state){const random=mulberry32(hashString(`${state.seed}|${state.year}|sponsors`));for(const team of state.teams.filter(t=>['worldtour','proseries'].includes(t.tier)&&t.status==='active')){if(team.sponsor?.expires>state.year)continue;const renewal=.52+(team.career.uciPoints>1200?.2:0)-(team.currentSeason.uciPoints<250?.12:0);if(random()<renewal){team.sponsor.expires=state.year+randInt(random,2,5);team.sponsor.investment=clamp(team.sponsor.investment+randInt(random,-4,7),45,98);team.budget=team.sponsor.investment;continue;}const sponsor=pick(random,SPONSOR_NAMES),previous=team.name,investment=clamp(team.budget+randInt(random,-10,14),team.tier==='worldtour'?67:48,98),attraction=clamp(investment+randInt(random,-6,8),45,98);team.name=team.tier==='worldtour'?`${sponsor} Cycling Team`:`${sponsor} Pro Cycling`;team.sponsor={name:sponsor,investment,attraction,started:state.year,expires:state.year+randInt(random,2,5)};team.budget=investment;team.attraction=attraction;team.history.push({year:state.year,type:'sponsor',name:team.name,previous});state.sponsorLog.unshift({year:state.year,teamId:team.id,identity:team.identity,previous,next:team.name});}state.sponsorLog=state.sponsorLog.slice(0,300);}
function setDirectorAgency(state,director,agency){if(director.agencyId){const old=state.directorAgencies.find(a=>a.id===director.agencyId);if(old)old.directorIds=old.directorIds.filter(id=>id!==director.id);}director.teamId=null;director.agencyId=agency.id;if(!agency.directorIds.includes(director.id))agency.directorIds.push(director.id);}
function appointDirector(state,director,team){if(director.teamId){const old=teamById(state,director.teamId);if(old&&old.directorId===director.id)old.directorId=null;}if(director.agencyId){const agency=state.directorAgencies.find(a=>a.id===director.agencyId);if(agency)agency.directorIds=agency.directorIds.filter(id=>id!==director.id);}const previous=team.directorId?directorById(state,team.directorId):null;if(previous&&previous.id!==director.id)setDirectorAgency(state,previous,pick(mulberry32(hashString(`${previous.id}|agency`)),state.directorAgencies));director.teamId=team.id;director.agencyId=null;team.directorId=director.id;director.history.push({year:state.year,text:`Appointed by ${team.name}.`});state.directorMoves.unshift({year:state.year,directorId:director.id,directorName:director.name,to:team.id,from:previous?.teamId||'agency'});}
function applyDirectorMarket(state){
  const random=mulberry32(hashString(`${state.seed}|${state.year}|directors`)),usedNames=new Set([...state.riders,...state.directors].map(x=>x.name));let retiredCount=0;
  for(const d of state.directors.filter(d=>!d.retired)){if(d.age>=d.retirementAge&&random()<.45){d.retired=true;retiredCount++;if(d.teamId){const t=teamById(state,d.teamId);if(t)t.directorId=null;}if(d.agencyId){const a=state.directorAgencies.find(a=>a.id===d.agencyId);if(a)a.directorIds=a.directorIds.filter(id=>id!==d.id);}d.history.push({year:state.year,text:'Retired from race direction.'});}}
  for(let i=0;i<retiredCount;i++){const agency=pick(random,state.directorAgencies),d=makeDirector(random,{agencyId:agency.id,usedNames,year:state.year});agency.directorIds.push(d.id);state.directors.push(d);}
  const tierRank={worldtour:4,proseries:3,u23:2,continental:1};const teams=[...state.teams.filter(t=>t.status==='active')].sort((a,b)=>(tierRank[b.tier]||0)-(tierRank[a.tier]||0));
  for(const team of teams){const current=directorById(state,team.directorId),pool=state.directors.filter(d=>!d.retired&&(d.agencyId||(d.teamId&&teamById(state,d.teamId)?.tier!==team.tier))).map(d=>({d,score:d.ability*.55+d.recruitment*.2+d.development*.15+d.reputation*.1+random()*5})).sort((a,b)=>b.score-a.score),best=pool[0]?.d;if(!current&&best)appointDirector(state,best,team);else if(best&&random()<.07&&best.ability>current.ability+4)appointDirector(state,best,team);}
  for(const team of teams.filter(t=>!t.directorId)){const agency=pick(random,state.directorAgencies),d=makeDirector(random,{agencyId:agency.id,usedNames,year:state.year});agency.directorIds.push(d.id);state.directors.push(d);appointDirector(state,d,team);}
  state.directorMoves=state.directorMoves.slice(0,300);
}
function evolveEvents(state){if((state.year-2025)%3!==0)return;const random=mulberry32(hashString(`${state.seed}|${state.year}|event-status`)),candidates=state.events.filter(e=>['proseries','continental'].includes(e.tier));shuffle(random,candidates).slice(0,3).forEach(event=>{const old=event.tier;if(event.tier==='continental'&&event.prestige>=55&&random()<.55){event.tier='proseries';event.prestige=clamp(event.prestige+7,0,85);}else if(event.tier==='proseries'&&event.prestige>=72&&random()<.22){event.tier='worldtour';event.prestige=clamp(event.prestige+8,0,92);}else event.prestige=clamp(event.prestige+randInt(random,-5,5),42,92);event.history.push({year:state.year,type:'status',from:old,to:event.tier,prestige:event.prestige});});}

export function topRiders(state,limit=20){return state.riders.filter(r=>!r.retired).sort((a,b)=>currentAbility(b)-currentAbility(a)).slice(0,limit);}
export function hallOfFame(state,limit=25){return state.riders.filter(r=>r.career.seasonCount>0||r.retired).map(r=>({...r,hallScore:hallScore(r)})).sort((a,b)=>b.hallScore-a.hallScore).slice(0,limit);}
function indexesFor(state){
  let cached=INDEX_CACHE.get(state);
  const signature=`${state.riders?.length||0}|${state.teams?.length||0}|${state.directors?.length||0}|${state.events?.length||0}`;
  if(!cached||cached.signature!==signature){cached={signature,riders:new Map((state.riders||[]).map(x=>[x.id,x])),teams:new Map((state.teams||[]).map(x=>[x.id,x])),directors:new Map((state.directors||[]).map(x=>[x.id,x])),events:new Map((state.events||[]).map(x=>[x.id,x]))};INDEX_CACHE.set(state,cached);}
  return cached;
}
export function teamById(state,id){return id?indexesFor(state).teams.get(id):undefined;}
export function riderById(state,id){return id?indexesFor(state).riders.get(id):undefined;}
export function directorById(state,id){return id?indexesFor(state).directors.get(id):undefined;}
export function eventById(state,id){return id?indexesFor(state).events.get(id):undefined;}
export function eventCategory(event){return event.kind==='grand-tour'?'grand-tour':event.kind==='monument'?'monument':['stage','u23-stage'].includes(event.kind)?'stage-race':['one-day','u23-one-day'].includes(event.kind)?'classic':'championship';}
