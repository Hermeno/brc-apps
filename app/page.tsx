import type { Metadata } from 'next';
import './site.css';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import { IconSprite, Icon } from '@/components/site/icons';
import { A } from '@/components/site/a';
import { Reveal, HeroMedia } from '@/components/site/motion';

/* Home, ported from the approved prototype (~/Desktop/Verliks_Public_Website,
   index.html). Copy and section order are transcribed, not rewritten.
   Photography keeps the prototype's srcset and its --pos art direction, so the
   crops stay as approved and width/height reserve the space (no layout shift). */

export const metadata: Metadata = {
  title: 'Verliks | Home Cleaning in Connecticut, From Cleaners Near You',
  description:
    'Describe the cleaning you need for free. ID-verified independent cleaners near you reply, and you agree on scope and price before accepting. Starting in Connecticut.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Verliks',
    title: 'Verliks | Home Cleaning in Connecticut, From Cleaners Near You',
    description:
      'Describe the cleaning you need for free. ID-verified independent cleaners near you reply, and you agree on scope and price before accepting. Starting in Connecticut.',
    url: '/',
  },
};

export default function HomePage() {
  return (
    <div className="vsite">
      <IconSprite />
      <A className="skip-link" href="#main">Skip to main content</A>
      <SiteHeader />
      <main id="main" tabIndex={-1} data-inert-when-menu>
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="label">Home cleaning in Connecticut</p>
              <h1 id="hero-title" className="hero-title"><span className="hero-line">Find a cleaner near you.</span> <span className="hero-line">Decide before they come.</span></h1>
              <p className="lead">Describe the job for free. ID-verified cleaners near you reply, and you agree on scope and price before saying yes.</p>
              <div className="actions">
                <A className="btn" href="/request">Find a cleaner <Icon name="arrow-right" /></A>
                <A className="link-arrow" href="/services"><span>Browse services</span><Icon name="arrow-right" /></A>
              </div>
            </div>
            <HeroMedia className="hero-media"><img src="/images/site/home-hero-kitchen-range-800.jpg" srcSet="/images/site/home-hero-kitchen-range-800.jpg 800w, /images/site/home-hero-kitchen-range-1200.jpg 1200w" sizes="(min-width: 1024px) 42vw, (min-width: 768px) 92vw, 100vw" width="800" height="1200" alt="A cleaner in an apron and gloves wiping down a white kitchen range" style={{ '--pos': '50% 40%', '--pos-sm': '50% 34%' } as React.CSSProperties} decoding="async" fetchPriority="high" /></HeroMedia>
          </div>
          <Reveal as="nav" className="hero-index">
            <p className="label hero-index-title" id="hero-index-title">Most requested</p>
            <ul><li><A href="/services/standard-cleaning"><span className="hi-name"><span>Standard Cleaning</span><Icon name="arrow-right" /></span><span className="hi-desc">Routine upkeep, kitchen to floors</span></A></li><li><A href="/services/deep-cleaning"><span className="hi-name"><span>Deep Cleaning</span><Icon name="arrow-right" /></span><span className="hi-desc">Build-up, edges and detail</span></A></li><li><A href="/services/move-in-move-out-cleaning"><span className="hi-name"><span><span className="nowrap">Move-In</span> / <span className="nowrap">Move-Out</span> Cleaning</span><Icon name="arrow-right" /></span><span className="hi-desc">Empty rooms before or after a move</span></A></li><li><A href="/services/post-construction-cleaning"><span className="hi-name"><span><span className="nowrap">Post-Construction</span> Cleaning</span><Icon name="arrow-right" /></span><span className="hi-desc">Fine dust after renovation work</span></A></li><li className="hi-all"><A href="/services"><span className="hi-name"><span>All services</span><Icon name="arrow-right" /></span><span className="hi-desc">Indoor, outdoor and for businesses</span></A></li></ul>
          </Reveal>
        </div>
      </section>
      <section className="section band-mist" aria-labelledby="sit-title">
        <div className="wrap">
          <Reveal className="section-head">
            <h2 id="sit-title">Not sure which cleaning you need?</h2>
            <p>Start from how the place looks today. Each row opens the page for the service that fits.</p>
          </Reveal>
          <ul className="situations"><li><A href="/services/standard-cleaning"><span className="sit-text">The home is kept up and just needs its regular clean.</span><span className="sit-service"><span>Standard Cleaning</span><Icon name="arrow-right" /></span></A></li><li><A href="/services/deep-cleaning"><span className="sit-text">It’s been months, or build-up is showing in the kitchen and bathrooms.</span><span className="sit-service"><span>Deep Cleaning</span><Icon name="arrow-right" /></span></A></li><li><A href="/services/recurring-cleaning"><span className="sit-text">You want the same upkeep every week or every two weeks.</span><span className="sit-service"><span>Recurring Cleaning</span><Icon name="arrow-right" /></span></A></li><li><A href="/services/move-in-move-out-cleaning"><span className="sit-text">The rooms are empty: you’re moving out, moving in or turning over a rental.</span><span className="sit-service"><span><span className="nowrap">Move-In</span> / <span className="nowrap">Move-Out</span> Cleaning</span><Icon name="arrow-right" /></span></A></li><li><A href="/services/post-construction-cleaning"><span className="sit-text">Contractors just finished and fine dust is on everything.</span><span className="sit-service"><span><span className="nowrap">Post-Construction</span> Cleaning</span><Icon name="arrow-right" /></span></A></li><li><A href="/services/tile-and-grout-cleaning"><span className="sit-text">The shower grout stays dark no matter how much you scrub.</span><span className="sit-service"><span>Tile & Grout Cleaning</span><Icon name="arrow-right" /></span></A></li></ul>
          <p style={{ marginTop: '24px' } as React.CSSProperties}><A className="link-arrow" href="services/index.html#by-situation"><span>More situations, indoor and outdoor</span><Icon name="arrow-right" /></A></p>
        </div>
      </section>
      <section className="section" aria-labelledby="cat-head">
        <div className="wrap">
          <Reveal className="section-head">
            <h2 id="cat-head">Every service has its own page</h2>
            <p>What the cleaner does, what to settle before the visit and what isn’t included. Pick a service to see the details.</p>
          </Reveal>
          <div className="catalog">
            <div className="cat-group"><figure className="cat-media"><img src="/images/site/standard-cleaning-dusting-shelves-800.jpg" srcSet="/images/site/standard-cleaning-dusting-shelves-800.jpg 800w, /images/site/standard-cleaning-dusting-shelves-1600.jpg 1600w" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw" width="800" height="533" alt="A cleaner dusting shelves in a living room" style={{ '--pos': '56% 42%', '--pos-sm': '60% 40%' } as React.CSSProperties} decoding="async" loading="lazy" /></figure><h3 className="cat-title" id="cat-inside">Inside the home</h3><ul className="cat-list" aria-labelledby="cat-inside"><li><A href="/services/standard-cleaning"><span className="cat-name"><span>Standard Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Routine cleaning for a home that’s already kept up.</span></A></li><li><A href="/services/deep-cleaning"><span className="cat-name"><span>Deep Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">A slower, more detailed clean for build-up that routine cleaning misses.</span></A></li><li><A href="/services/recurring-cleaning"><span className="cat-name"><span>Recurring Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Standard upkeep on a weekly or every-two-weeks schedule.</span></A></li><li><A href="/services/tile-and-grout-cleaning"><span className="cat-name"><span>Tile & Grout Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Detailed work on tile and the grout lines between it.</span></A></li><li><A href="/services/home-organizing"><span className="cat-name"><span>Home Organizing</span><Icon name="arrow-right" /></span><span className="cat-desc">Deciding where things live, so the space works and doesn’t just look tidy.</span></A></li></ul></div>
            <div className="cat-group"><figure className="cat-media"><img src="/images/site/move-out-empty-bedroom-800.jpg" srcSet="/images/site/move-out-empty-bedroom-800.jpg 800w, /images/site/move-out-empty-bedroom-1600.jpg 1600w" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw" width="800" height="533" alt="An empty bedroom with an open closet" style={{ '--pos': '50% 55%', '--pos-sm': '50% 55%' } as React.CSSProperties} decoding="async" loading="lazy" /></figure><h3 className="cat-title" id="cat-moving">Moving or finishing work</h3><ul className="cat-list" aria-labelledby="cat-moving"><li><A href="/services/move-in-move-out-cleaning"><span className="cat-name"><span><span className="nowrap">Move-In</span> / <span className="nowrap">Move-Out</span> Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">The clean that happens while the rooms are empty.</span></A></li><li><A href="/services/post-construction-cleaning"><span className="cat-name"><span><span className="nowrap">Post-Construction</span> Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Clearing fine dust and residue so a space can be used after building or renovation work.</span></A></li><li><A href="/services/garage-basement-attic-cleaning"><span className="cat-name"><span>Garage, Basement or Attic Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">The spaces that get skipped until you can’t walk through them.</span></A></li></ul><div className="cat-sub"><h3 className="cat-title" id="cat-business">For businesses</h3><ul className="cat-list" aria-labelledby="cat-business"><li><A href="/services/commercial-cleaning"><span className="cat-name"><span>Commercial Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Cleaning for a workplace, scheduled around the hours it operates.</span></A></li></ul></div></div>
            <div className="cat-group"><figure className="cat-media"><img src="/images/site/deck-wooden-terrace-800.jpg" srcSet="/images/site/deck-wooden-terrace-800.jpg 800w, /images/site/deck-wooden-terrace-1600.jpg 1600w" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw" width="800" height="533" alt="A wooden deck beside a house" style={{ '--pos': '50% 60%', '--pos-sm': '45% 60%' } as React.CSSProperties} decoding="async" loading="lazy" /></figure><h3 className="cat-title" id="cat-outside">Outside the home</h3><ul className="cat-list" aria-labelledby="cat-outside"><li><A href="/services/deck-cleaning"><span className="cat-name"><span>Deck Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Taking a season of weather, leaves and foot traffic off an outdoor deck.</span></A></li><li><A href="/services/pressure-washing"><span className="cat-name"><span>Pressure Washing</span><Icon name="arrow-right" /></span><span className="cat-desc">For hard outdoor surfaces that a hose and a brush stopped fixing.</span></A></li><li><A href="/services/gutter-cleaning"><span className="cat-name"><span>Gutter Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Clearing what has collected in the gutters so water can drain.</span></A></li><li><A href="/services/flashing-cleaning"><span className="cat-name"><span>Flashing Cleaning</span><Icon name="arrow-right" /></span><span className="cat-desc">Cleaning the exposed metal joins on a roof, without touching the sealing.</span></A></li></ul></div>
          </div>
        </div>
      </section>
      <section className="section band-mist" aria-labelledby="how-title">
        <div className="wrap">
          <Reveal className="section-head">
            <h2 id="how-title">How a request works</h2>
            <p>Five steps, and the decision is yours at the fourth. Nothing is booked until you accept a cleaner.</p>
          </Reveal>
          <ol className="steps"><li><span className="step-num" aria-hidden="true">01</span><div><h3>Describe the job</h3><p>Your ZIP code, the property, the day you want and anything specific. It takes a few minutes and costs nothing.</p></div></li><li><span className="step-num" aria-hidden="true">02</span><div><h3>It reaches cleaners who fit</h3><p>Only professionals whose area covers your ZIP, who offer this service and whose ID our team has approved.</p></div></li><li><span className="step-num" aria-hidden="true">03</span><div><h3>A cleaner replies</h3><p>The first available cleaner takes the request and a conversation opens for scope, timing and price.</p></div></li><li><span className="step-num" aria-hidden="true">04</span><div><h3>You accept or decline</h3><p>Check their profile and rating, then decide. If you decline, the request goes to another cleaner automatically.</p></div></li><li><span className="step-num" aria-hidden="true">05</span><div><h3>You pay the cleaner directly</h3><p>The price is what the two of you agree. It’s paid to the cleaner, not to Verliks.</p></div></li></ol>
          <dl className="facts">
            <div><dt>Free to ask</dt><dd>Sending a request costs nothing, and declining a cleaner costs nothing.</dd></div>
            <div><dt>An estimate first</dt><dd>You see an estimated price range before you send anything.</dd></div>
            <div><dt>Paid directly</dt><dd>You pay the cleaner. Verliks takes no percentage and never holds your money.</dd></div>
          </dl>
          <p style={{ marginTop: '24px' } as React.CSSProperties}><A className="link-arrow" href="/how-it-works"><span>How it works, in detail</span><Icon name="arrow-right" /></A></p>
        </div>
      </section>
      <section className="section" aria-labelledby="trust-title">
        <div className="wrap split">
          <figure className="trust-media split-5"><img src="/images/site/trust-cleaner-portrait-800.jpg" srcSet="/images/site/trust-cleaner-portrait-800.jpg 800w, /images/site/trust-cleaner-portrait-1200.jpg 1200w" sizes="(min-width: 1024px) 38vw, 100vw" width="800" height="1200" alt="Black and white portrait of a cleaning professional in overalls holding a bucket in a kitchen" style={{ '--pos': '50% 30%', '--pos-sm': '50% 26%' } as React.CSSProperties} decoding="async" loading="lazy" /></figure>
          <div className="split-7">
            <h2 id="trust-title">Who comes to your home</h2>
            <p className="lead" style={{ margin: '16px 0 28px', maxWidth: '38rem' } as React.CSSProperties}>Independent professionals, not Verliks employees. Here’s exactly what we check, and what we don’t.</p>
            <div className="ledger">
              <div>
                <h3>What Verliks checks</h3>
                <ul>
                  <li><Icon name="check" /><div><strong>Identity, reviewed by a person</strong><span>Every cleaner uploads a government ID and a selfie. Someone on our team reviews them before the profile can receive a single request.</span></div></li>
                  <li><Icon name="check" /><div><strong>Area and service</strong><span>Requests only reach cleaners whose service area covers your ZIP code and who offer the type of cleaning you asked for.</span></div></li>
                  <li><Icon name="check" /><div><strong>Ratings after every job</strong><span>You rate the job afterward. The rating stays on the cleaner’s profile and affects which requests they’re offered next.</span></div></li>
                </ul>
              </div>
              <div>
                <h3>What Verliks doesn’t do</h3>
                <ul>
                  <li><Icon name="x" /><div><strong>Criminal background checks</strong><span>Our review confirms who someone is. It isn’t a criminal record check.</span></div></li>
                  <li><Icon name="x" /><div><strong>Employ the cleaners</strong><span>Cleaners work independently. They decide what they take on and agree the price with you.</span></div></li>
                  <li><Icon name="x" /><div><strong>Hold your payment</strong><span>You pay the cleaner directly. There’s no escrow and no Verliks cut.</span></div></li>
                </ul>
              </div>
            </div>
            <p style={{ marginTop: '24px' } as React.CSSProperties}><A className="link-arrow" href="how-it-works.html#does-and-doesnt"><span>What Verliks does, and what it doesn’t</span><Icon name="arrow-right" /></A></p>
          </div>
        </div>
      </section>
      <section className="photo-band" aria-labelledby="area-title">
        <figure className="photo-band-media"><img src="/images/site/areas-connecticut-colonial-800.jpg" srcSet="/images/site/areas-connecticut-colonial-800.jpg 800w, /images/site/areas-connecticut-colonial-1600.jpg 1600w" sizes="100vw" width="800" height="640" alt="A white colonial-style building in Connecticut among fall trees" style={{ '--pos': '62% 45%', '--pos-sm': '50% 45%' } as React.CSSProperties} decoding="async" loading="lazy" /></figure>
        <div className="wrap">
          <div className="photo-band-panel">
            <h2 id="area-title">Starting in Connecticut</h2>
            <p>Verliks is starting here. Coverage works by ZIP code: your request reaches cleaners who include your ZIP in their area, so availability varies from town to town.</p>
            <A className="link-arrow" href="/service-areas"><span>How service areas work</span><Icon name="arrow-right" /></A>
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="faq-title">
        <div className="wrap split">
          <div className="split-4 sticky-col">
            <h2 id="faq-title">Questions people ask first</h2>
            <p className="muted" style={{ margin: '16px 0 12px' } as React.CSSProperties}>Anything else can be settled with the cleaner in the conversation, before you accept.</p>
            <A className="link-arrow" href="#ask"><span>Ask a question</span><Icon name="arrow-right" /></A>
          </div>
          <div className="split-8"><div className="faq"><details><summary><span>What does a cleaning cost?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>There’s no fixed price list. You see an estimated range before you send a request, calculated from the details you give. The cleaner who takes your request goes through the job with you and confirms the price before anything is booked.</p></div></details><details><summary><span>Who do I pay, and when?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>You pay the cleaner directly, on the terms the two of you agree. Verliks doesn’t charge you to send a request, takes no percentage of the job and never holds your payment.</p></div></details><details><summary><span>Who actually comes to my home?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>An independent professional whose ID and selfie our team approved, whose service area covers your ZIP code, and who offers the type of cleaning you asked for. Verliks verifies identity. It doesn’t run criminal background checks.</p></div></details><details><summary><span>What if the cleaner who replies isn’t right for me?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>Decline. Nothing is charged, and your request goes back out to other cleaners near you automatically.</p></div></details><details><summary><span>Can I ask for a specific cleaner?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>Yes. A request can go straight to a professional whose profile you’ve seen. If they aren’t available, it falls back to matching with cleaners nearby.</p></div></details><details><summary><span>How quickly will someone reply?</span><i className="faq-icon" aria-hidden="true"></i></summary><div className="faq-body"><p>Requests reach matching cleaners right away, in small groups at a time. How fast one replies depends on who’s free near you, so it isn’t a time we can promise.</p></div></details></div></div>
        </div>
      </section>
      <section className="section band-mist" id="ask" aria-labelledby="ask-title">
        <div className="wrap split">
          <div className="split-5">
            <h2 id="ask-title">Ask before you request</h2>
            <p className="lead" style={{ margin: '16px 0 20px' } as React.CSSProperties}>Questions about a service, your area or how requests work. Send a message and we’ll reply by email.</p>
            <p className="small muted">Prefer email? Write to <A className="link" href="mailto:support@verliks.com">support@verliks.com</A>.</p>
          </div>
          <div className="split-7"><div className="form-shell" data-form-shell>
        <form className="form" id="contact-form" data-contact-form noValidate aria-describedby="cf-intro">
          <p className="form-intro" id="cf-intro">All fields are required.</p>
          <div className="error-summary" data-error-summary tabIndex={-1} role="alert" hidden>
            <h3><Icon name="warning-circle" /><span data-error-title>Check these fields</span></h3>
            <ul data-error-list></ul>
          </div>
          <fieldset data-fieldset>
            <legend className="visually-hidden">Your message</legend>
            <div className="form-row">
              <div className="field">
                <label htmlFor="cf-name">Name</label>
                <input className="input" id="cf-name" name="name" type="text" autoComplete="name" required aria-describedby="cf-name-error" />
                <p className="field-error" id="cf-name-error" hidden></p>
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email</label>
                <input className="input" id="cf-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" spellCheck="false" required aria-describedby="cf-email-error" />
                <p className="field-error" id="cf-email-error" hidden></p>
              </div>
            </div>
            <div className="field">
              <label htmlFor="cf-service">Cleaning service</label>
              <p className="hint" id="cf-service-hint">Pick the closest match, or “Not sure yet.”</p>
              <div className="select-wrap">
                <select className="select" id="cf-service" name="service" required aria-describedby="cf-service-hint cf-service-error"><option value="" disabled>Choose a service</option><option value="not-sure">Not sure yet</option><optgroup label="Inside the home"><option value="standard-cleaning">Standard Cleaning</option><option value="deep-cleaning">Deep Cleaning</option><option value="recurring-cleaning">Recurring Cleaning</option><option value="tile-and-grout-cleaning">Tile & Grout Cleaning</option><option value="home-organizing">Home Organizing</option></optgroup><optgroup label="Moving or finishing work"><option value="move-in-move-out-cleaning">Move-In / Move-Out Cleaning</option><option value="post-construction-cleaning">Post-Construction Cleaning</option><option value="garage-basement-attic-cleaning">Garage, Basement or Attic Cleaning</option></optgroup><optgroup label="Outside the home"><option value="deck-cleaning">Deck Cleaning</option><option value="pressure-washing">Pressure Washing</option><option value="gutter-cleaning">Gutter Cleaning</option><option value="flashing-cleaning">Flashing Cleaning</option></optgroup><optgroup label="For businesses"><option value="commercial-cleaning">Commercial Cleaning</option></optgroup><option value="other">Something else (my area, a request, other)</option></select>
                <Icon name="caret-down" />
              </div>
              <p className="field-error" id="cf-service-error" hidden></p>
            </div>
            <div className="field">
              <label htmlFor="cf-message">Message</label>
              <p className="hint" id="cf-message-hint">If your question is about availability, include your ZIP code.</p>
              <textarea className="textarea" id="cf-message" name="message" rows={5} required aria-describedby="cf-message-hint cf-message-error"></textarea>
              <p className="field-error" id="cf-message-error" hidden></p>
            </div>
            <div className="hp" aria-hidden="true">
              <label htmlFor="cf-company">Leave this field empty</label>
              <input id="cf-company" name="_gotcha" type="text" tabIndex={-1} autoComplete="off" />
            </div>
          </fieldset>
          <div className="form-submit">
            <button className="btn" type="submit" data-submit><span data-submit-label>Send message</span><span className="spinner-bar" aria-hidden="true"></span></button>
            <p>We reply by email. Ready to describe a job? <A className="link" href="/request">Find a cleaner</A> instead.</p>
          </div>
        </form>
        <div className="form-status" data-form-status tabIndex={-1} hidden></div>
        <p className="visually-hidden" data-live aria-live="polite"></p>
        <noscript><p className="note">This form needs JavaScript to send. You can email <A className="link" href="mailto:support@verliks.com">support@verliks.com</A> instead.</p></noscript>
        <div data-review-slot></div>
      </div></div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
