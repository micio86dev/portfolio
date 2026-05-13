/// <reference path="../pb_data/types.d.ts" />

// `translations` — every UI string in the portfolio, one row per key, with an
// `en` / `it` / `es` column. The Astro frontend loads this collection on each
// request (SSR) and overlays it on the bundled JSON fallback (astro/src/i18n/*),
// so editing copy here in the admin (/_/) updates the live site with no
// redeploy. `key` is the dotted path used by the `t()` helper (e.g.
// "hero.headline.line1"); `group` is just the first segment, kept as a plain
// field so the admin list can be filtered/sorted by section.
//
// API rules: public read (the site fetches it unauthenticated); writes are
// admin-only.
//   listRule = viewRule = ""                    → public read
//   createRule = updateRule = deleteRule = null → superusers only

migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'translations',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          type: 'text',
          name: 'id',
          system: true,
          primaryKey: true,
          required: true,
          min: 15,
          max: 15,
          pattern: '^[a-z0-9]+$',
          autogeneratePattern: '[a-z0-9]{15}',
        },
        { type: 'text', name: 'key', required: true, max: 200 },
        { type: 'text', name: 'group', max: 100 },
        { type: 'text', name: 'en', required: true, max: 5000 },
        { type: 'text', name: 'it', max: 5000 },
        { type: 'text', name: 'es', max: 5000 },
        { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
        { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX `idx_translations_key` ON `translations` (`key`)'],
    });

    app.save(collection);

    const rows = [
      {
        "key": "meta.siteName",
        "group": "meta",
        "en": "MicioDev",
        "it": "MicioDev",
        "es": "MicioDev"
      },
      {
        "key": "meta.title",
        "group": "meta",
        "en": "Senior Full-Stack Developer — Laravel, Vue & Nuxt",
        "it": "Sviluppatore full-stack senior — Laravel, Vue e Nuxt",
        "es": "Desarrollador full-stack sénior — Laravel, Vue y Nuxt"
      },
      {
        "key": "meta.description",
        "group": "meta",
        "en": "Freelance full-stack developer, 15+ years building and running Laravel, Vue and Nuxt applications. Remote from the Canary Islands. Available Q3 2026.",
        "it": "Sviluppatore full-stack freelance, oltre 15 anni a costruire e gestire applicazioni Laravel, Vue e Nuxt. Da remoto, dalle Isole Canarie. Disponibile dal Q3 2026.",
        "es": "Desarrollador full-stack freelance, más de 15 años creando y manteniendo aplicaciones Laravel, Vue y Nuxt. En remoto, desde las Islas Canarias. Disponible desde el Q3 2026."
      },
      {
        "key": "meta.ogAlt",
        "group": "meta",
        "en": "MicioDev — freelance full-stack developer · Laravel · Vue · Nuxt",
        "it": "MicioDev — sviluppatore full-stack freelance · Laravel · Vue · Nuxt",
        "es": "MicioDev — desarrollador full-stack freelance · Laravel · Vue · Nuxt"
      },
      {
        "key": "status.available",
        "group": "status",
        "en": "Available for new projects — Q3 2026",
        "it": "Disponibile per nuovi progetti — Q3 2026",
        "es": "Disponible para nuevos proyectos — Q3 2026"
      },
      {
        "key": "status.location",
        "group": "status",
        "en": "Fuerteventura · Canary Islands · UTC+0",
        "it": "Fuerteventura · Isole Canarie · UTC+0",
        "es": "Fuerteventura · Islas Canarias · UTC+0"
      },
      {
        "key": "nav.home",
        "group": "nav",
        "en": "MicioDev — home",
        "it": "MicioDev — home",
        "es": "MicioDev — inicio"
      },
      {
        "key": "nav.about",
        "group": "nav",
        "en": "About",
        "it": "Chi sono",
        "es": "Sobre mí"
      },
      {
        "key": "nav.services",
        "group": "nav",
        "en": "Services",
        "it": "Servizi",
        "es": "Servicios"
      },
      {
        "key": "nav.projects",
        "group": "nav",
        "en": "Projects",
        "it": "Progetti",
        "es": "Proyectos"
      },
      {
        "key": "nav.contact",
        "group": "nav",
        "en": "Contact",
        "it": "Contatti",
        "es": "Contacto"
      },
      {
        "key": "nav.hireMe",
        "group": "nav",
        "en": "Hire me",
        "it": "Lavoriamo insieme",
        "es": "Trabajemos juntos"
      },
      {
        "key": "hero.eyebrow",
        "group": "hero",
        "en": "Freelance · full-stack · since 2010",
        "it": "Freelance · full-stack · dal 2010",
        "es": "Freelance · full-stack · desde 2010"
      },
      {
        "key": "hero.headline.line1",
        "group": "hero",
        "en": "Full-stack web apps",
        "it": "App web full-stack",
        "es": "Apps web full-stack"
      },
      {
        "key": "hero.headline.accent",
        "group": "hero",
        "en": "built to last",
        "it": "fatte per durare",
        "es": "hechas para durar"
      },
      {
        "key": "hero.headline.line3",
        "group": "hero",
        "en": "and kept running.",
        "it": "e tenute in piedi.",
        "es": "y mantenidas en marcha."
      },
      {
        "key": "hero.subhead",
        "group": "hero",
        "en": "Laravel, Vue and Nuxt — frontend, API and infrastructure, by one developer. 15+ years in, working remote from the Canary Islands.",
        "it": "Laravel, Vue e Nuxt — frontend, API e infrastruttura, da un solo sviluppatore. Oltre 15 anni di esperienza, da remoto dalle Isole Canarie.",
        "es": "Laravel, Vue y Nuxt — frontend, API e infraestructura, por un solo desarrollador. Más de 15 años de experiencia, en remoto desde las Islas Canarias."
      },
      {
        "key": "hero.ctaPrimary",
        "group": "hero",
        "en": "View Projects",
        "it": "Vedi i progetti",
        "es": "Ver proyectos"
      },
      {
        "key": "hero.ctaSecondary",
        "group": "hero",
        "en": "Let's Talk",
        "it": "Parliamone",
        "es": "Hablemos"
      },
      {
        "key": "hero.availability",
        "group": "hero",
        "en": "Available · Q3 2026",
        "it": "Disponibile · Q3 2026",
        "es": "Disponible · Q3 2026"
      },
      {
        "key": "hero.replies",
        "group": "hero",
        "en": "replies within 24h",
        "it": "rispondo entro 24h",
        "es": "respondo en 24h"
      },
      {
        "key": "hero.trustedBy.label",
        "group": "hero",
        "en": "Selected clients · 2018–2026",
        "it": "Clienti selezionati · 2018–2026",
        "es": "Clientes seleccionados · 2018–2026"
      },
      {
        "key": "hero.trustedBy.count",
        "group": "hero",
        "en": "07 / 42",
        "it": "07 / 42",
        "es": "07 / 42"
      },
      {
        "key": "hero.trustedBy.clientLabel",
        "group": "hero",
        "en": "client",
        "it": "cliente",
        "es": "cliente"
      },
      {
        "key": "hero.meta.section",
        "group": "hero",
        "en": "§ 01 / Hero",
        "it": "§ 01 / Hero",
        "es": "§ 01 / Hero"
      },
      {
        "key": "hero.meta.version",
        "group": "hero",
        "en": "v 1.0.0",
        "it": "v 1.0.0",
        "es": "v 1.0.0"
      },
      {
        "key": "hero.stamp",
        "group": "hero",
        "en": "// build 0xA1F · lg\n// region · ic-tenerife\n// uptime · 99.98%",
        "it": "// build 0xA1F · lg\n// region · ic-tenerife\n// uptime · 99.98%",
        "es": "// build 0xA1F · lg\n// region · ic-tenerife\n// uptime · 99.98%"
      },
      {
        "key": "services.eyebrow",
        "group": "services",
        "en": "§ 02 · Services",
        "it": "§ 02 · Servizi",
        "es": "§ 02 · Servicios"
      },
      {
        "key": "services.title",
        "group": "services",
        "en": "What I do, in five clear lines",
        "it": "Cosa faccio, in cinque righe chiare",
        "es": "Lo que hago, en cinco líneas claras"
      },
      {
        "key": "services.note",
        "group": "services",
        "en": "Five services · per-project quotes",
        "it": "Cinque servizi · preventivo per progetto",
        "es": "Cinco servicios · presupuesto por proyecto"
      },
      {
        "key": "services.footerNote",
        "group": "services",
        "en": "Not here: design from scratch · native mobile apps · WordPress",
        "it": "Non qui: design da zero · app mobile native · WordPress",
        "es": "Aquí no: diseño desde cero · apps móviles nativas · WordPress"
      },
      {
        "key": "services.footerIndex",
        "group": "services",
        "en": "↳ index · §02",
        "it": "↳ index · §02",
        "es": "↳ index · §02"
      },
      {
        "key": "services.items.fullstack.title",
        "group": "services",
        "en": "Full-stack web development",
        "it": "Sviluppo web full-stack",
        "es": "Desarrollo web full-stack"
      },
      {
        "key": "services.items.fullstack.desc",
        "group": "services",
        "en": "Laravel back end, Vue or Nuxt front end — one developer across the whole stack. From the first commit to a deploy you can trust.",
        "it": "Back end Laravel, front end Vue o Nuxt — un solo sviluppatore su tutto lo stack. Dal primo commit a un deploy di cui ti puoi fidare.",
        "es": "Back end en Laravel, front end en Vue o Nuxt — un solo desarrollador en todo el stack. Del primer commit a un despliegue en el que puedes confiar."
      },
      {
        "key": "services.items.api.title",
        "group": "services",
        "en": "API design & backend architecture",
        "it": "Progettazione API e architettura backend",
        "es": "Diseño de APIs y arquitectura backend"
      },
      {
        "key": "services.items.api.desc",
        "group": "services",
        "en": "REST and GraphQL APIs built to be consumed: versioned, documented, tested. Data models that hold up when the product grows.",
        "it": "API REST e GraphQL pensate per essere consumate: versionate, documentate, testate. Modelli dati che reggono quando il prodotto cresce.",
        "es": "APIs REST y GraphQL pensadas para consumirse: versionadas, documentadas, con tests. Modelos de datos que aguantan cuando el producto crece."
      },
      {
        "key": "services.items.vps.title",
        "group": "services",
        "en": "VPS infrastructure & DevOps",
        "it": "Infrastruttura VPS e DevOps",
        "es": "Infraestructura VPS y DevOps"
      },
      {
        "key": "services.items.vps.desc",
        "group": "services",
        "en": "Provisioning, deploys, monitoring and backups on your own servers. CI/CD that ships on green — not on hope.",
        "it": "Provisioning, deploy, monitoraggio e backup sui tuoi server. CI/CD che rilascia quando è tutto verde — non per scommessa.",
        "es": "Aprovisionamiento, despliegues, monitorización y backups en tus propios servidores. CI/CD que publica en verde — no a base de suerte."
      },
      {
        "key": "services.items.consulting.title",
        "group": "services",
        "en": "Technical consulting for agencies",
        "it": "Consulenza tecnica per agenzie",
        "es": "Consultoría técnica para agencias"
      },
      {
        "key": "services.items.consulting.desc",
        "group": "services",
        "en": "A senior pair of hands for scoping, estimates and architecture calls. White-label, on your timeline.",
        "it": "Una mano senior per scoping, stime e scelte di architettura. White-label, sui tuoi tempi.",
        "es": "Un par de manos sénior para definir alcance, estimaciones y decisiones de arquitectura. Marca blanca, a tu ritmo."
      },
      {
        "key": "services.items.review.title",
        "group": "services",
        "en": "Code review & legacy refactoring",
        "it": "Code review e refactoring di codice legacy",
        "es": "Revisión de código y refactor de legado"
      },
      {
        "key": "services.items.review.desc",
        "group": "services",
        "en": "Audits, untangling and incremental rewrites of code that has outgrown itself — without a big-bang rewrite.",
        "it": "Audit, sbrogliare il codice e riscritture incrementali di basi di codice diventate ingestibili — senza riscrivere tutto da capo.",
        "es": "Auditorías, desenredar el código y reescrituras incrementales de bases de código que se han quedado grandes — sin reescribirlo todo de golpe."
      },
      {
        "key": "projects.eyebrow",
        "group": "projects",
        "en": "§ 03 · Selected work",
        "it": "§ 03 · Lavori selezionati",
        "es": "§ 03 · Trabajos seleccionados"
      },
      {
        "key": "projects.title",
        "group": "projects",
        "en": "Things shipped — and still standing.",
        "it": "Cose messe in produzione — e ancora in piedi.",
        "es": "Cosas lanzadas — y aún en pie."
      },
      {
        "key": "projects.meta",
        "group": "projects",
        "en": "05 shown · 42 archived · 2010–2026",
        "it": "05 in vista · 42 in archivio · 2010–2026",
        "es": "05 a la vista · 42 en el archivo · 2010–2026"
      },
      {
        "key": "projects.featuredBadge",
        "group": "projects",
        "en": "Featured",
        "it": "In evidenza",
        "es": "Destacado"
      },
      {
        "key": "projects.openCaseStudy",
        "group": "projects",
        "en": "Open case study",
        "it": "Apri il case study",
        "es": "Abrir el caso de estudio"
      },
      {
        "key": "projects.filterLabel",
        "group": "projects",
        "en": "Filter",
        "it": "Filtra",
        "es": "Filtrar"
      },
      {
        "key": "projects.stackLabel",
        "group": "projects",
        "en": "Stack",
        "it": "Stack",
        "es": "Stack"
      },
      {
        "key": "projects.filters.all",
        "group": "projects",
        "en": "All",
        "it": "Tutti",
        "es": "Todos"
      },
      {
        "key": "projects.filters.saas",
        "group": "projects",
        "en": "SaaS",
        "it": "SaaS",
        "es": "SaaS"
      },
      {
        "key": "projects.filters.ecommerce",
        "group": "projects",
        "en": "E-commerce",
        "it": "E-commerce",
        "es": "E-commerce"
      },
      {
        "key": "projects.filters.dashboards",
        "group": "projects",
        "en": "Dashboards",
        "it": "Dashboard",
        "es": "Dashboards"
      },
      {
        "key": "projects.filters.editorial",
        "group": "projects",
        "en": "Editorial",
        "it": "Editoriale",
        "es": "Editorial"
      },
      {
        "key": "projects.archiveCta",
        "group": "projects",
        "en": "Browse the archive — 42 projects since 2010",
        "it": "Sfoglia l'archivio — 42 progetti dal 2010",
        "es": "Explora el archivo — 42 proyectos desde 2010"
      },
      {
        "key": "projects.mockupLabel",
        "group": "projects",
        "en": "project mockup · 16 / 10",
        "it": "mockup progetto · 16 / 10",
        "es": "mockup del proyecto · 16 / 10"
      },
      {
        "key": "projects.footerIndex",
        "group": "projects",
        "en": "↳ index · §03",
        "it": "↳ index · §03",
        "es": "↳ index · §03"
      },
      {
        "key": "skills.eyebrow",
        "group": "skills",
        "en": "§ 04 · Skills",
        "it": "§ 04 · Competenze",
        "es": "§ 04 · Habilidades"
      },
      {
        "key": "skills.title",
        "group": "skills",
        "en": "Tools, in four families",
        "it": "Strumenti, in quattro famiglie",
        "es": "Herramientas, en cuatro familias"
      },
      {
        "key": "skills.note",
        "group": "skills",
        "en": "No bars, no percentages — just what I actually use.",
        "it": "Niente barre, niente percentuali — solo quello che uso davvero.",
        "es": "Sin barras, sin porcentajes — solo lo que uso de verdad."
      },
      {
        "key": "skills.footerIndex",
        "group": "skills",
        "en": "↳ index · §04",
        "it": "↳ index · §04",
        "es": "↳ index · §04"
      },
      {
        "key": "skills.groups.languages",
        "group": "skills",
        "en": "Languages & frameworks",
        "it": "Linguaggi e framework",
        "es": "Lenguajes y frameworks"
      },
      {
        "key": "skills.groups.infra",
        "group": "skills",
        "en": "Infrastructure",
        "it": "Infrastruttura",
        "es": "Infraestructura"
      },
      {
        "key": "skills.groups.tooling",
        "group": "skills",
        "en": "Tooling & workflow",
        "it": "Strumenti e workflow",
        "es": "Herramientas y flujo de trabajo"
      },
      {
        "key": "skills.groups.apis",
        "group": "skills",
        "en": "APIs & services",
        "it": "API e servizi",
        "es": "APIs y servicios"
      },
      {
        "key": "skills.legend.label",
        "group": "skills",
        "en": "Legend",
        "it": "Legenda",
        "es": "Leyenda"
      },
      {
        "key": "skills.legend.primary",
        "group": "skills",
        "en": "daily — and preferred",
        "it": "ogni giorno — e preferito",
        "es": "a diario — y preferido"
      },
      {
        "key": "skills.legend.daily",
        "group": "skills",
        "en": "in current rotation",
        "it": "in rotazione attuale",
        "es": "en rotación actual"
      },
      {
        "key": "skills.legend.default",
        "group": "skills",
        "en": "when the job calls for it",
        "it": "quando il lavoro lo richiede",
        "es": "cuando el trabajo lo pide"
      },
      {
        "key": "skills.legend.pillPrimary",
        "group": "skills",
        "en": "primary",
        "it": "primario",
        "es": "principal"
      },
      {
        "key": "skills.legend.pillDaily",
        "group": "skills",
        "en": "daily",
        "it": "quotidiano",
        "es": "diario"
      },
      {
        "key": "skills.legend.pillDefault",
        "group": "skills",
        "en": "reach for",
        "it": "occasionale",
        "es": "ocasional"
      },
      {
        "key": "courses.eyebrow",
        "group": "courses",
        "en": "§ 04b · Courses",
        "it": "§ 04b · Corsi",
        "es": "§ 04b · Cursos"
      },
      {
        "key": "courses.title",
        "group": "courses",
        "en": "Courses I teach, in three tracks",
        "it": "Corsi che insegno, in tre percorsi",
        "es": "Cursos que imparto, en tres vías"
      },
      {
        "key": "courses.meta",
        "group": "courses",
        "en": "Three courses · Udemy & YouTube",
        "it": "Tre corsi · Udemy e YouTube",
        "es": "Tres cursos · Udemy y YouTube"
      },
      {
        "key": "courses.viewCourse",
        "group": "courses",
        "en": "View course",
        "it": "Vai al corso",
        "es": "Ir al curso"
      },
      {
        "key": "courses.platform.udemy",
        "group": "courses",
        "en": "Udemy",
        "it": "Udemy",
        "es": "Udemy"
      },
      {
        "key": "courses.platform.youtube",
        "group": "courses",
        "en": "YouTube",
        "it": "YouTube",
        "es": "YouTube"
      },
      {
        "key": "career.eyebrow",
        "group": "career",
        "en": "§ · About",
        "it": "§ · Chi sono",
        "es": "§ · Sobre mí"
      },
      {
        "key": "career.title",
        "group": "career",
        "en": "The path that got me here",
        "it": "Il percorso che mi ha portato qui",
        "es": "El camino que me trajo hasta aquí"
      },
      {
        "key": "career.intro",
        "group": "career",
        "en": "Hi, I'm a full-stack web developer skilled in high performance.",
        "it": "Ciao, sono uno sviluppatore web full-stack con una passione per le alte prestazioni.",
        "es": "Hola, soy desarrollador web full-stack con foco en el alto rendimiento."
      },
      {
        "key": "contact.eyebrow",
        "group": "contact",
        "en": "§ 05 · Contact",
        "it": "§ 05 · Contatti",
        "es": "§ 05 · Contacto"
      },
      {
        "key": "contact.title",
        "group": "contact",
        "en": "Tell me about the project.",
        "it": "Raccontami il progetto.",
        "es": "Cuéntame el proyecto."
      },
      {
        "key": "contact.form.ariaLabel",
        "group": "contact",
        "en": "Contact form",
        "it": "Modulo di contatto",
        "es": "Formulario de contacto"
      },
      {
        "key": "contact.form.name",
        "group": "contact",
        "en": "Name",
        "it": "Nome",
        "es": "Nombre"
      },
      {
        "key": "contact.form.namePlaceholder",
        "group": "contact",
        "en": "Jane Rossi",
        "it": "Maria Rossi",
        "es": "María García"
      },
      {
        "key": "contact.form.email",
        "group": "contact",
        "en": "Email",
        "it": "Email",
        "es": "Email"
      },
      {
        "key": "contact.form.emailPlaceholder",
        "group": "contact",
        "en": "jane@company.com",
        "it": "maria@azienda.com",
        "es": "maria@empresa.com"
      },
      {
        "key": "contact.form.subject",
        "group": "contact",
        "en": "Subject",
        "it": "Oggetto",
        "es": "Asunto"
      },
      {
        "key": "contact.form.subjectPlaceholder",
        "group": "contact",
        "en": "What's it about?",
        "it": "Di cosa si tratta?",
        "es": "¿De qué se trata?"
      },
      {
        "key": "contact.form.message",
        "group": "contact",
        "en": "Message",
        "it": "Messaggio",
        "es": "Mensaje"
      },
      {
        "key": "contact.form.messagePlaceholder",
        "group": "contact",
        "en": "What are you building, and where do you need a hand?",
        "it": "Cosa stai costruendo e dove ti serve una mano?",
        "es": "¿Qué estás construyendo y dónde necesitas una mano?"
      },
      {
        "key": "contact.form.charCounter",
        "group": "contact",
        "en": "{count} / 2000",
        "it": "{count} / 2000",
        "es": "{count} / 2000"
      },
      {
        "key": "contact.form.privacy",
        "group": "contact",
        "en": "By sending this you accept the privacy policy.",
        "it": "Inviando accetti la privacy policy.",
        "es": "Al enviar aceptas la política de privacidad."
      },
      {
        "key": "contact.form.submit",
        "group": "contact",
        "en": "Send message",
        "it": "Invia il messaggio",
        "es": "Enviar mensaje"
      },
      {
        "key": "contact.form.sending",
        "group": "contact",
        "en": "Sending…",
        "it": "Invio in corso…",
        "es": "Enviando…"
      },
      {
        "key": "contact.form.success",
        "group": "contact",
        "en": "Message sent! I'll reply within 24h.",
        "it": "Messaggio inviato! Ti rispondo entro 24 ore.",
        "es": "¡Mensaje enviado! Te respondo en 24 horas."
      },
      {
        "key": "contact.form.honeypotLabel",
        "group": "contact",
        "en": "Website",
        "it": "Sito web",
        "es": "Sitio web"
      },
      {
        "key": "contact.form.error",
        "group": "contact",
        "en": "Something went wrong. Please email me directly at {email}.",
        "it": "Qualcosa è andato storto. Scrivimi direttamente a {email}.",
        "es": "Algo ha fallado. Escríbeme directamente a {email}."
      },
      {
        "key": "contact.form.errors.name",
        "group": "contact",
        "en": "Please enter your name.",
        "it": "Inserisci il tuo nome.",
        "es": "Escribe tu nombre."
      },
      {
        "key": "contact.form.errors.email",
        "group": "contact",
        "en": "That doesn't look like a valid email.",
        "it": "Questa email non sembra valida.",
        "es": "Ese email no parece válido."
      },
      {
        "key": "contact.form.errors.subject",
        "group": "contact",
        "en": "Please add a subject.",
        "it": "Aggiungi un oggetto.",
        "es": "Añade un asunto."
      },
      {
        "key": "contact.form.errors.messageShort",
        "group": "contact",
        "en": "A little more detail, please — at least 10 characters.",
        "it": "Un po' più di dettaglio, per favore — almeno 10 caratteri.",
        "es": "Un poco más de detalle, por favor — al menos 10 caracteres."
      },
      {
        "key": "contact.form.errors.messageLong",
        "group": "contact",
        "en": "That's over the limit — keep it under 2000 characters.",
        "it": "Hai superato il limite — resta sotto i 2000 caratteri.",
        "es": "Te has pasado del límite — quédate por debajo de 2000 caracteres."
      },
      {
        "key": "contact.form.errors.rateLimit",
        "group": "contact",
        "en": "Too many attempts. Try again in a minute.",
        "it": "Troppi tentativi. Riprova tra un minuto.",
        "es": "Demasiados intentos. Inténtalo de nuevo en un minuto."
      },
      {
        "key": "contact.aside.eyebrow",
        "group": "contact",
        "en": "Direct",
        "it": "Diretto",
        "es": "Directo"
      },
      {
        "key": "contact.aside.replies",
        "group": "contact",
        "en": "I reply within 24 hours, Monday to Friday.",
        "it": "Rispondo entro 24 ore, dal lunedì al venerdì.",
        "es": "Respondo en 24 horas, de lunes a viernes."
      },
      {
        "key": "contact.aside.timezone",
        "group": "contact",
        "en": "Fuerteventura · UTC+0",
        "it": "Fuerteventura · UTC+0",
        "es": "Fuerteventura · UTC+0"
      },
      {
        "key": "contact.aside.hours",
        "group": "contact",
        "en": "CET-friendly hours",
        "it": "Orari compatibili con il CET",
        "es": "Horario compatible con CET"
      },
      {
        "key": "contact.aside.available",
        "group": "contact",
        "en": "Available · Q3 2026",
        "it": "Disponibile · Q3 2026",
        "es": "Disponible · Q3 2026"
      },
      {
        "key": "footer.eyebrow",
        "group": "footer",
        "en": "Open for new projects · Q3 2026",
        "it": "Aperto a nuovi progetti · Q3 2026",
        "es": "Abierto a nuevos proyectos · Q3 2026"
      },
      {
        "key": "footer.blurb",
        "group": "footer",
        "en": "Senior freelance full-stack developer. Laravel · Vue · Nuxt. Remote from the Canary Islands.",
        "it": "Sviluppatore full-stack freelance senior. Laravel · Vue · Nuxt. Da remoto, dalle Isole Canarie.",
        "es": "Desarrollador full-stack freelance sénior. Laravel · Vue · Nuxt. En remoto, desde las Islas Canarias."
      },
      {
        "key": "footer.colSite.title",
        "group": "footer",
        "en": "Site",
        "it": "Sito",
        "es": "Sitio"
      },
      {
        "key": "footer.colSite.work",
        "group": "footer",
        "en": "Projects",
        "it": "Progetti",
        "es": "Proyectos"
      },
      {
        "key": "footer.colSite.services",
        "group": "footer",
        "en": "Services",
        "it": "Servizi",
        "es": "Servicios"
      },
      {
        "key": "footer.colSite.about",
        "group": "footer",
        "en": "About",
        "it": "Chi sono",
        "es": "Sobre mí"
      },
      {
        "key": "footer.colSite.contact",
        "group": "footer",
        "en": "Contact",
        "it": "Contatti",
        "es": "Contacto"
      },
      {
        "key": "footer.colMore.title",
        "group": "footer",
        "en": "More",
        "it": "Altro",
        "es": "Más"
      },
      {
        "key": "footer.colMore.notes",
        "group": "footer",
        "en": "Notes",
        "it": "Note",
        "es": "Notas"
      },
      {
        "key": "footer.colMore.archive",
        "group": "footer",
        "en": "Archive",
        "it": "Archivio",
        "es": "Archivo"
      },
      {
        "key": "footer.colMore.privacy",
        "group": "footer",
        "en": "Privacy",
        "it": "Privacy",
        "es": "Privacidad"
      },
      {
        "key": "footer.colMore.imprint",
        "group": "footer",
        "en": "Imprint",
        "it": "Note legali",
        "es": "Aviso legal"
      },
      {
        "key": "footer.elsewhere",
        "group": "footer",
        "en": "Elsewhere",
        "it": "Altrove",
        "es": "En otros sitios"
      },
      {
        "key": "footer.copyright",
        "group": "footer",
        "en": "© 2010–2026 · Alessandro · MicioDev",
        "it": "© 2010–2026 · Alessandro · MicioDev",
        "es": "© 2010–2026 · Alessandro · MicioDev"
      },
      {
        "key": "footer.location",
        "group": "footer",
        "en": "Fuerteventura · Canary Islands · ES",
        "it": "Fuerteventura · Isole Canarie · ES",
        "es": "Fuerteventura · Islas Canarias · ES"
      },
      {
        "key": "footer.builtWith",
        "group": "footer",
        "en": "Built with Astro + PocketBase · v1.0.0",
        "it": "Realizzato con Astro + PocketBase · v1.0.0",
        "es": "Hecho con Astro + PocketBase · v1.0.0"
      },
      {
        "key": "projectsPage.eyebrow",
        "group": "projectsPage",
        "en": "§ Archive · Selected work",
        "it": "§ Archivio · Lavori selezionati",
        "es": "§ Archivo · Trabajos seleccionados"
      },
      {
        "key": "projectsPage.title",
        "group": "projectsPage",
        "en": "Everything shipped, in one place.",
        "it": "Tutto quello che ho messo in produzione, in un posto solo.",
        "es": "Todo lo lanzado, en un solo sitio."
      },
      {
        "key": "projectsPage.intro",
        "group": "projectsPage",
        "en": "A working archive of client and product builds — most still running. Open one for the brief, the stack and the outcomes.",
        "it": "Un archivio di lavori per clienti e prodotti — la maggior parte ancora online. Aprine uno per il brief, lo stack e i risultati.",
        "es": "Un archivo de trabajos para clientes y productos — la mayoría aún en marcha. Abre uno para ver el brief, el stack y los resultados."
      },
      {
        "key": "projectsPage.metaTitle",
        "group": "projectsPage",
        "en": "Projects — selected work",
        "it": "Progetti — lavori selezionati",
        "es": "Proyectos — trabajos seleccionados"
      },
      {
        "key": "projectsPage.metaDescription",
        "group": "projectsPage",
        "en": "An archive of selected client and product builds — Laravel, Vue and Nuxt — most still in production.",
        "it": "Un archivio di lavori selezionati per clienti e prodotti — Laravel, Vue e Nuxt — la maggior parte ancora in produzione.",
        "es": "Un archivo de trabajos seleccionados para clientes y productos — Laravel, Vue y Nuxt — la mayoría aún en producción."
      },
      {
        "key": "projectsPage.back",
        "group": "projectsPage",
        "en": "← Back to projects",
        "it": "← Torna ai progetti",
        "es": "← Volver a proyectos"
      },
      {
        "key": "projectsPage.live",
        "group": "projectsPage",
        "en": "Visit the site",
        "it": "Vai al sito",
        "es": "Ir al sitio"
      },
      {
        "key": "projectsPage.repo",
        "group": "projectsPage",
        "en": "View the code",
        "it": "Guarda il codice",
        "es": "Ver el código"
      },
      {
        "key": "projectsPage.stackLabel",
        "group": "projectsPage",
        "en": "Stack",
        "it": "Stack",
        "es": "Stack"
      },
      {
        "key": "projectsPage.resultsLabel",
        "group": "projectsPage",
        "en": "Results",
        "it": "Risultati",
        "es": "Resultados"
      },
      {
        "key": "notesPage.eyebrow",
        "group": "notesPage",
        "en": "§ Notes · Writing & changelog",
        "it": "§ Note · Articoli e changelog",
        "es": "§ Notas · Artículos y changelog"
      },
      {
        "key": "notesPage.title",
        "group": "notesPage",
        "en": "Notes — what I'm building and learning.",
        "it": "Note — cosa costruisco e cosa imparo.",
        "es": "Notas — lo que construyo y lo que aprendo."
      },
      {
        "key": "notesPage.intro",
        "group": "notesPage",
        "en": "Short posts on the things I ship, the tools I lean on and the calls I'd make again.",
        "it": "Articoli brevi sulle cose che metto in produzione, sugli strumenti che uso e sulle scelte che rifarei.",
        "es": "Artículos breves sobre lo que lanzo, las herramientas que uso y las decisiones que repetiría."
      },
      {
        "key": "notesPage.metaTitle",
        "group": "notesPage",
        "en": "Notes — writing & changelog",
        "it": "Note — articoli e changelog",
        "es": "Notas — artículos y changelog"
      },
      {
        "key": "notesPage.metaDescription",
        "group": "notesPage",
        "en": "Short posts on building and running Laravel, Vue and Nuxt applications.",
        "it": "Articoli brevi su come si costruiscono e si mantengono applicazioni Laravel, Vue e Nuxt.",
        "es": "Artículos breves sobre cómo se construyen y mantienen aplicaciones Laravel, Vue y Nuxt."
      },
      {
        "key": "notesPage.empty",
        "group": "notesPage",
        "en": "No posts yet.",
        "it": "Ancora nessun articolo.",
        "es": "Aún no hay entradas."
      },
      {
        "key": "notesPage.back",
        "group": "notesPage",
        "en": "← Back to notes",
        "it": "← Torna alle note",
        "es": "← Volver a notas"
      },
      {
        "key": "notesPage.readMore",
        "group": "notesPage",
        "en": "Read more",
        "it": "Continua a leggere",
        "es": "Seguir leyendo"
      },
      {
        "key": "notFound.eyebrow",
        "group": "notFound",
        "en": "Error · 404",
        "it": "Errore · 404",
        "es": "Error · 404"
      },
      {
        "key": "notFound.title",
        "group": "notFound",
        "en": "This page wandered off.",
        "it": "Questa pagina è scappata.",
        "es": "Esta página se ha escapado."
      },
      {
        "key": "notFound.body",
        "group": "notFound",
        "en": "404 — there's nothing here. The cat probably knocked it off the table. Let's get you back to solid ground.",
        "it": "404 — qui non c'è niente. Probabilmente il micio l'ha buttata giù dal tavolo. Torniamo su un terreno solido.",
        "es": "404 — aquí no hay nada. Seguramente el gato la tiró de la mesa. Volvamos a terreno firme."
      },
      {
        "key": "notFound.backHome",
        "group": "notFound",
        "en": "Take me home",
        "it": "Torna alla home",
        "es": "Llévame a casa"
      },
      {
        "key": "notFound.logoAlt",
        "group": "notFound",
        "en": "MicioDev logo",
        "it": "Logo MicioDev",
        "es": "Logo de MicioDev"
      },
      {
        "key": "cookies.text",
        "group": "cookies",
        "en": "This site keeps one functional setting in your browser — your light/dark preference. No analytics, no tracking, no third-party cookies.",
        "it": "Questo sito conserva nel browser una sola impostazione funzionale — la tua preferenza chiaro/scuro. Niente analitica, niente tracciamento, nessun cookie di terze parti.",
        "es": "Este sitio guarda en tu navegador un único ajuste funcional — tu preferencia de tema claro/oscuro. Sin analítica, sin rastreo, sin cookies de terceros."
      },
      {
        "key": "cookies.accept",
        "group": "cookies",
        "en": "OK",
        "it": "Va bene",
        "es": "Entendido"
      },
      {
        "key": "cookies.privacyLink",
        "group": "cookies",
        "en": "Privacy policy",
        "it": "Informativa privacy",
        "es": "Política de privacidad"
      },
      {
        "key": "cookies.settingsLink",
        "group": "cookies",
        "en": "Cookie settings",
        "it": "Impostazioni cookie",
        "es": "Ajustes de cookies"
      },
      {
        "key": "cookies.ariaLabel",
        "group": "cookies",
        "en": "Cookie notice",
        "it": "Avviso cookie",
        "es": "Aviso de cookies"
      },
      {
        "key": "dividers.services",
        "group": "dividers",
        "en": "§ 02 — Services",
        "it": "§ 02 — Servizi",
        "es": "§ 02 — Servicios"
      },
      {
        "key": "dividers.work",
        "group": "dividers",
        "en": "§ 03 — Selected work",
        "it": "§ 03 — Lavori selezionati",
        "es": "§ 03 — Trabajos seleccionados"
      },
      {
        "key": "dividers.career",
        "group": "dividers",
        "en": "§ — About",
        "it": "§ — Chi sono",
        "es": "§ — Sobre mí"
      },
      {
        "key": "dividers.skills",
        "group": "dividers",
        "en": "§ 04 — Skills",
        "it": "§ 04 — Competenze",
        "es": "§ 04 — Habilidades"
      },
      {
        "key": "dividers.courses",
        "group": "dividers",
        "en": "§ 04b — Courses",
        "it": "§ 04b — Corsi",
        "es": "§ 04b — Cursos"
      },
      {
        "key": "dividers.contact",
        "group": "dividers",
        "en": "§ 05 — Contact",
        "it": "§ 05 — Contatti",
        "es": "§ 05 — Contacto"
      },
      {
        "key": "a11y.skipToContent",
        "group": "a11y",
        "en": "Skip to content",
        "it": "Vai al contenuto",
        "es": "Saltar al contenido"
      },
      {
        "key": "a11y.mainNav",
        "group": "a11y",
        "en": "Main navigation",
        "it": "Navigazione principale",
        "es": "Navegación principal"
      },
      {
        "key": "a11y.openMenu",
        "group": "a11y",
        "en": "Open menu",
        "it": "Apri il menu",
        "es": "Abrir el menú"
      },
      {
        "key": "a11y.closeMenu",
        "group": "a11y",
        "en": "Close menu",
        "it": "Chiudi il menu",
        "es": "Cerrar el menú"
      },
      {
        "key": "a11y.toLight",
        "group": "a11y",
        "en": "Switch to light mode",
        "it": "Passa alla modalità chiara",
        "es": "Cambiar a modo claro"
      },
      {
        "key": "a11y.toDark",
        "group": "a11y",
        "en": "Switch to dark mode",
        "it": "Passa alla modalità scura",
        "es": "Cambiar a modo oscuro"
      },
      {
        "key": "a11y.language",
        "group": "a11y",
        "en": "Language",
        "it": "Lingua",
        "es": "Idioma"
      },
      {
        "key": "a11y.switchTo",
        "group": "a11y",
        "en": "Switch to {lang}",
        "it": "Passa a {lang}",
        "es": "Cambiar a {lang}"
      },
      {
        "key": "a11y.externalLink",
        "group": "a11y",
        "en": "opens in a new tab",
        "it": "si apre in una nuova scheda",
        "es": "se abre en una pestaña nueva"
      }
    ];

    for (const row of rows) {
      const rec = new Record(collection);
      rec.set('key', row.key);
      rec.set('group', row.group);
      rec.set('en', row.en);
      rec.set('it', row.it);
      rec.set('es', row.es);
      app.save(rec);
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('translations');
    return app.delete(collection);
  },
);
