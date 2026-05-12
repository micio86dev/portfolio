/// <reference path="../pb_data/types.d.ts" />

// Replace the placeholder `imprint` page (created by 1778600700_created_pages.js)
// with a real, professional legal-notice / imprint body in en / it / es.
//
// The copy is deliberately GENERIC: it names "MicioDev — freelance full-stack
// developer" as the operator and says the full legal details are "available on
// request". The site owner MUST personalise the following in the admin
// (collection `pages`, slug `imprint`):
//   - the operator's full legal name
//   - the business / registered address
//   - the VAT / tax identification number
//   - the competent jurisdiction (and, where applicable, professional register
//     and supervisory authority)
// …either by editing this row's `body_*` HTML directly or by replacing the
// "available on request" sentences with the concrete data.
//
// The same content is mirrored in src/lib/seed-data.ts (PAGES_SEED →
// seed-page-imprint) so the Astro fallback matches the live PB row.
//
// `down` restores the original placeholder strings.

migrate(
  (app) => {
    const record = app.findFirstRecordByFilter('pages', 'slug = "imprint"');

    record.set('title_en', 'Legal notice');
    record.set('title_it', 'Note legali');
    record.set('title_es', 'Aviso legal');

    record.set(
      'body_en',
      '<p>This site, <strong>miciodev.com</strong>, is the personal portfolio of MicioDev — a freelance full-stack developer (Laravel, Vue, Nuxt) working remotely from the Canary Islands, Spain. It exists to present services, selected work and a way to get in touch.</p><h2>Who is responsible</h2><p>The site is operated by MicioDev (freelance full-stack developer). The full legal name, business address, VAT / tax identification number and the competent jurisdiction are available on request — write through the contact form on this site and they will be provided.</p><h2>Hosting &amp; data processing</h2><p>The site runs on a virtual private server and uses a self-hosted PocketBase backend for content and for contact-form submissions. No third-party analytics, advertising or tracking services are used. For details on what is stored and why, see the <a href="/privacy">privacy policy</a>.</p><h2>Intellectual property</h2><p>Unless stated otherwise, the text, code, design and graphics on this site are the property of MicioDev and are protected by copyright. Third-party names, logos and trademarks shown in case studies or as references remain the property of their respective owners. Reuse beyond what copyright law permits requires prior written consent.</p><h2>External links</h2><p>This site may link to external websites that are outside its control. No responsibility is taken for the content, availability or data-protection practices of those sites; visiting them is at your own risk.</p><h2>Limitation of liability</h2><p>The content of this site is provided in good faith and for general information only. While reasonable care is taken to keep it accurate and up to date, no warranty is given as to its completeness or correctness, and no liability is accepted for any loss arising from its use.</p><h2>Contact</h2><p>This page is informational and does not constitute legal advice. Questions, corrections or legal notices can be sent through the <a href="/#contact">contact form</a> on this site.</p>',
    );
    record.set(
      'body_it',
      '<p>Questo sito, <strong>miciodev.com</strong>, è il portfolio personale di MicioDev — sviluppatore full-stack freelance (Laravel, Vue, Nuxt) che lavora da remoto dalle Isole Canarie, Spagna. Serve a presentare i servizi, una selezione di lavori e un modo per mettersi in contatto.</p><h2>Titolare e responsabile</h2><p>Il sito è gestito da MicioDev (sviluppatore full-stack freelance). Ragione/denominazione legale completa, indirizzo dell\'attività, partita IVA / codice fiscale e foro competente sono disponibili su richiesta — scrivi tramite il modulo di contatto del sito e verranno forniti.</p><h2>Hosting e trattamento dei dati</h2><p>Il sito gira su un server privato virtuale e usa un backend PocketBase self-hosted per i contenuti e per gli invii del modulo di contatto. Non vengono usati servizi di analitica, pubblicità o tracciamento di terze parti. Per i dettagli su cosa viene conservato e perché, consulta l\'<a href="/privacy">informativa sulla privacy</a>.</p><h2>Proprietà intellettuale</h2><p>Salvo diversa indicazione, testi, codice, design e grafica di questo sito sono di proprietà di MicioDev e sono protetti dal diritto d\'autore. Nomi, loghi e marchi di terze parti mostrati nei case study o come riferimenti restano di proprietà dei rispettivi titolari. Qualsiasi riutilizzo che vada oltre quanto consentito dalla legge sul diritto d\'autore richiede consenso scritto preventivo.</p><h2>Link esterni</h2><p>Questo sito può rimandare a siti esterni che non sono sotto il suo controllo. Non si assume alcuna responsabilità per contenuti, disponibilità o pratiche di protezione dei dati di tali siti; la visita avviene a tuo rischio.</p><h2>Limitazione di responsabilità</h2><p>I contenuti del sito sono forniti in buona fede e a solo scopo informativo generale. Pur prestando ragionevole cura per mantenerli accurati e aggiornati, non si fornisce alcuna garanzia sulla loro completezza o correttezza e non si accetta alcuna responsabilità per eventuali danni derivanti dal loro uso.</p><h2>Contatti</h2><p>Questa pagina è informativa e non costituisce consulenza legale. Domande, correzioni o comunicazioni legali possono essere inviate tramite il <a href="/#contact">modulo di contatto</a> del sito.</p>',
    );
    record.set(
      'body_es',
      '<p>Este sitio, <strong>miciodev.com</strong>, es el portfolio personal de MicioDev — desarrollador full-stack freelance (Laravel, Vue, Nuxt) que trabaja en remoto desde las Islas Canarias, España. Existe para presentar los servicios, una selección de trabajos y una forma de ponerse en contacto.</p><h2>Quién es el responsable</h2><p>El sitio lo gestiona MicioDev (desarrollador full-stack freelance). El nombre legal completo, el domicilio de la actividad, el NIF / número de identificación fiscal y la jurisdicción competente están disponibles bajo petición — escribe a través del formulario de contacto del sitio y se facilitarán.</p><h2>Alojamiento y tratamiento de datos</h2><p>El sitio se ejecuta en un servidor privado virtual y usa un backend PocketBase autoalojado para el contenido y para los envíos del formulario de contacto. No se usan servicios de analítica, publicidad ni rastreo de terceros. Para más detalles sobre qué se guarda y por qué, consulta la <a href="/privacy">política de privacidad</a>.</p><h2>Propiedad intelectual</h2><p>Salvo que se indique lo contrario, los textos, el código, el diseño y los gráficos de este sitio son propiedad de MicioDev y están protegidos por derechos de autor. Los nombres, logotipos y marcas de terceros mostrados en los casos de estudio o como referencias siguen siendo propiedad de sus respectivos titulares. Cualquier reutilización más allá de lo que permite la ley de propiedad intelectual requiere consentimiento previo por escrito.</p><h2>Enlaces externos</h2><p>Este sitio puede enlazar a sitios externos que están fuera de su control. No se asume responsabilidad alguna por el contenido, la disponibilidad o las prácticas de protección de datos de esos sitios; visitarlos es bajo tu propio riesgo.</p><h2>Limitación de responsabilidad</h2><p>El contenido de este sitio se ofrece de buena fe y solo con fines de información general. Aunque se pone un cuidado razonable en mantenerlo exacto y actualizado, no se ofrece garantía alguna sobre su integridad o corrección, ni se acepta responsabilidad por cualquier pérdida derivada de su uso.</p><h2>Contacto</h2><p>Esta página es informativa y no constituye asesoramiento legal. Las preguntas, correcciones o comunicaciones legales pueden enviarse a través del <a href="/#contact">formulario de contacto</a> del sitio.</p>',
    );

    app.save(record);
  },
  (app) => {
    const record = app.findFirstRecordByFilter('pages', 'slug = "imprint"');

    record.set('title_en', 'Imprint');
    record.set('title_it', 'Note legali');
    record.set('title_es', 'Aviso legal');
    record.set(
      'body_en',
      '<p><strong>Placeholder.</strong> This is placeholder copy — replace it with the real imprint / legal notice from the admin (collection <code>pages</code>, slug <code>imprint</code>).</p>',
    );
    record.set(
      'body_it',
      '<p><strong>Segnaposto.</strong> Questo è testo segnaposto — sostituiscilo con le note legali reali dall\'admin (collezione <code>pages</code>, slug <code>imprint</code>).</p>',
    );
    record.set(
      'body_es',
      '<p><strong>Marcador de posición.</strong> Este es un texto provisional — reemplázalo con el aviso legal real desde el panel (colección <code>pages</code>, slug <code>imprint</code>).</p>',
    );

    app.save(record);
  },
);
