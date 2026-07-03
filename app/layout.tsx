import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from '@/components/providers';
import type { Locale } from '@/lib/i18n';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://verliks.com'),
  title: {
    default:  'Verliks — Professional Cleaning Services',
    template: '%s | Verliks',
  },
  description: 'The #1 platform to find background-checked, Brazilian cleaning professionals near you. Book in minutes, relax all day.',
  keywords: ['cleaning services', 'house cleaning', 'cleaning professionals', 'Brazilian cleaners', 'book a cleaner', 'home cleaning'],
  authors:  [{ name: 'Verliks', url: 'https://verliks.com' }],
  openGraph: {
    title:       'Verliks — Professional Cleaning Services',
    description: 'Connect with vetted, background-checked cleaners in your area. Secure booking, satisfaction guaranteed.',
    url:         'https://verliks.com',
    siteName:    'Verliks',
    type:        'website',
    images: [{ url: '/logo-blue.png', width: 1200, height: 630, alt: 'Verliks' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Verliks — Professional Cleaning Services',
    description: 'Find vetted cleaning professionals near you. Book instantly.',
    images:      ['/logo-blue.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  other: {
    'google': 'notranslate',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('bc_locale')?.value ?? 'en') as Locale;
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${inter.variable}`}
        suppressHydrationWarning
        translate="no"
        style={{ backgroundColor: '#F8FAFC' }}
      >
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
      + '<button onclick="document.getElementById(\'' + BANNER_ID + '\').remove()" style="padding:4px 10px;background:transparent;color:#78350F;border:1px solid #D97706;border-radius:4px;cursor:pointer;font-size:12px;white-space:nowrap">Dismiss</button>';
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
        <Providers locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
