/* The ZIP search that starts a request. A plain GET form, so it works without
   JavaScript: /request reads ?zip= and keeps it only if it is five digits.
   type="text" with inputMode="numeric" rather than type="number", so a
   Connecticut ZIP such as 06103 keeps its leading zero. */
export default function ZipSearch({ id, hint, tone = 'photo' }: {
  id: string;
  hint?: string;
  /** "photo" sits on a darkened photograph, "light" on a white or pale band. */
  tone?: 'photo' | 'light';
}) {
  return (
    <form className="zip-search" data-tone={tone} action="/request" method="get" aria-label="Start a cleaning request">
      <div className="zip-row">
        <label className="zip-field" htmlFor={id}>
          <span>ZIP code</span>
          <input id={id} name="zip" type="text" inputMode="numeric" autoComplete="postal-code"
            pattern="[0-9]{5}" maxLength={5} required placeholder="e.g. 06103"
            title="Enter a 5-digit ZIP code" aria-describedby={hint ? `${id}-hint` : undefined} />
        </label>
        <button type="submit">Find a cleaner</button>
      </div>
      {hint && <p className="zip-hint" id={`${id}-hint`}>{hint}</p>}
    </form>
  );
}
