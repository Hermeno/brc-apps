import { SERVICE_TYPES, EXTRAS, calculateEstimate } from './estimate';

/* ─────────────────────────────────────────────────────────────
   Service catalogue for the public /services pages.

   Every entry maps to a real service id in lib/estimate.ts, so the page
   can deep-link into /request?service=<id> with the service preselected
   and can price its example with the platform's own estimator instead of
   a number written into copy.

   The "before you request" note and the FAQ are written per service on
   purpose: what a cleaner needs to know about a gutter job is not what
   they need to know about a closet.
   ───────────────────────────────────────────────────────────── */

export type ServiceExample = {
  /** Plain-language description of the property used for the estimate. */
  label: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  extras: string[];
  frequency: string;
};

export type Service = {
  slug: string;
  /** id in lib/estimate.ts — also the value /request?service= expects */
  id: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  whatIsIt: string;
  included: string[];
  rightForYou: string[];
  beforeYouRequest: string;
  /** Whether the add-ons in the request form apply to this service. */
  showExtras: boolean;
  example: ServiceExample;
  faq: { q: string; a: string }[];
  related: string[];
};

export const SERVICES: Service[] = [
  {
    slug: 'standard-cleaning',
    id: 'standard',
    name: 'Standard Cleaning',
    tagline: 'Routine cleaning for a home that is already more or less kept up.',
    metaTitle: 'Standard House Cleaning',
    metaDescription:
      'Routine house cleaning through Verliks: kitchen, bathrooms, bedrooms, living areas and floors. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Standard cleaning is the maintenance clean most homes run on: the kitchen, the bathrooms, the floors and the surfaces that collect dust and daily use. It assumes the home has been cleaned reasonably recently — it is not the right choice for catching up after months without one.',
    included: [
      'Kitchen surfaces, sink and the outside of appliances',
      'Bathrooms, fixtures and mirrors',
      'Bedrooms and living areas',
      'Dusting of surfaces you can reach without moving furniture',
      'Vacuuming and sweeping',
      'Mopping hard floors',
      'Tidying the areas being cleaned',
      'High-touch spots such as handles and switches',
    ],
    rightForYou: [
      'Weekly, biweekly or monthly upkeep',
      'A home that is generally maintained',
      'Households where nobody has time for the full round',
      'A one-off reset between deeper cleans',
    ],
    beforeYouRequest:
      'Have the number of bedrooms and bathrooms ready, along with roughly how big the home is and whether pets live there. If a room should be skipped — a home office, a nursery during a nap — say so in the notes, since it changes how long the job takes.',
    showExtras: true,
    example: { label: 'a 2-bedroom, 1-bathroom home of about 100 m², cleaned every two weeks', bedrooms: 2, bathrooms: 1, squareMeters: 100, extras: [], frequency: 'biweekly' },
    faq: [
      {
        q: 'Is this enough if nobody has cleaned in months?',
        a: 'Probably not. When dirt has built up, a deep clean is the better first step, and standard cleaning works well afterwards as upkeep. Describe the condition in your request and the cleaner can tell you which one fits.',
      },
      {
        q: 'Do I need to supply products and equipment?',
        a: 'That varies by professional. Verliks does not set a rule on it, so ask in the conversation before you accept — some cleaners bring everything, others prefer to use what is already in the home.',
      },
    ],
    related: ['deep-cleaning', 'move-in-move-out-cleaning', 'home-organizing'],
  },
  {
    slug: 'deep-cleaning',
    id: 'deep',
    name: 'Deep Cleaning',
    tagline: 'A slower, more detailed clean for what routine cleaning keeps missing.',
    metaTitle: 'Deep House Cleaning',
    metaDescription:
      'Deep cleaning through Verliks for built-up grime, neglected corners and detail work. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Deep cleaning goes after what a routine clean leaves behind: grease around the stove, build-up in the shower, dust on baseboards, edges and the tops of things. It takes considerably longer than a standard clean, and the scope depends on the condition the home is actually in.',
    included: [
      'Detailed kitchen work, including around and behind appliances where they can be reached',
      'Detailed bathroom work on tile, grout lines, fixtures and glass',
      'Baseboards, door frames, switch plates and trim',
      'Dusting into corners, edges and the tops of furniture and fittings',
      'Floors cleaned in detail, including edges',
      'Surfaces that routine cleaning skips',
      'Extra time on whatever has built up most',
      'Scope adjusted to the condition of the home',
    ],
    rightForYou: [
      'A seasonal reset',
      'A home that has not had a detailed clean in a long time',
      'Before guests arrive or after a long stretch of visitors',
      'The first clean before starting a regular routine',
      'After illness or a renovation-free but dusty period',
    ],
    beforeYouRequest:
      'The condition matters more than the size here, so be specific about the worst areas and how long it has been. Photos of the kitchen and bathrooms help a lot — they are what make the difference between an estimate that holds and one that changes on the day.',
    showExtras: true,
    example: { label: 'a 3-bedroom, 2-bathroom home of about 130 m², with the inside of the fridge added', bedrooms: 3, bathrooms: 2, squareMeters: 130, extras: ['fridge'], frequency: 'once' },
    faq: [
      {
        q: 'How is this different from standard cleaning?',
        a: 'Time and depth. A standard clean keeps a maintained home in shape. A deep clean is slower, works on build-up rather than surface dust, and reaches trim, edges, corners and the areas behind and around things.',
      },
      {
        q: 'Will one deep clean fix everything?',
        a: 'Not always. Hard-water stains, discoloured grout and long-standing build-up sometimes improve rather than disappear, and some of it is damage rather than dirt. A cleaner who has seen photos can tell you what to expect before you commit.',
      },
    ],
    related: ['standard-cleaning', 'tile-and-grout-cleaning', 'move-in-move-out-cleaning'],
  },
  {
    slug: 'post-construction-cleaning',
    id: 'post-work',
    name: 'Post-Construction Cleaning',
    tagline: 'Getting a space from worksite condition to somewhere you can actually live.',
    metaTitle: 'Post-Construction Cleaning',
    metaDescription:
      'Post-construction and post-renovation cleaning through Verliks: fine dust, debris and residue. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Construction dust is not ordinary dust. It is fine, it settles everywhere including inside cabinets and on top of doors, and it keeps reappearing for days as it works loose. This service is about removing it and the leftover residue so the space can be used.',
    included: [
      'Removal of construction dust from surfaces, ledges and fittings',
      'Collection of loose debris left behind',
      'Floors cleaned repeatedly as dust resettles',
      'Detailed kitchen and bathroom cleaning',
      'Cleaning around doors, trim, frames and windowsills',
      'Removal of visible residue where the surface allows it',
      'Inside cabinets and closets where accessible',
      'A final detail pass before the space is used',
    ],
    rightForYou: [
      'A newly built home',
      'A renovated kitchen, bathroom or single room',
      'After contractors have finished and left',
      'A property being handed over or prepared for move-in',
    ],
    beforeYouRequest:
      'Say what kind of work was done, whether the contractors removed the heavy debris already, and whether the space has power and running water — a cleaner cannot do much without either. Mention if paint, adhesive or grout haze is still on the floors, because that is different work from dust.',
    showExtras: false,
    example: { label: 'a renovated 2-bedroom, 1-bathroom unit of about 90 m²', bedrooms: 2, bathrooms: 1, squareMeters: 90, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Will the dust really be gone?',
        a: 'Most of it, but fine dust keeps working loose from vents and gaps for a while after any construction work. It is common to need a lighter second clean a week or two later, and it is worth planning for that rather than being surprised by it.',
      },
      {
        q: 'Do cleaners remove construction debris?',
        a: 'This service is about dust, residue and detail work, not hauling away rubble or heavy material. If there is debris left, say so in your request so the cleaner can tell you what they can and cannot take.',
      },
    ],
    related: ['deep-cleaning', 'move-in-move-out-cleaning', 'garage-basement-attic-cleaning'],
  },
  {
    slug: 'move-in-move-out-cleaning',
    id: 'moving',
    name: 'Move In / Move Out Cleaning',
    tagline: 'The clean that happens while the rooms are still empty.',
    metaTitle: 'Move In and Move Out Cleaning',
    metaDescription:
      'Move-in and move-out cleaning through Verliks, with empty rooms and cabinets cleaned inside. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'An empty home is the one chance to clean what furniture normally covers: the floor under the wardrobe, the inside of every cabinet, the back of the closet. This service is built around that window, whether you are handing a place back or taking one on.',
    included: [
      'Kitchen, including inside cabinets and drawers',
      'Bathrooms, fixtures and any built-in storage',
      'Floors throughout, including where furniture stood',
      'Dusting of empty rooms, shelving and fittings',
      'Doors, trim, frames and switch plates',
      'Inside closets and accessible built-ins',
      'Removal of ordinary household dirt and build-up',
      'A final pass based on the condition of the property',
    ],
    rightForYou: [
      'Tenants moving out and hoping to see the deposit again',
      'New owners who would rather not start on somebody else’s dirt',
      'Landlords turning a property around between occupants',
      'A property being prepared for viewing or sale',
    ],
    beforeYouRequest:
      'Say whether the property will be completely empty and when access starts and ends, since this work is usually pinned between a moving truck and a handover. If a landlord or agency gave you a checklist, share it in the notes — it is the clearest possible brief.',
    showExtras: true,
    example: { label: 'an empty 2-bedroom, 1-bathroom apartment of about 85 m², with the oven added', bedrooms: 2, bathrooms: 1, squareMeters: 85, extras: ['oven'], frequency: 'once' },
    faq: [
      {
        q: 'Will this guarantee I get my deposit back?',
        a: 'No, and anyone promising that is guessing. A deposit depends on your landlord, your lease and the state of the property beyond cleanliness. What you can do is share their checklist with the cleaner so the work targets what will actually be inspected.',
      },
      {
        q: 'Should the home be empty first?',
        a: 'Ideally yes, because the value of this clean is reaching what furniture normally blocks. If some items will still be there, say which rooms, so the estimate reflects what can really be done.',
      },
    ],
    related: ['deep-cleaning', 'post-construction-cleaning', 'standard-cleaning'],
  },
  {
    slug: 'deck-cleaning',
    id: 'deck-cleaning',
    name: 'Deck Cleaning',
    tagline: 'Taking a season of weather, leaves and traffic off an outdoor deck.',
    metaTitle: 'Deck Cleaning',
    metaDescription:
      'Deck cleaning through Verliks, with the method matched to the decking material. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Decks collect dirt, pollen, leaf stain and, in shaded spots, a green film that turns slippery when wet. Cleaning one is mostly about using the right method for the material: what is safe on composite is not the same as what softwood or hardwood can take.',
    included: [
      'Clearing loose debris from the surface and between boards',
      'Washing the deck surface',
      'Attention to visible build-up and shaded areas',
      'Steps, edges and the most-used areas',
      'A method chosen for the decking material',
      'Rinsing where the method calls for it',
      'Accessible railings where included in the scope',
      'A look over the finished area',
    ],
    rightForYou: [
      'Opening up the deck for the season',
      'A surface that has gone grey, green or slippery',
      'Before a gathering outdoors',
      'Routine exterior upkeep',
    ],
    beforeYouRequest:
      'The material is the important part: composite, pressure-treated softwood, hardwood or painted. Add the rough size, how many steps and levels, whether there is an outdoor tap nearby, and whether the boards are sound — loose or rotten boards are a repair question, not a cleaning one.',
    showExtras: false,
    example: { label: 'a deck of roughly 30 m²', bedrooms: 0, bathrooms: 0, squareMeters: 30, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Will the deck look new again?',
        a: 'It will look clean, which is not the same thing. Greying from sun exposure and stains that have gone into the wood usually need sanding, staining or sealing — work beyond cleaning. A cleaner can tell you which of the two you are looking at.',
      },
      {
        q: 'Does this include sealing or staining?',
        a: 'No. This is cleaning only. If you are planning to seal or stain afterwards, mention it, because the deck needs to dry fully first and that affects the timing.',
      },
    ],
    related: ['pressure-washing', 'gutter-cleaning', 'flashing-cleaning'],
  },
  {
    slug: 'pressure-washing',
    id: 'pressure-washing',
    name: 'Pressure Washing',
    tagline: 'For hard outdoor surfaces that a hose and a brush stopped fixing.',
    metaTitle: 'Pressure Washing',
    metaDescription:
      'Pressure washing through Verliks for driveways, walkways, patios and suitable exterior surfaces. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Pressure washing lifts ground-in dirt, algae and staining from hard exterior surfaces. The pressure and technique have to match the surface: concrete takes far more than siding, render or older brickwork, and too much pressure does damage that cannot be undone.',
    included: [
      'Washing of hard exterior surfaces',
      'Driveways and parking areas',
      'Walkways, steps and paths',
      'Patios and paved outdoor areas',
      'Suitable exterior walls and surfaces',
      'Extra attention to heavily used and stained areas',
      'Pressure and technique matched to the surface',
      'Clearing loosened dirt from the area afterwards',
    ],
    rightForYou: [
      'A driveway that has gone dark or green',
      'Paths and steps that get slippery in wet weather',
      'Patios before the outdoor season',
      'General exterior tidy-up of a property',
    ],
    beforeYouRequest:
      'Name the surfaces and rough square footage, and say whether there is an outdoor tap and power point available. Flag anything delicate nearby — planting beds, painted surfaces, older mortar, exterior lighting — and any oil stains, which behave differently from ordinary dirt.',
    showExtras: false,
    example: { label: 'a driveway and walkway of roughly 60 m² together', bedrooms: 0, bathrooms: 0, squareMeters: 60, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Can any surface be pressure washed?',
        a: 'No. Soft or aged surfaces, some sidings, older mortar and certain painted finishes can be damaged by high pressure, and a lower-pressure method is used instead. Describe the surface in your request rather than assuming.',
      },
      {
        q: 'Will oil stains come out?',
        a: 'Sometimes they lighten rather than disappear, especially if they have been sitting for a long time. Say the stains are there up front so nobody is working from a different expectation than you are.',
      },
    ],
    related: ['deck-cleaning', 'gutter-cleaning', 'flashing-cleaning'],
  },
  {
    slug: 'gutter-cleaning',
    id: 'gutter-cleaning',
    name: 'Gutter Cleaning',
    tagline: 'Clearing what has collected in the gutters so water can get out.',
    metaTitle: 'Gutter Cleaning',
    metaDescription:
      'Gutter cleaning through Verliks: leaves, debris and blocked downspouts cleared. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Gutters fill with leaves, grit off the roof and whatever the trees drop, and once they are blocked the water goes over the edge instead of down the pipe. Clearing them is straightforward work whose difficulty depends almost entirely on access and the height of the roof.',
    included: [
      'Removing leaves and loose debris from the gutter channels',
      'Clearing accessible downspout openings',
      'Attention to visible build-up and silt',
      'Bagging or collecting what comes out',
      'A check that water runs through where it can be tested',
      'Tidying the ground area afterwards',
      'Work adjusted to the access the property allows',
    ],
    rightForYou: [
      'Gutters overflowing in heavy rain',
      'Autumn and spring maintenance',
      'Properties with trees close to the roofline',
      'Before a wet season sets in',
    ],
    beforeYouRequest:
      'Access decides this job: say how many storeys the property has, whether the roofline is reachable by ladder, if the ground around the house is level, and whether gutter guards are fitted. Mention how long it has been, since compacted debris is slower than loose leaves.',
    showExtras: false,
    example: { label: 'a single-storey house with about 40 m² of roof footprint served by the gutters', bedrooms: 0, bathrooms: 0, squareMeters: 40, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Do cleaners work at height on any property?',
        a: 'Not necessarily. Some professionals will not take work above a certain height or without safe ladder footing, and that is a judgement each one makes. Describing the property accurately means you get a realistic answer instead of a cancelled job.',
      },
      {
        q: 'Are repairs included?',
        a: 'No. This is clearing, not repair. If a bracket is loose, a joint is leaking or a section is damaged, the cleaner can point it out, but fixing it is separate work.',
      },
    ],
    related: ['flashing-cleaning', 'pressure-washing', 'deck-cleaning'],
  },
  {
    slug: 'flashing-cleaning',
    id: 'flashing-cleaning',
    name: 'Flashing Cleaning',
    tagline: 'Cleaning the exposed metal joins on a roof, without touching the sealing.',
    metaTitle: 'Roof Flashing Cleaning',
    metaDescription:
      'Cleaning of accessible roof flashing and the surrounding area through Verliks. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Flashing is the metal detail that seals the joins on a roof — around chimneys, valleys and where a roof meets a wall. Dirt, moss and debris collect along those edges. This service cleans the accessible parts and the area around them. It is not roofing work and does not repair or reseal anything.',
    included: [
      'Cleaning of accessible exposed flashing',
      'Removing loose dirt, moss and debris from the joins',
      'Attention to visible build-up along edges',
      'Cleaning the surrounding accessible surfaces',
      'A method suited to the metal and the roof surface',
      'A look over the areas that were cleaned',
    ],
    rightForYou: [
      'Visible dirt or moss along roof joins',
      'Exterior maintenance alongside a gutter clean',
      'Seasonal upkeep on a property with trees nearby',
      'Appearance of the roofline from the ground',
    ],
    beforeYouRequest:
      'Describe where the flashing is and how it can be reached: chimney, valley, or where a roof meets a wall, and at what height. If you have noticed a leak or lifted metal, say so — that points to a roofer rather than to cleaning, and it is better to find out before booking.',
    showExtras: false,
    example: { label: 'flashing and surrounding roof area of roughly 20 m² on a single-storey roofline', bedrooms: 0, bathrooms: 0, squareMeters: 20, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Will this stop a leak?',
        a: 'No, and it should not be treated as a fix. Cleaning removes dirt and debris. A leak means the flashing or its sealing needs a roofer, and cleaning it may make the problem easier to see but will not solve it.',
      },
      {
        q: 'Is sealing or resealing included?',
        a: 'No. This is cleaning of accessible areas only — no repair, no sealant, no replacement.',
      },
    ],
    related: ['gutter-cleaning', 'pressure-washing', 'deck-cleaning'],
  },
  {
    slug: 'tile-and-grout-cleaning',
    id: 'tile-grout',
    name: 'Tile & Grout Cleaning',
    tagline: 'Detailed work on tile and the grout lines between it.',
    metaTitle: 'Tile and Grout Cleaning',
    metaDescription:
      'Tile and grout cleaning through Verliks for bathrooms, kitchens and tiled floors. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Grout is porous, which is why it holds dirt long after the tile beside it looks clean, and why it is usually the reason a tiled room reads as dirty. This service is slow, detailed work along those lines and across the tile, with the method chosen for the material.',
    included: [
      'Cleaning of the tile surface',
      'Detailed work along grout lines',
      'Removal of surface dirt, soap residue and film',
      'Bathroom tile, including shower walls and enclosures',
      'Kitchen tile and splashbacks',
      'Tiled floors where applicable',
      'Corners, edges and the joins along fixtures',
      'A method appropriate to the tile and grout',
    ],
    rightForYou: [
      'Showers with darkened or discoloured grout',
      'Kitchen splashbacks with cooking residue',
      'Tiled floors that stay dull after mopping',
      'A tiled room being prepared for guests or handover',
    ],
    beforeYouRequest:
      'Say which rooms and roughly how much tiled area, and what the tile is: ceramic, porcelain, or natural stone. Stone matters, because acidic products that work on ceramic will etch marble or travertine. Photos of the worst grout lines set expectations better than any description.',
    showExtras: false,
    example: { label: 'a bathroom and kitchen with about 25 m² of tiled area in a 2-bathroom home', bedrooms: 0, bathrooms: 2, squareMeters: 25, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Will the grout go back to its original colour?',
        a: 'Often it improves a great deal, but not always all the way. Grout that is stained through, or that has been sealed with dirt underneath, can stay discoloured — at which point the answer is regrouting or colour sealing, which is a different trade.',
      },
      {
        q: 'Can mould be removed?',
        a: 'Surface mould on tile and grout usually cleans up. Mould growing behind the tile or in failed silicone is a different matter, and it tends to come back until the silicone is replaced or the damp cause is dealt with.',
      },
    ],
    related: ['deep-cleaning', 'standard-cleaning', 'move-in-move-out-cleaning'],
  },
  {
    slug: 'home-organizing',
    id: 'home-organizing',
    name: 'Home Organizing',
    tagline: 'Deciding where things live, so the space works instead of just looking tidy.',
    metaTitle: 'Home Organizing',
    metaDescription:
      'Home organizing through Verliks: sorting, decluttering and setting up storage that holds. See what it covers and send your request to professionals near you.',
    whatIsIt:
      'Organizing is not cleaning. Nothing gets scrubbed here — the work is sorting what is there, deciding what stays, and giving it a place that makes sense for how you actually use the room. It needs you present for the decisions, at least at the start.',
    included: [
      'Sorting and grouping what is in the space',
      'Support with decluttering decisions',
      'Rearranging belongings into a workable order',
      'Organizing closets, cabinets, shelves or a whole room',
      'Setting up practical storage zones',
      'Putting frequently used items within easy reach',
      'Labelling or categorising when you want it',
      'A plan shaped around how you use the space',
    ],
    rightForYou: [
      'Closets and wardrobes',
      'Kitchens and pantries',
      'Home offices and paperwork',
      'Garages and storage areas',
      'A home being packed up for a move',
      'A room that is tidy but still hard to use',
    ],
    beforeYouRequest:
      'Say which rooms, and be honest about volume — a wardrobe and a full garage are not the same afternoon. Decide in advance whether you want help deciding what to discard or only help arranging what you keep, and whether you can be there, because the sorting usually needs your calls.',
    showExtras: false,
    example: { label: 'two rooms of about 35 m² combined', bedrooms: 2, bathrooms: 0, squareMeters: 35, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Do I have to be there?',
        a: 'For the sorting, usually yes — nobody else can decide what you keep. Once those decisions are made, the arranging can often continue without you.',
      },
      {
        q: 'Do organizers take things away or supply storage?',
        a: 'Do not assume either. Hauling away discards and buying bins or containers are extra, and whether a professional does them varies. Agree on it in the conversation before the day.',
      },
    ],
    related: ['garage-basement-attic-cleaning', 'move-in-move-out-cleaning', 'standard-cleaning'],
  },
  {
    slug: 'garage-basement-attic-cleaning',
    id: 'garage-attic',
    name: 'Garage, Basement or Attic Cleaning',
    tagline: 'The spaces that get skipped until they cannot be walked through.',
    metaTitle: 'Garage, Basement and Attic Cleaning',
    metaDescription:
      'Garage, basement and attic cleaning through Verliks: dust, debris and a floor you can use again. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Garages, basements and attics collect dust of a coarser kind, cobwebs, and years of things put down "for now". The cleaning part is straightforward; the reason these rooms are hard is usually the volume of stored belongings in the way.',
    included: [
      'Dust, cobweb and debris removal',
      'Sweeping or vacuuming floors that can take it',
      'Cleaning accessible surfaces and shelving',
      'Corners, edges and the areas behind stored items where reachable',
      'Removal of ordinary loose dirt',
      'Tidying the area that was cleaned',
      'Organizing support when you request it separately',
      'A final pass over the accessible areas',
    ],
    rightForYou: [
      'A garage you would like to park in again',
      'A basement being turned into usable space',
      'An attic before or after storing things',
      'A seasonal clear-out',
      'Spaces that have gone years without attention',
    ],
    beforeYouRequest:
      'Say how full the space is and whether things can be moved, since that decides most of the time on the job. Flag anything that changes the work: damp, mould, pests, exposed insulation, or an attic with boards missing. If items need discarding, note it — removal is not part of cleaning.',
    showExtras: false,
    example: { label: 'a two-car garage of roughly 40 m²', bedrooms: 0, bathrooms: 0, squareMeters: 40, extras: [], frequency: 'once' },
    faq: [
      {
        q: 'Will the cleaner haul away what I want to get rid of?',
        a: 'Do not count on it. Disposal usually means a separate service and a fee, and some material cannot be taken at all. Ask directly in the conversation before the visit.',
      },
      {
        q: 'What about mould or pests?',
        a: 'Say so in the request. Visible mould and pest activity are specialist work, and a cleaner may decline the job or limit it — which is the right outcome, not a lost booking.',
      },
    ],
    related: ['home-organizing', 'deep-cleaning', 'post-construction-cleaning'],
  },
  {
    slug: 'commercial-cleaning',
    id: 'commercial',
    name: 'Commercial Cleaning',
    tagline: 'Cleaning for a workplace, scheduled around the hours it operates.',
    metaTitle: 'Commercial Cleaning',
    metaDescription:
      'Commercial cleaning through Verliks for offices, retail and small business premises. See what it covers and send your request to cleaners near you.',
    whatIsIt:
      'Commercial cleaning is shaped less by square footage than by how a place is used: how many people come through, what hours it runs, and what has to be spotless for customers. Most of it happens outside opening hours, which is the part worth settling first.',
    included: [
      'Workspaces and common areas',
      'Restrooms and their supplies',
      'Floor care appropriate to the surface',
      'Dusting of accessible surfaces',
      'Waste collection and general tidying',
      'Kitchen and break-room areas',
      'High-touch points such as handles, switches and shared equipment',
      'A scope built around the business rather than a fixed list',
    ],
    rightForYou: [
      'Offices and co-working spaces',
      'Retail and customer-facing premises',
      'Small businesses without in-house cleaning',
      'Recurring contracts rather than one-off visits',
      'A space being prepared to open or reopen',
    ],
    beforeYouRequest:
      'The practical details decide this one: the hours cleaning can happen, how access and keys work, how often you need it, and roughly how many people use the space. If your premises require particular products, waste handling or insurance cover, raise it early rather than after a quote.',
    showExtras: false,
    example: { label: 'an office of about 150 m² with 2 restrooms', bedrooms: 0, bathrooms: 2, squareMeters: 150, extras: [], frequency: 'weekly' },
    faq: [
      {
        q: 'Can cleaning happen outside business hours?',
        a: 'That is the usual arrangement, but it depends on the professional and on how access works at your premises. Put the hours you need in the request so only cleaners who can work them take it up.',
      },
      {
        q: 'Can I set up a recurring schedule?',
        a: 'You can request weekly or biweekly work, and the estimate reflects the frequency. The ongoing arrangement is agreed directly between you and the cleaner.',
      },
    ],
    related: ['standard-cleaning', 'deep-cleaning', 'post-construction-cleaning'],
  },
];

/* Grouped by the question a visitor is actually asking, not by our internal ids.
   Used by the navbar menu, the mobile menu and the /services index. */
export const SERVICE_GROUPS: { title: string; slugs: string[] }[] = [
  { title: 'Inside the home', slugs: ['standard-cleaning', 'deep-cleaning', 'tile-and-grout-cleaning', 'home-organizing'] },
  { title: 'Moving or finishing work', slugs: ['move-in-move-out-cleaning', 'post-construction-cleaning', 'garage-basement-attic-cleaning'] },
  { title: 'Outside the home', slugs: ['deck-cleaning', 'pressure-washing', 'gutter-cleaning', 'flashing-cleaning'] },
  { title: 'For businesses', slugs: ['commercial-cleaning'] },
];

export const getService = (slug: string) => SERVICES.find(s => s.slug === slug);

/** Price range and hours from the platform's own estimator — never written into copy. */
export function exampleEstimate(service: Service) {
  return calculateEstimate({
    serviceType: service.id,
    bedrooms: service.example.bedrooms,
    bathrooms: service.example.bathrooms,
    squareMeters: service.example.squareMeters,
    extras: service.example.extras,
    frequency: service.example.frequency,
  });
}

/** The add-ons the request form offers, for services where they apply. */
export const REQUEST_EXTRAS = EXTRAS.map(e => ({ id: e.id, label: e.labelEn, price: e.price }));

/** Guard: every service slug must map to a real service id in the estimator. */
export const SERVICE_IDS = new Set(SERVICE_TYPES.map(s => s.id));
