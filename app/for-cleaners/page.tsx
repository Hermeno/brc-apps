import type { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import styles from './for-cleaners.module.css';
import { prisma } from '@/lib/prisma';
import { PLANS, RADIUS_OPTIONS, PLAN_MAX_RADIUS } from '@/lib/plans';

/* Public marketing page — no session, no personal data. Re-rendered hourly so
   an admin price change in PlanConfig reaches the page without a deploy. */
export const revalidate = 3600;

const CANONICAL = '/for-cleaners';
const SIGNUP    = '/auth/register';

export const metadata: Metadata = {
  title: 'House Cleaning Leads for Independent Cleaners',
  description:
    'Verliks sends local house cleaning requests to independent cleaners. Choose your own service area and jobs — pay a fee only when a client picks you.',
  alternates: { canonical: CANONICAL },
  openGraph: {
    title:       'House Cleaning Leads for Independent Cleaners | Verliks',
    description:
      'Set your service area, decide which cleaning requests to answer, and pay only when a client chooses you. Free to join.',
    url:         CANONICAL,
    siteName:    'Verliks',
    type:        'website',
    images: [{ url: '/process-bg.jpg', width: 1672, height: 941, alt: 'A cleaning professional at work' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'House Cleaning Leads for Independent Cleaners | Verliks',
    description: 'Local cleaning requests for independent professionals. Free to join — pay only when a client picks you.',
    images:      ['/process-bg.jpg'],
  },
  robots: { index: true, follow: true },
};

/* ── Icons — 24px box, 1.7 stroke, round caps: the same family the home page uses ── */
const IcYes = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
const IcNo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
    strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);
const IcArrowDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
const IcChevron = () => (
  <svg className={styles.faqChevron} width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

/* Live plan prices. An admin can change these in the dashboard (PlanConfig),
   so the page reads them rather than repeating the defaults in copy. */
async function getPlanPrices(): Promise<Record<string, number>> {
  const fallback = Object.fromEntries(PLANS.map(p => [p.id, p.price as number]));
  try {
    const rows = await prisma.planConfig.findMany({ select: { id: true, price: true } });
    for (const r of rows) fallback[r.id] = r.price;
  } catch {
    /* DB unreachable — ship the defaults from lib/plans.ts rather than an empty section. */
  }
  return fallback;
}

const money = (n: number) => (n <= 0 ? 'Free' : `$${n % 1 === 0 ? n : n.toFixed(2)}/month`);

export default async function ForCleanersPage() {
  const prices     = await getPlanPrices();
  const freeMax    = PLAN_MAX_RADIUS.FREE;
  const proMax     = PLAN_MAX_RADIUS.PRO;
  const radiusList = RADIUS_OPTIONS.join(', ').replace(/, (\d+)$/, ' and $1');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://verliks.com/for-cleaners',
        url: 'https://verliks.com/for-cleaners',
        name: 'House Cleaning Leads for Independent Cleaners',
        description:
          'How independent cleaning professionals receive local client requests through Verliks, what they control, and when a fee applies.',
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', name: 'Verliks', url: 'https://verliks.com' },
        publisher: { '@type': 'Organization', name: 'Verliks', url: 'https://verliks.com' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://verliks.com' },
          { '@type': 'ListItem', position: 2, name: 'For cleaners', item: 'https://verliks.com/for-cleaners' },
        ],
      },
    ],
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <a href="#main" className={styles.skip}>Skip to content</a>

      {/* ═══ Header + hero: one dark band ═══ */}
      <div className={styles.dark}>
        <header className={styles.topbar}>
          <div className={styles.topbarInner}>
            <NextLink href="/" className={styles.logo} aria-label="Verliks home">
              <Image src="/vlogo.PNG" alt="" width={32} height={32} className={styles.logoMark} priority />
              <span>verliks</span>
            </NextLink>
            <div className={styles.topbarRight}>
              <NextLink href="/auth/login" className={styles.signIn}>Sign in</NextLink>
              <NextLink href={SIGNUP} className={`${styles.ctaGold} ${styles.topbarCta}`}>
                Create your profile
              </NextLink>
            </div>
          </div>
        </header>

        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <p className={`${styles.eyebrow} ${styles.eyebrowGold}`}>For cleaning professionals</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Cleaning clients near you, <em>without chasing them.</em>
            </h1>
            <p className={styles.heroLede}>
              Verliks sends local cleaning requests to independent professionals. You set the area you
              cover and decide which requests to answer. Creating a profile is free, and the
              per-request fee applies only when a client chooses you.
            </p>
            <div className={styles.heroActions}>
              <NextLink href={SIGNUP} className={styles.ctaGold}>Create your cleaner profile</NextLink>
              <a href="#how-it-works" className={styles.ctaGhostDark}>See how it works <IcArrowDown /></a>
            </div>

            <div className={styles.facts}>
              <div className={styles.fact}>
                <p className={styles.factLabel}>Free to join</p>
                <p className={styles.factBody}>
                  No monthly fee is required to create a profile or to receive requests.
                </p>
              </div>
              <div className={styles.fact}>
                <p className={styles.factLabel}>You set the area</p>
                <p className={styles.factBody}>
                  A ZIP code and a radius up to {freeMax} miles — up to {proMax} on the Pro plan.
                </p>
              </div>
              <div className={styles.fact}>
                <p className={styles.factLabel}>Paid only when picked</p>
                <p className={styles.factBody}>
                  Reading and answering a request costs nothing. The fee applies when the client
                  confirms you.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main id="main">
        {/* ═══ How it works ═══ */}
        <section className={styles.section} id="how-it-works" aria-labelledby="how-title">
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>How it works</p>
              <h2 id="how-title" className={styles.h2}>From sign-up to your first client request</h2>
              <p className={styles.lede}>
                Five steps. The first four are yours to complete once; after that, requests come to you.
              </p>
            </div>

            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">01</span>
                <div>
                  <h3 className={styles.stepTitle}>Create your account</h3>
                  <p className={styles.stepBody}>
                    Your name, email, phone and a password. We email you a code to confirm the address.
                  </p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">02</span>
                <div>
                  <h3 className={styles.stepTitle}>Set your services and your area</h3>
                  <p className={styles.stepBody}>
                    Choose the types of cleaning you take on, your ZIP code, and how far you are willing
                    to travel. Add a photo and a short bio so clients know who they are talking to. You
                    are only matched to the services you list.
                  </p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">03</span>
                <div>
                  <h3 className={styles.stepTitle}>Verify your identity</h3>
                  <p className={styles.stepBody}>
                    Upload the front and back of a government ID and a selfie, with your full name and
                    address. A person at Verliks reviews it before your profile can receive requests.
                  </p>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">04</span>
                <div>
                  <h3 className={styles.stepTitle}>Add a card</h3>
                  <p className={styles.stepBody}>
                    A card on file is required before requests can reach you — it is how the per-request
                    fee is settled later. Card details are held by Stripe and never stored on our
                    servers.
                  </p>
                  <span className={styles.stepNote}>Adding a card does not charge you.</span>
                </div>
              </li>

              <li className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">05</span>
                <div>
                  <h3 className={styles.stepTitle}>Answer the requests you want</h3>
                  <p className={styles.stepBody}>
                    When a nearby request matches your services and your area, you are notified and can
                    open the full details. Answering is free and opens a conversation with the client.
                    If the client confirms you, that is when the fee is charged.
                  </p>

                  <div className={styles.example}>
                    <div className={styles.exampleTop}>
                      <span className={styles.exampleService}>Deep Clean</span>
                      <span className={styles.exampleTag}>Example</span>
                    </div>
                    <ul className={styles.exampleRows}>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>When</span>
                        <span className={styles.exampleVal}>Saturday, 9:00 AM</span>
                      </li>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>Where</span>
                        <span className={styles.exampleVal}>The full street address</span>
                      </li>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>Home</span>
                        <span className={styles.exampleVal}>3 bed · 2 bath</span>
                      </li>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>Extras</span>
                        <span className={styles.exampleVal}>Inside fridge, windows</span>
                      </li>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>Client&rsquo;s estimated budget</span>
                        <span className={styles.exampleVal}>$301 &ndash; $367</span>
                      </li>
                      <li className={styles.exampleRow}>
                        <span className={styles.exampleKey}>Client&rsquo;s notes</span>
                        <span className={styles.exampleVal}>Free text, if they add any</span>
                      </li>
                    </ul>
                  </div>
                  <p className={styles.exampleCaption}>
                    Illustrative example of the fields you see, not a real client request. The budget
                    range is an estimate Verliks calculates from the job details — you agree the final
                    price with the client yourself.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* ═══ What it costs ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`} id="pricing" aria-labelledby="cost-title">
          <div className={styles.inner}>
            <div className={styles.costGrid}>
              <div>
                <p className={styles.eyebrow}>What it costs</p>
                <h2 id="cost-title" className={styles.h2}>You pay for the client who picks you</h2>
                <p className={styles.lede}>
                  Verliks charges a fee for a request only once the client has confirmed you. Until that
                  moment — reading the request, answering it, talking to the client — nothing is
                  charged. The amount depends on the type of cleaning.
                </p>

                <div className={`${styles.callout} ${styles.calloutOnCream}`}>
                  <p className={styles.calloutTitle}>Verliks does not take a cut of your price</p>
                  <p className={styles.calloutBody}>
                    You agree the price with the client and they pay you directly. The per-request fee
                    is the only charge tied to a job, and it is not a percentage of what you earn.
                  </p>
                </div>
              </div>

              <div>
                <div className={styles.ledger}>
                  <div className={styles.ledgerRow}>
                    <div>
                      <p className={styles.ledgerKey}>Creating your profile</p>
                      <p className={styles.ledgerSub}>Account, services, service area, photo and bio.</p>
                    </div>
                    <span className={`${styles.ledgerVal} ${styles.ledgerFree}`}>Free</span>
                  </div>
                  <div className={styles.ledgerRow}>
                    <div>
                      <p className={styles.ledgerKey}>Identity verification</p>
                      <p className={styles.ledgerSub}>ID and selfie review by our team.</p>
                    </div>
                    <span className={`${styles.ledgerVal} ${styles.ledgerFree}`}>Free</span>
                  </div>
                  <div className={styles.ledgerRow}>
                    <div>
                      <p className={styles.ledgerKey}>Receiving and answering requests</p>
                      <p className={styles.ledgerSub}>Including the conversation with the client.</p>
                    </div>
                    <span className={`${styles.ledgerVal} ${styles.ledgerFree}`}>Free</span>
                  </div>
                  <div className={styles.ledgerRow}>
                    <div>
                      <p className={styles.ledgerKey}>Per-request fee</p>
                      <p className={styles.ledgerSub}>
                        Charged to your card when a client confirms you. Set per type of cleaning — a
                        standard clean carries a lower fee than post-construction or commercial work.
                      </p>
                    </div>
                    <span className={styles.ledgerVal}>When chosen</span>
                  </div>
                  <div className={styles.ledgerRow}>
                    <div>
                      <p className={styles.ledgerKey}>Monthly plan</p>
                      <p className={styles.ledgerSub}>Optional. Affects placement and how far you can work.</p>
                    </div>
                    <span className={styles.ledgerVal}>Optional</span>
                  </div>
                </div>

                <p className={styles.plansLabel}>The monthly plans</p>
                <p className={styles.plansIntro}>
                  All three receive requests. A paid plan changes how early you are considered and how
                  far you can work — never whether you can work at all.
                </p>
                <div className={styles.plans}>
                  <div className={styles.planRow}>
                    <span className={styles.planName}>Free<br /><span className={styles.planPrice}>$0</span></span>
                    <p className={styles.planWhat}>
                      Receive requests, work within a radius of up to {freeMax} miles. No placement bonus.
                    </p>
                  </div>
                  <div className={styles.planRow}>
                    <span className={styles.planName}>Basic<br /><span className={styles.planPrice}>{money(prices.BASIC)}</span></span>
                    <p className={styles.planWhat}>
                      Adds 15 points to your match score out of 100, so you are considered earlier when
                      several professionals fit the same request.
                    </p>
                  </div>
                  <div className={styles.planRow}>
                    <span className={styles.planName}>Pro<br /><span className={styles.planPrice}>{money(prices.PRO)}</span></span>
                    <p className={styles.planWhat}>
                      Adds 30 points, raises your radius cap to {proMax} miles, and makes you eligible for
                      Instant Book — a strong match can be sent to you alone before anyone else.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ What you control ═══ */}
        <section className={styles.section} id="your-control" aria-labelledby="control-title">
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>Your control</p>
              <h2 id="control-title" className={styles.h2}>Nothing is booked over your head</h2>
              <p className={styles.lede}>
                Every request is an offer you can ignore. These are the settings that decide which
                requests reach you at all, and you can change any of them from your profile.
              </p>
            </div>

            <div className={styles.controls}>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>Your service area</h3>
                <p className={styles.controlBody}>
                  A ZIP code plus a radius of {radiusList} miles. Requests outside that circle are never
                  sent to you. The Free and Basic plans cap the radius at {freeMax} miles; Pro raises it
                  to {proMax}.
                </p>
              </div>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>The work you take</h3>
                <p className={styles.controlBody}>
                  Pick from standard and deep cleaning, move-in/move-out, post-construction, pressure
                  washing, gutters, tile and grout, organizing, garages and commercial work. You are
                  matched only to the types you list.
                </p>
              </div>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>When you are reachable</h3>
                <p className={styles.controlBody}>
                  Switch your availability off and new requests stop arriving until you switch it back
                  on. Your profile and history stay as they are.
                </p>
              </div>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>Time you have blocked</h3>
                <p className={styles.controlBody}>
                  Block specific time slots in your schedule. Verliks also stops you from taking a
                  request that falls within two hours of a job you have already accepted.
                </p>
              </div>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>Each request, one at a time</h3>
                <p className={styles.controlBody}>
                  You see the type of cleaning, the address, the date and time, the size of the home and
                  the client&rsquo;s notes before you answer. Ignoring a request costs nothing.
                </p>
              </div>
              <div className={styles.control}>
                <h3 className={styles.controlTitle}>Your price</h3>
                <p className={styles.controlBody}>
                  Verliks estimates a budget range for the client, but it does not set your rate. What
                  you charge is agreed between you and the client.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ What Verliks does and does not do ═══ */}
        <section className={`${styles.section} ${styles.sectionCream}`} id="trust" aria-labelledby="trust-title">
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>Straight answers</p>
              <h2 id="trust-title" className={styles.h2}>What Verliks does, and what it does not</h2>
              <p className={styles.lede}>
                Platforms in this category tend to be vague about the second list. Here it is, so you
                can decide with the facts in front of you.
              </p>
            </div>

            <div className={styles.truthGrid}>
              <div>
                <p className={styles.truthHead}>What Verliks does</p>
                <ul className={styles.truthList}>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconYes}`}><IcYes /></span>
                    <span>
                      <strong>Checks identity by hand.</strong> Every professional submits a government
                      ID and a selfie, and a person at Verliks approves or rejects it before that
                      profile can receive a single request.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconYes}`}><IcYes /></span>
                    <span>
                      <strong>Filters before it notifies.</strong> A request only reaches you if it is
                      inside your radius, matches a service you offer, and does not clash with your
                      schedule.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconYes}`}><IcYes /></span>
                    <span>
                      <strong>Keeps card details with Stripe.</strong> Your card number never touches
                      Verliks servers, and you can remove a card from your dashboard.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconYes}`}><IcYes /></span>
                    <span>
                      <strong>Counts your rating.</strong> Clients review completed jobs, and your
                      rating feeds directly into how you are ranked for future requests.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconYes}`}><IcYes /></span>
                    <span>
                      <strong>Takes disputes.</strong> You or the client can open a dispute about a job,
                      and our team reviews and resolves it.
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className={styles.truthHead}>What Verliks does not do</p>
                <ul className={styles.truthList}>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconNo}`}><IcNo /></span>
                    <span>
                      <strong>It is not a job and we are not your employer.</strong> You work as an
                      independent professional. Verliks is not a staffing agency, does not withhold
                      taxes and does not provide employee benefits.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconNo}`}><IcNo /></span>
                    <span>
                      <strong>No criminal background check.</strong> Our review confirms that you are
                      who you say you are. It is an identity check, not a criminal record check.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconNo}`}><IcNo /></span>
                    <span>
                      <strong>No guaranteed volume of work.</strong> How many requests you see depends
                      on client demand near you, the area and services you set, and your ranking. We do
                      not promise a number.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconNo}`}><IcNo /></span>
                    <span>
                      <strong>We do not handle the client&rsquo;s payment to you.</strong> There is no
                      escrow and no payout from Verliks. You collect from the client directly, on the
                      terms the two of you agree.
                    </span>
                  </li>
                  <li className={styles.truthItem}>
                    <span className={`${styles.truthIcon} ${styles.iconNo}`}><IcNo /></span>
                    <span>
                      <strong>We do not hold requests for you.</strong> Requests go to a small group at
                      a time and the first professional to answer takes the conversation. Answering
                      quickly matters.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className={styles.section} id="faq" aria-labelledby="faq-title">
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <p className={styles.eyebrow}>Questions</p>
              <h2 id="faq-title" className={styles.h2}>Before you sign up</h2>
            </div>

            <div className={styles.faq}>
              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Do I need a registered cleaning company to join?<IcChevron /></summary>
                <p className={styles.faqA}>
                  No. Verliks does not require a registered business — independent cleaners and small
                  cleaning companies both use it. What we do require is a valid government ID, a
                  confirmed email address and a card on file. Any licence, registration or insurance
                  your state or city requires in order to do cleaning work is your responsibility, not
                  something Verliks provides or verifies.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Exactly when am I charged?<IcChevron /></summary>
                <p className={styles.faqA}>
                  When the client confirms you for the job. At that point the per-request fee is charged
                  to your card on file. If the charge does not go through — an expired card, a decline,
                  or your bank asking for confirmation — you have 24 hours to pay it from your
                  dashboard. If it is still unpaid after that, the request is released and offered to
                  another professional.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Does it cost anything to answer a request?<IcChevron /></summary>
                <p className={styles.faqA}>
                  No. Reading a request, answering it and talking to the client are all free. If the
                  client picks someone else, you are not charged anything for that request.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>How much is the per-request fee?<IcChevron /></summary>
                <p className={styles.faqA}>
                  It depends on the type of cleaning: a standard clean carries a lower fee than deep
                  cleaning, post-construction, moving or commercial work, which are larger jobs. The fee
                  for a request is fixed when the request is created, and it is charged only if the
                  client confirms you.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Do I have to pay for a plan?<IcChevron /></summary>
                <p className={styles.faqA}>
                  No. The Free plan receives requests. A paid plan raises your match score and, on Pro,
                  the distance you can cover — it does not unlock the ability to work. You can start
                  free and change later from your dashboard.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>How many requests will I get?<IcChevron /></summary>
                <p className={styles.faqA}>
                  We cannot promise a number, and we would rather say so than invent one. It depends on
                  how many clients are requesting cleanings near you, how wide an area and how many
                  services you have set, your rating, and how quickly you answer. Each request goes to a
                  small group of matching professionals at a time, and the first to answer takes the
                  conversation.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Is this employment?<IcChevron /></summary>
                <p className={styles.faqA}>
                  No. Verliks is not an employer or a staffing agency, and these are not job vacancies.
                  You are an independent professional receiving commercial opportunities: you choose
                  which to take, you set your price with the client, and you are responsible for your
                  own taxes and obligations.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Which areas does Verliks cover?<IcChevron /></summary>
                <p className={styles.faqA}>
                  Verliks operates in the United States and does not restrict professionals to a fixed
                  list of ZIP codes — you are matched to any request that falls inside the area you set.
                  How many requests that actually means depends on client demand around you, which
                  varies by region.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>What do I need for identity verification?<IcChevron /></summary>
                <p className={styles.faqA}>
                  Your full legal name, your ID number and address, photos of the front and back of a
                  government ID, and a selfie. A person on our team reviews the submission and approves
                  or rejects it. If it is rejected you are told why and can submit again.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary className={styles.faqQ}>Can I change my service area later?<IcChevron /></summary>
                <p className={styles.faqA}>
                  Yes, at any time from your profile — the ZIP code you work from and the radius around
                  it, up to the maximum your plan allows. The change applies to the requests you are
                  matched to from then on.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Final CTA ═══ */}
      <section className={`${styles.dark} ${styles.final}`} aria-labelledby="final-title">
        <div className={styles.finalInner}>
          <p className={`${styles.eyebrow} ${styles.eyebrowGold}`}>Get started</p>
          <h2 id="final-title" className={styles.finalTitle}>Put your profile in front of nearby clients</h2>
          <p className={styles.finalBody}>
            Creating a profile is free, and you decide what happens with every request that reaches
            you.
          </p>
          <div className={styles.finalActions}>
            <NextLink href={SIGNUP} className={styles.ctaGold}>Create your cleaner profile</NextLink>
            <NextLink href="/auth/login" className={styles.ctaGhostDark}>I already have an account</NextLink>
          </div>
          <p className={styles.finalNext}>
            Next: create your account and confirm your email. You can then set your services and area,
            verify your ID and add a card — all from your dashboard.
          </p>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <NextLink href="/" className={styles.logo} aria-label="Verliks home">
              <Image src="/vlogo.PNG" alt="" width={32} height={32} className={styles.logoMark} />
              <span>verliks</span>
            </NextLink>
            <p className={styles.footerTagline}>
              Connecting people who need a cleaning with independent professionals nearby.
            </p>
          </div>

          <nav className={styles.footerNav} aria-label="Footer">
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>For cleaners</p>
              <NextLink href={SIGNUP}>Create your profile</NextLink>
              <a href="#how-it-works">How it works</a>
              <a href="#pricing">What it costs</a>
              <a href="#faq">Questions</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>For clients</p>
              <NextLink href="/">Home</NextLink>
              <NextLink href="/request">Request a cleaning</NextLink>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.footerColTitle}>Company</p>
              <NextLink href="/about">About Verliks</NextLink>
              <NextLink href="/terms">Terms of service</NextLink>
              <NextLink href="/privacy">Privacy policy</NextLink>
            </div>
          </nav>
        </div>
        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Verliks. Verliks connects clients with independent cleaning
          professionals and is not an employer or staffing agency.
        </div>
      </footer>
    </div>
  );
}
