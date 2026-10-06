import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/* One anchor for the ported markup: internal paths go through next/link so
   navigation stays client-side, anything else stays a plain <a>. */
export function A({ href = '#', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const internal = href.startsWith('/') && !href.startsWith('//');
  if (internal) return <Link href={href} {...rest}>{children}</Link>;
  return <a href={href} {...rest}>{children}</a>;
}
