/* ─────────────────────────────────────────────────────────────
   Content for the public website, taken from the approved prototype
   at ~/Desktop/Verliks_Public_Website. Copy is transcribed, not rewritten.

   `requestParam` is the value /request?service= already understands
   (checked against lib/estimate.ts SERVICE_TYPES and the request form,
   which seeds its state from that query parameter).
   ───────────────────────────────────────────────────────────── */

export type ServiceGroup =
  | 'Inside the home'
  | 'Moving or finishing work'
  | 'Outside the home'
  | 'For businesses';

export type SiteService = {
  slug: string;
  name: string;
  /** One line under the name in the services menu and directory. */
  blurb: string;
  group: ServiceGroup;
  /** Pre-selects the service in the existing /request flow. */
  requestParam: string;
  /** Base name of the photography in /public/images/site. */
  image: string;
};

export const SITE_SERVICES: SiteService[] = [
  {
    slug: 'standard-cleaning',
    name: 'Standard Cleaning',
    blurb: 'Routine upkeep, kitchen to floors',
    group: 'Inside the home',
    requestParam: 'standard',
    image: 'standard-cleaning-dusting-shelves',
  },
  {
    slug: 'deep-cleaning',
    name: 'Deep Cleaning',
    blurb: 'Detail work on build-up and edges',
    group: 'Inside the home',
    requestParam: 'deep',
    image: 'deep-cleaning-stovetop',
  },
  {
    slug: 'recurring-cleaning',
    name: 'Recurring Cleaning',
    blurb: 'Upkeep on a weekly or biweekly schedule',
    group: 'Inside the home',
    requestParam: 'standard',
    image: 'recurring-cleaning-bedroom',
  },
  {
    slug: 'tile-and-grout-cleaning',
    name: 'Tile & Grout Cleaning',
    blurb: 'Detail work along grout lines',
    group: 'Inside the home',
    requestParam: 'tile-grout',
    image: 'tile-grout-scrubbing',
  },
  {
    slug: 'home-organizing',
    name: 'Home Organizing',
    blurb: 'Sorting, deciding and finding a place',
    group: 'Inside the home',
    requestParam: 'home-organizing',
    image: 'home-organizing-closet',
  },
  {
    slug: 'move-in-move-out-cleaning',
    name: 'Move-In / Move-Out Cleaning',
    blurb: 'Empty rooms, before or after a move',
    group: 'Moving or finishing work',
    requestParam: 'moving',
    image: 'move-out-empty-bedroom',
  },
  {
    slug: 'post-construction-cleaning',
    name: 'Post-Construction Cleaning',
    blurb: 'Fine dust and residue after work',
    group: 'Moving or finishing work',
    requestParam: 'post-work',
    image: 'post-construction-kitchen-renovation',
  },
  {
    slug: 'garage-basement-attic-cleaning',
    name: 'Garage, Basement or Attic Cleaning',
    blurb: 'Storage spaces nobody has touched',
    group: 'Moving or finishing work',
    requestParam: 'garage-attic',
    image: 'garage-storage-shelves',
  },
  {
    slug: 'deck-cleaning',
    name: 'Deck Cleaning',
    blurb: 'A season of weather off the boards',
    group: 'Outside the home',
    requestParam: 'deck-cleaning',
    image: 'deck-wooden-terrace',
  },
  {
    slug: 'pressure-washing',
    name: 'Pressure Washing',
    blurb: 'Hard outdoor surfaces, matched pressure',
    group: 'Outside the home',
    requestParam: 'pressure-washing',
    image: 'pressure-washing-siding',
  },
  {
    slug: 'gutter-cleaning',
    name: 'Gutter Cleaning',
    blurb: 'Clearing gutters so water drains',
    group: 'Outside the home',
    requestParam: 'gutter-cleaning',
    image: 'gutter-debris-roofline',
  },
  {
    slug: 'flashing-cleaning',
    name: 'Flashing Cleaning',
    blurb: 'Roof joins cleaned, never resealed',
    group: 'Outside the home',
    requestParam: 'flashing-cleaning',
    image: 'flashing-chimney-roof',
  },
  {
    slug: 'commercial-cleaning',
    name: 'Commercial Cleaning',
    blurb: 'Workplaces, around opening hours',
    group: 'For businesses',
    requestParam: 'commercial',
    image: 'commercial-hallway-cart',
  },
];

export const SERVICE_GROUP_ORDER: ServiceGroup[] = [
  'Inside the home',
  'Moving or finishing work',
  'Outside the home',
  'For businesses',
];

export const servicesByGroup = (group: ServiceGroup) =>
  SITE_SERVICES.filter(s => s.group === group);

export const getSiteService = (slug: string) =>
  SITE_SERVICES.find(s => s.slug === slug);

/** Primary nav, in the prototype's order. */
export const SITE_NAV = [
  { href: '/how-it-works',  label: 'How it works' },
  { href: '/service-areas', label: 'Service areas' },
  { href: '/about',         label: 'About' },
  { href: '/contact',       label: 'Contact' },
];

/** The one label used for the primary action everywhere on the site. */
export const PRIMARY_CTA = 'Find a cleaner';
export const REQUEST_PATH = '/request';

export const requestHref = (requestParam?: string) =>
  requestParam ? `${REQUEST_PATH}?service=${requestParam}` : REQUEST_PATH;
