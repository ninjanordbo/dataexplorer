/**
 * Simplified SVG choropleth map of Sør-Norge for rangering view.
 * Static prototype — shapes approximate actual geography.
 */

const CHOROPLETH_GREENS = [
  '#e8f5e2', '#c8e6b8', '#a3d48e', '#7bc264', '#55a83e', '#3d8a2e', '#2a6b1f', '#1a4d12',
];

// Simplified municipality/zone paths for Agder region
const REGIONS = [
  { id: 'kristiansand', name: 'Kristiansand', path: 'M180,340 L220,315 L270,310 L290,330 L285,360 L260,380 L220,385 L190,370 Z', value: 0.7 },
  { id: 'arendal', name: 'Arendal', path: 'M290,330 L330,310 L370,315 L380,340 L365,365 L330,370 L285,360 Z', value: 0.5 },
  { id: 'grimstad', name: 'Grimstad', path: 'M260,380 L285,360 L330,370 L320,395 L280,400 Z', value: 0.6 },
  { id: 'lillesand', name: 'Lillesand', path: 'M220,385 L260,380 L280,400 L260,415 L225,410 Z', value: 0.4 },
  { id: 'lindesnes', name: 'Lindesnes', path: 'M120,370 L180,340 L190,370 L220,385 L225,410 L200,430 L150,425 L120,400 Z', value: 0.3 },
  { id: 'farsund', name: 'Farsund', path: 'M60,380 L120,370 L120,400 L150,425 L130,445 L80,440 L50,415 Z', value: 0.2 },
  { id: 'flekkefjord', name: 'Flekkefjord', path: 'M20,350 L60,330 L100,335 L120,370 L60,380 L50,415 L25,395 Z', value: 0.15 },
  { id: 'lyngdal', name: 'Lyngdal', path: 'M100,335 L140,320 L180,340 L120,370 Z', value: 0.35 },
  { id: 'vennesla', name: 'Vennesla', path: 'M180,290 L220,275 L240,295 L220,315 L180,340 L140,320 L150,295 Z', value: 0.55 },
  { id: 'evje-hornnes', name: 'Evje og Hornnes', path: 'M220,230 L260,220 L280,250 L270,280 L240,295 L220,275 Z', value: 0.45 },
  { id: 'bygland', name: 'Bygland', path: 'M220,160 L270,150 L290,185 L280,220 L260,220 L220,230 L210,195 Z', value: 0.1 },
  { id: 'valle', name: 'Valle', path: 'M230,90 L280,80 L310,110 L300,150 L270,150 L220,160 L215,125 Z', value: 0.08 },
  { id: 'bykle', name: 'Bykle', path: 'M210,30 L270,20 L310,50 L310,110 L280,80 L230,90 L210,60 Z', value: 0.05 },
  { id: 'setesdal', name: 'Åmli', path: 'M270,280 L280,250 L320,240 L360,250 L370,280 L350,310 L330,310 L290,330 L270,310 Z', value: 0.25 },
  { id: 'froland', name: 'Froland', path: 'M290,280 L330,270 L360,280 L370,315 L330,310 L290,330 Z', value: 0.4 },
  { id: 'tvedestrand', name: 'Tvedestrand', path: 'M370,315 L400,300 L420,320 L415,350 L380,340 Z', value: 0.55 },
  { id: 'risor', name: 'Risør', path: 'M400,270 L440,260 L455,290 L440,320 L420,320 L400,300 Z', value: 0.65 },
  { id: 'gjerstad', name: 'Gjerstad', path: 'M360,250 L400,240 L430,255 L440,260 L400,270 L370,280 Z', value: 0.3 },
  { id: 'vegardshei', name: 'Vegårdshei', path: 'M320,240 L360,230 L400,240 L360,250 Z', value: 0.2 },
  { id: 'iveland', name: 'Iveland', path: 'M240,295 L270,280 L290,280 L270,310 L220,315 Z', value: 0.38 },
  { id: 'sirdal', name: 'Sirdal', path: 'M20,260 L80,240 L120,270 L100,335 L60,330 L20,350 Z', value: 0.12 },
  { id: 'aseral', name: 'Åseral', path: 'M120,270 L180,250 L200,280 L180,290 L150,295 L140,320 L100,335 Z', value: 0.18 },
  { id: 'birkenes', name: 'Birkenes', path: 'M240,295 L270,280 L310,285 L330,310 L270,310 Z', value: 0.42 },
];

// Hatching pattern for "mangler data"
const HATCH_REGIONS = [
  { id: 'ocean-west', path: 'M0,445 L50,415 L80,440 L130,445 L150,425 L200,430 L225,410 L260,415 L280,400 L320,395 L365,365 L380,340 L415,350 L440,320 L455,290 L470,280 L470,470 L0,470 Z' },
];

interface ChoroplethMapProps {
  className?: string;
}

export function ChoroplethMap({ className }: ChoroplethMapProps) {
  const getColor = (value: number) => {
    const index = Math.min(Math.floor(value * CHOROPLETH_GREENS.length), CHOROPLETH_GREENS.length - 1);
    return CHOROPLETH_GREENS[index];
  };

  return (
    <svg viewBox="0 0 470 470" className={className} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ccc" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="470" height="470" fill="#f8f8f8" rx="8" />

      {/* Hatched ocean/no-data area */}
      {HATCH_REGIONS.map(r => (
        <path key={r.id} d={r.path} fill="url(#hatch)" stroke="#ddd" strokeWidth="0.5" />
      ))}

      {/* Municipality regions with choropleth coloring */}
      {REGIONS.map(region => (
        <path
          key={region.id}
          d={region.path}
          fill={getColor(region.value)}
          stroke="white"
          strokeWidth="1.5"
        >
          <title>{region.name}</title>
        </path>
      ))}
    </svg>
  );
}
