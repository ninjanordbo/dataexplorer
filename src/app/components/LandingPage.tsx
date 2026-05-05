import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronUp, X,
  TrendingUp, Baby, Briefcase,  GraduationCap,
  Clock, Briefcase as BriefcaseIcon, Home, ShieldCheck, Leaf,
} from 'lucide-react';
import type { CuratedIndicatorSet, VisualizationType, GeoLevel, RecentEntry } from './DataExplorer';
import { indicators, GEO_LEVEL_LABELS } from './DataExplorer';

interface LandingPageProps {
  curatedSets: CuratedIndicatorSet[];
  recentEntries: RecentEntry[];
  onSelectIndicator: (indicatorId: string) => void;
  onSelectCuratedSet: (set: CuratedIndicatorSet) => void;
  onSelectRecentIndicator: (entry: RecentEntry) => void;
}

const ALL_CATEGORIES = [
  { name: 'Befolkning', Icon: TrendingUp },
  { name: 'Arbeidsliv og stønader', Icon: BriefcaseIcon },
  { name: 'Bolig', Icon: Home },
  { name: 'Utdanning', Icon: GraduationCap },
  { name: 'Helse', Icon: ShieldCheck },
  { name: 'Klima & Miljø', Icon: Leaf },
  { name: 'Økonomi', Icon: Briefcase },
  { name: 'Oppvekst', Icon: Baby },
];

const FILTER_CATEGORIES = ['Befolkning', 'Økonomi', 'Arbeidsliv og stønader', 'Bolig', 'Geografi', 'Utdanning', 'Oppvekst'];

// Format relative time in Norwegian
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const years = Math.floor(diff / (86400000 * 365));
  if (minutes < 2) return 'Akkurat nå';
  if (hours < 1) return `${minutes} minutter siden`;
  if (hours < 24) return `${hours} time${hours > 1 ? 'r' : ''} siden`;
  if (days < 7) return `${days} dag${days > 1 ? 'er' : ''} siden`;
  if (years < 1) return `${Math.floor(days / 7)} uke${Math.floor(days / 7) > 1 ? 'r' : ''} siden`;
  return `${years} år siden`;
}

// Fake recent entries for demo when localStorage is empty
const DEMO_RECENT: RecentEntry[] = [
  {
    type: 'indicator',
    id: 'familietyper',
    name: 'Familietyper i Agder fylke',
    timestamp: Date.now() - 2 * 3600000,
    indicatorIds: ['familietyper'],
  },
  {
    type: 'indicator',
    id: 'medianinntekt',
    name: 'Boligpriser i Oslo',
    timestamp: Date.now() - 365 * 86400000,
    indicatorIds: ['medianinntekt'],
  },
  {
    type: 'indicator',
    id: 'barn',
    name: 'Barnefattigdom 2023',
    timestamp: Date.now() - 3 * 86400000,
    indicatorIds: ['barn'],
  },
  {
    type: 'indicator',
    id: 'sysselsetting',
    name: 'Sysselsetting Kristiansand',
    timestamp: Date.now() - 7 * 86400000,
    indicatorIds: ['sysselsetting'],
  },
];

const DEMO_RECENT_TAGS: Record<string, string[]> = {
  familietyper: ['Befolkning', 'Agder'],
  medianinntekt: ['Bolig', 'Oslo'],
  barn: ['Økonomi', 'Nasjonalt'],
  sysselsetting: ['Arbeid', 'Kommune'],
};

export function LandingPage({
  curatedSets,
  recentEntries,
  onSelectIndicator,
  onSelectCuratedSet,
  onSelectRecentIndicator,
}: LandingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterVisualization, setFilterVisualization] = useState<VisualizationType[]>([]);
  const [filterGeoLevels, setFilterGeoLevels] = useState<GeoLevel[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);
  const [showVisualizationFilter, setShowVisualizationFilter] = useState(false);
  const [showGeoFilter, setShowGeoFilter] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Compute category counts (show all 8 regardless of count)
  const categoryData = useMemo(() => {
    return ALL_CATEGORIES.map(cat => ({
      ...cat,
      count: indicators.filter(ind => ind.category === cat.name).length,
    }));
  }, []);

  // When a category card is clicked, set the filter
  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
      setFilterCategories(prev => prev.filter(c => c !== catName));
    } else {
      setSelectedCategory(catName);
      setFilterCategories([catName]);
    }
  };

  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      if (searchTerm && !ind.name.toLowerCase().includes(searchTerm.toLowerCase()) && !ind.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(ind.category)) return false;
      if (filterVisualization.length > 0 && !filterVisualization.some(v => ind.supportedVisualizations.includes(v))) return false;
      if (filterGeoLevels.length > 0) {
        const geoOrder: GeoLevel[] = ['hele_landet', 'fylke', 'kommune', 'sone', 'levekaarssone'];
        const indLevel = geoOrder.indexOf(ind.minGeoLevel);
        if (!filterGeoLevels.some(gl => geoOrder.indexOf(gl) >= indLevel)) return false;
      }
      return true;
    });
  }, [searchTerm, filterCategories, filterVisualization, filterGeoLevels]);

  // Group filtered indicators by category
  const groupedIndicators = useMemo(() => {
    const groups: Record<string, typeof indicators> = {};
    filteredIndicators.forEach(ind => {
      if (!groups[ind.category]) groups[ind.category] = [];
      groups[ind.category].push(ind);
    });
    return groups;
  }, [filteredIndicators]);

  const activeGroupCategories = Object.keys(groupedIndicators);

  const toggleFilterCategory = (cat: string) => {
    setFilterCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    // Sync with selectedCategory highlight
    if (filterCategories.includes(cat)) setSelectedCategory(null);
    else setSelectedCategory(cat);
  };

  const toggleFilterVisualization = (vis: VisualizationType) => {
    setFilterVisualization(prev =>
      prev.includes(vis) ? prev.filter(v => v !== vis) : [...prev, vis]
    );
  };

  const toggleFilterGeoLevel = (gl: GeoLevel) => {
    setFilterGeoLevels(prev =>
      prev.includes(gl) ? prev.filter(g => g !== gl) : [...prev, gl]
    );
  };

  const hasActiveFilters = filterCategories.length > 0 || filterVisualization.length > 0 || filterGeoLevels.length > 0 || searchTerm;

  const clearAllFilters = () => {
    setFilterCategories([]);
    setFilterVisualization([]);
    setFilterGeoLevels([]);
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const selectedIndicator = selectedIndicatorId
    ? indicators.find(i => i.id === selectedIndicatorId)
    : null;

  // Merge real recent entries with demo entries to always show 4 cards
  const displayedRecent = (() => {
    const real = recentEntries.slice(0, 4);
    if (real.length >= 4) return real;
    const realIds = new Set(real.map(e => e.id));
    const filler = DEMO_RECENT.filter(e => !realIds.has(e.id));
    return [...real, ...filler].slice(0, 4);
  })();

  return (
    <div className="flex-1 flex flex-col gap-0 min-h-0 overflow-y-auto bg-[#f7f8f7]">

      {/* ── Nylig utforsket ── */}
      <section className="px-[28px] pt-[24px] pb-[0px]">
        <div className="flex items-center gap-[8px] mb-[14px]">
          <div className="w-[3px] h-[16px] bg-[#89B56B] rounded-full" />
          <span className="font-['Epilogue',sans-serif] font-semibold text-[15px] text-[#2d2d2d]">Nylig utforsket</span>
        </div>
        <div className="flex gap-[14px]">
          {displayedRecent.map((entry, i) => {
            const tags = DEMO_RECENT_TAGS[entry.id] || [entry.indicatorIds[0]];
            return (
              <button
                key={entry.id + i}
                onClick={() => onSelectRecentIndicator(entry)}
                className="flex-1 bg-white rounded-[12px] border border-[#e8e8e8] shadow-[0_1px_4px_rgba(0,0,0,0.05)] px-[18px] py-[16px] text-left hover:border-[#c8d8c8] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-[12px]">
                  <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f5f5f5] flex items-center justify-center shrink-0 mt-[1px]">
                    <Clock className="w-[14px] h-[14px] text-[#9aaa99]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['Epilogue',sans-serif] font-semibold text-[13px] text-[#2d2d2d] leading-[19px] mb-[3px] group-hover:text-[#3d5a4a] transition-colors">
                      {entry.name}
                    </div>
                    <div className="text-[11px] text-[#a0a0a0] mb-[10px]">
                      Sist åpnet: {formatRelativeTime(entry.timestamp)}
                    </div>
                    <div className="flex gap-[5px] flex-wrap">
                      {tags.map(tag => (
                        <span key={tag} className="px-[8px] py-[2px] bg-[#f2f4f2] rounded-[5px] text-[10px] font-medium text-[#6a7a6a]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Velg kategori ── */}
      <section className="px-[28px] pt-[24px] pb-[0px]">
        <div className="flex items-center justify-between mb-[14px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-[3px] h-[16px] bg-[#89B56B] rounded-full" />
            <span className="font-['Epilogue',sans-serif] font-semibold text-[15px] text-[#2d2d2d]">Velg kategori</span>
          </div>
          <button className="text-[12px] text-[#3d5a4a] font-medium hover:underline">Se alle kategorier</button>
        </div>
        <div className="grid grid-cols-8 gap-[10px]">
          {categoryData.slice(0, 8).map(({ name, count, Icon }) => {
            const isSelected = selectedCategory === name;
            return (
              <button
                key={name}
                onClick={() => handleCategoryClick(name)}
                className={`rounded-[12px] border px-[10px] py-[16px] flex flex-col items-center gap-[8px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3d5a4a] border-[#3d5a4a] shadow-[0_2px_8px_rgba(61,90,74,0.25)]'
                    : 'bg-white border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#c8d8c8] hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)]'
                }`}
              >
                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-[#eef4e8]'}`}>
                  <Icon className={`w-[16px] h-[16px] ${isSelected ? 'text-white' : 'text-[#89B56B]'}`} />
                </div>
                <div className={`font-['Epilogue',sans-serif] font-semibold text-[11px] text-center leading-tight ${isSelected ? 'text-white' : 'text-[#2d2d2d]'}`}>
                  {name}
                </div>
                <div className={`text-[10px] text-center ${isSelected ? 'text-white/70' : 'text-[#a0a0a0]'}`}>
                  {count} indikatorsett
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Indikatormeny ── */}
      <section className="px-[28px] pt-[24px] pb-[28px] flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-[8px] mb-[14px]">
          <div className="w-[3px] h-[16px] bg-[#89B56B] rounded-full" />
          <span className="font-['Epilogue',sans-serif] font-semibold text-[15px] text-[#2d2d2d]">Indikatormeny</span>
        </div>

        <div className="flex-1 bg-white rounded-[14px] border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex overflow-hidden" style={{ minHeight: 380 }}>

          {/* ── Left: Filtervalg ── */}
          <div className="w-[190px] shrink-0 border-r border-[#efefef] overflow-y-auto bg-[#fafafa] px-[16px] py-[16px]">
            <div className="flex items-center justify-between mb-[14px]">
              <span className="font-['Epilogue',sans-serif] font-semibold text-[11px] text-[#999] tracking-[0.07em] uppercase">
                Filtervalg
              </span>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-[10px] text-[#3d5a4a] hover:underline font-medium">
                  Nullstill
                </button>
              )}
            </div>

            {/* Kategori filter */}
            <div className="mb-[4px]">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="flex items-center justify-between w-full text-[12px] text-[#3a3a3a] font-semibold py-[5px]"
              >
                <span>Kategori</span>
                {showCategoryFilter ? <ChevronUp className="w-[13px] h-[13px] text-[#aaa]" /> : <ChevronDown className="w-[13px] h-[13px] text-[#aaa]" />}
              </button>
              {showCategoryFilter && (
                <div className="mt-[4px] space-y-[5px]">
                  {FILTER_CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-[7px] text-[12px] text-[#606060] cursor-pointer py-[1px] hover:text-[#2d2d2d] transition-colors">
                        <input
                          type="checkbox"
                          checked={filterCategories.includes(cat)}
                          onChange={() => toggleFilterCategory(cat)}
                          className="w-[14px] h-[14px] rounded-[3px] border-[#d0d0d0] accent-[#3d5a4a] shrink-0"
                        />
                        <span className="flex-1">{cat}</span>
                      </label>
                  ))}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ebebeb] my-[10px]" />

            {/* Visualisering filter */}
            <div className="mb-[4px]">
              <button
                onClick={() => setShowVisualizationFilter(!showVisualizationFilter)}
                className="flex items-center justify-between w-full text-[12px] text-[#3a3a3a] font-semibold py-[5px]"
              >
                <span>Visualisering</span>
                {showVisualizationFilter ? <ChevronUp className="w-[13px] h-[13px] text-[#aaa]" /> : <ChevronDown className="w-[13px] h-[13px] text-[#aaa]" />}
              </button>
              {showVisualizationFilter && (
                <div className="mt-[4px] space-y-[5px]">
                  {(['visning', 'fordeling'] as VisualizationType[]).map(vis => (
                    <label key={vis} className="flex items-center gap-[7px] text-[12px] text-[#606060] cursor-pointer py-[1px] hover:text-[#2d2d2d] transition-colors">
                      <input
                        type="checkbox"
                        checked={filterVisualization.includes(vis)}
                        onChange={() => toggleFilterVisualization(vis)}
                        className="w-[14px] h-[14px] rounded-[3px] border-[#d0d0d0] accent-[#3d5a4a]"
                      />
                      <span>{vis === 'fordeling' ? 'Underområder' : 'Hovedområde'}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ebebeb] my-[10px]" />

            {/* Geografisk nivå filter */}
            <div className="mb-[4px]">
              <button
                onClick={() => setShowGeoFilter(!showGeoFilter)}
                className="flex items-center justify-between w-full text-[12px] text-[#3a3a3a] font-semibold py-[5px]"
              >
                <span>Geografisk nivå</span>
                {showGeoFilter ? <ChevronUp className="w-[13px] h-[13px] text-[#aaa]" /> : <ChevronDown className="w-[13px] h-[13px] text-[#aaa]" />}
              </button>
              {showGeoFilter && (
                <div className="mt-[4px] space-y-[5px]">
                  {(['hele_landet', 'fylke', 'kommune', 'sone', 'levekaarssone'] as GeoLevel[]).map(level => (
                    <label key={level} className="flex items-center gap-[7px] text-[12px] text-[#606060] cursor-pointer py-[1px] hover:text-[#2d2d2d] transition-colors">
                      <input
                        type="checkbox"
                        checked={filterGeoLevels.includes(level)}
                        onChange={() => toggleFilterGeoLevel(level)}
                        className="w-[14px] h-[14px] rounded-[3px] border-[#d0d0d0] accent-[#3d5a4a]"
                      />
                      <span>{GEO_LEVEL_LABELS[level]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="h-[1px] bg-[#ebebeb] my-[10px]" />

            {/* Tidsperiode (placeholder) */}
            <div className="mb-[4px]">
              <button className="flex items-center justify-between w-full text-[12px] text-[#3a3a3a] font-semibold py-[5px]">
                <span>Tidsperiode</span>
                <ChevronDown className="w-[13px] h-[13px] text-[#aaa]" />
              </button>
            </div>
          </div>

          {/* ── Middle: Søk + indicator list ── */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-[#efefef]">

            {/* Search bar */}
            <div className="px-[14px] pt-[14px] pb-[10px] shrink-0 border-b border-[#f0f0f0]">
              <div className="relative">
                <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#b8b8b8]" />
                <input
                  type="text"
                  placeholder="Søk indikator"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-[32px] pr-[30px] py-[7px] border border-[#e0e0e0] rounded-[8px] text-[12px] text-[#2d2d2d] bg-white focus:outline-none focus:border-[#3d5a4a] focus:ring-1 focus:ring-[#3d5a4a]/20 transition-all placeholder:text-[#c0c0c0]"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-[9px] top-1/2 -translate-y-1/2">
                    <X className="w-[12px] h-[12px] text-[#b0b0b0] hover:text-[#606060]" />
                  </button>
                )}
              </div>

              {/* Active filter chips + count */}
              <div className="mt-[8px] flex items-center justify-between">
                <div className="flex items-center gap-[5px] flex-wrap">
                  {filterCategories.length > 0 && (
                    <div className="text-[10px] text-[#888]">Aktive filtre:</div>
                  )}
                  {filterCategories.map(cat => (
                    <span key={cat} className="flex items-center gap-[3px] bg-[#e8f0e8] text-[#3d5a4a] text-[10px] font-medium px-[7px] py-[2px] rounded-[5px]">
                      {cat}
                      <button onClick={() => toggleFilterCategory(cat)}>
                        <X className="w-[9px] h-[9px]" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-[#aaa] whitespace-nowrap shrink-0 font-normal">
                  Viser {filteredIndicators.length} av {indicators.length} indikatorer
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="ml-[6px] text-[10px] font-medium text-[#3d5a4a] hover:underline normal-case">Nullstill alle</button>
                  )}
                </div>
              </div>
            </div>

            {/* Indicator list grouped by category */}
            <div className="flex-1 overflow-y-auto">
              {activeGroupCategories.length === 0 ? (
                <div className="px-[14px] py-[40px] text-center">
                  <Search className="w-[20px] h-[20px] text-[#ddd] mx-auto mb-[8px]" />
                  <div className="text-[12px] text-[#999]">Ingen treff</div>
                  <button onClick={clearAllFilters} className="mt-[4px] text-[11px] text-[#3d5a4a] hover:underline font-medium">
                    Nullstill filtre
                  </button>
                </div>
              ) : (
                activeGroupCategories.map(category => (
                  <div key={category}>
                    {/* Category header */}
                    <div className="px-[14px] py-[7px] bg-[#fafafa] border-b border-[#f0f0f0] flex items-center justify-between sticky top-0 z-10">
                      <span className="font-['Epilogue',sans-serif] font-semibold text-[11px] text-[#888] tracking-[0.04em]">
                        {category}
                      </span>
                      <ChevronDown className="w-[12px] h-[12px] text-[#ccc]" />
                    </div>

                    {groupedIndicators[category].map((ind) => {
                      const isSelected = selectedIndicatorId === ind.id;
                      return (
                        <button
                          key={ind.id}
                          onClick={() => setSelectedIndicatorId(ind.id)}
                          className={`w-full text-left px-[14px] py-[10px] border-b border-[#f5f5f5] transition-colors ${
                            isSelected
                              ? 'bg-[#f0f5f1]'
                              : 'hover:bg-[#fafbfa]'
                          }`}
                        >
                          <div className="flex items-center gap-[8px]">
                            <div className={`w-[8px] h-[8px] rounded-full shrink-0 border-2 transition-colors ${isSelected ? 'bg-[#3d5a4a] border-[#3d5a4a]' : 'bg-transparent border-[#d0d0d0]'}`} />
                            <span className={`font-['Epilogue',sans-serif] font-medium text-[12px] leading-tight flex-1 ${isSelected ? 'text-[#3d5a4a]' : 'text-[#3a3a3a]'}`}>
                              {ind.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Right: Indikatorbeskrivelse ── */}
          <div className="w-[380px] shrink-0 overflow-y-auto">
            {selectedIndicator ? (
              <div className="p-[18px]">
                <div className="flex items-start justify-between mb-[14px]">
                  <div>
                    <div className="text-[11px] font-semibold text-[#999] tracking-[0.06em] uppercase mb-[4px]">
                      Indikatorbeskrivelse
                    </div>
                    <div className="font-['Epilogue',sans-serif] font-bold text-[14px] text-[#2d2d2d]">
                      {selectedIndicator.name}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectIndicator(selectedIndicator.id)}
                    className="shrink-0 ml-[10px] px-[12px] py-[6px] bg-[#3d5a4a] text-white text-[11px] font-semibold rounded-[8px] hover:bg-[#2d4a3a] transition-colors whitespace-nowrap"
                  >
                    Velg denne
                  </button>
                </div>

                <p className="text-[12px] text-[#606060] leading-[19px] mb-[16px]">
                  {selectedIndicator.description}
                </p>

                {/* Data source */}
                <div className="bg-[#f8f9f8] rounded-[8px] border border-[#eaeaea] px-[12px] py-[10px] mb-[14px]">
                  <div className="text-[9px] font-semibold text-[#aaa] tracking-[0.08em] uppercase mb-[5px]">Datakilde</div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[14px] h-[14px] bg-[#e0e7e0] rounded-[3px] flex items-center justify-center shrink-0">
                      <span className="text-[7px] font-bold text-[#3d5a4a]">≡</span>
                    </div>
                    <span className="text-[11px] text-[#555]">Statistisk Sentralbyrå (SSB) - Tabell 12345</span>
                  </div>
                </div>

                {/* Additional info */}
                {selectedIndicator.unit && (
                  <div className="flex items-center gap-[6px] mb-[8px]">
                    <span className="text-[10px] text-[#aaa]">Enhet:</span>
                    <span className="text-[11px] font-medium text-[#555]">{selectedIndicator.unit}</span>
                  </div>
                )}

                <div className="flex items-center gap-[6px] mb-[8px]">
                  <span className="text-[10px] text-[#aaa]">Geografisk nivå:</span>
                  <span className="text-[11px] font-medium text-[#555]">{GEO_LEVEL_LABELS[selectedIndicator.minGeoLevel]}</span>
                </div>

                {selectedIndicator.subOptions && selectedIndicator.subOptions.length > 0 && (
                  <div className="mt-[12px]">
                    <div className="text-[10px] text-[#aaa] mb-[6px]">Underkategorier:</div>
                    <div className="flex flex-wrap gap-[5px]">
                      {selectedIndicator.subOptions.map(opt => (
                        <span key={opt.id} className="px-[7px] py-[2px] bg-[#f2f4f2] border border-[#e4e8e4] rounded-[5px] text-[10px] text-[#606060]">
                          {opt.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-[14px] text-[11px] text-[#8a8a8a] leading-[17px]">
                  Statistikken omfatter personer som ifølge folkeregisteret er bosatt i Norge per 1. januar. Enslige defineres som personer som bor alene eller med barn, men ikke med ektefelle, registrert partner eller samboer.
                </p>

                {selectedIndicator.subOptions && (
                  <p className="mt-[8px] text-[11px] text-[#8a8a8a] leading-[17px]">
                    Barn regnes som personer som bor med minst én forelder.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-[18px] h-full flex flex-col items-center justify-center text-center">
                <div className="w-[40px] h-[40px] rounded-full bg-[#f2f4f2] flex items-center justify-center mb-[10px]">
                  <Search className="w-[16px] h-[16px] text-[#c0c8c0]" />
                </div>
                <div className="text-[12px] font-medium text-[#999] mb-[4px]">Indikatorbeskrivelse</div>
                <div className="text-[11px] text-[#bbb] leading-[16px]">
                  Velg en indikator fra listen for å se beskrivelse og detaljer
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
