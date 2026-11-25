/* A 200 ms fade between pages. Next.js remounts a template on every navigation,
   so the CSS animation (app/globals.css) replays each time. Being CSS, it never
   leaves the server-rendered page invisible while JavaScript loads, and it keeps
   the animation library off the public pages. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
