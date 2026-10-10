/**
 * All copy and data for the site lives here, so the page can be tweaked
 * without touching components. Facts come from press coverage and from the
 * club's own 2026 brochure, both collected in RESEARCH.md. Anything marked
 * TODO still needs confirmation from the club.
 */

export const site = {
  name: 'Banjalučka lasta',
  legalName: 'Sportsko rekreativno udruženje „Banjalučka lasta“',
  description:
    'Sportsko rekreativno udruženje „Banjalučka lasta“ iz Banjaluke. Čuvamo tradiciju skokova sa Gradskog mosta u Vrbas i vodimo trening kamp na jezeru Manjača.',
  url: 'https://banjaluckalasta.ba', // TODO: real domain
  founded: 2021,
  president: 'Igor Arsenić',
  // TODO: add a public e-mail / phone once the club confirms one
  email: null as string | null,
};

export const socials = [
  { id: 'instagram', label: 'Instagram', handle: '@banjalucka_lasta', href: 'https://www.instagram.com/banjalucka_lasta/' },
  { id: 'tiktok', label: 'TikTok', handle: '@banjaluka.lasta', href: 'https://www.tiktok.com/@banjaluka.lasta' },
  { id: 'facebook', label: 'Facebook', handle: 'Banjalučka Lasta', href: 'https://www.facebook.com/p/Banjalu%C4%8Dka-Lasta-61563609915496/' },
] as const;

// Same order as the sections on the page, then the news page. The section links start with
// "/" so they also lead back from the news pages; on the home page they just scroll.
export const nav = [
  { label: 'Pobjednici', href: '/#pobjednici' },
  { label: 'Kamp', href: '/#kamp' },
  { label: 'Lasta', href: '/#lasta' },
  { label: 'Skakači', href: '/#skakaci' },
  { label: 'Rezultati', href: '/#rezultati' },
  { label: 'Novosti', href: '/novosti' },
];

/** One label per intent, used everywhere on the page. */
export const cta = {
  join: { label: 'Prijavi se', href: '#prijava' },
  watch: { label: 'Pogledaj skok', href: '#video' },
  news: { label: 'Novosti', href: '/novosti' },
};

export const hero = {
  // The scroll-driven dive (LastaHero). Hidden for now: the hero shows the poster with
  // the diver cutout instead. Set to true to bring the dive back; the quote poster then
  // returns to its own section further down the page.
  animated: false,
  // Poster hero: two headline numbers, then one paragraph that says what this is.
  srTitle: 'Banjalučka lasta: skokovi sa Gradskog mosta u Banjaluci',
  stats: [
    // `short` is the label on phones, where the two numbers share the narrow column beside the poster.
    { value: '73', unit: '', label: 'godine skokova sa Gradskog mosta, od 1953.', short: 'godine skokova' },
    { value: '12', unit: 'm', label: 'od ograde mosta do površine Vrbasa', short: 'od mosta do Vrbasa' },
  ],
  lead: 'Banjalučka lasta se skače samo sa Gradskog mosta: ruke iznad glave, tijelo ispruženo, let koji se drži što duže. Udruženje čuva tu tradiciju, trenira nove skakače i ljeti vodi kamp na Manjači.',
  // The rest of this block is only used by the animated hero.
  title: 'Banjalučka lasta',
  sub: 'Dvanaest metara iznad Vrbasa. Ruke iznad glave, jedan odraz i let koji Banjaluka gleda od 1936.',
  // Only used by the animated hero: captions synced to the dive (scroll progress 0 to 1).
  phases: [
    { word: 'Odraz', line: 'Čvrst stav na ogradi mosta. Jedan odraz, bez drugog pokušaja.', from: 0.14, to: 0.4 },
    { word: 'Let', line: 'Ruke iznad glave, tijelo ispruženo. Položaj se drži što duže.', from: 0.43, to: 0.79 },
  ],
  outro: 'Lasta sa Gradskog mosta, simbol Banjaluke.',
  a11yLabel: 'Banjalučka lasta, znak kluba: skakač u letu unutar kruga',
};

/**
 * The story of the jumps in three chapters (Story.tsx), from the press and the Tourist
 * Organisation, see RESEARCH.md. 1936: TO Banjaluka says the jumps began when the bridge was
 * built. 1953 and 1955: TO Banjaluka and bl-portal. 2021: the club, per its own words in
 * bl-portal ("moramo nešto pokrenuti").
 */
export const story = {
  title: 'Kako je počelo',
  // Each sentence lights up word by word as it is scrolled into reading position (Story.tsx).
  chapters: [
    {
      year: '1936',
      beats: [
        'Preko Vrbasa je završen Gradski most, dvanaest metara iznad vode.',
        'Ubrzo se na njegovoj ogradi pojavljuju prvi skakači: mladi Banjalučani koji se usude da skoče u rijeku.',
        'Nema sudija ni pravila. Nadmeću se u hrabrosti, i u tome čiji je skok ljepši.',
      ],
    },
    {
      year: '1953',
      beats: [
        'Članovi Kluba akademičara Banjaluka organizuju prvi Karneval na Vrbasu.',
        'Skokovi sa mosta prvi put postaju zvanični, a hiljade ljudi ispune most i obale da vide svaki skok.',
        'Dvije godine kasnije lasta dobija svoj stil: ruke iznad glave, tijelo ispruženo, let koji se drži što duže.',
        'Karneval je od tada mijenjao ime, danas je to Ljeto na Vrbasu, ali skokovi su ostali njegov najvažniji dio.',
      ],
    },
    {
      year: '2021',
      beats: [
        'Kada su starije generacije stale, na mostu je ostalo malo skakača iz Banjaluke.',
        'Skakači tada osnivaju udruženje „Banjalučka lasta“.',
        'Žele da most ponovo pripada domaćim skakačima, i da mladi nauče lastu kako treba.',
        'Predsjednik je Igor Arsenić, a ljeti udruženje vodi i trening kamp na Manjači.',
      ],
    },
  ],
};

export const technique = {
  title: 'Ruke iznad glave.',
  intro:
    'Banjalučka lasta se skače samo sa Gradskog mosta. Visina mosta i dubina Vrbasa odredili su njen odraz, let i ulazak u vodu.',
  difference:
    'Kod mostarske i užičke laste ruke idu iza tijela. Kod banjalučke idu iznad glave, a tijelo je ispruženo i izvijeno.',
  phases: [
    { name: 'Stav', text: 'Miran, čvrst stav na ogradi mosta. Sve počinje prije nego što se noge odvoje od kamena.' },
    { name: 'Odraz', text: 'Odraz određuje cijeli let. Greška na mostu se ne može popraviti u zraku.' },
    { name: 'Let', text: 'Ruke iznad glave, tijelo ispruženo. Cilj je zadržati položaj laste što je duže moguće.' },
    { name: 'Ulazak', text: 'Ulazak u vodu uz što manje prskanja. Ispod mosta Vrbas je dubok dva do tri metra.' },
  ],
};

/** The two chapter breaks: one still line each, with photos falling past it (Interlude.tsx). */
export const interludes = {
  lasta: { label: 'Banjalučka lasta u slikama', line: 'Ruke iznad glave.' },
  kamp: { label: 'Kamp u slikama', line: 'Od mosta do tornja.' },
};

export const winnersHead = {
  title: 'Pobjednici skokova',
};

/**
 * Every winner from the board "Pobjednici skokova sa Gradskog mosta od 1979."
 * (no competition in 1983, 1992 to 1996 and 2020), plus 2025 and 2026. Names
 * the board gives surname first (Ostojić Marko, Jakupović Medo) are turned
 * round. `city` is one thing Banja Luka lived through that year; each was
 * checked against press or encyclopedia sources in October 2026.
 */
export const winners = [
  { year: '1979', name: 'Asim Džaferagić', city: 'Marijan Beneš u Banjaluci nokautom osvaja titulu profesionalnog prvaka Evrope u boksu. U aprilu šesnaestogodišnji Gari Kasparov ovdje osvaja svoj prvi međunarodni turnir.' },
  { year: '1980', name: 'Fadil Jakupović', city: 'Na tvrđavi Kastel počinju arheološka iskopavanja. Do 1986. ispod srednjovjekovnih bedema otkrivaju i ostatke iz antičkog doba.' },
  { year: '1981', name: 'Omer Hasanbegović', city: 'Zemljotres magnitude 5,4 trese Banjaluku 13. avgusta, dvanaest godina poslije razornog 1969. Oštećene su brojne zgrade.' },
  { year: '1982', name: 'Ibrahim Caca Bajbaga', city: 'Riblja čorba 6. decembra u dvorani Borik počinje jugoslovensku turneju albuma „Buvlja pijaca“.' },
  { year: '1984', name: 'Nenad Arsenić', city: 'Banjalučanin Anton Josipović osvaja olimpijsko zlato u boksu u Los Anđelesu. Grad mu priređuje veliki doček.' },
  { year: '1985', name: 'Omer Hasanbegović', city: 'Svjetska šampionka Maja Čiburdanidze pobjeđuje na velemajstorskom šahovskom turniru u Banjaluci, ispred Psahisa, Velimirovića i Kurajice.' },
  { year: '1986', name: 'Nenad Arsenić', city: 'Rukometaši Borca Zlatan Arnautović, Zlatko Saračević i Irfan Smailagić postaju svjetski prvaci sa Jugoslavijom u Švajcarskoj.' },
  { year: '1987', name: 'Omer Hasanbegović', city: 'Reprezentacija Jugoslavije pred 25.000 gledalaca na Gradskom stadionu pobjeđuje Austriju 4:0.' },
  { year: '1988', name: 'Nenad Arsenić', city: 'Borac kao drugoligaš osvaja Kup maršala Tita. U finalu u Beogradu pobjeđuje Crvenu zvezdu 1:0, golom Senada Lupića.' },
  { year: '1989', name: 'Nenad Arsenić', city: 'Golman Ante Jakovljević u posljednjem kolu brani penal Proleteru i vraća Borac u Prvu ligu Jugoslavije.' },
  { year: '1990', name: 'Omer Hasanbegović', city: 'Banjalučani 18. novembra izlaze na prve višestranačke izbore u Bosni i Hercegovini poslije Drugog svjetskog rata.' },
  { year: '1991', name: 'Miralem Juraldžija', city: 'Rukometaši Borca osvajaju IHF kup. Poslije 20:15 u Boriku, CSKA u revanšu u Moskvi dobija samo 24:23.' },
  { year: '1997', name: 'Dario Mišlicki', city: 'Aerodrom Banjaluka se 18. novembra otvara za civilni saobraćaj.' },
  { year: '1998', name: 'Nenad Arsenić', city: 'Banski dvor, nekadašnje sjedište bana Vrbaske banovine, i zvanično postaje gradski kulturni centar.' },
  { year: '1999', name: 'Dario Mišlicki', city: 'Iz Banjaluke 29. januara polijeće prvi let Air Srpske, za Beograd.' },
  { year: '2000', name: 'Dario Mišlicki', city: 'Košarkašica Slađana Golić, olimpijska vicešampionka iz Seula, oprašta se od košarke u punoj dvorani Borik.' },
  { year: '2001', name: 'Dario Mišlicki', city: 'Zdravko Čolić 31. maja, poslije sedam godina, ponovo pjeva u Banjaluci.' },
  { year: '2002', name: 'Dario Mišlicki', city: 'U Banjaluci se prvi put igra ATP čelendžer, teniski turnir na šljaci koji će se održati 21 put.' },
  { year: '2003', name: 'Dario Mišlicki', city: 'Papa Jovan Pavle II 22. juna dolazi u Banjaluku i na misi u Petrićevcu proglašava blaženim Banjalučanina Ivana Merza.' },
  { year: '2004', name: 'Marko Ostojić', city: 'U obnovljenom Hramu Hrista Spasitelja u centru grada 26. septembra služi se prva liturgija.' },
  { year: '2005', name: 'Dario Mišlicki', city: 'Na Vrbasu se vozi Evropsko prvenstvo u raftingu, sa 19 ekipa iz devet zemalja.' },
  { year: '2006', name: 'Dario Mišlicki i Elvis Ganić', city: 'Borac osvaja Prvu ligu Republike Srpske i plasira se u Premijer ligu Bosne i Hercegovine.' },
  { year: '2007', name: 'Nenad Arsenić', city: 'Banjalučanka Marija Šestić pjeva za BiH na Eurosongu u Helsinkiju i zauzima 11. mjesto. Rađa se Kratkofil, prvi filmski festival u gradu.' },
  { year: '2008', name: 'Nenad Arsenić', city: 'Na Kastelu se prvi put održava Demofest, festival neafirmisanih bendova. Prijavile su se 192 grupe.' },
  { year: '2009', name: 'Nenad Arsenić', city: 'Svjetsko prvenstvo u raftingu dovodi na Vrbas takmičare iz 35 zemalja, uz noćni slalom u kanjonu Tijesno.' },
  { year: '2010', name: 'Dario Mišlicki', city: 'Obnovljena robna kuća Boska ponovo se otvara 11. novembra. Mjesec kasnije iz Banjaluke polijeće simboličan let za Brisel: ukinute su vize za Šengen.' },
  { year: '2011', name: 'Medo Jakupović', city: 'Borac prvi put u istoriji postaje prvak Bosne i Hercegovine.' },
  { year: '2012', name: 'Borko Miladinović', city: 'Škotski Franz Ferdinand na Kastel Rock Festu 2. jula sviraju svoj prvi koncert u Bosni i Hercegovini.' },
  { year: '2013', name: 'Borko Miladinović', city: 'Ljeto na Vrbasu slavi 60 godina. Manifestacija koja je počela karnevalom 1953. i danas se otvara skokovima sa Gradskog mosta.' },
  { year: '2014', name: 'Marko Pavlović', city: 'U majskim poplavama Vrbas dostiže istorijski vodostaj. Proglašeno je vanredno stanje, a voda odnosi most u Česmi.' },
  { year: '2015', name: 'Aleksandar Aleksić', city: 'Ulicama grada trči se prvi Banjalučki polumaraton.' },
  { year: '2016', name: 'Igor Arsenić', city: 'Obnovljena Ferhadija, srušena 1993, otvara se 7. maja, tačno 23 godine poslije rušenja.' },
  { year: '2017', name: 'Igor Arsenić', city: 'Dvorana Borik je domaćin Evropskog prvenstva u džiju-džicu za seniore.' },
  { year: '2018', name: 'Đorđe Gajić', city: 'Banjaluka nosi titulu Evropskog grada sporta. Na Kastelu se prvi put održava viteški festival „Kastrum“.' },
  { year: '2019', name: 'Đorđe Gajić', city: 'Otvoren je novi Zeleni most preko Vrbasa, a Pošta Srpske izdaje marku „Banjalučka lasta“.' },
  { year: '2021', name: 'Đorđe Gajić', city: 'Skakači sa Gradskog mosta osnivaju udruženje „Banjalučka lasta“. Borac po drugi put postaje prvak BiH.' },
  { year: '2022', name: 'Igor Arsenić', city: 'Svjetsko prvenstvo u raftingu ponovo je na Vrbasu: više od 60 ekipa iz 22 zemlje, uz svečano otvaranje na Kastelu.' },
  { year: '2023', name: 'Igor Arsenić', city: 'Na prvom ATP 250 turniru u gradu, Srpska Openu, Dušan Lajović pobjeđuje Novaka Đokovića, a u finalu i Andreja Rubljova.' },
  { year: '2024', name: 'Igor Arsenić', city: 'Borac je prvak BiH i prvi put igra ligašku fazu Lige konferencije.' },
  { year: '2025', name: 'Igor Arsenić', city: 'Borac igra osminu finala Lige konferencije i ispada od Rapida tek u produžecima. Krajem marta poplave donose vanrednu situaciju u 16 naselja.' },
  { year: '2026', name: 'Igor Arsenić', city: 'Vrbas u maju ugošćuje Svjetsko prvenstvo u kajaku na divljim vodama i Evropsko prvenstvo u raftingu. Borac osvaja četvrtu titulu prvaka BiH.' },
];

export const people = {
  igor: {
    name: 'Igor Arsenić',
    role: 'Predsjednik udruženja',
    text: 'Prvi skok sa šest godina. Sedam puta najljepša banjalučka lasta sa Gradskog mosta. Pobjednik skokova sa mosta na Đetinji u Užicu 2023.',
    photo: { id: 'vn-va-dhUPA', frame: 'maxres1' as const },
  },
  nenad: {
    name: 'Nenad Arsenić',
    role: 'Legenda Gradskog mosta',
    text: 'Osam puta prvo mjesto u banjalučkoj lasti. U 2026. ponovo na mostu, poslije devet godina pauze.',
    photo: { id: 'OF_8684YXWE', frame: 'hqdefault' as const },
  },
  family: {
    title: 'Porodica Arsenić',
    text: 'Otac Nenad je osvajao pehare sa mosta. Danas skaču sinovi: Igor, Zvjezdan i Dušan. Na mostu 2022. bili su prvi, četvrti i peti.',
  },
  durovic: {
    name: 'Igor Đurović',
    role: 'Stari most, Mostar',
    text: 'Najmlađi Banjalučanin na Starom mostu. Skače sa 23 metra u Neretvu i bio je među prvih deset 2026.',
    image: 'https://picsum.photos/seed/lasta-mostar-neretva/900/1100?grayscale', // TODO: real photo
  },
  club: {
    value: '13',
    of: '22',
    text: 'skakača na Gradskom mostu 2026. bilo je iz Banjaluke.',
  },
};

export const results = {
  latest: {
    year: 2026,
    date: '12. jul 2026.',
    note: '22 skakača, 73. Ljeto na Vrbasu',
    podium: [
      { place: 1, name: 'Igor Arsenić', from: 'Banja Luka' },
      { place: 2, name: 'Dino Bajrić', from: 'Sarajevo' }, // TODO: press also spells it "Brajić"
      { place: 3, name: 'Miloš Kojić', from: 'Modriča' },
    ],
  },
  bridge: [
    { year: '2025', winner: 'Igor Arsenić', note: '24 skakača' },
    { year: '2024', winner: 'Igor Arsenić', note: 'Najljepša lasta' },
    { year: '2023', winner: 'Igor Arsenić', note: '70. Ljeto na Vrbasu' },
    { year: '2022', winner: 'Igor Arsenić', note: 'Zvjezdan 4., Dušan 5.' },
    { year: '2019', winner: 'Đorđe Gajić', note: 'Igor Arsenić 3.' },
    { year: '2016', winner: 'Igor Arsenić', note: 'Gradski most' },
  ],
  away: [
    { year: '2026', place: 'Mostar, Stari most', text: 'Igor Đurović među prvih deset, sa 23 metra.' },
    { year: '2025', place: 'Makarska, Sveti Petar', text: 'Igor Arsenić, lasta sa stijene u Jadran.' },
    { year: '2023', place: 'Užice, most na Đetinji', text: 'Igor Arsenić prvi, sa 16 metara.' },
  ],
};

export const quote = {
  text: 'Ovo je prije svega jedan viteški, hrabri sport koji nije za svakoga.',
  author: 'Igor Arsenić',
  role: 'predsjednik udruženja',
  // The diver cutout from the 2026 brochure cover (file "Igor.png").
  photoAlt: 'Igor Arsenić u lasti, u letu',
};

export const videos = [
  { id: 'AMU1_urs3l8', frame: 'maxresdefault' as const, title: 'Najbolja banjalučka lasta 2025', who: 'Igor Arsenić' },
  { id: 'vn-va-dhUPA', frame: 'maxresdefault' as const, title: 'Najbolja banjalučka lasta 2024', who: 'Igor Arsenić' },
  { id: 'OF_8684YXWE', frame: 'maxres1' as const, title: 'Revijalni skok na Ljetu na Vrbasu', who: 'Nenad Arsenić' },
];

/** Wide shot of Gradski most full of spectators, a frame from the 2025 video. */
export const bridgePhoto = {
  id: 'AMU1_urs3l8',
  frame: 'maxres1' as const,
  alt: 'Gradski most u Banjaluci, pun gledalaca, iznad Vrbasa',
};

/**
 * Trening kamp. Everything below comes from the club's 2026 brochure
 * ("Trening kamp 2026, 15 - 21. jun") and its video material.
 */
export const camp = {
  badgeAlt: 'Trening kamp 2026',
  title: 'Sedam dana na Manjači',
  text: 'Trening kamp 2026 održan je od 15. do 21. juna na jezeru Manjača: skokovi, snaga, plivanje i borilačke vještine.',
  // The emblem sits above the camp badge on the club's own brochure, jersey and
  // video graphics. Set to false to hide it. TODO: confirm how the patronage should be worded.
  showSeal: true,
  sealAlt: 'Amblem Republike Srpske',
  facts: [
    { value: '75', label: 'polaznika' },
    { value: '7', label: 'dana na jezeru' },
    { value: '5:30', label: 'jutarnja smotra' },
  ],
  // Drone fly-in over the lake. Wide for landscape screens, tall for phones.
  video: {
    wide: '/media/kamp-wide.mp4',
    tall: '/media/kamp-tall.mp4',
    posterWide: '/media/kamp-wide.jpg',
    posterTall: '/media/kamp-tall.jpg',
  },
  // Drone orbit past the jump tower, behind the programme.
  tower: {
    wide: '/media/tower-wide.mp4',
    tall: '/media/tower-tall.mp4',
    posterWide: '/media/tower-wide.jpg',
    posterTall: '/media/tower-tall.jpg',
  },
};

type ProgramItem = { time: string; label: string; key?: boolean };

const morning: ProgramItem[] = [
  { time: '5:30', label: 'Smotra' },
  { time: '6:00', label: 'Jutarnji trening snage, izdržljivosti i plivanja', key: true },
  { time: '8:00', label: 'Doručak' },
  { time: '8:30', label: 'Odmor i slobodne aktivnosti' },
];

const evening: ProgramItem[] = [
  { time: '18:00', label: 'Večera u restoranu' },
  { time: '19:00', label: 'Predavanje i pregled dana' },
  { time: '20:30', label: 'Trening borilačkih vještina', key: true },
  { time: '22:00', label: 'Spavanje' },
];

export const program = {
  title: 'Program kampa',
  text: 'Radni dan počinje smotrom u 5:30 i jutarnjim treningom, a završava se treningom borilačkih vještina. Vikend donosi dan za porodicu i takmičenje u skokovima.',
  // Images live in src/assets/kamp/dan-1.jpg ... dan-7.jpg, in this order.
  days: [
    {
      id: 'pon', short: 'Pon', date: '15. jun', name: 'Ponedjeljak',
      summary: 'Dolazak, večera i upoznavanje sa planom i programom.',
      alt: 'Jezero Manjača iz zraka, sa branom i stazom oko jezera',
      items: [
        { time: '18:00', label: 'Doček učesnika i večera', key: true },
        { time: '', label: 'Upoznavanje sa planom i programom' },
      ],
    },
    {
      id: 'uto', short: 'Uto', date: '16. jun', name: 'Utorak',
      summary: 'Prvi puni dan: jutarnji trening, skokovi i borilačke vještine.',
      alt: 'Skakač u lasti napušta platformu tornja',
      items: [
        ...morning,
        { time: '11:30', label: 'Ručak' },
        { time: '13:00', label: 'Trening skokova i druženje na plaži', key: true },
        { time: '16:00', label: 'Odmor' },
        ...evening,
      ],
    },
    {
      id: 'sri', short: 'Sri', date: '17. jun', name: 'Srijeda',
      summary: 'Trka SUP daskama na jezeru i obuka ronjenja.',
      alt: 'Četiri takmičara veslaju na velikoj SUP dasci po jezeru',
      items: [
        ...morning,
        { time: '11:30', label: 'Ručak' },
        { time: '13:00', label: 'Trka SUP daskama na jezeru', key: true },
        { time: '15:00', label: 'Obuka ronjenja', key: true },
        ...evening,
      ],
    },
    {
      id: 'cet', short: 'Čet', date: '18. jun', name: 'Četvrtak',
      summary: 'Skokovi, surfanje na vodi i SUP daske. Uveče airsoft.',
      alt: 'Toranj za skokove na obali jezera, snimak iz zraka',
      items: [
        ...morning,
        { time: '11:30', label: 'Ručak u restoranu' },
        { time: '13:00', label: 'Trening skokova i druženje na plaži, uz surfanje na vodi i vožnju SUP daskama', key: true },
        { time: '17:00', label: 'Večera u restoranu' },
        { time: '18:00', label: 'Airsoft', key: true },
        { time: '22:00', label: 'Spavanje' },
      ],
    },
    {
      id: 'pet', short: 'Pet', date: '19. jun', name: 'Petak',
      summary: 'Trening skokova i snage, pa surfanje na vodi.',
      alt: 'Skakač se odražava sa platforme tornja za skokove',
      items: [
        ...morning,
        { time: '11:30', label: 'Ručak' },
        { time: '13:00', label: 'Trening skokova i snage', key: true },
        { time: '15:00', label: 'Surfanje na vodi' },
        ...evening,
      ],
    },
    {
      id: 'sub', short: 'Sub', date: '20. jun', name: 'Subota',
      summary: 'Vježbe na plaži i dan za porodicu.',
      alt: 'Publika i kajaci uz obalu jezera Manjača',
      items: [
        { time: '7:00', label: 'Smotra' },
        { time: '8:00', label: 'Doručak' },
        { time: '10:00', label: 'Vježbe oblikovanja tijela na plaži' },
        { time: '11:30', label: 'Ručak' },
        { time: '13:00', label: 'Dan za porodicu (volontiranje)', key: true },
        { time: '16:30', label: 'Večera' },
        { time: '18:00', label: 'Airsoft' },
      ],
    },
    {
      id: 'ned', short: 'Ned', date: '21. jun', name: 'Nedjelja',
      summary: 'Takmičenje u skokovima i koncert Borisa Režaka.',
      alt: 'Skakač u lasti ispred tornja, na takmičenju u skokovima',
      items: [
        { time: '7:00', label: 'Smotra' },
        { time: '8:00', label: 'Doručak' },
        { time: '8:30', label: 'Odmor i slobodne aktivnosti' },
        { time: '12:00', label: 'Ručak' },
        { time: '16:00', label: 'Takmičenje u skokovima', key: true },
        { time: '18:00', label: 'Koncert Borisa Režaka', key: true },
      ],
    },
  ] satisfies { id: string; short: string; date: string; name: string; summary: string; alt: string; items: ProgramItem[] }[],
  coaches: [
    { area: 'Snaga, izdržljivost i plivanje', names: 'Zvjezdan Arsenić, Sara Rončević i Aleksandra Novaković' },
    { area: 'Borilačke vještine', names: 'Božidar Vučurević, evropski prvak u džudou' },
  ],
};

/**
 * The airsoft club run by the same people: Airsoft klub „Arhangel Mihailo“, Banja Luka.
 * Everything here is from the club's Instagram (@airsoftklub.arhangelmihailo, October 2026):
 * its bio, and the posters for its game days, training days and the 8x8 tournament.
 * The images in src/assets/airsoft/ are the web-size copies from that profile.
 */
export const airsoft = {
  // The navbar shows this instead of "Banjalučka lasta" while the section is on screen.
  navName: ['Airsoft', 'Arhangel Mihailo'] as const,
  title: 'Arhangel Mihailo',
  lead: 'Airsoft igre, događaji i teambuildinzi na klupskom poligonu u Banjaluci. Adrenalin, taktika i zabava: dođi sam ili sa ekipom.',
  link: 'Iza kluba stoji Igor Arsenić, predsjednik Banjalučke laste, a airsoft je bio i dio trening kampa na Manjači.',
  values: ['Realna akcija', 'Timski duh', 'Fair play', 'Adrenalin'],
  formats: [
    { name: 'Classic Game Day', text: 'Dan otvorenih vrata: dođi, isprobaj, igraj. Nemaš opremu? Za posjetioce je sve potpuno besplatno.' },
    { name: 'Trening dan', text: 'Spremi se, treniraj, poboljšaj se. Ulaz je besplatan za članove i za one sa svojom opremom.' },
    { name: 'Turnir 8×8', text: 'Ekipe od po osam igrača na poligonu. Na turniru 2. oktobra 2026. prva nagrada bila je 5.000 KM.' },
    { name: 'Teambuilding', text: 'Igra za firme, društva i ekipe koje žele da se okupe i provjere timski duh.' },
  ],
  slogan: 'Okupi ekipu i dođi da osjetiš adrenalin!',
  instagram: { label: 'Prati klub na Instagramu', handle: '@airsoftklub.arhangelmihailo', href: 'https://www.instagram.com/airsoftklub.arhangelmihailo/' },
  alts: {
    logo: 'Znak airsoft kluba „Arhangel Mihailo“: arhangel sa krilima i štitom',
    players: 'Dva igrača u taktičkoj opremi na poligonu kluba',
    aim: 'Igrač nišani na poligonu, plakat „Pokret. Preciznost. Timski rad.“',
    gameDay: 'Plakat za Classic Game Day, 18. jul 2026.',
    tournament: 'Plakat za Turnir 8x8, 2. oktobar 2026, prva nagrada 5.000 KM',
  },
};

/** Jump clips from the camp's final competition. Files: public/media/skok-NN.mp4 + .jpg */
export const finale = {
  title: 'Finale na tornju',
  text: 'Kamp se završava takmičenjem u skokovima. U nedjelju, 21. juna, na toranj su izašli regionalni prvaci, pred punom obalom jezera.',
  railLabel: 'Skokovi sa finala kampa',
  // TODO: names of the jumpers. Only two source files were named (Dušan, Sanel).
  clips: [
    { id: '01' }, { id: '02' }, { id: '03' }, { id: '04', name: 'Dušan' }, { id: '05' }, { id: '06' },
    { id: '07' }, { id: '08' }, { id: '09', name: 'Sanel' }, { id: '10' }, { id: '11' }, { id: '12' },
  ] as { id: string; name?: string }[],
};

/**
 * "Klub van mosta": the club's work off the bridge. The rafting and Vrbas cleanup (31 May,
 * 100+ registered, expert support from Vode Srpske) is from the press, see RESEARCH.md.
 * TODO: photos from the cleanup and the playgrounds, when the club sends them.
 */
export const community = {
  title: 'Klub van mosta',
  lead: 'Lasta nije samo skok sa mosta. Udruženje radi i za rijeku i za grad.',
  stat: { value: '100+', label: 'Banjalučana prijavilo se za besplatan rafting i čišćenje Vrbasa.' },
  actions: [
    {
      title: 'Rafting i čišćenje Vrbasa',
      text: 'Spust kanjonom Vrbasa uz sakupljanje otpada sa obala i iz korita, uz stručnu podršku Voda Srpske.',
    },
    {
      title: 'Igrališta i naselja',
      text: 'Članovi kluba uređuju školska igrališta i dijelove naselja u gradu.',
    },
  ],
  alts: {
    members: 'Dvojica se grle i slave na obali jezera, poslije skoka',
    water: 'Mladi u kajaku na jezeru, pored skoka sa tornja',
  },
};

export const join = {
  title: 'Skoči sa nama.',
  text: 'Tražimo mlade koji žele da nauče lastu kako treba: postepeno, uz trenera i sa sigurnošću na prvom mjestu.',
  minorNote: 'Za mlađe od 18 godina potrebna je saglasnost roditelja.',
  levels: ['Početnik sam', 'Skačem sa manjih visina', 'Takmičim se'],
};

export const partners = [
  // TODO: confirm which of these the club wants to list, and get logo files
  'Turistička organizacija Banjaluka',
  'Grad Banja Luka',
  'Banjalučka pivara',
  'Vode Srpske',
];
