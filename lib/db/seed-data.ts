/**
 * First-boot content, written from the café's own photographs. Product names describe what each
 * photo shows; where a name is printed on the photo (the vegan and gluten-free slices) it is used
 * verbatim. Prices are deliberately absent — they are the café's to set in the admin, and the
 * menu shows no price rather than an invented one.
 *
 * `image` values are keys of assets/seed (file names without extension).
 */

export interface SeedSlide {
  readonly image: string;
  readonly imageAlt: string;
  readonly title: string;
  readonly description: string;
  readonly note: string;
}

export interface SeedProduct {
  readonly name: string;
  readonly description: string;
  readonly image?: string;
  readonly dietary?: string;
  readonly featured?: boolean;
}

export interface SeedCategory {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly products: readonly SeedProduct[];
}

export interface SeedGalleryItem {
  readonly image: string;
  readonly title: string;
  readonly alt: string;
  readonly category: string;
}

export const SEED_SLIDES: readonly SeedSlide[] = [
  {
    image: 'latte-talca',
    imageAlt: 'Latte macchiato és karamellás latte omlós keksszel, virágmintás tálcán',
    title: 'A nap legjobb negyedórája',
    description:
      'Krémes latte, karamellás macchiato és mellé egy omlós keksz. Ilyenkor ráér minden más.',
    note: 'frissen őrölve',
  },
  {
    image: 'melegszendvics',
    imageAlt: 'Grillezett melegszendvicsek és friss zöldségtál egy napsütötte fa asztalon',
    title: 'Reggeli, ami kitart délig',
    description:
      'Ropogósra sütött melegszendvics, mellé paradicsom, uborka, paprika. Egy jó nap így kezdődik.',
    note: 'ropogósra sütve',
  },
  {
    image: 'torta-malnas',
    imageAlt: 'Málnás tortaszelet habcsókkal egy fehér tányéron, az ablak melletti asztalon',
    title: 'Délután egy szelet torta',
    description:
      'Réteges torták, klasszikus szeletek, vegán és gluténmentes választás is. Nézd meg, mi van ma a vitrinben.',
    note: 'ma mi legyen?',
  },
  {
    image: 'limonadek',
    imageAlt: 'Eper, erdei gyümölcs és mangó limonádé a terasz asztalán, napsütésben',
    title: 'Nyáron a teraszon',
    description:
      'Gyümölcsös limonádé, jeges kávé, estefelé egy gin tonic. Ha süt a nap, kint a helyünk.',
    note: 'jéghidegen',
  },
];

export const SEED_MENU: readonly SeedCategory[] = [
  {
    name: 'Kávék',
    slug: 'kavek',
    description: 'Espresso alapú italok, frissen őrölt kávéból.',
    products: [
      {
        name: 'Latte macchiato',
        description: 'Rétegzett meleg tej, selymes hab és egy adag espresso.',
        image: 'latte-talca',
        featured: true,
      },
      {
        name: 'Karamellás latte',
        description: 'Latte karamellöntettel, a tetején roppanósra karamellizált habbal.',
      },
    ],
  },
  {
    name: 'Hideg italok',
    slug: 'hideg-italok',
    description: 'Jeges kávé, matcha és limonádék a melegebb napokra.',
    products: [
      {
        name: 'Jeges kávé',
        description: 'Hideg kávé bőséges tejszínhabbal, kakaóval megszórva.',
        image: 'jeges-kave',
        featured: true,
      },
      {
        name: 'Matcha latte',
        description: 'Élénkzöld matcha hideg tejjel, jégen.',
        image: 'matcha',
        featured: true,
      },
      {
        name: 'Limonádé',
        description: 'Eper, erdei gyümölcs vagy mangó, friss gyümölccsel és mentával.',
        image: 'limonadek',
        featured: true,
      },
    ],
  },
  {
    name: 'Koktélok',
    slug: 'koktelok',
    description: 'Gin tonic és gyümölcsös koktélok, nagy pohárban, sok jéggel.',
    products: [
      {
        name: 'Gin tonic',
        description: 'Bogyós gyümölccsel vagy citrommal és rózsabimbóval, sok jéggel.',
        image: 'gin-tonic',
      },
      {
        name: 'Gyümölcsös koktél',
        description: 'Bogyós gyümölcs, narancs és citrom, rózsabimbóval díszítve.',
        image: 'koktel-terasz',
      },
    ],
  },
  {
    name: 'Reggeli és szendvicsek',
    slug: 'reggeli-szendvicsek',
    description: 'Melegszendvicsek, friss zöldséggel tálalva.',
    products: [
      {
        name: 'Melegszendvics',
        description: 'Grillezett, sajtos melegszendvics friss zöldségtállal.',
        image: 'melegszendvics',
        featured: true,
      },
    ],
  },
  {
    name: 'Torták',
    slug: 'tortak',
    description: 'Réteges torták szeletre.',
    products: [
      {
        name: 'Málnás torta',
        description: 'Könnyű piskóta, málnás réteg és vaníliás krém, málnazselé a tetején.',
        image: 'torta-malnas',
        featured: true,
      },
      {
        name: 'Erdei gyümölcsös torta',
        description: 'Vaníliás krém és erdei gyümölcsös rétegek, rózsaszín mázzal.',
        image: 'torta-erdei',
      },
      {
        name: 'Csokoládés torta',
        description: 'Csokoládés rétegek, gyümölcszselé a tetején, étcsokoládé lapkával.',
        image: 'torta-csokolades',
      },
    ],
  },
  {
    name: 'Sütemények',
    slug: 'sutemenyek',
    description: 'Klasszikus szeletek, aprósütemények, vegán és gluténmentes finomságok.',
    products: [
      {
        name: 'Eszterházy-szelet',
        description: 'Diós lapok, vaníliás krém, a tetején a jellegzetes fondant-mintával.',
        image: 'klasszikus-sutemenyek',
      },
      {
        name: 'Dobos-szelet',
        description: 'Vékony piskótalapok, csokoládékrém, ropogós karamelltető.',
      },
      {
        name: 'Nyers vegán málnás ribizlitorta',
        description: 'Tej, glutén és hozzáadott cukor nélkül.',
        image: 'vegan-gluten-mentes',
        dietary: 'vegan,gluten-free',
      },
      {
        name: 'Gluténmentes epres-krémsajtos szelet',
        description: 'Krémsajtos réteg, friss eper és eperzselé.',
        dietary: 'gluten-free',
      },
      {
        name: 'Nyers vegán almás-vaníliás pite',
        description: 'Diós alap, almás-vaníliás krém. Tej, glutén és hozzáadott cukor nélkül.',
        dietary: 'vegan,gluten-free',
      },
    ],
  },
];

export const SEED_GALLERY_CATEGORIES = [
  { name: 'Kávé', slug: 'kave' },
  { name: 'Italok', slug: 'italok' },
  { name: 'Sütemények', slug: 'sutemenyek' },
  { name: 'Hangulat', slug: 'hangulat' },
] as const;

export const SEED_GALLERY: readonly SeedGalleryItem[] = [
  {
    image: 'latte-talca',
    title: 'Latte macchiato',
    alt: 'Két latte macchiato és omlós keksz virágmintás tálcán, a felszolgáló kezében',
    category: 'kave',
  },
  {
    image: 'torta-malnas',
    title: 'Málnás torta',
    alt: 'Málnás tortaszelet habcsókkal az ablak melletti asztalon',
    category: 'sutemenyek',
  },
  {
    image: 'limonadek',
    title: 'Limonádék a teraszon',
    alt: 'Eper, erdei gyümölcs és mangó limonádé a terasz asztalán, napsütésben',
    category: 'italok',
  },
  {
    image: 'kavebab-toltes',
    title: 'Friss kávébab',
    alt: 'Pörkölt kávébab ömlik a zacskóból a daráló tartályába',
    category: 'kave',
  },
  {
    image: 'klasszikus-sutemenyek',
    title: 'Klasszikus szeletek',
    alt: 'Eszterházy- és Dobos-szelet, linzerek, csokoládés keksz és mandulás fánkok kék tányérokon',
    category: 'sutemenyek',
  },
  {
    image: 'koktel-terasz',
    title: 'Koktél a teraszon',
    alt: 'Gyümölcsös koktél egy kézben, háttérben a füves terasz és a fák',
    category: 'hangulat',
  },
  {
    image: 'matcha',
    title: 'Matcha',
    alt: 'Két matcha ital üvegpohárban, virágos tálcán',
    category: 'italok',
  },
  {
    image: 'melegszendvics',
    title: 'Reggeli',
    alt: 'Két grillezett melegszendvics és zöldségtál egy napsütötte fa asztalon',
    category: 'hangulat',
  },
  {
    image: 'torta-erdei',
    title: 'Erdei gyümölcsös torta',
    alt: 'Erdei gyümölcsös tortaszelet fehér tányéron, háttérben kárpitozott szék',
    category: 'sutemenyek',
  },
  {
    image: 'jeges-kave',
    title: 'Jeges kávé',
    alt: 'Négy jeges kávé tejszínhabbal egy fatálcán',
    category: 'italok',
  },
  {
    image: 'kavebab-daralo',
    title: 'A daráló',
    alt: 'Pörkölt kávébabok a daráló tartályában, felülnézetből',
    category: 'kave',
  },
  {
    image: 'gin-tonic',
    title: 'Gin tonic',
    alt: 'Két gin tonic talpas pohárban, fatálcán',
    category: 'italok',
  },
  {
    image: 'vegan-gluten-mentes',
    title: 'Vegán és gluténmentes',
    alt: 'Nyers vegán málnás ribizlitorta, gluténmentes epres-krémsajtos szelet és nyers vegán almás pite fatálcán',
    category: 'sutemenyek',
  },
  {
    image: 'torta-csokolades',
    title: 'Csokoládés torta',
    alt: 'Csokoládés réteges tortaszelet csokoládélapkával, fehér tányéron',
    category: 'sutemenyek',
  },
];
