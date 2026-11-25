import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

// Display / headings — Google Sans Flex (static weights only; the 4.15 MB
// variable font is intentionally not shipped).
const googleSans = localFont({
  src: [
    { path: './fonts/GoogleSansFlex_24pt-Light.ttf',    weight: '300', style: 'normal' },
    { path: './fonts/GoogleSansFlex_24pt-Regular.ttf',  weight: '400', style: 'normal' },
    { path: './fonts/GoogleSansFlex_24pt-Medium.ttf',   weight: '500', style: 'normal' },
    { path: './fonts/GoogleSansFlex_24pt-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: './fonts/GoogleSansFlex_24pt-Bold.ttf',     weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

// Body / UI — Plus Jakarta Sans (variable, normal + italic).
const jakarta = localFont({
  src: [
    { path: './fonts/PlusJakartaSans-VariableFont_wght.ttf',        style: 'normal' },
    { path: './fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://verliks.com'),
  title: {
    default:  'Verliks — Professional Cleaning Services',
    template: '%s | Verliks',
  },
  description: 'Connect with independent cleaning professionals near you. Describe the job for free, discuss the details, and decide before you book.',
  keywords: ['cleaning services', 'house cleaning', 'cleaning professionals', 'find a cleaner', 'home cleaning'],
  authors:  [{ name: 'Verliks', url: 'https://verliks.com' }],
  openGraph: {
    title:       'Verliks — Professional Cleaning Services',
    description: 'Find an independent cleaner in your area. Send a request for free and agree on the details before you book.',
    url:         'https://verliks.com',
    siteName:    'Verliks',
    type:        'website',
    images: [{ url: '/images/brand/verliks-logo-600.png', width: 600, height: 129, alt: 'Verliks' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Verliks — Professional Cleaning Services',
    description: 'Connect with independent cleaning professionals near you.',
    images:      ['/images/brand/verliks-logo-600.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  other: {
    'google': 'notranslate',
  },
};

// Chakra, the session and the translations live in the layouts that use them (auth, dashboard,
// request), not here: the public pages need none of it, and reading the locale cookie here made
// every page dynamic.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body
        className={`${googleSans.variable} ${jakarta.variable}`}
        suppressHydrationWarning
        translate="no"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        {/* Scroll-staggered sections start hidden and are revealed by the client
            once they enter the viewport. The hidden state is server-rendered, so
            with scripting off the reveal would never arrive. app/site.css covers
            browsers that support `@media (scripting: none)`; this covers the rest. */}
        <noscript>
          <style>{'.vsite [data-stagger]>*{opacity:1!important;transform:none!important;filter:none!important}'}</style>
        </noscript>
        {/* Detect Google Translate / DeepL activation and warn before React breaks.
            Runs as plain DOM — survives React crashes caused by <font> tag injection. */}
        <Script
          id="translate-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var BANNER_ID = 'bc-translate-warning';
  function showBanner() {
    if (document.getElementById(BANNER_ID)) return;
    var b = document.createElement('div');
    b.id = BANNER_ID;
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#FEF3C7;border-bottom:2px solid #D97706;padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:12px;font-family:sans-serif;font-size:13px;color:#78350F;box-shadow:0 2px 8px rgba(0,0,0,.12)';
    b.innerHTML = '<span>&#9888;&#65039; <strong>Browser translation can cause errors on this platform.</strong> Please use it in English for the best experience.</span>'
      + '<button onclick="window.location.reload()" style="padding:4px 14px;background:#D97706;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:12px;white-space:nowrap">Reload page</button>'
      + '<button onclick="document.getElementById(\\'' + BANNER_ID + '\\').remove()" style="padding:4px 10px;background:transparent;color:#78350F;border:1px solid #D97706;border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap">Dismiss</button>';
    var target = document.body || document.documentElement;
    target.insertBefore(b, target.firstChild);
  }
  var obs = new MutationObserver(function() {
    var cls = document.documentElement.className;
    if (cls.indexOf('translated-') !== -1) { obs.disconnect(); showBanner(); }
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();`,
          }}
        />
        {/* Meta Pixel base code, on every page. The pixel also counts the page views of
            client-side navigation on its own, through the History API. */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1940094264035106');
fbq('track','PageView');`,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt="" src="https://www.facebook.com/tr?id=1940094264035106&ev=PageView&noscript=1" />
        </noscript>
        {children}
      </body>
    </html>
  );
}
