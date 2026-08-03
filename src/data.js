export const WORLD_TEAMS = [
  ['alpecin','Alpecin – Premier Tech','BEL',86,84],
  ['bahrain','Bahrain Victorious','BRN',83,82],
  ['decathlon','Decathlon CMA CGM Team','FRA',87,88],
  ['ef','EF Education – EasyPost','USA',83,84],
  ['groupama','Groupama – FDJ United','FRA',82,82],
  ['ineos','INEOS Grenadiers','GBR',90,91],
  ['lidl','Lidl – Trek','GER',89,90],
  ['lotto','Lotto Intermarché','BEL',82,81],
  ['movistar','Movistar Team','ESP',84,84],
  ['nsn','NSN Cycling Team','SUI',83,85],
  ['redbull','Red Bull – BORA – hansgrohe','GER',91,92],
  ['soudal','Soudal Quick-Step','BEL',88,88],
  ['jayco','Team Jayco AlUla','AUS',82,82],
  ['picnic','Team Picnic PostNL','NED',79,77],
  ['visma','Team Visma | Lease a Bike','NED',93,94],
  ['uae','UAE Team Emirates XRG','UAE',95,96],
  ['unox','Uno-X Mobility','NOR',81,80],
  ['astana','XDS Astana Team','KAZ',82,83]
];

export const PRO_TEAMS = [
  ['bardiani','Bardiani CSF','ITA',69,67], ['burgos','Burgos – Burpellet – BH','ESP',69,67],
  ['cajarural','Caja Rural – Seguros RGA','ESP',71,69], ['cofidis','Cofidis','FRA',78,77],
  ['kern','Equipo Kern Pharma','ESP',73,71], ['euskaltel','Euskaltel – Euskadi','ESP',72,70],
  ['mbh','MBH Bank CSB Telecom Fort','HUN',67,68], ['modern','Modern Adventure Pro Cycling','USA',69,72],
  ['q365','Pinarello – Q36.5 Pro Cycling Team','SUI',77,79], ['flanders','Team Flanders – Baloise','BEL',73,70],
  ['novo','Team Novo Nordisk','USA',66,70], ['polti','Team Polti VisitMalta','ITA',71,70],
  ['toscana','Toscana Nippo Rali','ITA',67,66], ['total','TotalEnergies','FRA',75,74],
  ['tudor','Tudor Pro Cycling Team','SUI',80,83], ['unibet','Unibet Rose Rockets','FRA',71,74]
];

export const TEAM_IDENTITIES = {
  alpecin:'Flanders Multi-Surface Project', bahrain:'Bahrain Cycling Project', decathlon:'AG2R French Cycling', ef:'Slipstream Sports',
  groupama:'FDJ Cycling Project', ineos:'British Performance Cycling', lidl:'Trek Factory Racing', lotto:'Belgian Lottery Cycling',
  movistar:'Abarca Sports', nsn:'Swiss Global Cycling', redbull:'BORA German Cycling', soudal:'Quick-Step Cycling', jayco:'GreenEDGE Cycling',
  picnic:'Dutch Development Cycling', visma:'Dutch High Performance Cycling', uae:'Emirates Global Cycling', unox:'Norwegian Mobility Cycling',
  astana:'Kazakhstan Cycling Project', bardiani:'Reverberi Cycling', burgos:'Burgos Cycling Project', cajarural:'Navarra Rural Cycling',
  cofidis:'Cofidis Competition', kern:'Kern Pharma Cycling', euskaltel:'Basque Cycling Foundation', mbh:'Central European Cycling',
  modern:'Modern Adventure Cycling', q365:'Q36.5 Swiss Cycling', flanders:'Flanders Development Team', novo:'Novo Nordisk Cycling',
  polti:'Basso Italian Cycling', toscana:'Toscana Cycling Project', total:'Vendée Cycling', tudor:'Tudor Swiss Cycling', unibet:'Rose Rockets Cycling'
};

// All riders and directors are generated procedurally. The country database is deliberately broad
// enough for cycling to globalize naturally over a long Chronicle save.
export const COUNTRY_DATABASE = {
  BE:{weight:14,first:['Wout','Jasper','Thibau','Arnaud','Tim','Jordi','Lennert','Sander'],last:['Van der Berg','De Smet','Vermeulen','Vandamme','De Clercq','Maes','Willems','Goossens']},
  FR:{weight:14,first:['Paul','Romain','Lenny','Mathieu','Clément','Victor','Alexis','Pierre'],last:['Martin','Bernard','Roux','Gautier','Lefèvre','Moreau','Dumont','Fontaine']},
  ES:{weight:13,first:['Carlos','Juan','Pablo','Mikel','Iker','Alejandro','Sergio','Unai'],last:['García','Rodríguez','Martínez','López','Sánchez','Fernández','Navarro','Molina']},
  IT:{weight:13,first:['Luca','Matteo','Filippo','Marco','Giulio','Andrea','Davide','Simone'],last:['Bianchi','Rossi','Ferrari','Conti','Romano','Gallo','Costa','Lombardi']},
  NL:{weight:10,first:['Daan','Thijs','Jeroen','Nils','Bram','Koen','Sven','Lars'],last:['De Jong','Van Dijk','Visser','Smit','Meijer','Bos','Mulder','Dekker']},
  GB:{weight:8,first:['Tom','Ben','Adam','Simon','Ethan','James','Oscar','Luke'],last:['Smith','Jones','Brown','Taylor','Wilson','Evans','Thomas','Wright']},
  US:{weight:7,first:['Matthew','Brandon','Logan','Eli','Cole','Nolan','Tyler','Caleb'],last:['Miller','Johnson','Davis','Anderson','Moore','Martin','Clark','Hall']},
  CO:{weight:7,first:['Santiago','Daniel','Einer','Miguel','Jhonatan','Andrés','Camilo','Esteban'],last:['Gómez','Ramírez','Rojas','Herrera','Castro','Vargas','Cárdenas','Pineda']},
  DK:{weight:6,first:['Mads','Jonas','Magnus','Søren','Mikkel','Kasper','Emil','Rasmus'],last:['Jensen','Nielsen','Hansen','Pedersen','Larsen','Kristensen','Madsen','Poulsen']},
  AU:{weight:6,first:['Jack','Luke','Ben','Caleb','Michael','Sam','Dylan','Jay'],last:['Williams','Brown','Wilson','Taylor','Anderson','Thomas','Martin','Harris']},
  DE:{weight:6,first:['Maximilian','Nils','Florian','Jonas','Georg','Marco','Felix','Lennard'],last:['Schmidt','Müller','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann']},
  PT:{weight:5,first:['João','Rui','António','Tiago','Miguel','Pedro','Nuno','Diogo'],last:['Silva','Santos','Ferreira','Pereira','Costa','Rodrigues','Martins','Sousa']},
  CH:{weight:5,first:['Marc','Stefan','Fabian','Mauro','Silvan','Noah','Jan','Robin'],last:['Müller','Meier','Schmid','Keller','Weber','Frei','Brunner','Widmer']},
  NO:{weight:5,first:['Tobias','Alexander','Sindre','Jonas','Anders','Kristian','Eirik','Marius'],last:['Hansen','Johansen','Olsen','Larsen','Andersen','Nilsen','Kristiansen','Karlsen']},
  SI:{weight:4,first:['Tadej','Primož','Matej','Jan','Luka','Miha','Žan','Jaka'],last:['Novak','Kovač','Krajnc','Zupan','Mlakar','Kos','Vidmar','Božič']},
  PL:{weight:3,first:['Michał','Jakub','Kamil','Piotr','Bartosz','Tomasz'],last:['Kowalski','Nowak','Wiśniewski','Wójcik','Kamiński','Lewandowski']},
  CZ:{weight:3,first:['Jan','Tomáš','Petr','Jakub','Martin','Lukáš'],last:['Novák','Svoboda','Dvořák','Černý','Procházka','Kučera']},
  AT:{weight:3,first:['Felix','Matthias','Lukas','Florian','Jakob','Daniel'],last:['Gruber','Huber','Bauer','Wagner','Moser','Steiner']},
  HR:{weight:2,first:['Luka','Ivan','Marko','Josip','Ante','Nikola'],last:['Horvat','Kovačević','Babić','Marić','Jurić','Novak']},
  RO:{weight:2,first:['Andrei','Mihai','Alexandru','Radu','Vlad','Ionuț'],last:['Popescu','Ionescu','Stan','Dumitru','Gheorghe','Marin']},
  JP:{weight:3,first:['Haruto','Ren','Yuki','Kaito','Sota','Takumi'],last:['Sato','Suzuki','Takahashi','Tanaka','Ito','Yamamoto']},
  ZA:{weight:3,first:['Ryan','Ethan','Liam','Milan','Johan','Calvin'],last:['Van der Merwe','Botha','Smith','Naidoo','Pretorius','Mokoena']},
  NZ:{weight:3,first:['Finn','George','Liam','Jack','Logan','Theo'],last:['Wilson','Taylor','Williams','Brown','King','Thompson']},
  CA:{weight:3,first:['Derek','Michael','Evan','Nathan','Lucas','Owen'],last:['Tremblay','Gagnon','Roy','Bouchard','Wilson','MacDonald']},
  IE:{weight:3,first:['Ben','Sean','Conor','Cian','Darragh','Eoin'],last:['Murphy','Kelly','O’Brien','Walsh','Byrne','Ryan']},
  MX:{weight:3,first:['Isaac','Emiliano','Santiago','Mateo','Diego','Ángel'],last:['Hernández','González','Ramírez','Torres','Flores','Cruz']},
  EC:{weight:3,first:['Richard','Jonathan','Jhon','Alexander','Kevin','Byron'],last:['Carvajal','Caicedo','Narváez','Mendoza','Guamán','Villacís']},
  ER:{weight:3,first:['Biniam','Natnael','Merhawi','Amanuel','Dawit','Henok'],last:['Tesfay','Berhane','Teklehaimanot','Ghebremedhin','Kudus','Debesay']},
  RW:{weight:2,first:['Joseph','Eric','Samuel','Moïse','Jean','Didier'],last:['Areruya','Munyaneza','Ndayisenga','Uwizeye','Habimana','Nsengimana']},
  MA:{weight:2,first:['Youssef','Omar','Hamza','Mehdi','Anas','Ayoub'],last:['El Amrani','Bennani','Alaoui','Idrissi','Mansouri','Fassi']},
  KE:{weight:2,first:['Samuel','Brian','Daniel','Peter','David','Kevin'],last:['Kiptoo','Kamau','Mwangi','Otieno','Kiprotich','Njoroge']},
  KZ:{weight:3,first:['Alexey','Dmitriy','Vadim','Nursultan','Arman','Mikhail'],last:['Smirnov','Ivanov','Sokolov','Tulegenov','Kozlov','Nurpeisov']},
  HU:{weight:2,first:['Attila','Bence','Márton','Gábor','Dávid','Ádám'],last:['Nagy','Kovács','Tóth','Szabó','Horváth','Varga']},
  SE:{weight:2,first:['Erik','Axel','Emil','Viktor','Oskar','Hugo'],last:['Andersson','Johansson','Karlsson','Nilsson','Eriksson','Larsson']},
  FI:{weight:1,first:['Mikko','Eero','Aleksi','Lauri','Joonas','Oskari'],last:['Korhonen','Virtanen','Mäkinen','Nieminen','Mäkelä','Laine']},
  LU:{weight:2,first:['Luc','Tom','Michel','Kevin','Nicolas','Mathieu'],last:['Schmit','Muller','Weber','Hoffmann','Wagner','Thill']},
  SK:{weight:2,first:['Peter','Martin','Jakub','Tomáš','Lukáš','Marek'],last:['Horváth','Kováč','Varga','Tóth','Nagy','Baláž']},
  LT:{weight:1,first:['Jonas','Mantas','Lukas','Tomas','Paulius','Darius'],last:['Kazlauskas','Jankauskas','Petrauskas','Stankevičius','Vasiliauskas','Žukauskas']},
  EE:{weight:1,first:['Mihkel','Kristjan','Martin','Karl','Rasmus','Siim'],last:['Tamm','Saar','Sepp','Kask','Mägi','Ilves']},
  GR:{weight:1,first:['Nikos','Giorgos','Dimitris','Kostas','Andreas','Yannis'],last:['Papadopoulos','Nikolaidis','Georgiou','Pappas','Vasileiou','Kostas']},
  TR:{weight:2,first:['Emre','Burak','Kerem','Mert','Arda','Can'],last:['Yılmaz','Kaya','Demir','Şahin','Çelik','Aydın']},
  IL:{weight:1,first:['Noam','Daniel','Itay','Ariel','Yonatan','Omer'],last:['Cohen','Levi','Mizrahi','Peretz','Biton','Friedman']},
  AR:{weight:2,first:['Matías','Tomás','Juan','Facundo','Nicolás','Franco'],last:['Fernández','Gómez','Díaz','Romero','Álvarez','Pereyra']},
  BR:{weight:2,first:['Lucas','Gabriel','Rafael','Mateus','João','Pedro'],last:['Silva','Santos','Oliveira','Souza','Pereira','Costa']},
  CL:{weight:2,first:['Vicente','Matías','Diego','Benjamín','Tomás','Felipe'],last:['González','Muñoz','Rojas','Díaz','Pérez','Soto']},
  VE:{weight:1,first:['José','Carlos','Luis','Daniel','Andrés','Miguel'],last:['González','Rodríguez','Pérez','Hernández','Martínez','Ramírez']},
  UY:{weight:1,first:['Santiago','Agustín','Martín','Facundo','Joaquín','Ignacio'],last:['Rodríguez','González','Martínez','Fernández','Pereira','Silva']},
  UA:{weight:2,first:['Oleksandr','Andrii','Maksym','Dmytro','Taras','Bohdan'],last:['Shevchenko','Kovalenko','Bondarenko','Tkachenko','Kravchenko','Melnyk']},
  CN:{weight:2,first:['Wei','Jun','Hao','Tao','Lei','Ming'],last:['Wang','Li','Zhang','Liu','Chen','Yang']},
  KR:{weight:1,first:['Min-jun','Ji-hoon','Hyun-woo','Seo-jun','Dong-hyun','Joon'],last:['Kim','Lee','Park','Choi','Jung','Kang']}
};

export const DEVELOPMENT_NATIONS = ['FR','IT','ES','BE','NL','GB','US','CO','DK','DE','AU','NO','PT','CH','SI','MX','EC','ER'];
export const STAR_SEEDS = [];

const profiles = {
  sprint: ['flat','flat','hilly','flat'],
  classic: ['hilly','cobbles','hilly'],
  ardennes: ['hilly','puncheur','hilly'],
  mountain: ['hilly','mountain','mountain','time-trial'],
  week: ['flat','hilly','mountain','time-trial','mountain','flat','hilly'],
  grand: ['flat','hilly','mountain','flat','time-trial','mountain','flat','hilly','mountain','flat','hilly','mountain','flat','time-trial','mountain','flat','hilly','mountain','flat','hilly','mountain'],
  u23: ['flat','hilly','mountain','time-trial','mountain','hilly','flat']
};

function event(id,name,tier,month,day,kind,region,prestige,profileKey,stageCount=null) {
  const profile = profiles[profileKey];
  return { id,name,tier,month,day,kind,region,prestige,basePrestige:prestige,stageProfiles: stageCount ? Array.from({length: stageCount},(_,index)=>profile[index%profile.length]) : profile, active:true, history:[], editions:[] };
}

export const BASE_EVENTS = [
  event('tdu','Santos Tour Down Under','worldtour',1,18,'stage','OCE',76,'week',6),
  event('cadel','Cadel Evans Great Ocean Road Race','worldtour',1,25,'one-day','OCE',70,'classic',1),
  event('uae-tour','UAE Tour','worldtour',2,16,'stage','MEA',78,'week',7),
  event('omloop','Omloop Nieuwsblad','worldtour',2,28,'one-day','EUR',82,'classic',1),
  event('strade','Strade Bianche','worldtour',3,7,'one-day','EUR',88,'classic',1),
  event('paris-nice','Paris–Nice','worldtour',3,8,'stage','EUR',88,'week',8),
  event('tirreno','Tirreno–Adriatico','worldtour',3,9,'stage','EUR',87,'week',7),
  event('sanremo','Milano–Sanremo','worldtour',3,21,'monument','EUR',96,'classic',1),
  event('catalunya','Volta a Catalunya','worldtour',3,23,'stage','EUR',86,'week',7),
  event('sprint-classic','The Great Sprint Classic','worldtour',3,25,'one-day','EUR',74,'sprint',1),
  event('e3','E3 Saxo Classic','worldtour',3,27,'one-day','EUR',87,'classic',1),
  event('gent','Gent–Wevelgem','worldtour',3,29,'one-day','EUR',87,'classic',1),
  event('dwars','Dwars door Vlaanderen','worldtour',4,1,'one-day','EUR',82,'classic',1),
  event('flanders','Tour of Flanders','worldtour',4,5,'monument','EUR',98,'classic',1),
  event('itzulia','Itzulia Basque Country','worldtour',4,6,'stage','EUR',86,'week',6),
  event('roubaix','Paris–Roubaix','worldtour',4,12,'monument','EUR',99,'classic',1),
  event('amstel','Amstel Gold Race','worldtour',4,19,'one-day','EUR',89,'ardennes',1),
  event('fleche','La Flèche Wallonne','worldtour',4,22,'one-day','EUR',88,'ardennes',1),
  event('liege','Liège–Bastogne–Liège','worldtour',4,26,'monument','EUR',97,'ardennes',1),
  event('romandie','Tour de Romandie','worldtour',4,28,'stage','EUR',83,'week',6),
  event('giro','Giro d’Italia','worldtour',5,9,'grand-tour','EUR',98,'grand',21),
  event('eschborn','Eschborn–Frankfurt','worldtour',5,1,'one-day','EUR',78,'sprint',1),
  event('dauphine','Critérium du Dauphiné','worldtour',6,7,'stage','EUR',89,'week',8),
  event('suisse','Tour de Suisse','worldtour',6,14,'stage','EUR',88,'week',8),
  event('copenhagen','Copenhagen Sprint','worldtour',6,21,'one-day','EUR',75,'sprint',1),
  event('tour','Tour de France','worldtour',7,4,'grand-tour','EUR',100,'grand',21),
  event('san-sebastian','Clásica San Sebastián','worldtour',8,1,'one-day','EUR',88,'ardennes',1),
  event('pologne','Tour de Pologne','worldtour',8,3,'stage','EUR',80,'week',7),
  event('cyclassics','ADAC Cyclassics','worldtour',8,16,'one-day','EUR',79,'sprint',1),
  event('renewi','Renewi Tour','worldtour',8,19,'stage','EUR',80,'week',5),
  event('vuelta','La Vuelta a España','worldtour',8,22,'grand-tour','EUR',97,'grand',21),
  event('bretagne','Bretagne Classic','worldtour',8,30,'one-day','EUR',82,'classic',1),
  event('quebec','Grand Prix Cycliste de Québec','worldtour',9,11,'one-day','AME',85,'ardennes',1),
  event('montreal','Grand Prix Cycliste de Montréal','worldtour',9,13,'one-day','AME',86,'ardennes',1),
  event('worlds-tt','World Championships – Time Trial','national',9,23,'championship','WORLD',96,'mountain',1),
  event('worlds-road','World Championships – Road Race','national',9,27,'championship','WORLD',99,'ardennes',1),
  event('lombardia','Il Lombardia','worldtour',10,10,'monument','EUR',97,'mountain',1),
  event('guangxi','Tour of Guangxi','worldtour',10,13,'stage','ASI',76,'week',6),

  event('valenciana','Volta a la Comunitat Valenciana','proseries',2,4,'stage','EUR',66,'week',5),
  event('algarve','Volta ao Algarve','proseries',2,18,'stage','EUR',69,'week',5),
  event('kuurne','Kuurne–Brussels–Kuurne','proseries',3,1,'one-day','EUR',70,'classic',1),
  event('nokere','Nokere Koerse','proseries',3,18,'one-day','EUR',64,'sprint',1),
  event('brabant','Brabantse Pijl','proseries',4,15,'one-day','EUR',72,'ardennes',1),
  event('turkey','Tour of Türkiye','proseries',4,20,'stage','EUR',65,'week',8),
  event('alps','Tour of the Alps','proseries',4,20,'stage','EUR',73,'mountain',5),
  event('asturias','Vuelta a Asturias','proseries',5,1,'stage','EUR',60,'mountain',3),
  event('dunkirk','Four Days of Dunkirk','proseries',5,19,'stage','EUR',65,'week',6),
  event('norway','Tour of Norway','proseries',5,28,'stage','EUR',64,'week',4),
  event('belgium','Baloise Belgium Tour','proseries',6,17,'stage','EUR',68,'week',5),
  event('slovenia','Tour of Slovenia','proseries',6,17,'stage','EUR',67,'mountain',5),
  event('burgos','Vuelta a Burgos','proseries',8,4,'stage','EUR',72,'mountain',5),
  event('britain','Tour of Britain','proseries',9,2,'stage','EUR',70,'week',6),
  event('wallonie','Tour de Wallonie','proseries',7,26,'stage','EUR',64,'week',5),
  event('arctic','Arctic Race of Norway','proseries',8,13,'stage','EUR',63,'week',4),
  event('denmark','Tour of Denmark','proseries',8,18,'stage','EUR',64,'week',5),
  event('piemonte','Gran Piemonte','proseries',10,8,'one-day','EUR',69,'ardennes',1),
  event('paris-tours','Paris–Tours','proseries',10,11,'one-day','EUR',70,'classic',1),

  event('avenir','Tour de l’Avenir','u23',8,17,'u23-stage','WORLD',82,'u23',8),
  event('giro-next','Giro Next Gen','u23',6,13,'u23-stage','EUR',79,'u23',8),
  event('u23-flanders','U23 Tour of Flanders','u23',4,11,'u23-one-day','EUR',68,'classic',1),
  event('peace','Course de la Paix U23','u23',5,28,'u23-stage','EUR',67,'u23',4),
  event('isard','Ronde de l’Isard','u23',5,20,'u23-stage','EUR',65,'mountain',5),
  event('u23-worlds-tt','U23 World Championships – Time Trial','u23',9,22,'u23-championship','WORLD',84,'mountain',1),
  event('u23-worlds-road','U23 World Championships – Road Race','u23',9,26,'u23-championship','WORLD',88,'ardennes',1),

  event('rw-tour','Tour du Rwanda','continental',2,22,'stage','AFR',55,'mountain',6),
  event('colombia','Tour Colombia','continental',2,10,'stage','AME',57,'mountain',6),
  event('japan','Tour of Japan','continental',5,17,'stage','ASI',54,'week',7),
  event('qinghai','Tour of Qinghai Lake','continental',7,12,'stage','ASI',55,'mountain',8),
  event('utah','Rocky Mountain Tour','continental',8,8,'stage','AME',53,'mountain',5),
  event('cape','Cape Cycling Tour','continental',3,15,'stage','AFR',50,'week',5),
  event('nz','New Zealand Cycle Classic','continental',1,14,'stage','OCE',49,'week',5),
  event('portugal','Volta a Portugal','continental',8,5,'stage','EUR',58,'week',10)
];

const EVENT_COUNTRIES = {
  tdu:'AU',cadel:'AU','uae-tour':'AE',omloop:'BE',strade:'IT','paris-nice':'FR',tirreno:'IT',sanremo:'IT',catalunya:'ES','sprint-classic':'NL',e3:'BE',gent:'BE',dwars:'BE',flanders:'BE',itzulia:'ES',roubaix:'FR',amstel:'NL',fleche:'BE',liege:'BE',romandie:'CH',giro:'IT',eschborn:'DE',dauphine:'FR',suisse:'CH',copenhagen:'DK',tour:'FR','san-sebastian':'ES',pologne:'PL',cyclassics:'DE',renewi:'NL',vuelta:'ES',bretagne:'FR',quebec:'CA',montreal:'CA','worlds-tt':'WORLD','worlds-road':'WORLD',lombardia:'IT',guangxi:'CN',
  valenciana:'ES',algarve:'PT',kuurne:'BE',nokere:'BE',brabant:'BE',turkey:'TR',alps:'IT',asturias:'ES',dunkirk:'FR',norway:'NO',belgium:'BE',slovenia:'SI',burgos:'ES',britain:'GB',wallonie:'BE',arctic:'NO',denmark:'DK',piemonte:'IT','paris-tours':'FR',
  avenir:'FR','giro-next':'IT','u23-flanders':'BE',peace:'CZ',isard:'FR','u23-worlds-tt':'WORLD','u23-worlds-road':'WORLD','rw-tour':'RW',colombia:'CO',japan:'JP',qinghai:'CN',utah:'US',cape:'ZA',nz:'NZ',portugal:'PT'
};
for (const race of BASE_EVENTS) race.country = EVENT_COUNTRIES[race.id] || 'WORLD';

export const TERRAIN_TYPES = ['climber','sprinter','puncheur','rouleur','time-trialist','cobbles','all-rounder'];
export const PROGRAM_TYPES = ['grand-tour','one-week','monuments','stage-hunter'];
export const ROLES = ['Leader','Sprinter','Classics leader','Domestique'];

// Sponsor strength is deliberately independent from sporting tier. A huge brand can
// begin with a Continental project and finance its climb; a WorldTour organization
// can also lose its place after replacing a wealthy partner with a smaller one.
export const SPONSOR_DATABASE = [
  {id:'ineos',name:'INEOS',country:'GB',size:'huge',money:98,attraction:94,colors:['#111827','#ef4444']},
  {id:'uae-xrg',name:'UAE XRG',country:'AE',size:'huge',money:99,attraction:96,colors:['#f8fafc','#dc2626']},
  {id:'red-bull',name:'Red Bull',country:'AT',size:'huge',money:97,attraction:97,colors:['#172554','#facc15']},
  {id:'visma',name:'Visma',country:'NL',size:'large',money:88,attraction:91,colors:['#facc15','#111827']},
  {id:'lidl',name:'Lidl',country:'DE',size:'huge',money:94,attraction:90,colors:['#1d4ed8','#facc15']},
  {id:'decathlon',name:'Decathlon',country:'FR',size:'huge',money:93,attraction:89,colors:['#2563eb','#f8fafc']},
  {id:'movistar',name:'Movistar',country:'ES',size:'large',money:86,attraction:86,colors:['#16a34a','#0f172a']},
  {id:'alpecin',name:'Alpecin',country:'BE',size:'large',money:84,attraction:85,colors:['#1e3a8a','#dc2626']},
  {id:'bahrain',name:'Bahrain',country:'BH',size:'huge',money:91,attraction:86,colors:['#dc2626','#0f172a']},
  {id:'ef',name:'EF Education',country:'US',size:'large',money:84,attraction:88,colors:['#ec4899','#f8fafc']},
  {id:'groupama',name:'Groupama',country:'FR',size:'large',money:82,attraction:82,colors:['#2563eb','#dc2626']},
  {id:'soudal',name:'Soudal',country:'BE',size:'large',money:87,attraction:87,colors:['#dc2626','#f8fafc']},
  {id:'jayco',name:'Jayco',country:'AU',size:'large',money:82,attraction:80,colors:['#7c3aed','#f8fafc']},
  {id:'picnic',name:'Picnic',country:'NL',size:'large',money:76,attraction:75,colors:['#ef4444','#f8fafc']},
  {id:'unox',name:'Uno-X',country:'NO',size:'large',money:80,attraction:82,colors:['#f97316','#dc2626']},
  {id:'astana',name:'XDS Astana',country:'KZ',size:'large',money:82,attraction:80,colors:['#38bdf8','#facc15']},
  {id:'cofidis',name:'Cofidis',country:'FR',size:'large',money:77,attraction:75,colors:['#dc2626','#f8fafc']},
  {id:'tudor',name:'Tudor',country:'CH',size:'large',money:82,attraction:84,colors:['#111827','#ef4444']},
  {id:'total',name:'TotalEnergies',country:'FR',size:'large',money:76,attraction:74,colors:['#2563eb','#dc2626']},
  {id:'euskaltel',name:'Euskaltel',country:'ES',size:'medium',money:66,attraction:72,colors:['#f97316','#15803d']},
  {id:'caja-rural',name:'Caja Rural',country:'ES',size:'medium',money:65,attraction:67,colors:['#16a34a','#f8fafc']},
  {id:'q365',name:'Q36.5',country:'CH',size:'medium',money:73,attraction:78,colors:['#111827','#f8fafc']},
  {id:'polti',name:'Polti',country:'IT',size:'medium',money:65,attraction:64,colors:['#ef4444','#f8fafc']},
  {id:'burgos',name:'Burgos',country:'ES',size:'medium',money:61,attraction:61,colors:['#7c3aed','#f8fafc']},
  {id:'kern',name:'Kern Pharma',country:'ES',size:'medium',money:64,attraction:66,colors:['#059669','#f8fafc']},
  {id:'flanders',name:'Flanders Baloise',country:'BE',size:'medium',money:65,attraction:69,colors:['#facc15','#111827']},
  {id:'novo',name:'Novo Nordisk',country:'DK',size:'large',money:72,attraction:74,colors:['#2563eb','#f8fafc']},
  {id:'unibet',name:'Unibet',country:'FR',size:'medium',money:68,attraction:72,colors:['#16a34a','#111827']},
  {id:'coca-cola',name:'Coca-Cola',country:'US',size:'huge',money:98,attraction:98,colors:['#dc2626','#f8fafc']},
  {id:'hsbc',name:'HSBC',country:'GB',size:'huge',money:96,attraction:91,colors:['#dc2626','#f8fafc']},
  {id:'shell',name:'Shell',country:'GB',size:'huge',money:97,attraction:88,colors:['#facc15','#dc2626']},
  {id:'lvmh',name:'LVMH',country:'FR',size:'huge',money:97,attraction:96,colors:['#111827','#d6b36a']},
  {id:'repsol',name:'Repsol',country:'ES',size:'huge',money:94,attraction:90,colors:['#f97316','#dc2626']},
  {id:'inditex',name:'Zara – Inditex',country:'ES',size:'huge',money:96,attraction:95,colors:['#111827','#f8fafc']},
  {id:'bbva',name:'BBVA',country:'ES',size:'large',money:88,attraction:84,colors:['#1d4ed8','#f8fafc']},
  {id:'rbc',name:'RBC',country:'CA',size:'large',money:87,attraction:83,colors:['#1d4ed8','#facc15']},
  {id:'shopify',name:'Shopify',country:'CA',size:'large',money:86,attraction:88,colors:['#65a30d','#111827']},
  {id:'tesco',name:'Tesco',country:'GB',size:'large',money:84,attraction:79,colors:['#2563eb','#dc2626']},
  {id:'pearson',name:'Pearson',country:'GB',size:'large',money:78,attraction:76,colors:['#0f766e','#f8fafc']},
  {id:'santander',name:'Santander',country:'ES',size:'huge',money:94,attraction:89,colors:['#dc2626','#f8fafc']},
  {id:'enel',name:'Enel',country:'IT',size:'huge',money:92,attraction:86,colors:['#7c3aed','#22c55e']},
  {id:'ferrero',name:'Ferrero',country:'IT',size:'large',money:88,attraction:90,colors:['#78350f','#f8fafc']},
  {id:'eni',name:'Eni',country:'IT',size:'huge',money:94,attraction:84,colors:['#facc15','#111827']},
  {id:'orange',name:'Orange',country:'FR',size:'huge',money:91,attraction:88,colors:['#f97316','#111827']},
  {id:'carrefour',name:'Carrefour',country:'FR',size:'large',money:86,attraction:82,colors:['#1d4ed8','#dc2626']},
  {id:'bnp',name:'BNP Paribas',country:'FR',size:'huge',money:94,attraction:86,colors:['#047857','#f8fafc']},
  {id:'ab-inbev',name:'AB InBev',country:'BE',size:'huge',money:93,attraction:89,colors:['#d97706','#111827']},
  {id:'kbc',name:'KBC',country:'BE',size:'large',money:84,attraction:80,colors:['#16a34a','#f8fafc']},
  {id:'ing',name:'ING',country:'NL',size:'huge',money:94,attraction:87,colors:['#f97316','#f8fafc']},
  {id:'philips',name:'Philips',country:'NL',size:'large',money:87,attraction:85,colors:['#2563eb','#f8fafc']},
  {id:'rabobank',name:'Rabobank',country:'NL',size:'large',money:88,attraction:89,colors:['#f97316','#2563eb']},
  {id:'deutsche-bank',name:'Deutsche Bank',country:'DE',size:'huge',money:94,attraction:85,colors:['#1d4ed8','#f8fafc']},
  {id:'adidas',name:'Adidas',country:'DE',size:'huge',money:95,attraction:97,colors:['#111827','#f8fafc']},
  {id:'sap',name:'SAP',country:'DE',size:'huge',money:93,attraction:88,colors:['#0ea5e9','#111827']},
  {id:'maersk',name:'Maersk',country:'DK',size:'huge',money:92,attraction:84,colors:['#38bdf8','#f8fafc']},
  {id:'lego',name:'LEGO',country:'DK',size:'huge',money:93,attraction:98,colors:['#dc2626','#facc15']},
  {id:'equinor',name:'Equinor',country:'NO',size:'huge',money:93,attraction:84,colors:['#dc2626','#111827']},
  {id:'volvo',name:'Volvo',country:'SE',size:'huge',money:92,attraction:90,colors:['#1e3a8a','#f8fafc']},
  {id:'ubs',name:'UBS',country:'CH',size:'huge',money:96,attraction:87,colors:['#dc2626','#111827']},
  {id:'nestle',name:'Nestlé',country:'CH',size:'huge',money:95,attraction:90,colors:['#7c2d12','#f8fafc']},
  {id:'mercado-libre',name:'Mercado Libre',country:'AR',size:'large',money:86,attraction:91,colors:['#facc15','#1d4ed8']},
  {id:'ecopetrol',name:'Ecopetrol',country:'CO',size:'huge',money:91,attraction:84,colors:['#16a34a','#facc15']},
  {id:'avianca',name:'Avianca',country:'CO',size:'large',money:82,attraction:86,colors:['#dc2626','#f8fafc']},
  {id:'toyota',name:'Toyota',country:'JP',size:'huge',money:98,attraction:96,colors:['#dc2626','#f8fafc']},
  {id:'sony',name:'Sony',country:'JP',size:'huge',money:95,attraction:97,colors:['#111827','#f8fafc']},
  {id:'samsung',name:'Samsung',country:'KR',size:'huge',money:98,attraction:96,colors:['#1d4ed8','#f8fafc']},
  {id:'alibaba',name:'Alibaba',country:'CN',size:'huge',money:98,attraction:92,colors:['#f97316','#f8fafc']},
  {id:'emirates',name:'Emirates',country:'AE',size:'huge',money:98,attraction:95,colors:['#dc2626','#f8fafc']},
  {id:'discovery',name:'Discovery',country:'ZA',size:'large',money:82,attraction:84,colors:['#0ea5e9','#111827']},
  {id:'woolworths',name:'Woolworths',country:'AU',size:'large',money:84,attraction:81,colors:['#16a34a','#f8fafc']},
  {id:'air-new-zealand',name:'Air New Zealand',country:'NZ',size:'large',money:81,attraction:85,colors:['#111827','#f8fafc']},
  {id:'regional-bank',name:'Regional Bank',country:'WORLD',size:'medium',money:62,attraction:58,colors:['#315b74','#f8fafc']},
  {id:'regional-foods',name:'Regional Foods',country:'WORLD',size:'small',money:47,attraction:48,colors:['#7c2d12','#f5deb3']},
  {id:'regional-telecom',name:'Regional Telecom',country:'WORLD',size:'medium',money:65,attraction:63,colors:['#6d28d9','#f8fafc']},
  {id:'regional-mobility',name:'Regional Mobility',country:'WORLD',size:'small',money:52,attraction:55,colors:['#0369a1','#f8fafc']}
];

export const INITIAL_SPONSOR_IDS = {
  alpecin:['alpecin','regional-telecom'],bahrain:['bahrain','regional-bank'],decathlon:['decathlon','regional-mobility'],ef:['ef','regional-telecom'],
  groupama:['groupama','regional-bank'],ineos:['ineos','regional-telecom'],lidl:['lidl','regional-mobility'],lotto:['ab-inbev','regional-bank'],movistar:['movistar','regional-bank'],
  nsn:['ubs','regional-telecom'],redbull:['red-bull','regional-mobility'],soudal:['soudal','regional-bank'],jayco:['jayco','regional-mobility'],picnic:['picnic','regional-foods'],
  visma:['visma','regional-telecom'],uae:['uae-xrg','emirates'],unox:['unox','regional-mobility'],astana:['astana','regional-bank'],
  cofidis:['cofidis','regional-bank'],tudor:['tudor','regional-telecom'],total:['total','regional-mobility'],euskaltel:['euskaltel','regional-telecom'],cajarural:['caja-rural','regional-bank'],
  q365:['q365','regional-mobility'],polti:['polti','regional-foods'],burgos:['burgos','regional-bank'],kern:['kern','regional-telecom'],flanders:['flanders','regional-bank'],novo:['novo','regional-telecom'],unibet:['unibet','regional-mobility']
};

export const RARITIES = {
  generational: { label:'Generational', min:95, max:100, weight:0.004 },
  legend: { label:'Legend', min:90, max:95, weight:0.018 },
  epic: { label:'Epic', min:85, max:90, weight:0.055 },
  rare: { label:'Rare', min:80, max:85, weight:0.16 },
  uncommon: { label:'Uncommon', min:70, max:80, weight:0.31 },
  common: { label:'Common', min:50, max:69, weight:0.453 }
};

export const STAGE_LABELS = {
  flat: 'Flat stage', hilly: 'Rolling stage', puncheur: 'Puncheur finish', mountain: 'Mountain stage', 'time-trial':'Time trial', cobbles:'Cobbled stage'
};
