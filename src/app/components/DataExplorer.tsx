import { useState, useCallback } from 'react';
import { SideMenu } from './SideMenu';
import { MainPanel } from './MainPanel';
import { IndicatorMenu } from './IndicatorMenu';
import { MapPanel } from './MapPanel';
import { LandingPage } from './LandingPage';
import { ArrowLeft } from 'lucide-react';

export type VisualizationType = 'fordeling' | 'visning';
export type ChartType = 'bar' | 'line' | 'pie' | 'grid' | 'nokkeltall';
export type FordelingSubType = 'kart' | 'soyle' | 'kart_soyle';
export type GeoLevel = 'hele_landet' | 'fylke' | 'kommune' | 'sone' | 'levekaarssone';
export type IndicatorMode = 'single' | 'multi';
export type DisplayMode = 'antall' | 'andel';

export const GEO_LEVEL_HIERARCHY: Record<GeoLevel, number> = {
  hele_landet: 0,
  fylke: 1,
  kommune: 2,
  sone: 3,
  levekaarssone: 4,
};

export const GEO_LEVEL_LABELS: Record<GeoLevel, string> = {
  hele_landet: 'Hele landet',
  fylke: 'Fylke',
  kommune: 'Kommune',
  sone: 'Sone',
  levekaarssone: 'Levekårssone',
};

export function isGeoLevelAvailable(indicatorMinLevel: GeoLevel, currentLevel: GeoLevel): boolean {
  return GEO_LEVEL_HIERARCHY[currentLevel] <= GEO_LEVEL_HIERARCHY[indicatorMinLevel];
}

export interface SubOption {
  id: string;
  name: string;
}

export interface Indicator {
  id: string;
  name: string;
  category: string;
  supportedVisualizations: VisualizationType[];
  description: string;
  subOptions?: SubOption[];
  unit?: string;
  minGeoLevel: GeoLevel;
}

export interface Region {
  id: string;
  name: string;
  level: GeoLevel;
  parent?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface CuratedIndicatorSet {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  indicatorIds: string[];
  defaultVisualization: VisualizationType;
  defaultChartType: ChartType;
  defaultGeoLevel: GeoLevel;
  defaultRegions: string[];
}

export interface RecentEntry {
  type: 'indicator' | 'curated_set';
  id: string;
  name: string;
  timestamp: number;
  indicatorIds: string[];
}

export const CURATED_SETS: CuratedIndicatorSet[] = [
  {
    id: 'levekaar',
    name: 'Levekårsindeks',
    description: 'Samlet oversikt over sentrale levekårsindikatorer: inntekt, sysselsetting, utdanning og boforhold.',
    icon: 'Heart',
    color: '#3d5a4a',
    indicatorIds: ['medianinntekt', 'sysselsetting', 'utdanningsniva', 'aleneboende'],
    defaultVisualization: 'visning',
    defaultChartType: 'nokkeltall',
    defaultGeoLevel: 'kommune',
    defaultRegions: ['kristiansand'],
  },
  {
    id: 'befolkningsutvikling',
    name: 'Befolkningsutvikling',
    description: 'Følg befolkningsutviklingen over tid med aldersfordeling, flyttinger og familiestruktur.',
    icon: 'TrendingUp',
    color: '#2D6A8A',
    indicatorIds: ['aldersfordeling', 'flyttinger', 'familietyper'],
    defaultVisualization: 'visning',
    defaultChartType: 'line',
    defaultGeoLevel: 'fylke',
    defaultRegions: ['agder'],
  },
  {
    id: 'oppvekst-barn',
    name: 'Oppvekst og barn',
    description: 'Indikatorer knyttet til barns oppvekstvilkår: antall barn, barneflyttinger og enslige foreldre.',
    icon: 'Baby',
    color: '#6E448E',
    indicatorIds: ['barn', 'barn-enslige-foreldre', 'barneflyttinger'],
    defaultVisualization: 'visning',
    defaultChartType: 'bar',
    defaultGeoLevel: 'fylke',
    defaultRegions: ['agder'],
  },
  {
    id: 'arbeid-okonomi',
    name: 'Arbeid og økonomi',
    description: 'Sysselsettingsgrad og medianinntekt for å forstå det økonomiske landskapet i regionen.',
    icon: 'Briefcase',
    color: '#B8860B',
    indicatorIds: ['sysselsetting', 'medianinntekt'],
    defaultVisualization: 'visning',
    defaultChartType: 'line',
    defaultGeoLevel: 'kommune',
    defaultRegions: ['kristiansand'],
  },
  {
    id: 'regional-sammenligning',
    name: 'Regional sammenligning',
    description: 'Sammenlign nøkkeltall på tvers av fylker: alder, innvandrere, sysselsetting og inntekt.',
    icon: 'Map',
    color: '#c0392b',
    indicatorIds: ['alder-gjennomsnitt', 'innvandrere', 'sysselsetting', 'medianinntekt'],
    defaultVisualization: 'fordeling',
    defaultChartType: 'bar',
    defaultGeoLevel: 'fylke',
    defaultRegions: ['agder', 'rogaland', 'vestland'],
  },
  {
    id: 'utdanning-kompetanse',
    name: 'Utdanning og kompetanse',
    description: 'Utdanningsnivået i befolkningen fordelt på grunnskole, videregående og høyere utdanning.',
    icon: 'GraduationCap',
    color: '#1a6b5a',
    indicatorIds: ['utdanningsniva'],
    defaultVisualization: 'visning',
    defaultChartType: 'pie',
    defaultGeoLevel: 'kommune',
    defaultRegions: ['kristiansand'],
  },
];

// Comprehensive mock data
export const regions: Region[] = [
  // Hele landet
  { id: 'norge', name: 'Norge', level: 'hele_landet' },
  // Fylke
  { id: 'agder', name: 'Agder', level: 'fylke' },
  { id: 'rogaland', name: 'Rogaland', level: 'fylke' },
  { id: 'vestland', name: 'Vestland', level: 'fylke' },
  { id: 'oslo', name: 'Oslo', level: 'fylke' },
  { id: 'viken', name: 'Viken', level: 'fylke' },
  // Kommune
  { id: 'kristiansand', name: 'Kristiansand', level: 'kommune', parent: 'agder' },
  { id: 'arendal', name: 'Arendal', level: 'kommune', parent: 'agder' },
  { id: 'grimstad', name: 'Grimstad', level: 'kommune', parent: 'agder' },
  { id: 'lillesand', name: 'Lillesand', level: 'kommune', parent: 'agder' },
  { id: 'stavanger', name: 'Stavanger', level: 'kommune', parent: 'rogaland' },
  { id: 'sandnes', name: 'Sandnes', level: 'kommune', parent: 'rogaland' },
  { id: 'bergen', name: 'Bergen', level: 'kommune', parent: 'vestland' },
  // Sone
  { id: 'sone-kvadraturen', name: 'Kvadraturen', level: 'sone', parent: 'kristiansand' },
  { id: 'sone-vagsbygd', name: 'Vågsbygd', level: 'sone', parent: 'kristiansand' },
  { id: 'sone-randesund', name: 'Randesund', level: 'sone', parent: 'kristiansand' },
  { id: 'sone-lund', name: 'Lund', level: 'sone', parent: 'kristiansand' },
  { id: 'sone-hillevag', name: 'Hillevåg', level: 'sone', parent: 'stavanger' },
  { id: 'sone-storhaug', name: 'Storhaug', level: 'sone', parent: 'stavanger' },
  // Levekårssone
  { id: 'lk-kvadraturen-ost', name: 'Kvadraturen Øst', level: 'levekaarssone', parent: 'sone-kvadraturen' },
  { id: 'lk-kvadraturen-vest', name: 'Kvadraturen Vest', level: 'levekaarssone', parent: 'sone-kvadraturen' },
  { id: 'lk-vagsbygd-nord', name: 'Vågsbygd Nord', level: 'levekaarssone', parent: 'sone-vagsbygd' },
  { id: 'lk-vagsbygd-sor', name: 'Vågsbygd Sør', level: 'levekaarssone', parent: 'sone-vagsbygd' },
  { id: 'lk-hillevag-sentrum', name: 'Hillevåg Sentrum', level: 'levekaarssone', parent: 'sone-hillevag' },
];

export const indicators: Indicator[] = [
  {
    id: 'familietyper',
    name: 'Familietyper',
    category: 'Befolkning',
    supportedVisualizations: ['visning'],
    description: 'Data om familietyper er delt inn i ulike grupper, og to måltall er tilgjengelige: Antall personer i hver gruppe og andel (prosent) personer i hver gruppe. Gruppene er Enslige uten barn, enslige med barn 0-17 år, par uten barn, par med barn 0-17 år, enfamiliehusstander med voksne barn, flerfamiliehusholdninger (med eller uten barn).',
    subOptions: [
      { id: 'kjonn', name: 'Kjønn' },
      { id: 'aldersfordeling', name: 'Aldersfordeling' },
      { id: 'familietyper', name: 'Familietyper' },
      { id: 'sivilstand', name: 'Sivilstand' },
    ],
    unit: '%',
    minGeoLevel: 'kommune',
  },
  {
    id: 'aldersfordeling',
    name: 'Aldersfordeling',
    category: 'Befolkning',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Data om aldersfordeling viser hvordan befolkningen er fordelt inn i ulike aldersgrupper. Statistikken dekker aldersgrupper fra 0-5 år til 80+ år.',
    subOptions: [
      { id: '0-5', name: '0-5 år' },
      { id: '6-15', name: '6-15 år' },
      { id: '16-24', name: '16-24 år' },
      { id: '25-44', name: '25-44 år' },
      { id: '45-66', name: '45-66 år' },
      { id: '67-79', name: '67-79 år' },
      { id: '80+', name: '80+ år' },
    ],
    unit: 'personer',
    minGeoLevel: 'levekaarssone',
  },
  {
    id: 'alder-gjennomsnitt',
    name: 'Alder (gjennomsnitt)',
    category: 'Befolkning',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Data om alder viser gjennomsnittsalder for befolkningen i et område. Sist publisert: 2024-05-15. Datakilde: Statistisk sentralbyrå. Undersøking av nok tall klarer. Datakilde: SSB. Her vises opplysninger fra statistikk-banken.',
    unit: 'år',
    minGeoLevel: 'levekaarssone',
  },
  {
    id: 'flyttinger',
    name: 'Flyttinger',
    category: 'Befolkning',
    supportedVisualizations: ['visning'],
    description: 'Flyttestatistikk viser antall inn- og utflyttinger i et geografisk område. Inkluderer innenlands flytting og inn-/utvandring.',
    unit: 'personer',
    minGeoLevel: 'kommune',
  },
  {
    id: 'aleneboende',
    name: 'Aleneboende',
    category: 'Befolkning',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Statistikk om personer som bor alene i en husholdning. Inkluderer alle aldre og begge kjønn.',
    unit: 'personer',
    minGeoLevel: 'sone',
  },
  {
    id: 'innvandrere',
    name: 'Innvandrere',
    category: 'Befolkning',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Statistikk om innvandrere og norskfødte med innvandrerforeldre. Fordelt etter landbakgrunn og botid.',
    unit: 'personer',
    minGeoLevel: 'fylke',
  },
  {
    id: 'barn',
    name: 'Barn',
    category: 'Oppvekst',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Statistikk om barn i alderen 0-17 år. Inkluderer data om barnehagedekning, skoletilbud og levekår.',
    unit: 'personer',
    minGeoLevel: 'kommune',
  },
  {
    id: 'barn-enslige-foreldre',
    name: 'Barn med enslige foreldre',
    category: 'Oppvekst',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Antall barn som bor med én forelder. Fordelt etter alder og kommune.',
    unit: 'personer',
    minGeoLevel: 'fylke',
  },
  {
    id: 'barneflyttinger',
    name: 'Barneflyttinger',
    category: 'Oppvekst',
    supportedVisualizations: ['visning'],
    description: 'Statistikk om flyttinger blant barn under 18 år. Inkluderer både innenlands og utenlands flytting.',
    unit: 'personer',
    minGeoLevel: 'fylke',
  },
  {
    id: 'landareal-ssb-api',
    name: 'Landareal - SSB API',
    category: 'Geografi',
    supportedVisualizations: ['visning'],
    description: 'Landareal hentet fra SSB API. Viser totalt areal i kvadratkilometer.',
    unit: 'km²',
    minGeoLevel: 'levekaarssone',
  },
  {
    id: 'utdanningsniva',
    name: 'Utdanningsnivå',
    category: 'Utdanning',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Andel av befolkningen med ulike utdanningsnivåer: grunnskole, videregående og høyere utdanning.',
    subOptions: [
      { id: 'grunnskole', name: 'Grunnskole' },
      { id: 'vgs', name: 'Videregående' },
      { id: 'hoyere', name: 'Høyere utdanning' },
    ],
    unit: '%',
    minGeoLevel: 'kommune',
  },
  {
    id: 'sysselsetting',
    name: 'Sysselsetting',
    category: 'Arbeidsliv og stønader',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Sysselsettingsgrad for befolkningen i alderen 15-74 år.',
    unit: '%',
    minGeoLevel: 'sone',
  },
  {
    id: 'medianinntekt',
    name: 'Medianinntekt',
    category: 'Økonomi',
    supportedVisualizations: ['fordeling', 'visning'],
    description: 'Medianinntekt etter skatt for husholdninger. Oppgitt i tusen kroner.',
    unit: 'tusen kr',
    minGeoLevel: 'kommune',
  },
];

// Generate mock chart data per indicator and region
export function generateChartData(indicatorId: string, regionIds: string[]): ChartDataPoint[] {
  const seed = indicatorId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  const labels: Record<string, string[]> = {
    'familietyper': ['Ugift Mann', 'Ugift Kvinne', 'Gift', 'Enke/enkemann', 'Separert/skilt'],
    'aldersfordeling': ['0-5 år', '6-15 år', '16-24 år', '25-44 år', '45-66 år', '67-79 år', '80+ år'],
    'alder-gjennomsnitt': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'flyttinger': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'aleneboende': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'innvandrere': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'barn': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'barn-enslige-foreldre': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'barneflyttinger': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'landareal-ssb-api': ['Agder', 'Rogaland', 'Vestland', 'Oslo', 'Viken'],
    'utdanningsniva': ['Grunnskole', 'Videregående', 'Høyere utdanning'],
    'sysselsetting': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    'medianinntekt': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
  };

  const ranges: Record<string, [number, number]> = {
    'familietyper': [5, 35],
    'aldersfordeling': [500, 8000],
    'alder-gjennomsnitt': [38, 44],
    'flyttinger': [50, 200],
    'aleneboende': [100, 400],
    'innvandrere': [30, 150],
    'barn': [80, 250],
    'barn-enslige-foreldre': [10, 60],
    'barneflyttinger': [3, 15],
    'landareal-ssb-api': [400, 16000],
    'utdanningsniva': [15, 50],
    'sysselsetting': [60, 80],
    'medianinntekt': [350, 550],
  };

  const cats = labels[indicatorId] || ['A', 'B', 'C', 'D', 'E'];
  const [lo, hi] = ranges[indicatorId] || [10, 100];

  return cats.map((name, i) => {
    const point: ChartDataPoint = { name };
    const activeRegions = regionIds.length > 0 ? regionIds : ['agder'];
    activeRegions.forEach((regionId, ri) => {
      const regionLabel = regions.find(r => r.id === regionId)?.name || regionId;
      const val = lo + rng(i * 100 + ri * 17 + seed) * (hi - lo);
      point[regionLabel] = Math.round(val * 10) / 10;
    });
    return point;
  });
}

// Generate key figure values for nokkeltall
export function generateKeyFigure(indicatorId: string, regionId: string): number {
  const seed = (indicatorId + regionId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = ((seed * 9301 + 49297) % 233280) / 233280;

  const ranges: Record<string, [number, number]> = {
    'alder-gjennomsnitt': [36, 45],
    'flyttinger': [40, 200],
    'aleneboende': [100, 400],
    'innvandrere': [30, 200],
    'barn': [80, 300],
    'barn-enslige-foreldre': [10, 80],
    'barneflyttinger': [2, 20],
    'landareal-ssb-api': [400, 16000],
    'sysselsetting': [60, 82],
    'medianinntekt': [350, 600],
  };

  const [lo, hi] = ranges[indicatorId] || [10, 500];
  return Math.round((lo + rng * (hi - lo)) * 10) / 10;
}

// Map positions for region markers on map overlays
export const REGION_POSITIONS: Record<string, { top: string; left: string }> = {
  norge: { top: '40%', left: '35%' },
  agder: { top: '72%', left: '35%' },
  rogaland: { top: '62%', left: '22%' },
  vestland: { top: '48%', left: '20%' },
  oslo: { top: '52%', left: '45%' },
  viken: { top: '55%', left: '42%' },
  kristiansand: { top: '75%', left: '32%' },
  arendal: { top: '73%', left: '37%' },
  grimstad: { top: '74%', left: '35%' },
  lillesand: { top: '74%', left: '33%' },
  stavanger: { top: '64%', left: '18%' },
  sandnes: { top: '65%', left: '20%' },
  bergen: { top: '50%', left: '16%' },
  'sone-kvadraturen': { top: '76%', left: '31%' },
  'sone-vagsbygd': { top: '77%', left: '29%' },
  'sone-randesund': { top: '75%', left: '34%' },
  'sone-lund': { top: '74%', left: '30%' },
  'sone-hillevag': { top: '63%', left: '17%' },
  'sone-storhaug': { top: '65%', left: '19%' },
  'lk-kvadraturen-ost': { top: '76%', left: '32%' },
  'lk-kvadraturen-vest': { top: '76%', left: '30%' },
  'lk-vagsbygd-nord': { top: '76%', left: '28%' },
  'lk-vagsbygd-sor': { top: '78%', left: '29%' },
  'lk-hillevag-sentrum': { top: '63%', left: '16%' },
};

// Color palette for multi-region charts
export const CHART_COLORS = [
  '#3d5a4a', '#89a975', '#2d5a1e', '#a5bd8f', '#c0d1a9',
  '#5e7652', '#6b8f5b', '#3d6630', '#b8cca8', '#4a5e40',
];

// localStorage helpers for recent history
const RECENT_STORAGE_KEY = 'dataexplorer-recent-history';
const MAX_RECENT_ENTRIES = 8;

function loadRecentHistory(): RecentEntry[] {
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as RecentEntry[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_RECENT_ENTRIES);
  } catch {
    return [];
  }
}

function saveToRecentHistory(entry: RecentEntry): void {
  try {
    const existing = loadRecentHistory();
    const filtered = existing.filter(e => !(e.type === entry.type && e.id === entry.id));
    const updated = [entry, ...filtered].slice(0, MAX_RECENT_ENTRIES);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function DataExplorer() {
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>(() => loadRecentHistory());
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('visning');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [fordelingSubType, setFordelingSubType] = useState<FordelingSubType>('kart');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['familietyper']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['agder', 'norge']);
  const [geoLevel, setGeoLevel] = useState<GeoLevel>('fylke');
  const [indicatorMode, setIndicatorMode] = useState<IndicatorMode>('single');
  const [selectedSubOption, setSelectedSubOption] = useState<string>('sivilstand');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('antall');
  const [menuExpanded, setMenuExpanded] = useState(true);
  const [sideMenuCollapsed, setSideMenuCollapsed] = useState(false);

  const handleVisualizationChange = useCallback((type: VisualizationType) => {
    setVisualizationType(type);
    setIndicatorMode('single');
    // Keep current indicator - if incompatible, the warning in MainPanel will show
    setSelectedIndicators(prev => prev.length > 0 ? [prev[0]] : ['aldersfordeling']);
  }, []);

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type);
    if (type === 'nokkeltall') {
      setIndicatorMode('multi');
      setSelectedIndicators(prev => prev.length > 0 ? prev : ['alder-gjennomsnitt']);
    } else {
      setIndicatorMode('single');
      setSelectedIndicators(prev => prev.length > 0 ? [prev[0]] : prev);
    }
  }, []);

  const handleIndicatorToggle = useCallback((indicatorId: string) => {
    if (indicatorMode === 'multi') {
      setSelectedIndicators(prev => {
        if (prev.includes(indicatorId)) {
          return prev.length > 1 ? prev.filter(id => id !== indicatorId) : prev;
        }
        return [...prev, indicatorId];
      });
    } else {
      setSelectedIndicators([indicatorId]);
    }
    const ind = indicators.find(i => i.id === indicatorId);
    if (ind) {
      saveToRecentHistory({
        type: 'indicator',
        id: indicatorId,
        name: ind.name,
        timestamp: Date.now(),
        indicatorIds: [indicatorId],
      });
      setRecentEntries(loadRecentHistory());
    }
  }, [indicatorMode]);

  const handleSetPrimaryRegion = useCallback((regionId: string) => {
    setSelectedRegions(prev => {
      // Replace the first element (primary) with the new region, keep comparison areas
      const comparisons = prev.slice(1).filter(id => id !== regionId);
      return [regionId, ...comparisons];
    });
  }, []);

  const handleAddComparisonRegion = useCallback((regionId: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(regionId)) return prev;
      if (prev.length >= 6) return prev; // 1 primary + 5 comparisons max
      return [...prev, regionId];
    });
  }, []);

  const handleRemoveComparisonRegion = useCallback((regionId: string) => {
    setSelectedRegions(prev => {
      // Never remove the first (primary) region
      if (prev[0] === regionId) return prev;
      return prev.filter(id => id !== regionId);
    });
  }, []);

  const handleGeoLevelChange = useCallback((level: GeoLevel) => {
    setGeoLevel(level);
    const firstRegionAtLevel = regions.find(r => r.level === level);
    if (firstRegionAtLevel) {
      setSelectedRegions([firstRegionAtLevel.id]);
    }
  }, []);

  const handleIndicatorModeChange = useCallback((mode: IndicatorMode) => {
    setIndicatorMode(mode);
    if (mode === 'single' && selectedIndicators.length > 1) {
      setSelectedIndicators([selectedIndicators[0]]);
    }
  }, [selectedIndicators]);

  const handleSelectCuratedSet = useCallback((set: CuratedIndicatorSet) => {
    if (set.defaultChartType === 'nokkeltall' && set.indicatorIds.length > 1) {
      setIndicatorMode('multi');
      setSelectedIndicators(set.indicatorIds);
    } else {
      setIndicatorMode('single');
      setSelectedIndicators(set.indicatorIds.length > 0 ? [set.indicatorIds[0]] : ['familietyper']);
    }
    setVisualizationType(set.defaultVisualization);
    setChartType(set.defaultChartType);
    setGeoLevel(set.defaultGeoLevel);
    setSelectedRegions(set.defaultRegions);
    saveToRecentHistory({
      type: 'curated_set',
      id: set.id,
      name: set.name,
      timestamp: Date.now(),
      indicatorIds: set.indicatorIds,
    });
    setRecentEntries(loadRecentHistory());
    setShowLandingPage(false);
  }, []);

  const handleSelectRecentIndicator = useCallback((entry: RecentEntry) => {
    if (entry.type === 'curated_set') {
      const set = CURATED_SETS.find(s => s.id === entry.id);
      if (set) {
        handleSelectCuratedSet(set);
        return;
      }
    }
    setSelectedIndicators([entry.id]);
    setVisualizationType('visning');
    setChartType('line');
    setIndicatorMode('single');
    saveToRecentHistory({ ...entry, timestamp: Date.now() });
    setRecentEntries(loadRecentHistory());
    setShowLandingPage(false);
  }, [handleSelectCuratedSet]);

  const handleSelectIndicatorFromLibrary = useCallback((indicatorId: string) => {
    const ind = indicators.find(i => i.id === indicatorId);
    if (!ind) return;
    setSelectedIndicators([indicatorId]);
    setVisualizationType('visning');
    setChartType('line');
    setIndicatorMode('single');
    saveToRecentHistory({
      type: 'indicator',
      id: indicatorId,
      name: ind.name,
      timestamp: Date.now(),
      indicatorIds: [indicatorId],
    });
    setRecentEntries(loadRecentHistory());
    setShowLandingPage(false);
  }, []);

  const selectedIndicatorObjects = indicators.filter(ind =>
    selectedIndicators.includes(ind.id)
  );

  const areIndicatorsCompatible = selectedIndicatorObjects.every(ind =>
    ind.supportedVisualizations.includes(visualizationType)
  );

  const areIndicatorsGeoCompatible = selectedIndicatorObjects.every(ind =>
    isGeoLevelAvailable(ind.minGeoLevel, geoLevel)
  );

  return (
    <>
      <SideMenu collapsed={sideMenuCollapsed} onToggle={() => setSideMenuCollapsed(!sideMenuCollapsed)} onNavigateHome={() => setShowLandingPage(true)} />
      <div className="flex-1 flex flex-col gap-[16px] p-[16px] min-w-0 overflow-y-auto">
        {/* Floating header bar */}
        <div className="bg-white rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-between px-[24px] py-[10px] shrink-0">
          <div className="flex items-center gap-[8px]">
            <div className="w-[3px] h-[20px] bg-[#89B56B] rounded-full" />
            <span className="font-['Epilogue',sans-serif] font-medium text-[18px] text-[#2d2d2d]">
              {showLandingPage ? 'Indikatorbibliotek' : 'Datautforsker'}
            </span>
            {!showLandingPage && (
              <button
                onClick={() => setShowLandingPage(true)}
                className="ml-[8px] flex items-center gap-[4px] px-[12px] py-[5px] text-[13px] text-[#3d5a4a] hover:bg-[#f5f5f5] rounded-[6px] transition-colors"
              >
                <ArrowLeft className="w-[14px] h-[14px]" />
                Bibliotek
              </button>
            )}
          </div>
          {!showLandingPage && (
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="w-[34px] h-[34px] bg-[#3d5a4a] rounded-[6px] hover:bg-[#2d4a3a] transition-colors flex items-center justify-center"
              title={isFullscreen ? 'Lukk fullskjerm' : 'Fullskjerm'}
            >
              {isFullscreen
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              }
            </button>
          )}
        </div>

        {showLandingPage ? (
          <LandingPage
            curatedSets={CURATED_SETS}
            recentEntries={recentEntries}
            onSelectIndicator={handleSelectIndicatorFromLibrary}
            onSelectCuratedSet={handleSelectCuratedSet}
            onSelectRecentIndicator={handleSelectRecentIndicator}
          />
        ) : (
          <>
            <MainPanel
              visualizationType={visualizationType}
              chartType={chartType}
              fordelingSubType={fordelingSubType}
              selectedIndicators={selectedIndicatorObjects}
              selectedRegions={selectedRegions}
              areIndicatorsCompatible={areIndicatorsCompatible}
              areIndicatorsGeoCompatible={areIndicatorsGeoCompatible}
              onVisualizationChange={handleVisualizationChange}
              onChartTypeChange={handleChartTypeChange}
              onFordelingSubTypeChange={setFordelingSubType}
              menuExpanded={menuExpanded}
              onToggleMenu={() => setMenuExpanded(prev => !prev)}
              geoLevel={geoLevel}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(prev => !prev)}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
            />
            {menuExpanded && !isFullscreen && (
              <div className="flex gap-[16px] h-[600px] shrink-0">
                <MapPanel
                  selectedRegions={selectedRegions}
                  geoLevel={geoLevel}
                  onGeoLevelChange={handleGeoLevelChange}
                  onSetPrimaryRegion={handleSetPrimaryRegion}
                  onAddComparisonRegion={handleAddComparisonRegion}
                  onRemoveComparisonRegion={handleRemoveComparisonRegion}
                />
                <IndicatorMenu
                  visualizationType={visualizationType}
                  selectedIndicators={selectedIndicators}
                  onIndicatorToggle={handleIndicatorToggle}
                  indicatorMode={indicatorMode}
                  onIndicatorModeChange={handleIndicatorModeChange}
                  selectedSubOption={selectedSubOption}
                  onSubOptionChange={setSelectedSubOption}
                  geoLevel={geoLevel}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
