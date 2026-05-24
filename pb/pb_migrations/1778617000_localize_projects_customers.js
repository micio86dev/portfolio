/// <reference path="../pb_data/types.d.ts" />

// Updates the `customers` and `projects` rows seeded by 1778602000 with two
// things at once:
//   1) lightweight Markdown bolds (`**...**`) sprinkled across the long EN
//      descriptions, so readers can scan the case studies and client profiles
//      without getting lost;
//   2) Italian and Spanish translations of the descriptions (and project
//      titles), which were left empty by the original seed and were therefore
//      falling back to English everywhere.
//
// 1778602000 already ran on existing instances, so editing that file alone
// doesn't backfill anything — the new copy has to land via a forward step.
// Lookup is by `slug`; rows added or renamed by hand are left alone. Safe to
// re-run: the writes are deterministic overrides of three text columns per
// record.

const CUSTOMERS = [
  {
    slug: 'nuovavita',
    description_en:
      'The **Standup Method** is the **first remote addiction-recovery programme**. In its first year alone it changed the lives of **over 100 people across Europe**, with the mission of helping thousands quit cocaine addiction. It is a **six-month programme followed from home**, created by **Danilo Cuccagna** — a certified coach who definitively overcame his own addiction — together with internationally qualified **psychologists, psychotherapists, psychiatrists and professional educators** who went through addiction and came out of it thanks to the method.',
    description_it:
      "Il **Metodo Standup** è il **primo programma di disintossicazione dalle dipendenze a distanza**. Già nel primo anno ha cambiato la vita di **oltre 100 persone in Europa**, con la missione di aiutarne migliaia a smettere con la cocaina. È un **programma di sei mesi seguito da casa**, creato da **Danilo Cuccagna** — un coach certificato che ha superato definitivamente la propria dipendenza — insieme a **psicologi, psicoterapeuti, psichiatri ed educatori professionali** con qualifiche internazionali, anch'essi usciti dalla dipendenza grazie al metodo.",
    description_es:
      'El **Método Standup** es el **primer programa remoto de recuperación de adicciones**. Ya en su primer año cambió la vida de **más de 100 personas en Europa**, con la misión de ayudar a miles a dejar la cocaína. Es un **programa de seis meses seguido desde casa**, creado por **Danilo Cuccagna** — un coach certificado que superó definitivamente su propia adicción — junto a **psicólogos, psicoterapeutas, psiquiatras y educadores profesionales** con cualificaciones internacionales, que también salieron de la adicción gracias al método.',
  },
  {
    slug: 'fiberdroid',
    description_en:
      'A telecommunications company that connects businesses and professionals to the internet over **VoIP, WiFi, cloud and optical fibre**. It builds **cloud and IT solutions tailored to each client**, helping companies integrate every communication service — the Internet included — to make their business fly.',
    description_it:
      'Azienda di telecomunicazioni che connette imprese e professionisti a internet tramite **VoIP, WiFi, cloud e fibra ottica**. Costruisce **soluzioni cloud e IT su misura per ogni cliente**, aiutando le aziende a integrare ogni servizio di comunicazione — Internet incluso — per far decollare il loro business.',
    description_es:
      'Empresa de telecomunicaciones que conecta a empresas y profesionales a internet vía **VoIP, WiFi, cloud y fibra óptica**. Construye **soluciones cloud e IT a medida para cada cliente**, ayudando a las empresas a integrar todos sus servicios de comunicación — Internet incluido — para hacer despegar su negocio.',
  },
  {
    slug: 'tc2-group',
    description_en:
      'A **long-standing client**, and currently the **largest of my career**. TC2 works in **quality control** and manages the agents who carry it out; the web-development group I belong to handles a small slice of what the company does. The collaboration began in **2022** — first a demo of a management system, then a **full rewrite of the API** behind their main management system, given the low quality of the previously written code.',
    description_it:
      "Un **cliente di lunga data**, e attualmente il **più grande della mia carriera**. TC2 si occupa di **controllo qualità** e gestisce gli agenti che lo eseguono; il gruppo di sviluppo web di cui faccio parte segue una piccola fetta delle attività dell'azienda. La collaborazione è iniziata nel **2022** — prima una demo di gestionale, poi una **riscrittura completa delle API** dietro il loro gestionale principale, vista la bassa qualità del codice precedente.",
    description_es:
      'Un **cliente de larga duración**, y actualmente el **más grande de mi carrera**. TC2 trabaja en **control de calidad** y gestiona a los agentes que lo realizan; el grupo de desarrollo web del que formo parte cubre una pequeña parte de la actividad de la empresa. La colaboración empezó en **2022** — primero una demo de gestor, luego una **reescritura completa de la API** detrás de su gestor principal, dada la baja calidad del código previo.',
  },
  {
    slug: 'formafarm',
    description_en:
      '**My first client when I went freelance.** Forma Farm provides highly specialised IT and software-development services for **e-learning and knowledge-management projects** based on **Forma LMS**. It merges **16 years of e-learning consulting** from E-learnit with the cloud-computing and web-solutions expertise of Purple Network — both partners and founders of the Forma Association and developers of **Forma LMS, the award-winning open-source learning management system**. The "Farm" is the natural evolution of years of collaboration: creating space to grow your e-learning business and ideas.',
    description_it:
      '**Il mio primo cliente come freelance.** Forma Farm offre servizi IT e di sviluppo software altamente specializzati per **progetti di e-learning e knowledge management** basati su **Forma LMS**. Unisce **16 anni di consulenza e-learning** di E-learnit con l\'esperienza in cloud computing e soluzioni web di Purple Network — entrambi soci fondatori dell\'Associazione Forma e sviluppatori di **Forma LMS, l\'LMS open-source premiato**. La "Farm" è l\'evoluzione naturale di anni di collaborazione: creare spazio per far crescere il proprio business di e-learning e le proprie idee.',
    description_es:
      '**Mi primer cliente como freelance.** Forma Farm ofrece servicios IT y de desarrollo software altamente especializados para **proyectos de e-learning y gestión del conocimiento** basados en **Forma LMS**. Une **16 años de consultoría en e-learning** de E-learnit con la experiencia en cloud computing y soluciones web de Purple Network — ambos socios fundadores de la Asociación Forma y desarrolladores de **Forma LMS, el LMS open-source premiado**. La "Farm" es la evolución natural de años de colaboración: crear espacio para hacer crecer tu negocio de e-learning y tus ideas.',
  },
  {
    slug: 'kotuko',
    description_en:
      'Kotuko supports companies through their **digital-evolution process**, offering solutions across **digital marketing, web design and IT technology**. A dynamic team powered by change — convinced that the greatest danger is not having the courage to transform.',
    description_it:
      'Kotuko accompagna le aziende nel loro **percorso di evoluzione digitale**, con soluzioni che spaziano dal **digital marketing al web design alla tecnologia IT**. Un team dinamico mosso dal cambiamento — convinto che il pericolo maggiore sia non avere il coraggio di trasformarsi.',
    description_es:
      'Kotuko acompaña a las empresas en su **proceso de evolución digital**, con soluciones que abarcan **marketing digital, diseño web y tecnología IT**. Un equipo dinámico impulsado por el cambio — convencido de que el mayor peligro es no tener el valor de transformarse.',
  },
  {
    slug: 'alcos-digital',
    description_en:
      'The agency where I actually **learned to work with PHP and a range of frameworks** — including my favourite, **Laravel**. For two years I was also involved in **native iOS development in Objective-C**. The company eventually went into layoffs and I moved on; there is little information about it on the web today.',
    description_it:
      "L'agenzia in cui ho davvero **imparato a lavorare con PHP e diversi framework** — incluso il mio preferito, **Laravel**. Per due anni mi sono occupato anche di **sviluppo nativo iOS in Objective-C**. L'azienda è poi entrata in cassa integrazione e sono andato avanti; oggi se ne trovano poche tracce in rete.",
    description_es:
      'La agencia donde realmente **aprendí a trabajar con PHP y varios frameworks** — incluido mi favorito, **Laravel**. Durante dos años también me dediqué al **desarrollo nativo iOS en Objective-C**. La empresa terminó en regulación de empleo y seguí mi camino; hoy queda poca información sobre ella en la web.',
  },
  {
    slug: 'proxime',
    description_en:
      'Proxime conceives, designs and builds solutions grounded in **advanced communication theory** and **innovative open-source technology**. Its staff combines heterogeneous skills across communication, IT, marketing, design and human–machine interaction, applies **usability and accessibility** throughout, and ships products with **initial training and real coaching** so users are productive immediately. Work spans **SUAP / OpenTRIUM territorial-marketing portals**, **accessible web portals for public administration**, corporate e-learning and training, hardware and software sales, and **photovoltaic-systems monitoring**.',
    description_it:
      'Proxime concepisce, progetta e realizza soluzioni basate su **teoria della comunicazione avanzata** e **tecnologie open-source innovative**. Il suo staff combina competenze eterogenee tra comunicazione, IT, marketing, design e interazione uomo-macchina, applica **usabilità e accessibilità** in modo trasversale e rilascia i prodotti con **formazione iniziale e affiancamento reale** così che gli utenti siano subito produttivi. Il lavoro spazia da **portali SUAP / OpenTRIUM per il marketing territoriale**, **portali web accessibili per la pubblica amministrazione**, e-learning aziendale e formazione, vendita di hardware e software, fino al **monitoraggio di impianti fotovoltaici**.',
    description_es:
      'Proxime concibe, diseña y construye soluciones basadas en **teoría de la comunicación avanzada** y **tecnologías open-source innovadoras**. Su equipo combina competencias heterogéneas en comunicación, IT, marketing, diseño e interacción persona-máquina, aplica **usabilidad y accesibilidad** de forma transversal y entrega los productos con **formación inicial y acompañamiento real** para que los usuarios sean productivos desde el primer día. Su trabajo abarca **portales SUAP / OpenTRIUM de marketing territorial**, **portales web accesibles para la administración pública**, e-learning corporativo y formación, venta de hardware y software, y **monitorización de instalaciones fotovoltaicas**.',
  },
];

const PROJECTS = [
  {
    slug: 'fiberdroid-customer-area',
    title_en: 'Customer area & operations portal',
    title_it: 'Area clienti e portale operativo',
    title_es: 'Área de clientes y portal de operaciones',
    desc_en:
      "A **PWA (single-page app)** backed by a **REST API**. It packs a lot: a **notification system over push, WebSocket and email**; **user roles and permissions**; **automated invoicing** for end customers; appointment management; product shipments; and **full contract management and workflow** — among much more. Development is a continuous stream of improvements, but it rests on a **stable base built since 2021**, is well documented, and ships with **unit tests** covering the system's core functions.",
    desc_it:
      'Una **PWA (single-page app)** appoggiata a una **REST API**. Contiene molto: un **sistema di notifiche su push, WebSocket ed email**; **ruoli e permessi utente**; **fatturazione automatica** verso i clienti finali; gestione appuntamenti; spedizioni dei prodotti; e **gestione completa di contratti e workflow** — tra molto altro. Lo sviluppo è un flusso continuo di miglioramenti, ma poggia su una **base stabile costruita dal 2021**, è ben documentato e include **test unitari** sulle funzioni core del sistema.',
    desc_es:
      'Una **PWA (single-page app)** apoyada en una **REST API**. Cubre mucho: un **sistema de notificaciones por push, WebSocket y email**; **roles y permisos de usuario**; **facturación automatizada** hacia los clientes finales; gestión de citas; envíos de productos; y **gestión completa de contratos y workflow** — entre mucho más. El desarrollo es un flujo continuo de mejoras, pero descansa sobre una **base estable construida desde 2021**, está bien documentado e incluye **tests unitarios** sobre las funciones core del sistema.',
  },
  {
    slug: 'inspxt',
    title_en: 'INspxt — inspections management platform',
    title_it: 'INspxt — piattaforma di gestione ispezioni',
    title_es: 'INspxt — plataforma de gestión de inspecciones',
    desc_en:
      'An app for managing **inspectors and the inspections they carry out**. The **Laravel REST API** handles user roles and permissions — chiefly **administrators and inspectors** — while the **React front end** fully separates the two roles, showing a simplified interface to inspectors, who can reach only a subset of features. The system is **stable and performant** given the access and data traffic it handles, and it mainly drives inspection activities that **certify the quality of customer products**. A **complete refactoring** improved the UX, simplified the database structure, migrated the data to the new schema, and streamlined the server-side code both syntactically and logically.',
    desc_it:
      'App per la gestione di **ispettori e delle ispezioni che svolgono**. La **REST API in Laravel** gestisce ruoli e permessi — principalmente **amministratori e ispettori** — mentre il **front end in React** separa nettamente i due ruoli, mostrando agli ispettori un\'interfaccia semplificata limitata a un sottoinsieme di funzioni. Il sistema è **stabile e performante** rispetto agli accessi e al traffico dati che gestisce, e guida principalmente le attività di ispezione che **certificano la qualità dei prodotti dei clienti**. Un **refactor completo** ha migliorato la UX, semplificato la struttura del database, migrato i dati al nuovo schema e ripulito il codice server sia sintatticamente sia logicamente.',
    desc_es:
      'App para la gestión de **inspectores y de las inspecciones que realizan**. La **REST API en Laravel** gestiona roles y permisos — principalmente **administradores e inspectores** — mientras que el **front end en React** separa netamente los dos roles, mostrando a los inspectores una interfaz simplificada limitada a un subconjunto de funciones. El sistema es **estable y rendido** respecto a los accesos y al tráfico de datos que maneja, y conduce principalmente actividades de inspección que **certifican la calidad de los productos de los clientes**. Un **refactor completo** mejoró la UX, simplificó la estructura de la base de datos, migró los datos al nuevo esquema y limpió el código del servidor tanto sintáctica como lógicamente.',
  },
  {
    slug: 'standup-way-platform',
    title_en: 'StandUp Way platform',
    title_it: 'Piattaforma StandUp Way',
    title_es: 'Plataforma StandUp Way',
    desc_en:
      "A **PWA (SPA)** connected to a **REST API**. Features include a **notification system over push, WebSocket and email**; user roles and permissions; **automated scheduling** for the group's video calls (via **agora.io**); appointment management; **dynamic clinical record cards** for customers; and much more. Development keeps evolving, but it rests on a **stable base built since 2023**, is well documented, and ships with **Playwright tests** covering the system's core flows from the front end.",
    desc_it:
      'Una **PWA (SPA)** collegata a una **REST API**. Le funzionalità includono un **sistema di notifiche su push, WebSocket ed email**; ruoli e permessi utente; **pianificazione automatica** delle videochiamate di gruppo (tramite **agora.io**); gestione appuntamenti; **schede cliniche dinamiche** per i clienti; e molto altro. Lo sviluppo continua a evolvere, ma poggia su una **base stabile costruita dal 2023**, è ben documentato e include **test Playwright** che coprono i flussi core dal front end.',
    desc_es:
      'Una **PWA (SPA)** conectada a una **REST API**. Las funciones incluyen un **sistema de notificaciones por push, WebSocket y email**; roles y permisos de usuario; **planificación automatizada** de las videollamadas grupales (vía **agora.io**); gestión de citas; **fichas clínicas dinámicas** para los clientes; y mucho más. El desarrollo sigue evolucionando, pero descansa sobre una **base estable construida desde 2023**, está bien documentado e incluye **tests Playwright** que cubren los flujos core desde el front end.',
  },
  {
    slug: 'silent-hill-web',
    title_en: 'Silent Hill Web',
    title_it: 'Silent Hill Web',
    title_es: 'Silent Hill Web',
    desc_en:
      'After the announcements of new entries in the saga I built a **PWA in Nuxt 3 + Laravel 10** for my favourite game series. It is **server-side rendered** and tuned across accessibility and usability for SEO. It has an **event notification system**, **interactive maps** built on the in-game map images, and a **two-axis navigation** — a horizontal menu to pick the game, a vertical one for its sub-sections and the generic sections. Users sign up by **email or via Facebook Login**. The admin panel — built in Nuxt 2 to move faster, then **fully refactored to Nuxt 4 + shadcn** — manages multiple user roles with configurable permissions and uploads images and YouTube videos quickly. Both the site and the panel are **trilingual: Italian, English and Spanish**. It is a fully **non-profit project**, so the main thing missing is content — collaborators who know Silent Hill well are welcome.',
    desc_it:
      'Dopo gli annunci di nuovi capitoli della saga ho costruito una **PWA in Nuxt 3 + Laravel 10** dedicata alla mia serie di videogiochi preferita. È **renderizzata lato server** e ottimizzata su accessibilità e usabilità per la SEO. Ha un **sistema di notifiche eventi**, **mappe interattive** costruite sopra le immagini delle mappe di gioco e una **navigazione a due assi** — un menu orizzontale per scegliere il gioco, uno verticale per le sue sottosezioni e le sezioni generiche. Gli utenti si registrano via **email o Facebook Login**. Il pannello admin — nato in Nuxt 2 per andare veloce, poi **completamente rifattorizzato in Nuxt 4 + shadcn** — gestisce più ruoli utente con permessi configurabili e carica velocemente immagini e video YouTube. Sia il sito sia il pannello sono **trilingue: italiano, inglese e spagnolo**. È un **progetto totalmente no-profit**, quindi la cosa principale che manca sono i contenuti — chi conosce bene Silent Hill è il benvenuto come collaboratore.',
    desc_es:
      'Tras los anuncios de nuevas entregas en la saga construí una **PWA en Nuxt 3 + Laravel 10** dedicada a mi serie de videojuegos favorita. Está **renderizada en el servidor** y optimizada en accesibilidad y usabilidad para SEO. Tiene un **sistema de notificación de eventos**, **mapas interactivos** construidos sobre las imágenes de los mapas del juego y una **navegación de dos ejes** — un menú horizontal para elegir el juego, otro vertical para sus subsecciones y las secciones genéricas. Los usuarios se registran por **email o Facebook Login**. El panel de administración — nacido en Nuxt 2 para ir más rápido, después **completamente refactorizado a Nuxt 4 + shadcn** — gestiona múltiples roles de usuario con permisos configurables y sube imágenes y vídeos de YouTube rápidamente. Tanto el sitio como el panel son **trilingües: italiano, inglés y español**. Es un **proyecto totalmente sin ánimo de lucro**, así que lo principal que falta es contenido — quien conozca bien Silent Hill es bienvenido como colaborador.',
  },
  {
    slug: 'devboards-io',
    title_en: 'DevBoards.io',
    title_it: 'DevBoards.io',
    title_es: 'DevBoards.io',
    desc_en:
      'An **IT job-discovery and tech-news platform** aimed at the European and U.S. markets. It aggregates job listings from **10+ sources using AI-powered APIs**, serves multilingual tech news, and includes a **custom CMS admin dashboard** for content management. Two **Python scripts** import jobs every **12 hours** via RSS feeds and public job-portal APIs, filtering Tech/IT roles and **auto-categorising each listing** with relevant metadata — so users discover thousands of opportunities a day from a single platform in **five languages**, with fast filters for **skills, availability and seniority**. Each user gets a **compatibility score** for every posting, and companies get a **trust score** based on the quality of their ads plus a community-driven like/dislike rating. GitHub repo (6 submodules + CI/CD): https://github.com/micio86dev/itjobhub-antigravity-config',
    desc_it:
      "Una **piattaforma di scoperta di offerte di lavoro IT e di news tech** indirizzata ai mercati europeo e statunitense. Aggrega annunci da **10+ fonti tramite API guidate da AI**, pubblica news tech multilingue e include una **dashboard CMS amministrativa custom** per la gestione dei contenuti. Due **script Python** importano le offerte ogni **12 ore** via feed RSS e API pubbliche dei portali di lavoro, filtrando i ruoli Tech/IT e **categorizzando automaticamente ogni annuncio** con metadati pertinenti — così gli utenti scoprono migliaia di opportunità al giorno da un'unica piattaforma in **cinque lingue**, con filtri rapidi per **competenze, disponibilità e seniority**. Ogni utente riceve un **punteggio di compatibilità** per ogni annuncio e le aziende ottengono un **punteggio di affidabilità** basato sulla qualità degli annunci più una valutazione like/dislike data dalla community. GitHub repo (6 sottomoduli + CI/CD): https://github.com/micio86dev/itjobhub-antigravity-config",
    desc_es:
      'Una **plataforma de descubrimiento de empleo IT y de noticias tech** orientada a los mercados europeo y estadounidense. Agrega anuncios de **10+ fuentes mediante APIs impulsadas por AI**, publica noticias tech multilingües e incluye un **panel CMS administrativo a medida** para la gestión de contenidos. Dos **scripts en Python** importan las ofertas cada **12 horas** vía feeds RSS y APIs públicas de los portales de empleo, filtrando los puestos Tech/IT y **categorizando automáticamente cada anuncio** con metadatos relevantes — así los usuarios descubren miles de oportunidades al día desde una sola plataforma en **cinco idiomas**, con filtros rápidos por **competencias, disponibilidad y seniority**. Cada usuario recibe una **puntuación de compatibilidad** para cada anuncio y las empresas obtienen una **puntuación de confianza** basada en la calidad de los anuncios más una valoración like/dislike de la comunidad. Repositorio GitHub (6 submódulos + CI/CD): https://github.com/micio86dev/itjobhub-antigravity-config',
  },
];

migrate(
  (app) => {
    for (const c of CUSTOMERS) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('customers', 'slug = {:slug}', { slug: c.slug });
      } catch (_) {
        continue; // slug renamed / row deleted — skip silently
      }
      rec.set('description_en', c.description_en);
      rec.set('description_it', c.description_it);
      rec.set('description_es', c.description_es);
      app.save(rec);
    }

    for (const p of PROJECTS) {
      let rec;
      try {
        rec = app.findFirstRecordByFilter('projects', 'slug = {:slug}', { slug: p.slug });
      } catch (_) {
        continue;
      }
      rec.set('title_en', p.title_en);
      rec.set('title_it', p.title_it);
      rec.set('title_es', p.title_es);
      rec.set('desc_en', p.desc_en);
      rec.set('desc_it', p.desc_it);
      rec.set('desc_es', p.desc_es);
      app.save(rec);
    }
  },
  (app) => {
    // Forward-only content update — the previous plain-text EN copy isn't
    // worth restoring, and leaving the IT/ES translations in place is
    // harmless. No-op down.
  },
);
