import type { Settings } from './settings-schema';
import { COOKIES_DRAFT, PRIVACY_DRAFT } from './legal-drafts';

/**
 * The site's starting content. A settings group that has never been saved in the admin reads
 * these values, so a fresh install is complete without a separate seed copy of the same text.
 *
 * What the café has not told us is left empty rather than guessed: street address, phone,
 * opening hours, social accounts, company details. The public site hides an empty field, and
 * the admin dashboard lists each one as a task.
 *
 * Image ids beginning with `seed-` are the café's own photographs, loaded on first boot from
 * assets/seed (see lib/db/seed.ts).
 */

const MAPS_PLACE_QUERY = encodeURIComponent('Kapucinus Kávézó Hatvan');

export const DEFAULT_SETTINGS: Settings = {
  site: {
    brandName: 'Kapucinus Kávézó',
    tagline: 'Kávé, torta, limonádé – és egy asztal, ahol nem siettetünk.',
    homeHeading: 'Kapucinus Kávézó, Hatvan',
    seoTitle: 'Kapucinus Kávézó – kávé, sütemények és reggeli Hatvanban',
    seoDescription:
      'Kávé, torták, melegszendvicsek, limonádék és koktélok Hatvanban. Nézd meg az étlapot és az itallapot, és tervezd meg az utat hozzánk.',
    ogImageId: 'seed-latte-talca',
    logoId: null,
    iconId: null,
  },

  about: {
    heading: 'Egy csésze, amiért érdemes megállni',
    lead: 'A Kapucinus olyan hely, ahová reggel egy gyors kávéra ugrasz be, délután pedig ottfelejted magad egy szelet torta mellett.',
    body: 'Minden csésze úgy készül, ahogy mi magunk is szeretjük inni: frissen őrölt kávéból, selymesre habosított tejjel, figyelemmel. A vitrinben klasszikus szeletek mellett vegán és gluténmentes finomságok is várnak, nyáron pedig a limonádék és a koktélok veszik át a főszerepet.',
    note: 'a pult mögül',
    primaryImageId: 'seed-latte-talca',
    primaryImageAlt: 'Két latte macchiato és omlós keksz virágmintás tálcán, a felszolgáló kezében',
    secondaryImageId: 'seed-kavebab-toltes',
    secondaryImageAlt: 'Pörkölt kávébab ömlik a zacskóból a daráló tartályába',
  },

  aboutPage: {
    heading: 'Rólunk',
    lead: 'Kávézó Hatvanban, ahol a kávé mellé idő is jár.',
    heroImage: {
      id: 'seed-kavebab-daralo',
      alt: 'Pörkölt kávébabok a daráló tartályában, felülnézetből',
    },
    storyHeading: 'Amiért csináljuk',
    storyBody:
      'Egy jó kávézót nem az tesz jóvá, hogy mindent tud. Hanem az, hogy reggel ugyanaz a csésze vár, mint tegnap, és délután is kedved van visszajönni.\n\nA Kapucinusban erre figyelünk. Hogy a kávé kerek és kiegyensúlyozott legyen, a tej selymes, a sütemény friss, és hogy a pult mögül mindig jusson egy jó szó. Nem bonyolítjuk túl, csak minden nap ugyanúgy odafigyelünk.',
    valuesHeading: 'Amire figyelünk',
    values: [
      {
        title: 'Kávé, figyelemmel',
        text: 'Frissen őrölt szemek, pontosan beállított daráló, selymesre habosított tej. A részleteken múlik, ezért nem sietjük el.',
      },
      {
        title: 'Édes, könnyű, mindenkinek',
        text: 'A klasszikus szeletek mellett vegán és gluténmentes süteményeket is tartunk, hogy mindenki találjon magának valót.',
      },
      {
        title: 'Időt is adunk mellé',
        text: 'Maradj egy kávéra vagy egy egész délutánra. Nálunk senki nem siettet.',
      },
    ],
    atmosphereHeading: 'Bent és kint',
    atmosphereBody:
      'Napfényes ablakok, puha székek, nyáron terasz a fák alatt. Ugyanúgy jól esik itt egy csendes reggeli kávé, mint egy baráti koccintás estefelé.',
    atmosphereImages: [
      {
        id: 'seed-koktel-terasz',
        alt: 'Gyümölcsös koktél egy kézben, háttérben a füves terasz és a fák',
      },
      {
        id: 'seed-torta-erdei',
        alt: 'Erdei gyümölcsös tortaszelet az ablak melletti asztalon, háttérben kárpitozott szék',
      },
      {
        id: 'seed-limonadek',
        alt: 'Három színes limonádé a terasz asztalán a napsütésben',
      },
    ],
    teamHeading: 'A pult mögött',
    teamBody:
      'A csapatunk minden csészét úgy készít, mintha a saját asztalára vinné. Ha nem tudod, mit kérj, kérdezz bátran, szívesen ajánlunk valamit.',
    teamImage: {
      id: 'seed-jeges-kave',
      alt: 'Négy jeges kávé tejszínhabbal egy fatálcán, a felszolgáló kezében',
    },
    closingNote: 'várunk szeretettel',
  },

  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    others: [],
  },

  location: {
    name: 'Kapucinus Kávézó',
    street: '',
    postalCode: '',
    city: 'Hatvan',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2686.876034051754!2d19.68296397681075!3d47.667404583776154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47404d7b8c769f77%3A0x3c7b8d85203bcdf1!2zS2FwdWNpbnVzIEvDoXbDqXrDsyBIYXR2YW4!5e0!3m2!1shu!2shu!4v1790792508781!5m2!1shu!2shu',
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${MAPS_PLACE_QUERY}`,
    /** The place's own Google Maps page, from the feature id in the embed above. */
    mapsUrl: 'https://maps.google.com/?cid=4358232667322043889',
    phone: '',
    email: '',
    hours: Array.from({ length: 7 }, () => ({ closed: false, open: '', close: '' })),
    hoursNote: '',
    latitude: null,
    longitude: null,
  },

  operator: {
    companyName: '',
    seat: '',
    registrationNumber: '',
    taxNumber: '',
    email: '',
    phone: '',
    hostingProvider: '',
    hostingAddress: '',
    hostingContact: '',
  },

  legal: {
    privacy: PRIVACY_DRAFT,
    cookies: COOKIES_DRAFT,
    impressumNote: '',
    effectiveDate: '',
  },
};
