import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MapPin } from 'lucide-react';
import './site.css';
import SiteHeader from '@/components/site/site-header';
import SiteFooter from '@/components/site/site-footer';
import { SITE_SERVICES } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Find a Cleaner Near You | Verliks',
  description: 'Tell Verliks what needs cleaning and connect with an independent cleaner who serves your ZIP code. Your request is free; you agree on the work and price before accepting.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Verliks',
    title: 'Find a Cleaner Near You | Verliks',
    description: 'A simpler way to find independent cleaning professionals near you. Describe the job for free and decide before you book.',
    url: '/',
  },
};

const featured = [
  { slug: 'standard-cleaning', name: 'Everyday cleaning', detail: 'The fresh start your routine needs.', image: '/images/site/standard-cleaning-dusting-shelves-1600.jpg', alt: 'A professional dusting a living room shelf' },
  { slug: 'deep-cleaning', name: 'Deep cleaning', detail: 'More attention to the places that need it.', image: '/images/site/deep-cleaning-stovetop-1200.jpg', alt: 'A professional cleaning a kitchen stovetop' },
  { slug: 'move-in-move-out-cleaning', name: 'Moving cleaning', detail: 'For the home you leave or the one ahead.', image: '/images/site/move-out-empty-bedroom-1600.jpg', alt: 'An empty bedroom ready for move-in cleaning' },
];

const moreServices = SITE_SERVICES.filter(s => !featured.some(f => f.slug === s.slug)).slice(0, 6);

export default function HomePage() {
  return (
    <div className="vsite">
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="wrap home-hero-grid">
            <div className="home-hero-copy">
              <p className="eyebrow eyebrow-rule">CLEANING HELP, ON YOUR TERMS</p>
              <h1 id="home-title">A cleaner home starts with the <em>right person.</em></h1>
              <p className="hero-lede">Tell us what you need. We connect you with an independent cleaning professional who serves your area. You decide on the details and price before you say yes.</p>
              <form className="home-search" action="/request" method="get" aria-label="Start a cleaning request">
                <div className="home-search-fields">
                  <label className="search-field search-service"><span>What needs cleaning?</span>
                    <select name="service" defaultValue="standard" required>
                      <option value="standard">Standard cleaning</option><option value="deep">Deep cleaning</option>
                      <option value="moving">Move-in / move-out</option>
                      <option value="post-work">Post-construction</option><option value="commercial">Commercial cleaning</option>
                    </select>
                  </label>
                  <label className="search-field search-zip"><span>ZIP code</span>
                    <input name="zip" type="text" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} placeholder="Enter ZIP" required aria-describedby="zip-hint" />
                  </label>
                </div>
                <button className="btn btn-primary search-submit" type="submit">Find a cleaner <ArrowRight size={19} aria-hidden="true" /></button>
              </form>
              <p className="search-note" id="zip-hint"><Check size={16} aria-hidden="true" /> Free to request <span aria-hidden="true">·</span> Availability depends on your ZIP code</p>
            </div>
            <div className="home-hero-visual">
              <Image src="/images/site/verliks-cleaning-hero-editorial-20261006.webp" alt="A cleaning professional at work in a sunlit living room" fill priority sizes="(max-width: 900px) 100vw, 43vw" className="home-hero-image" />
              <div className="hero-visual-caption"><span>01 / 03</span><span>Real people. Real homes.<br />A better way to connect.</span></div>
            </div>
          </div>
          <div className="hero-edge" aria-hidden="true">V</div>
        </section>

        <section className="benefit-ribbon" aria-label="Why request through Verliks"><div className="wrap benefit-ribbon-inner">
          <p><span>01</span> Tell us what needs doing</p><p><span>02</span> Speak with a local cleaner</p><p><span>03</span> Decide before you book</p>
        </div></section>

        <section className="home-section services-section" aria-labelledby="services-title"><div className="wrap">
          <div className="section-intro"><div><p className="eyebrow">A SERVICE FOR THE SITUATION</p><h2 id="services-title">What can we help you clean?</h2></div>
            <Link href="/services" className="text-link">Explore all services <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
          <div className="featured-grid">{featured.map((item, index) => (
            <Link className={`featured-service ${index === 0 ? 'feature-tall' : ''}`} href={`/services/${item.slug}`} key={item.slug}>
              <div className="featured-photo"><Image src={item.image} alt={item.alt} fill sizes={index === 0 ? '(max-width: 760px) 100vw, 48vw' : '(max-width: 760px) 100vw, 25vw'} /></div>
              <div className="featured-info"><span className="featured-number">0{index + 1}</span><div><h3>{item.name}</h3><p>{item.detail}</p></div><ArrowUpRight size={22} aria-hidden="true" /></div>
            </Link>
          ))}</div>
          <div className="more-services"><span className="more-label">More ways we can help</span><div>{moreServices.map(service =>
            <Link href={`/services/${service.slug}`} key={service.slug}>{service.name}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div></div>
        </div></section>

        <section className="home-section process-section" aria-labelledby="process-title"><div className="wrap process-grid">
          <div className="process-intro"><p className="eyebrow">THE VERLIKS WAY</p><h2 id="process-title">Simple from the first request.</h2>
            <p>A cleaning request should be clear from the start. Here is what happens before anyone comes to your home.</p>
            <Link href="/how-it-works" className="text-link">See how it works <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
          <ol className="process-steps">
            <li><span>01</span><div><h3>Tell us about the job</h3><p>Choose a service, share your ZIP code and describe the space. Sending a request is free.</p></div></li>
            <li><span>02</span><div><h3>Talk through the details</h3><p>An available professional who offers the service in your area can respond. Discuss scope, timing and price together.</p></div></li>
            <li><span>03</span><div><h3>Choose with confidence</h3><p>Review the professional and accept only when it feels right. You pay the cleaner directly on the terms you agree.</p></div></li>
          </ol>
        </div></section>

        <section className="home-section trust-section" aria-labelledby="trust-title"><div className="wrap trust-grid">
          <div className="trust-image"><Image src="/images/site/trust-cleaner-portrait-1200.jpg" alt="Portrait of a professional cleaner in a home" fill sizes="(max-width: 820px) 100vw, 43vw" /></div>
          <div className="trust-copy"><p className="eyebrow">PEOPLE FIRST</p><h2 id="trust-title">Know who you&apos;re welcoming in.</h2>
            <p>Verliks connects you with independent professionals. Our team reviews each cleaner&apos;s government ID and selfie before their profile can receive requests.</p>
            <ul><li><Check aria-hidden="true" size={19} /> Identity reviewed by our team</li><li><Check aria-hidden="true" size={19} /> Services and coverage matched to your request</li><li><Check aria-hidden="true" size={19} /> A conversation before you accept</li></ul>
            <p className="trust-note">Identity review is not a criminal background check.</p>
            <Link href="/how-it-works#does-and-doesnt" className="text-link">Our approach to trust <ArrowUpRight size={19} aria-hidden="true" /></Link>
          </div>
        </div></section>

        <section className="pro-section" aria-labelledby="pro-title"><div className="wrap pro-grid">
          <div className="pro-copy"><p className="eyebrow">FOR INDEPENDENT CLEANERS</p><h2 id="pro-title">Good work deserves a steady way to meet clients.</h2>
            <p>Set the services and area you cover. See local requests and choose which conversations to start. The lead fee applies when the client confirms you.</p>
            <Link href="/for-cleaners" className="btn btn-gold">How Verliks works for pros <ArrowRight size={19} aria-hidden="true" /></Link></div>
          <div className="pro-image"><Image src="/images/site/about-cleaner-van-1200.jpg" alt="Independent cleaning professional beside a work vehicle" fill sizes="(max-width: 820px) 100vw, 44vw" /></div>
        </div></section>

        <section className="home-section area-section" aria-labelledby="area-title"><div className="wrap area-grid">
          <div><p className="eyebrow">COVERAGE BY ZIP CODE</p><h2 id="area-title">Local starts with your address.</h2></div>
          <div><p>Verliks is starting in Connecticut and building a network of independent cleaners for more U.S. communities. Enter your ZIP code to begin a request; availability varies by area and service.</p>
            <Link href="/service-areas" className="text-link"><MapPin size={18} aria-hidden="true" /> Check service areas <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div></section>

        <section className="home-section home-faq" aria-labelledby="faq-title"><div className="wrap faq-grid">
          <div><p className="eyebrow">A FEW GOOD QUESTIONS</p><h2 id="faq-title">Before you get started.</h2></div>
          <div className="faq-list"><details><summary>Does it cost anything to request a cleaner?</summary><p>No. Sending a cleaning request is free. You agree on the job and price with the professional before you accept.</p></details>
            <details><summary>Does Verliks send an employee?</summary><p>No. Cleaners on Verliks work independently. They choose the work they take and agree on the details with you.</p></details>
            <details><summary>How is the cleaner verified?</summary><p>Our team reviews a government ID and selfie before a cleaner can receive requests. We do not conduct criminal background checks.</p></details>
            <details><summary>Who handles payment?</summary><p>You pay the cleaner directly, based on the terms the two of you agree. Verliks does not hold the job payment.</p></details>
          </div>
        </div></section>

        <section className="final-cta" aria-labelledby="final-title"><div className="wrap final-cta-inner">
          <div><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="final-title">Tell us what home needs today.</h2></div>
          <Link href="/request" className="btn btn-primary">Start a free request <ArrowRight size={19} aria-hidden="true" /></Link>
        </div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
