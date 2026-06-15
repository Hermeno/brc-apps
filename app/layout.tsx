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
  title: 'BrazilianClean — Professional Cleaning Services',
  description: 'The #1 platform to find background-checked cleaners near you. Book in minutes, relax all day.',
  openGraph: {
    title: 'BrazilianClean — Professional Cleaning Services',
    description: 'Connect with vetted, background-checked cleaners in your area. Secure booking, satisfaction guaranteed.',
    type: 'website',
  },
  other: {
    // Prevent browser auto-translation — Google Translate/DeepL wrap text nodes in
    // <font> tags which corrupts React's virtual DOM and causes hydration crashes.
    'google': 'notranslate',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('bc_locale')?.value ?? 'pt') as Locale;
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
