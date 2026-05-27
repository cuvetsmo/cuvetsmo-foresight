/**
 * Public SVG download of the Foresight mark — single source of truth so
 * the brand page download links never drift from the in-code mark.
 */
const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" ry="14" fill="#020617"/>
  <g transform="translate(8 8) scale(2)" fill="none" stroke="#FFFFFF"
     stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 17 L9 11 L13 14 L21 5"/>
  </g>
  <circle cx="50" cy="18" r="3.6" fill="#10B981"/>
</svg>
`;

export function GET() {
  return new Response(SVG, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Disposition": 'inline; filename="foresight-mark.svg"',
    },
  });
}
