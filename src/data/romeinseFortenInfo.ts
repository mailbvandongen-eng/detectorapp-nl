// Uitgebreide informatie over Romeinse forten en versterkingen
// Op B1 niveau geschreven voor detectoristen

export interface RomeinsFortInfo {
  naam: string
  latinNaam?: string
  type: 'castellum' | 'wachttoren' | 'vlootbasis' | 'legerkamp' | 'minifort' | 'versterking' | 'villa'
  periode: string
  beschrijving: string
  watWasHier: string
  watTeZien: string
  verwachteVondsten: string
  betekenis: string
  bronnen?: string[]
}

// Database met informatie per fort (key = Name uit GeoJSON)
export const ROMEINSE_FORTEN_INFO: Record<string, RomeinsFortInfo> = {
  'Fectio': {
    naam: 'Fectio',
    latinNaam: 'Fectio',
    type: 'castellum',
    periode: '4/5 n.Chr. - ca. 270 n.Chr.',
    beschrijving: 'Fectio was een van de belangrijkste Romeinse legerbases in Nederland. Het fort lag bij de splitsing van de Rijn en de Vecht, een strategisch punt.',
    watWasHier: 'Hier was een groot castellum (legerplaats) met ruimte voor ongeveer 500 soldaten. Er waren barakken, een badhuis, een hospitaal en pakhuizen. Buiten het fort woonden handelaren en families van soldaten.',
    watTeZien: 'Archeologisch Park Castellum Hoge Woerd toont de contouren van het fort. In het museum zijn veel vondsten te zien, waaronder een Romeins schip.',
    verwachteVondsten: 'Munten, fibulae (mantelspelden), aardewerk, wapens, paardentuig, en militaire uitrusting. Door de natte bodem zijn hier ook organische materialen zoals leer en hout bewaard.',
    betekenis: 'Fectio was onderdeel van de Limes, de noordgrens van het Romeinse Rijk. Vanaf hier werden troepen en goederen vervoerd over de Rijn.',
    bronnen: ['https://www.hogewoerd.nl', 'https://www.livius.org/articles/place/fectio-vechten/']
  },
  'Traiectum': {
    naam: 'Traiectum',
    latinNaam: 'Traiectum',
    type: 'castellum',
    periode: '47 n.Chr. - ca. 270 n.Chr.',
    beschrijving: 'Traiectum is het huidige Utrecht. De naam betekent "oversteekplaats". Hier stak een belangrijke weg de Rijn over.',
    watWasHier: 'Een klein castellum met een bezetting van enkele honderden soldaten. Het fort bewaakte de oversteek van de Rijn. Er was een brug of veerpont.',
    watTeZien: 'De Domkerk staat deels op de fundamenten van het Romeinse fort. In het Centraal Museum zijn Romeinse vondsten te zien. Onder het Domplein zijn resten gevonden.',
    verwachteVondsten: 'Munten, sieraden, aardewerk, bouwmateriaal (tegels, bakstenen), en offers aan de rivier. Bij de brug werden vaak munten geofferd.',
    betekenis: 'Traiectum was een belangrijk knooppunt waar de landweg de rivier kruiste. Later groeide het uit tot de stad Utrecht.',
    bronnen: ['https://www.livius.org/articles/place/traiectum-utrecht/']
  },
  'Laurum': {
    naam: 'Laurum',
    latinNaam: 'Laurum',
    type: 'castellum',
    periode: 'ca. 40 n.Chr. - ca. 270 n.Chr.',
    beschrijving: 'Laurum lag in het huidige Woerden. Het was een middelgroot fort aan de Rijn.',
    watWasHier: 'Een castellum met ruimte voor ongeveer 500 soldaten. Er zijn resten gevonden van houten barakken, een badhuis en pakhuizen. Buiten het fort lag een vicus (burgerdorp).',
    watTeZien: 'In het Stadsmuseum Woerden zijn vondsten te zien, waaronder een bijzondere Romeinse boot. De contouren van het fort zijn in het stratenpatroon te herkennen.',
    verwachteVondsten: 'Militaria, aardewerk, munten, en schrijfplankjes. Door de natte veengrond zijn ook houten voorwerpen en leren schoenen bewaard gebleven.',
    betekenis: 'Laurum toont hoe de Romeinen in het veengebied bouwden. De soldaten moesten constant vechten tegen het water.',
    bronnen: ['https://www.castellumwoerden.nl']
  },
  'Castellum Praetorium Agrippinae': {
    naam: 'Praetorium Agrippinae',
    latinNaam: 'Praetorium Agrippinae',
    type: 'castellum',
    periode: '40 n.Chr. - ca. 270 n.Chr.',
    beschrijving: 'Dit fort lag in Valkenburg (ZH). De naam verwijst naar Agrippina, de moeder van keizer Nero.',
    watWasHier: 'Een middelgroot castellum met barakken voor hulptroepen. Er waren ook werkplaatsen en opslagruimtes. Het fort werd meerdere keren herbouwd na overstromingen.',
    watTeZien: 'Het Archeologisch Steunpunt Valkenburg toont de geschiedenis. Delen van het fort zijn opgegraven en worden beschermd.',
    verwachteVondsten: 'Militaire uitrusting, aardewerk uit het Rijnland en Gallië, munten, en bouwmateriaal. Hier zijn ook inscripties gevonden.',
    betekenis: 'Een van de best onderzochte forten aan de Rijn. Geeft veel informatie over het dagelijks leven van Romeinse soldaten.',
    bronnen: ['https://www.livius.org/articles/place/praetorium-agrippinae-valkenburg/']
  },
  'Castra Hunnerberg': {
    naam: 'Castra Hunnerberg',
    latinNaam: 'Castra',
    type: 'legerkamp',
    periode: '19 v.Chr. - ca. 70 n.Chr.',
    beschrijving: 'Op de Hunnerberg bij Nijmegen lag een groot legerkamp. Hier waren tijdelijk twee volledige legioenen (10.000 soldaten) gestationeerd.',
    watWasHier: 'Een enorm legerkamp van 42 hectare, een van de grootste ten noorden van de Alpen. Hier werden veldtochten naar Germanië voorbereid.',
    watTeZien: 'Op de Hunnerberg zijn de wallen nog zichtbaar in het landschap. Het Museum Het Valkhof toont veel vondsten.',
    verwachteVondsten: 'Militaire uitrusting van hoge kwaliteit, munten van Augustus en Tiberius, legioenstempels op dakpannen, en resten van wapens.',
    betekenis: 'Dit was de belangrijkste legerbasis in het vroege Romeinse Nederland. Vanaf hier werden de oorlogen tegen de Germanen gevoerd.',
    bronnen: ['https://www.livius.org/articles/place/noviomagus-nijmegen-hunnerberg/']
  },
  'Castellum Kops Plateau': {
    naam: 'Kops Plateau',
    latinNaam: 'Oppidum Batavorum',
    type: 'castellum',
    periode: 'ca. 10 v.Chr. - 70 n.Chr.',
    beschrijving: 'Op het Kops Plateau in Nijmegen lag een vroege militaire basis, later de hoofdstad van de Bataven.',
    watWasHier: 'Eerst een Romeins kamp, later de civiele hoofdstad Oppidum Batavorum. Hier woonden Romeinen en Bataven samen.',
    watTeZien: 'Het Kops Plateau is nu een natuurgebied. Opgravingen hebben veel informatie opgeleverd. Museum Het Valkhof toont de vondsten.',
    verwachteVondsten: 'Vroege Romeinse militaria, Keltisch-Bataafse voorwerpen, importaardewerk, en munten uit de tijd van Augustus.',
    betekenis: 'Dit was het eerste contactpunt tussen Romeinen en Bataven. Hier begon de romanisering van Nederland.',
    bronnen: ['https://www.livius.org/articles/place/noviomagus-nijmegen-kops-plateau/']
  },
  'Nijmegen, Valkhof': {
    naam: 'Valkhof Nijmegen',
    latinNaam: 'Valkhof',
    type: 'versterking',
    periode: 'ca. 270 n.Chr. - 400 n.Chr.',
    beschrijving: 'Op het Valkhof stond een laat-Romeinse versterking. Later bouwde Karel de Grote hier een palts.',
    watWasHier: 'Een versterkte positie uit de tijd dat het Romeinse Rijk onder druk stond. De soldaten bewaakten de Waaloever.',
    watTeZien: 'Het Valkhofpark met de Sint-Nicolaaskapel (deels Karolingisch). Museum Het Valkhof toont de geschiedenis.',
    verwachteVondsten: 'Laat-Romeinse munten, gordeltjes en riemtongen, aardewerk uit de 3e en 4e eeuw, en militaire gespen.',
    betekenis: 'Toont de overgang van het Romeinse Rijk naar de vroege middeleeuwen. Nijmegen bleef een belangrijk centrum.',
    bronnen: ['https://www.museumhetvalkhof.nl']
  },
  'Castellum Op de Hoge Woerd': {
    naam: 'Hoge Woerd',
    latinNaam: 'Castellum',
    type: 'castellum',
    periode: 'ca. 50 n.Chr. - 270 n.Chr.',
    beschrijving: 'Dit fort lag in Leidsche Rijn bij Utrecht. Het is nu een archeologisch park.',
    watWasHier: 'Een middengroot castellum met houten gebouwen. Buiten de muren lag een burgerdorp. Hier is een compleet Romeins schip gevonden.',
    watTeZien: 'Archeologisch Park Castellum Hoge Woerd met de reconstructie van het fort en een museum. Je kunt over de fundamenten lopen.',
    verwachteVondsten: 'Militaire uitrusting, scheepsonderdelen, aardewerk, munten, en door de natte grond ook organisch materiaal.',
    betekenis: 'Een van de best bewaarde en gepresenteerde Romeinse forten in Nederland. Ideaal om te zien hoe een fort eruitzag.',
    bronnen: ['https://www.hogewoerd.nl']
  },
  'Lugdunum': {
    naam: 'Lugdunum Batavorum',
    latinNaam: 'Lugdunum Batavorum',
    type: 'castellum',
    periode: 'ca. 40 n.Chr. - 270 n.Chr.',
    beschrijving: 'Lugdunum lag in Katwijk, aan de monding van de Rijn in zee. Het was het westelijkste fort van de Limes.',
    watWasHier: 'Een castellum dat de riviermonding bewaakte. Hier eindigde de Rijn en begon de zee. Er was ook een vuurtoren.',
    watTeZien: 'Het fort is door de zee weggespoeld. In het Rijksmuseum van Oudheden in Leiden zijn vondsten te zien.',
    verwachteVondsten: 'Op het strand worden soms voorwerpen gevonden na stormen. Munten, aardewerk en militaria.',
    betekenis: 'Het westelijke eindpunt van de Limes. Hier begonnen zeereizen naar Britannia.',
    bronnen: ['https://www.livius.org/articles/place/lugdunum-batavorum-katwijk/']
  },
  'Vlootbasis Naaldwijk': {
    naam: 'Vlootbasis Naaldwijk',
    type: 'vlootbasis',
    periode: '1e eeuw n.Chr.',
    beschrijving: 'Bij Naaldwijk lag mogelijk een basis voor de Romeinse vloot (Classis Germanica).',
    watWasHier: 'Een haven met schepen die langs de kust patrouilleerden en troepen naar Britannia vervoerden.',
    watTeZien: 'Het gebied is nu landbouwgrond. Vondsten zijn in lokale musea te zien.',
    verwachteVondsten: 'Scheepsonderdelen, ankers, militaire uitrusting voor mariniers, importaardewerk.',
    betekenis: 'Toont het belang van de Romeinse vloot voor de verdediging van de kust.',
    bronnen: []
  },
  'Minifort Ockenburg': {
    naam: 'Minifort Ockenburg',
    type: 'minifort',
    periode: 'ca. 150 n.Chr.',
    beschrijving: 'Bij Ockenburg in Den Haag stond een klein Romeins fortje dat de kust bewaakte.',
    watWasHier: 'Een kleine wachtpost met ruimte voor een handvol soldaten. Het lag op een strandwal.',
    watTeZien: 'Het terrein is beschermd maar niet toegankelijk. Vondsten zijn in het Haags Historisch Museum.',
    verwachteVondsten: 'Kleine hoeveelheden militaria, aardewerk, en munten.',
    betekenis: 'Toont dat de Romeinen ook de kust bewaakten, niet alleen de rivieren.',
    bronnen: []
  },
  'Castellum Ceuclum': {
    naam: 'Ceuclum',
    latinNaam: 'Ceuclum',
    type: 'castellum',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Ceuclum lag bij Cuijk aan de Maas. Het bewaakte een brug over de rivier.',
    watWasHier: 'Een middelgroot castellum bij een belangrijke rivierovergang. De weg naar het noorden liep hier.',
    watTeZien: 'In Cuijk zijn restanten gevonden. Het Maasmuseum toont lokale vondsten.',
    verwachteVondsten: 'Munten, fibulae, aardewerk, en materiaal gerelateerd aan de brug.',
    betekenis: 'Een belangrijke schakel in het Romeinse wegennet langs de Maas.',
    bronnen: ['https://www.livius.org/articles/place/ceuclum-cuijk/']
  },
  'Castellum Meinerswijk': {
    naam: 'Meinerswijk',
    type: 'castellum',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Bij Arnhem-Meinerswijk lag een Romeins fort aan de Rijn.',
    watWasHier: 'Een castellum dat de rivierroute bewaakte. Het lag in de uiterwaarden.',
    watTeZien: 'Het terrein is nu natuurgebied. Vondsten zijn in Museum Arnhem te zien.',
    verwachteVondsten: 'Militaria, aardewerk, munten, en scheepsresten.',
    betekenis: 'Onderdeel van de keten van forten langs de Rijn.',
    bronnen: []
  },
  'Levefanum': {
    naam: 'Levefanum',
    latinNaam: 'Levefanum',
    type: 'versterking',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Levefanum lag bij Wijk bij Duurstede, waar de Rijn splitste in de Lek en de Kromme Rijn.',
    watWasHier: 'Een militaire post bij een strategische riviersplitsing. Mogelijk ook een haven.',
    watTeZien: 'Het terrein is bebouwd. Dorestad Museum toont de latere geschiedenis van deze plek.',
    verwachteVondsten: 'Munten, aardewerk, militaria, en handelsproducten.',
    betekenis: 'Een belangrijk controlepunt voor het scheepvaartverkeer.',
    bronnen: []
  },
  'Nigrum Pullum': {
    naam: 'Nigrum Pullum',
    latinNaam: 'Nigrum Pullum (Zwarte Poel)',
    type: 'minifort',
    periode: 'ca. 40 - 270 n.Chr.',
    beschrijving: 'Romeins castellum bij Zwammerdam aan de Oude Rijn. Garnizoen van 100-150 soldaten met pakhuizen en haven voor riviertransport. Wereldberoemd door de vondst van 6 Romeinse schepen (1971-1974) in perfecte staat - bewaard door de natte veengrond. De Zwammerdamschepen zijn de best bewaarde Romeinse rivierschepen ter wereld en tonen uniek inzicht in Romeins transport en scheepsbouw. Vondsten: schepen, leren schoeisel, houten voorwerpen, aardewerk, munten, militaria. Te zien in Rijksmuseum van Oudheden, Leiden.',
    watWasHier: 'Een klein fort met pakhuizen en haven. Bij opgravingen werden 6 Romeinse schepen gevonden.',
    watTeZien: 'De schepen zijn in het Rijksmuseum van Oudheden in Leiden. Het terrein zelf is niet te bezoeken.',
    verwachteVondsten: 'Scheepsonderdelen, leren schoeisel, houten voorwerpen, aardewerk, munten, en door de natte veengrond organisch materiaal.',
    betekenis: 'Wereldberoemd om de goed bewaarde Romeinse schepen. Toont transport over de Rijn.',
    bronnen: ['https://www.rmo.nl/collectie/themas/zwammerdam']
  },
  'Stenen wachttoren Vleuterweide': {
    naam: 'Wachttoren Vleuterweide',
    type: 'wachttoren',
    periode: 'ca. 150 n.Chr.',
    beschrijving: 'In Vleuterweide bij Utrecht stond een stenen wachttoren. Dit was ongebruikelijk - de meeste waren van hout.',
    watWasHier: 'Een versterkte toren met uitzicht over de omgeving. Mogelijk woonden hier ook families van soldaten.',
    watTeZien: 'De fundamenten zijn gemarkeerd in de wijk. Vondsten zijn in het Centraal Museum Utrecht.',
    verwachteVondsten: 'Bouwmaterialen (dakpannen, stenen), aardewerk, en persoonlijke bezittingen.',
    betekenis: 'Een van de weinige bekende stenen wachttorens. Toont variatie in Romeinse bouwwijzen.',
    bronnen: []
  },
  'Wachttoren Bunnik': {
    naam: 'Wachttoren Bunnik',
    type: 'wachttoren',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Bij Bunnik stond een houten wachttoren aan de Rijn.',
    watWasHier: 'Een uitkijkpost waar soldaten de rivier in de gaten hielden en signalen doorgaven.',
    watTeZien: 'De exacte locatie is niet precies bekend. Het gebied is nu bebouwd.',
    verwachteVondsten: 'Kleine hoeveelheden militaria en aardewerk.',
    betekenis: 'Onderdeel van het signaleringssysteem langs de Limes.',
    bronnen: []
  },
  'Castellum Maastricht': {
    naam: 'Castellum Maastricht',
    latinNaam: 'Mosae Trajectum',
    type: 'versterking',
    periode: '3e - 4e eeuw n.Chr.',
    beschrijving: 'In het centrum van Maastricht stond een laat-Romeinse versterking bij de brug over de Maas.',
    watWasHier: 'Een verdedigingswerk uit de tijd dat het Rijk onder druk stond. Het bewaakte de rivierovergang.',
    watTeZien: 'Onder het Vrijthof zijn resten gevonden. Centre Ceramique toont de Romeinse geschiedenis.',
    verwachteVondsten: 'Laat-Romeinse munten, militaire riembeslag, aardewerk, en bouwmaterialen.',
    betekenis: 'Toont de continuiteit - Maastricht bleef belangrijk van de Romeinse tijd tot nu.',
    bronnen: ['https://www.centreceramique.nl']
  },
  'Roompot': {
    naam: 'Roompot Fort',
    type: 'castellum',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Bij de Roompot in Zeeland lag een Romeins fort dat de zeeroute bewaakte.',
    watWasHier: 'Een versterking aan de kust die schepen beschermde en piraterij teginging.',
    watTeZien: 'Het fort is door de zee verzwolgen. Soms spoelen vondsten aan.',
    verwachteVondsten: 'Door erosie kunnen munten en voorwerpen op het strand gevonden worden.',
    betekenis: 'Toont dat de Romeinen ook de Zeeuwse wateren controleerden.',
    bronnen: []
  },
  'Castellum Carvium': {
    naam: 'Carvium',
    latinNaam: 'Carvium',
    type: 'castellum',
    periode: '1e - 3e eeuw n.Chr.',
    beschrijving: 'Carvium lag bij Herwen, waar de Rijn en de Waal samenkwamen.',
    watWasHier: 'Een fort bij een strategisch punt waar twee grote rivieren samenkwamen.',
    watTeZien: 'Het gebied is nu natuurgebied. Vondsten zijn in Museum Het Valkhof in Nijmegen.',
    verwachteVondsten: 'Militaria, aardewerk, munten, en scheepsresten.',
    betekenis: 'Controleerde een belangrijk knooppunt van waterwegen.',
    bronnen: []
  }
}

// Generieke informatie voor forten zonder specifieke data
export const GENERIEK_FORT_INFO: RomeinsFortInfo = {
  naam: 'Romeins fort',
  type: 'versterking',
  periode: '1e - 3e eeuw n.Chr.',
  beschrijving: 'Een Romeinse militaire versterking langs de noordgrens van het Rijk.',
  watWasHier: 'Een militaire post met soldaten die de grens bewaakten. Vaak was er ook een burgerdorp (vicus) in de buurt.',
  watTeZien: 'De meeste forten zijn nu verdwenen of overbouwd. Lokale musea tonen vaak vondsten.',
  verwachteVondsten: 'Munten, fibulae (mantelspelden), aardewerk, wapens en gereedschap.',
  betekenis: 'Onderdeel van de Limes, de noordelijke grens van het Romeinse Rijk die door Nederland liep.',
  bronnen: []
}

// Type vertalingen
export const FORT_TYPE_LABELS: Record<string, string> = {
  'castellum': 'Castellum (legerplaats)',
  'wachttoren': 'Wachttoren (signaalpost)',
  'vlootbasis': 'Vlootbasis (haven)',
  'legerkamp': 'Legerkamp (castra)',
  'minifort': 'Minifort (wachtpost)',
  'versterking': 'Versterking',
  'villa': 'Villa (militair gebruikt)'
}
