/* Icon sprite from the prototype (Phosphor outlines, 256 viewBox).
   Rendered once per page by <IconSprite /> and referenced with <Icon name="..." />,
   exactly like the prototype does with <use href="#i-...">. */

export function IconSprite() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" focusable="false">
      <symbol id="i-arrow-right" viewBox="0 0 256 256">
        <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
      </symbol>
      <symbol id="i-arrow-up-right" viewBox="0 0 256 256">
        <path d="M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" />
      </symbol>
      <symbol id="i-caret-down" viewBox="0 0 256 256">
        <path d="M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z" />
      </symbol>
      <symbol id="i-list" viewBox="0 0 256 256">
        <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z" />
      </symbol>
      <symbol id="i-x" viewBox="0 0 256 256">
        <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z" />
      </symbol>
      <symbol id="i-check" viewBox="0 0 256 256">
        <path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z" />
      </symbol>
    </svg>
  );
}

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={`icon icon-${name}${className ? ' ' + className : ''}`} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}
