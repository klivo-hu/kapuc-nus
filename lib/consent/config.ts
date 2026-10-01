/**
 * The consent window's purposes and copy.
 *
 * `version` is tied to the purposes below. Change what is asked, raise the version: a decision
 * recorded against older purposes was an answer to a different question, and is treated as absent.
 */

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'cef-consent';
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_STORAGE_MEDIUM = 'cookie' as 'cookie' | 'local';
export const CONSENT_POLICY_PATH = '/cookie-tajekoztato';
export const CONSENT_PLACEMENT = 'bottom-right-card';
export const CONSENT_BLOCKING = false;
export const CONSENT_SHOW_PURPOSES_UP_FRONT = false;
export const CONSENT_GOOGLE_MODE = true;

export interface ConsentCategory {
  readonly id: string;
  /** Essential purposes are always on and are never presented as a choice. */
  readonly essential: boolean;
  readonly label: string;
  readonly description: string;
  readonly signals: readonly string[];
}

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  {
    id: 'necessary',
    essential: true,
    label: 'Feltétlenül szükséges',
    description: 'Az oldal működéséhez és a döntésed megjegyzéséhez szükséges. Nem kapcsolható ki.',
    signals: ['security_storage'],
  },
  {
    id: 'functional',
    essential: false,
    label: 'Külső tartalmak',
    description:
      'A Google Térkép a helyszínnél. Betöltéskor a Google sütiket helyezhet el a böngésződben.',
    signals: ['functionality_storage', 'personalization_storage'],
  },
];

export const CONSENT_COPY = {
  title: 'Sütik és külső tartalmak',
  body: 'Az oldal működéséhez csak a feltétlenül szükséges sütit használjuk. A Google Térkép betöltésekor a Google is elhelyezhet sütiket, ehhez a hozzájárulásodat kérjük.',
  acceptAll: 'Mindent engedélyezek',
  rejectAll: 'Csak a szükségeset',
  customize: 'Beállítások',
  save: 'Választás mentése',
  preferencesTitle: 'Tárolási célok',
  preferencesBody:
    'Minden célt külön engedélyezhetsz. A döntésedet bármikor módosíthatod a lábléc „Süti beállítások” gombjával.',
  policyLink: 'Cookie tájékoztató',
  reopen: 'Süti beállítások',
  alwaysOn: 'Mindig aktív',
} as const;

/** The purposes the visitor decides. Essential storage is disclosed, never toggled. */
export const OPTIONAL_CATEGORIES = CONSENT_CATEGORIES.filter((category) => !category.essential);

/** The starting state: nothing non-essential is granted before an answer exists. */
export function defaultGrants(): Record<string, boolean> {
  return Object.fromEntries(
    CONSENT_CATEGORIES.map((category) => [category.id, category.essential]),
  );
}

/** Every purpose granted — the shape `Allow all` writes. */
export function allGranted(): Record<string, boolean> {
  return Object.fromEntries(CONSENT_CATEGORIES.map((category) => [category.id, true]));
}
