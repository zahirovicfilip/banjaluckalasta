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

export const nav = [
  { label: 'Lasta', href: '#lasta' },
  { label: 'Istorija', href: '#istorija' },
  { label: 'Skakači', href: '#skakaci' },
  { label: 'Rezultati', href: '#rezultati' },
  { label: 'Kamp', href: '#kamp' },
];

/** One label per intent, used everywhere on the page. */
export const cta = {
  join: { label: 'Prijavi se', href: '#prijava' },
  watch: { label: 'Pogledaj skok', href: '#video' },
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
  eyebrow: 'Sportsko rekreativno udruženje · Banja Luka',
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

// The section under the hero. The hero already carries 73 years and 12 m, so these are different facts.
export const stats = [
  { value: '1936', unit: '', label: 'završen je Gradski most i počeli su skokovi u Vrbas' },
  { value: '7', unit: '', label: 'puta najljepša lasta: Igor Arsenić, predsjednik udruženja' },
  { value: '2021', unit: '', label: 'osnovano udruženje „Banjalučka lasta“' },
  { value: '75', unit: '', label: 'polaznika trening kampa na Manjači 2026.' },
];

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

export const history = [
  { year: '1936', title: 'Most i prvi skokovi', text: 'Završen je Gradski most. Mladi Banjalučani počinju da skaču u Vrbas i nadmeću se u tehnici i preciznosti.' },
  { year: '1953', title: 'Karneval na Vrbasu', text: 'Klub akademičara Banjaluka organizuje prvi karneval i prve zvanične skokove sa mosta.' },
  { year: '1955', title: 'Rođenje laste', text: 'Vrbaska lasta dobija svoj stil: drugačiji odraz, let i ulazak u vodu od svih drugih skokova.' },
  { year: '1970-e', title: 'Susreti na Vrbasu', text: 'Karneval mijenja ime. Osamdesetih obale i Kastel okuplja i više od 10.000 posjetilaca.' },
  { year: '1995', title: 'Ljeto na Vrbasu', text: 'Manifestacija dobija današnje ime. Skokovi sa mosta ostaju njen najgledaniji dio.' },
  { year: '2019', title: 'Lasta na marki', text: 'Pošta Srpske izdaje marku „Banjalučka lasta“ u tiražu od 10.000, po dizajnu Božidara Došenovića.' },
  { year: '2021', title: 'Osnovan klub', text: 'Skakači se okupljaju u udruženje „Banjalučka lasta“. Predsjednik je Igor Arsenić.' },
  { year: '2026', title: 'Sedma titula', text: 'Igor Arsenić sedmi put izvodi najljepšu lastu. Nenad Arsenić se vraća na most poslije devet godina.' },
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
      alt: 'Trka na SUP daskama uz plažu jezera',
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
      alt: 'Trening borilačkih vještina: bacanje na terenu',
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
      alt: 'Polaznici kampa u plavim dresovima se pozdravljaju',
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
      alt: 'Skakač u letu iznad tornja sa platformama',
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

export const jersey = {
  title: 'Dres kampa',
  text: 'Svi polaznici nose dres kampa. Ovo je dizajn iz 2025, u bijeloj i rozoj varijanti.',
  altWhite: 'Dres trening kampa 2025, bijela varijanta',
  altPink: 'Dres trening kampa 2025, roza varijanta',
};

export const actions = [
  {
    title: 'Rafting i čišćenje Vrbasa',
    photo: { id: 'OF_8684YXWE', frame: 'maxres2' as const }, // TODO: photo from the club's own cleanup
    text: 'Besplatan spust kanjonom Vrbasa uz sakupljanje otpada sa obala i iz korita. Prijavilo se više od 100 Banjalučana, uz stručnu podršku Voda Srpske.',
  },
  {
    title: 'Igrališta i naselja',
    text: 'Članovi kluba uređuju školska igrališta i dijelove naselja u gradu.',
  },
];

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
