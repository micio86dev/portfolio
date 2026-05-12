/// <reference path="../pb_data/types.d.ts" />

// Seeds (and re-seeds) the `customers` and `projects` collections from the
// portfolio source notes (`data/customers.md` / `data/projects.md`), and adds
// the `projects.customer` relation that links each case study to its client.
//
// Why a separate migration rather than editing the `created_*` ones:
//   - `created_projects.js` (1778600300) runs *before* `created_customers.js`
//     (1778600600), so the `customer` relation can't be declared there —
//     `customers` doesn't exist yet at that point.
//   - both collections were already created on existing instances, so the real
//     content + the new fields have to be applied as a forward step.
//
// `up()` is written to be idempotent and safe on a fresh DB too: `fields.add()`
// REPLACES a same-named field (so re-asserting `images` / `primary_image` is a
// no-op when `created_*` already declared them), and it always wipes both
// collections before inserting — running it on top of the old placeholder seed
// leaves a clean, deterministic result.
//
// Personal projects (Silent Hill Web, DevBoards.io) have no `customer`. Some
// customers (web agencies / past employers) have no project — that's expected.
//
// `started` / `ended` are the collaboration / project span (datetimes — an
// empty `ended` means "ongoing"). Client projects inherit their customer's
// span; `period` is the matching human display string. `order` encodes the
// homepage ordering: projects are most-recent-first by `ended ?? started`,
// with personal projects pushed after all client ones — see
// `byRecencyPersonalLast()` in astro/src/lib/pocketbase.ts. Customers are
// ordered most-recent-collaboration-first.
//
// Image semantics (see the `created_customers` migration comment): for a
// `customer`, `logo` = the company logo, `primary_image` = a screenshot of
// the client's portal (set later via admin), `images` = an extra gallery.
//
// Text content is filled for English only; `*_it` / `*_es` are left empty and
// the frontend falls back to `*_en` (see `pick()` / `localize()` in
// astro/src/lib/pocketbase.ts). Images are seeded empty — upload via the admin
// UI, then set `primary_image` to the chosen filename.

const CUSTOMERS = [
  {
    slug: 'nuovavita',
    name: 'Nuovavita',
    sector: 'Health · addiction recovery',
    url: 'https://metodostandup.it',
    featured: true,
    order: 1,
    started: '2023-05-01 00:00:00.000Z',
    ended: '2026-02-01 00:00:00.000Z',
    description_en:
      'The Standup Method is the first remote addiction-recovery programme. In its first year alone it changed the lives of over 100 people across Europe, with the mission of helping thousands quit cocaine addiction. It is a six-month programme followed from home, created by Danilo Cuccagna — a certified coach who definitively overcame his own addiction — together with internationally qualified psychologists, psychotherapists, psychiatrists and professional educators who went through addiction and came out of it thanks to the method.',
  },
  {
    slug: 'fiberdroid',
    name: 'Fiberdroid',
    sector: 'Telecommunications',
    url: 'https://fiberdroid.it',
    featured: true,
    order: 2,
    started: '2019-03-01 00:00:00.000Z',
    ended: '2021-02-01 00:00:00.000Z',
    description_en:
      'A telecommunications company that connects businesses and professionals to the internet over VoIP, WiFi, cloud and optical fibre. It builds cloud and IT solutions tailored to each client, helping companies integrate every communication service — the Internet included — to make their business fly.',
  },
  {
    slug: 'tc2-group',
    name: 'TC2 Group',
    sector: 'Quality control & inspection',
    url: 'https://www.tc2group.it',
    featured: true,
    order: 3,
    started: '2019-01-01 00:00:00.000Z',
    ended: '2020-08-01 00:00:00.000Z',
    description_en:
      'A long-standing client, and currently the largest of my career. TC2 works in quality control and manages the agents who carry it out; the web-development group I belong to handles a small slice of what the company does. The collaboration began in 2022 — first a demo of a management system, then a full rewrite of the API behind their main management system, given the low quality of the previously written code.',
  },
  {
    slug: 'formafarm',
    name: 'FormaFarm',
    sector: 'E-learning · knowledge management',
    url: 'https://lp.formafarm.com',
    featured: false,
    order: 4,
    started: '2018-05-01 00:00:00.000Z',
    ended: '2019-06-01 00:00:00.000Z',
    description_en:
      'My first client when I went freelance. Forma Farm provides highly specialised IT and software-development services for e-learning and knowledge-management projects based on Forma LMS. It merges 16 years of e-learning consulting from E-learnit with the cloud-computing and web-solutions expertise of Purple Network — both partners and founders of the Forma Association and developers of Forma LMS, the award-winning open-source learning management system. The "Farm" is the natural evolution of years of collaboration: creating space to grow your e-learning business and ideas.',
  },
  {
    slug: 'kotuko',
    name: 'Kotuko',
    sector: 'Digital marketing · web design',
    url: 'https://www.kotuko.it/',
    featured: false,
    order: 5,
    started: '2015-07-01 00:00:00.000Z',
    ended: '2017-11-01 00:00:00.000Z',
    description_en:
      'Kotuko supports companies through their digital-evolution process, offering solutions across digital marketing, web design and IT technology. A dynamic team powered by change — convinced that the greatest danger is not having the courage to transform.',
  },
  {
    slug: 'alcos-digital',
    name: 'Alcos Digital',
    sector: 'Communication & marketing',
    url: 'https://alcoscomunicazione.com',
    featured: false,
    order: 6,
    started: '2014-02-01 00:00:00.000Z',
    ended: '2015-07-01 00:00:00.000Z',
    description_en:
      'The agency where I actually learned to work with PHP and a range of frameworks — including my favourite, Laravel. For two years I was also involved in native iOS development in Objective-C. The company eventually went into layoffs and I moved on; there is little information about it on the web today.',
  },
  {
    slug: 'proxime',
    name: 'Proxime',
    sector: 'Photovoltaic monitoring · PA portals',
    url: 'http://www.sunguard.it',
    featured: false,
    order: 7,
    started: '2010-10-01 00:00:00.000Z',
    ended: '2014-01-01 00:00:00.000Z',
    description_en:
      'Proxime conceives, designs and builds solutions grounded in advanced communication theory and innovative open-source technology. Its staff combines heterogeneous skills across communication, IT, marketing, design and human–machine interaction, applies usability and accessibility throughout, and ships products with initial training and real coaching so users are productive immediately. Work spans SUAP / OpenTRIUM territorial-marketing portals, accessible web portals for public administration, corporate e-learning and training, hardware and software sales, and photovoltaic-systems monitoring.',
  },
];

const PROJECTS = [
  {
    slug: 'fiberdroid-customer-area',
    idx: '01',
    customer: 'fiberdroid',
    client: 'Fiberdroid',
    clientInitials: 'FD',
    period: '2019 — 2021',
    featured: true,
    order: 2,
    started: '2019-03-01 00:00:00.000Z',
    ended: '2021-02-01 00:00:00.000Z',
    title_en: 'Customer area & operations portal',
    desc_en:
      "A PWA (single-page app) backed by a REST API. It packs a lot: a notification system over push, WebSocket and email; user roles and permissions; automated invoicing for end customers; appointment management; product shipments; and full contract management and workflow — among much more. Development is a continuous stream of improvements, but it rests on a stable base built since 2021, is well documented, and ships with unit tests covering the system's core functions.",
    stack: ['Laravel 9', 'Nuxt 2', 'REST API', 'PWA / SPA', 'WebSockets', 'Push notifications'],
    kpis: [],
    live_url: 'https://area-clienti.fiberdroid.it',
    repo_url: '',
  },
  {
    slug: 'inspxt',
    idx: '02',
    customer: 'tc2-group',
    client: 'TC2 Group',
    clientInitials: 'T2',
    period: '2019 — 2020',
    featured: false,
    order: 3,
    started: '2019-01-01 00:00:00.000Z',
    ended: '2020-08-01 00:00:00.000Z',
    title_en: 'INspxt — inspections management platform',
    desc_en:
      'An app for managing inspectors and the inspections they carry out. The Laravel REST API handles user roles and permissions — chiefly administrators and inspectors — while the React front end fully separates the two roles, showing a simplified interface to inspectors, who can reach only a subset of features. The system is stable and performant given the access and data traffic it handles, and it mainly drives inspection activities that certify the quality of customer products. A complete refactoring improved the UX, simplified the database structure, migrated the data to the new schema, and streamlined the server-side code both syntactically and logically.',
    stack: ['Laravel 9', 'React', 'REST API', 'Redis'],
    kpis: [],
    live_url: 'https://inspxt.tc2services.app',
    repo_url: '',
  },
  {
    slug: 'standup-way-platform',
    idx: '03',
    customer: 'nuovavita',
    client: 'Nuovavita',
    clientInitials: 'NV',
    period: '2023 — 2026',
    featured: true,
    order: 1,
    started: '2023-05-01 00:00:00.000Z',
    ended: '2026-02-01 00:00:00.000Z',
    title_en: 'StandUp Way platform',
    desc_en:
      "A PWA (SPA) connected to a REST API. Features include a notification system over push, WebSocket and email; user roles and permissions; automated scheduling for the group's video calls (via agora.io); appointment management; dynamic clinical record cards for customers; and much more. Development keeps evolving, but it rests on a stable base built since 2023, is well documented, and ships with Playwright tests covering the system's core flows from the front end.",
    stack: ['Laravel 12', 'Nuxt 4', 'MySQL', 'Redis', 'agora.io', 'SSR / PWA', 'Playwright'],
    kpis: [],
    live_url: 'https://admin.metodostandup.it',
    repo_url: '',
  },
  {
    slug: 'silent-hill-web',
    idx: '04',
    customer: null,
    client: 'Personal project',
    clientInitials: 'SH',
    period: '2022 — 2023',
    featured: false,
    order: 5,
    started: '2022-09-01 00:00:00.000Z',
    ended: '2023-06-01 00:00:00.000Z',
    title_en: 'Silent Hill Web',
    desc_en:
      'After the announcements of new entries in the saga I built a PWA in Nuxt 3 + Laravel 10 for my favourite game series. It is server-side rendered and tuned across accessibility and usability for SEO. It has an event notification system, interactive maps built on the in-game map images, and a two-axis navigation — a horizontal menu to pick the game, a vertical one for its sub-sections and the generic sections. Users sign up by email or via Facebook Login. The admin panel — built in Nuxt 2 to move faster, then fully refactored to Nuxt 4 + shadcn — manages multiple user roles with configurable permissions and uploads images and YouTube videos quickly. Both the site and the panel are trilingual: Italian, English and Spanish. It is a fully non-profit project, so the main thing missing is content — collaborators who know Silent Hill well are welcome.',
    stack: ['Laravel 12', 'Nuxt 4', 'Reverb · WebSockets', 'Redis', 'SSR / PWA', 'shadcn', 'i18n · it/en/es'],
    kpis: [
      { label: 'Languages', value: '3' },
      { label: 'Rendering', value: 'SSR' },
    ],
    live_url: 'https://silenthillweb.com',
    repo_url: '',
  },
  {
    slug: 'devboards-io',
    idx: '05',
    customer: null,
    client: 'Personal project',
    clientInitials: 'DB',
    period: '2024 — present',
    featured: true,
    order: 4,
    started: '2024-06-01 00:00:00.000Z',
    ended: '',
    title_en: 'DevBoards.io',
    desc_en:
      'An IT job-discovery and tech-news platform aimed at the European and U.S. markets. It aggregates job listings from 10+ sources using AI-powered APIs, serves multilingual tech news, and includes a custom CMS admin dashboard for content management. Two Python scripts import jobs every 12 hours via RSS feeds and public job-portal APIs, filtering Tech/IT roles and auto-categorising each listing with relevant metadata — so users discover thousands of opportunities a day from a single platform in five languages, with fast filters for skills, availability and seniority. Each user gets a compatibility score for every posting, and companies get a trust score based on the quality of their ads plus a community-driven like/dislike rating. GitHub repo (6 submodules + CI/CD): https://github.com/micio86dev/itjobhub-antigravity-config',
    stack: ['ElysiaJS', 'Bun', 'Qwik', 'Python 3.11', 'MongoDB', 'Redis'],
    kpis: [
      { label: 'Job sources', value: '10+' },
      { label: 'Languages', value: '5' },
      { label: 'Import cycle', value: '12h' },
    ],
    live_url: 'https://devboards.io',
    repo_url: 'https://github.com/micio86dev/itjobhub-antigravity-config',
  },
];

migrate(
  (app) => {
    // ── schema: make sure the image fields exist on both collections, and add
    //    the projects → customers relation. `fields.add()` replaces a
    //    same-named field, so this is safe whatever state the collections are
    //    in (fresh, or created before the image fields were declared).
    const imageFields = () => [
      new Field({
        type: 'file',
        name: 'images',
        maxSelect: 12,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
      }),
      new Field({ type: 'text', name: 'primary_image', max: 255 }),
    ];

    const customers = app.findCollectionByNameOrId('customers');
    customers.fields.add(...imageFields());
    app.save(customers);

    const projects = app.findCollectionByNameOrId('projects');
    projects.fields.add(...imageFields());
    projects.fields.add(
      new Field({
        type: 'relation',
        name: 'customer',
        required: false,
        collectionId: customers.id,
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 1,
      }),
    );
    app.save(projects);

    // ── wipe both collections (drops the old placeholder seed) ─────────────
    for (const r of app.findAllRecords('projects')) app.delete(r);
    for (const r of app.findAllRecords('customers')) app.delete(r);

    // ── re-insert: customers first, then projects (linked by slug) ────────
    const customerIdBySlug = {};
    for (const c of CUSTOMERS) {
      const rec = new Record(customers, {
        slug: c.slug,
        name: c.name,
        sector: c.sector,
        url: c.url,
        featured: c.featured,
        order: c.order,
        started: c.started || '',
        ended: c.ended || '',
        description_en: c.description_en,
        description_it: '',
        description_es: '',
        testimonial_en: '',
        testimonial_it: '',
        testimonial_es: '',
        testimonial_author: '',
        primary_image: '',
      });
      app.save(rec);
      customerIdBySlug[c.slug] = rec.id;
    }

    for (const p of PROJECTS) {
      const data = {
        slug: p.slug,
        idx: p.idx,
        client: p.client,
        clientInitials: p.clientInitials,
        period: p.period,
        featured: p.featured,
        order: p.order,
        started: p.started || '',
        ended: p.ended || '',
        title_en: p.title_en,
        title_it: '',
        title_es: '',
        desc_en: p.desc_en,
        desc_it: '',
        desc_es: '',
        stack: p.stack,
        kpis: p.kpis,
        live_url: p.live_url,
        repo_url: p.repo_url,
        primary_image: '',
      };
      if (p.customer) data.customer = customerIdBySlug[p.customer];
      app.save(new Record(projects, data));
    }
  },
  (app) => {
    // Irreversible content seed — the previous placeholder data isn't worth
    // restoring, and the added fields/relation are harmless to keep. No-op.
  },
);
