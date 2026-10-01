/**
 * Starting drafts of the privacy and cookie notices, written against what this site actually
 * does: no analytics, no advertising, no forms; a first-party consent cookie; the Google Maps
 * embed, loaded only after consent; and an admin session cookie for staff. The operator's own
 * details are rendered from the Impresszum settings above each text, not typed in here.
 *
 * These are drafts. They are editable in the admin (Beállítások → Jogi szövegek) and must be
 * reviewed by a qualified lawyer before the site goes live.
 */

export const PRIVACY_DRAFT = `## Kik vagyunk

Az adatkezelő a Kapucinus Kávézó üzemeltetője, akinek adatai az oldal tetején, az „Adatkezelő” részben szerepelnek. Kérdés esetén az ott megadott elérhetőségeken írhatsz nekünk.

## Milyen adatokat kezelünk, és miért

### A weboldal böngészése

A weboldal nem használ látogatottságmérést, hirdetési vagy követő eszközöket, és nem kér tőled személyes adatot. A tárhelyszolgáltató szerverei a biztonságos működés érdekében technikai naplót vezethetnek (például IP-cím, időpont, böngésző típusa). Ennek jogalapja az üzemeltető jogos érdeke a weboldal biztonságos működtetéséhez (GDPR 6. cikk (1) f) pont).

### Süti-beállítások

A sütikkel kapcsolatos döntésedet egy sütiben rögzítjük, hogy ne kelljen minden látogatáskor újra megkérdeznünk. A süti csak a döntésedet és annak időpontját tárolja, 180 napig. Részletek a Süti tájékoztatóban.

### Google Térkép

A helyszínnél látható térképet a Google szolgáltatja. A térkép csak akkor töltődik be, ha ehhez a süti-beállításoknál hozzájárulsz, vagy a térkép helyén a betöltést választod. Ekkor a böngésződ közvetlenül a Google szervereihez kapcsolódik, amely ennek során sütiket helyezhet el és adatokat kezelhet (például IP-cím). Ebben a Google önálló adatkezelőként jár el, a saját adatvédelmi tájékoztatója szerint: [policies.google.com/privacy](https://policies.google.com/privacy). Az adatok az Egyesült Államokba is továbbításra kerülhetnek, az EU–USA adatvédelmi keretrendszer alapján. A hozzájárulást bármikor visszavonhatod a lábléc „Süti beállítások” pontjában.

### Ha felveszed velünk a kapcsolatot

Ha e-mailben vagy telefonon keresel minket, a megadott adataidat (név, elérhetőség, az üzenet tartalma) kizárólag a megkeresésed megválaszolására használjuk, a megkeresés lezárásáig.

## A jogaid

Kérheted, hogy tájékoztassunk a rólad kezelt adatokról, hogy azokat helyesbítsük, töröljük vagy kezelésüket korlátozzuk, és tiltakozhatsz az adatkezelés ellen. Hozzájáruláson alapuló adatkezelésnél a hozzájárulásodat bármikor visszavonhatod.

Ha úgy érzed, hogy az adataid kezelése nem megfelelő, panaszt tehetsz a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (1055 Budapest, Falk Miksa utca 9–11., [naih.hu](https://naih.hu)), vagy bírósághoz fordulhatsz.`;

export const COOKIES_DRAFT = `## Mi az a süti?

A süti (cookie) egy kis adatcsomag, amelyet a weboldal a böngésződben tárol. Mi a lehető legkevesebbet használjuk: nincs látogatottságmérés és nincs hirdetési süti.

## Feltétlenül szükséges sütik

Ezek nélkül az oldal nem tudna megfelelően működni, ezért nem kapcsolhatók ki.

- **cef-consent** — elmenti a süti-beállításokkal kapcsolatos döntésedet. Saját süti, 180 napig érvényes.
- **kapu_admin** — a kávézó munkatársainak bejelentkezését tartja nyilván az adminfelületen. Látogatóknál nem jön létre. Saját süti, 12 óráig érvényes.

## Funkcionális sütik

Csak a hozzájárulásoddal töltődnek be.

- **Google Térkép** — a helyszín térképe. Betöltéskor a Google (google.com) helyezhet el sütiket a saját céljaira; ezek listáját és időtartamát a Google tájékoztatója tartalmazza: [policies.google.com/technologies/cookies](https://policies.google.com/technologies/cookies).

## A beállítások módosítása

A döntésedet bármikor megváltoztathatod vagy visszavonhatod az oldal alján található „Süti beállítások” gombbal. A sütiket a böngésződ beállításaiban is törölheted.`;
