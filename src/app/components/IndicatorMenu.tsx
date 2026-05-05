import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { VisualizationType, IndicatorMode, GeoLevel, indicators, GEO_LEVEL_LABELS, isGeoLevelAvailable } from './DataExplorer';

interface IndicatorMenuProps {
  visualizationType: VisualizationType;
  selectedIndicators: string[];
  onIndicatorToggle: (indicatorId: string) => void;
  indicatorMode: IndicatorMode;
  onIndicatorModeChange: (mode: IndicatorMode) => void;
  selectedSubOption: string;
  onSubOptionChange: (subOption: string) => void;
  geoLevel: GeoLevel;
}

const CATEGORIES = ['Befolkning', 'Oppvekst', 'Utdanning', 'Økonomi', 'Arbeidsliv og stønader', 'Bolig', 'Geografi'];

export function IndicatorMenu({
  visualizationType,
  selectedIndicators,
  onIndicatorToggle,
  indicatorMode,
  onIndicatorModeChange,
  selectedSubOption,
  onSubOptionChange,
  geoLevel,
}: IndicatorMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Befolkning']);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterVisualization, setFilterVisualization] = useState<VisualizationType[]>([]);
  const [filterGeoLevels, setFilterGeoLevels] = useState<GeoLevel[]>([]);

  // Filter modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);
  const [showVisualizationFilter, setShowVisualizationFilter] = useState(true);
  const [showGeoFilter, setShowGeoFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  // Build active filter tags
  const activeFilterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    filterVisualization.forEach(vis => {
      const label = vis === 'fordeling' ? 'Underområder' : 'Hovedområde';
      tags.push({
        label,
        onRemove: () => setFilterVisualization(prev => prev.filter(v => v !== vis)),
      });
    });
    filterCategories.forEach(cat => {
      tags.push({
        label: cat,
        onRemove: () => setFilterCategories(prev => prev.filter(c => c !== cat)),
      });
    });
    filterGeoLevels.forEach(gl => {
      tags.push({
        label: GEO_LEVEL_LABELS[gl],
        onRemove: () => setFilterGeoLevels(prev => prev.filter(g => g !== gl)),
      });
    });
    return tags;
  }, [filterCategories, filterVisualization, filterGeoLevels]);

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      if (searchTerm && !ind.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(ind.category)) return false;
      if (filterVisualization.length > 0 && !filterVisualization.some(v => ind.supportedVisualizations.includes(v))) return false;
      if (filterGeoLevels.length > 0 && !filterGeoLevels.some(gl => isGeoLevelAvailable(ind.minGeoLevel, gl))) return false;
      return true;
    });
  }, [searchTerm, filterCategories, filterVisualization, filterGeoLevels]);

  // Group by category
  const categorizedIndicators = useMemo(() => {
    return filteredIndicators.reduce((acc, ind) => {
      if (!acc[ind.category]) acc[ind.category] = [];
      acc[ind.category].push(ind);
      return acc;
    }, {} as Record<string, typeof indicators>);
  }, [filteredIndicators]);

  // Get all selected indicator objects for description panel
  const selectedIndicatorObjs = useMemo(() => {
    return selectedIndicators
      .map(id => indicators.find(ind => ind.id === id))
      .filter(Boolean) as typeof indicators;
  }, [selectedIndicators]);

  // Track which indicator descriptions are expanded (default: all expanded)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = useCallback((id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isMultiSelect = indicatorMode === 'multi';

  const geoUnavailableIndicators = useMemo(() => {
    return indicators.filter(ind => !isGeoLevelAvailable(ind.minGeoLevel, geoLevel));
  }, [geoLevel]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFilterCategory = (cat: string) => {
    setFilterCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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

  const clearAllFilters = () => {
    setFilterCategories([]);
    setFilterVisualization([]);
    setFilterGeoLevels([]);
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex-[3] min-w-[400px] flex flex-col">
      {/* Header with mode toggle */}
      <div className="px-[24px] border-b border-[#e8e8e8] flex items-center justify-between shrink-0 h-[50px]">
        <div className="font-['Epilogue',sans-serif] font-normal text-[14px] text-[#5a5a5a] flex items-center gap-[4px]">
          <span className="text-[#c8c8c8]">|</span> Indikatormeny
        </div>
        <div className="flex gap-[4px]">
          <button
            onClick={() => onIndicatorModeChange('single')}
            className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-all ${
              indicatorMode === 'single'
                ? 'bg-[#3d5a4a] text-white shadow-sm'
                : 'bg-transparent text-[#5a5a5a] hover:text-[#3d5a4a]'
            }`}
          >
            En indikator
          </button>
          <button
            onClick={() => onIndicatorModeChange('multi')}
            className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-all ${
              indicatorMode === 'multi'
                ? 'bg-[#3d5a4a] text-white shadow-sm'
                : 'bg-transparent text-[#5a5a5a] hover:text-[#3d5a4a]'
            }`}
          >
            Flere indikatorer
          </button>
        </div>
      </div>

      {/* Filter modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with slight blur */}
          <div
            className="absolute inset-0 backdrop-blur-[2px] bg-white/30"
            onClick={() => setFilterModalOpen(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-[14px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] w-[340px] max-h-[480px] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#e8e8e8]">
              <div className="flex items-center gap-[8px]">
                <SlidersHorizontal className="w-[14px] h-[14px] text-[#3d5a4a]" />
                <span className="font-['Epilogue',sans-serif] font-medium text-[14px] text-[#2d2d2d]">Filtrer indikatorer</span>
              </div>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#f0f0f0] transition-colors"
              >
                <X className="w-[16px] h-[16px] text-[#999]" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
              {/* Kategori */}
              <div className="mb-[10px]">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className="flex items-center justify-between w-full text-[13px] text-[#3d5a4a] font-medium py-[6px]"
                >
                  <span>Kategori</span>
                  {showCategoryFilter ? <ChevronUp className="w-[14px] h-[14px] text-[#5a7a64]" /> : <ChevronDown className="w-[14px] h-[14px] text-[#5a7a64]" />}
                </button>
                {showCategoryFilter && (
                  <div className="mt-[4px] space-y-[6px] ml-[2px]">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-[8px] text-[13px] text-[#4a4a4a] cursor-pointer py-[2px]">
                        <input
                          type="checkbox"
                          checked={filterCategories.includes(cat)}
                          onChange={() => toggleFilterCategory(cat)}
                          className="w-[15px] h-[15px] rounded border-[#a8c0ab] text-[#3d5a4a] focus:ring-[#3d5a4a] accent-[#3d5a4a]"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Visualisering */}
              <div className="mb-[10px]">
                <button
                  onClick={() => setShowVisualizationFilter(!showVisualizationFilter)}
                  className="flex items-center justify-between w-full text-[13px] text-[#3d5a4a] font-medium py-[6px]"
                >
                  <span>Visualisering</span>
                  {showVisualizationFilter ? <ChevronUp className="w-[14px] h-[14px] text-[#5a7a64]" /> : <ChevronDown className="w-[14px] h-[14px] text-[#5a7a64]" />}
                </button>
                {showVisualizationFilter && (
                  <div className="mt-[4px] space-y-[6px] ml-[2px]">
                    {(['visning', 'fordeling'] as VisualizationType[]).map(vis => (
                      <label key={vis} className="flex items-center gap-[8px] text-[13px] text-[#4a4a4a] cursor-pointer py-[2px]">
                        <input
                          type="checkbox"
                          checked={filterVisualization.includes(vis)}
                          onChange={() => toggleFilterVisualization(vis)}
                          className="w-[15px] h-[15px] rounded border-[#a8c0ab] text-[#3d5a4a] focus:ring-[#3d5a4a] accent-[#3d5a4a]"
                        />
                        <span>{vis === 'fordeling' ? 'Underområder' : 'Hovedområde'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Geografisk nivå */}
              <div className="mb-[10px]">
                <button
                  onClick={() => setShowGeoFilter(!showGeoFilter)}
                  className="flex items-center justify-between w-full text-[13px] text-[#3d5a4a] font-medium py-[6px]"
                >
                  <span>Geografisk nivå</span>
                  {showGeoFilter ? <ChevronUp className="w-[14px] h-[14px] text-[#5a7a64]" /> : <ChevronDown className="w-[14px] h-[14px] text-[#5a7a64]" />}
                </button>
                {showGeoFilter && (
                  <div className="mt-[4px] space-y-[6px] ml-[2px]">
                    {(['hele_landet', 'fylke', 'kommune', 'sone', 'levekaarssone'] as GeoLevel[]).map(level => (
                      <label key={level} className="flex items-center gap-[8px] text-[13px] text-[#4a4a4a] cursor-pointer py-[2px]">
                        <input
                          type="checkbox"
                          checked={filterGeoLevels.includes(level)}
                          onChange={() => toggleFilterGeoLevel(level)}
                          className="w-[15px] h-[15px] rounded border-[#a8c0ab] text-[#3d5a4a] focus:ring-[#3d5a4a] accent-[#3d5a4a]"
                        />
                        <span>{GEO_LEVEL_LABELS[level]}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Tidsperiode */}
              <div className="mb-[6px]">
                <button
                  onClick={() => setShowTimeFilter(!showTimeFilter)}
                  className="flex items-center justify-between w-full text-[13px] text-[#3d5a4a] font-medium py-[6px]"
                >
                  <span>Tidsperiode</span>
                  {showTimeFilter ? <ChevronUp className="w-[14px] h-[14px] text-[#5a7a64]" /> : <ChevronDown className="w-[14px] h-[14px] text-[#5a7a64]" />}
                </button>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-[20px] py-[12px] border-t border-[#e8e8e8] flex items-center justify-between">
              {activeFilterTags.length > 0 ? (
                <button
                  onClick={clearAllFilters}
                  className="text-[12px] text-[#3d5a4a] hover:underline transition-colors"
                >
                  Nullstill {activeFilterTags.length} filter
                </button>
              ) : (
                <span className="text-[12px] text-[#999]">Ingen filtre valgt</span>
              )}
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-[16px] py-[7px] bg-[#3d5a4a] hover:bg-[#2d4a3a] text-white text-[13px] font-medium rounded-[8px] transition-colors"
              >
                Bruk filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-column body (filter sidebar removed — now in modal) */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT COLUMN - Search, filter tags, indicator list */}
        <div className="flex-[2] flex flex-col min-w-0 border-r border-[#e8e8e8]">
          {/* Search bar + filter button + tags */}
          <div className="px-[16px] pt-[14px] pb-[10px] shrink-0">
            {/* Search + filter button */}
            <div className="flex gap-[8px] mb-[10px]">
              <div className="relative flex-1">
                <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#5a5a5a]" />
                <input
                  type="text"
                  placeholder="Søk indikator"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-[36px] pr-[12px] py-[8px] border border-[#c8c8c8] rounded-[6px] text-[13px] text-[#303030] bg-white focus:outline-none focus:border-[#3d5a4a] focus:ring-1 focus:ring-[#3d5a4a]/20 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-[12px] top-1/2 -translate-y-1/2">
                    <X className="w-[14px] h-[14px] text-[#999] hover:text-[#303030]" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilterModalOpen(true)}
                className={`flex items-center gap-[6px] px-[12px] py-[8px] rounded-[6px] border transition-colors shrink-0 ${
                  activeFilterTags.length > 0
                    ? 'bg-[#eef3eb] border-[#3d5a4a]/30 text-[#3d5a4a]'
                    : 'bg-white border-[#c8c8c8] text-[#5a5a5a] hover:border-[#3d5a4a] hover:text-[#3d5a4a]'
                }`}
              >
                <SlidersHorizontal className="w-[14px] h-[14px]" />
                <span className="text-[13px] font-medium">Filter</span>
                {activeFilterTags.length > 0 && (
                  <span className="w-[18px] h-[18px] rounded-full bg-[#3d5a4a] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterTags.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter tags row */}
            <div className="flex items-center gap-[6px] flex-wrap">
              {activeFilterTags.length > 0 && (
                <>
                  <span className="text-[12px] text-[#5a5a5a]">Aktive filtre:</span>
                  {activeFilterTags.map((tag, i) => (
                    <div key={i} className="bg-[#dce9d3] px-[10px] py-[3px] rounded-[8px] flex items-center gap-[6px]">
                      <span className="text-[12px] text-[#303030]">{tag.label}</span>
                      <button onClick={tag.onRemove} className="text-[#303030] hover:text-[#3d5a4a] transition-colors">
                        <X className="w-[12px] h-[12px]" />
                      </button>
                    </div>
                  ))}
                  <button onClick={clearAllFilters} className="text-[12px] text-[#3d5a4a] hover:underline ml-[4px]">
                    Nullstill alle
                  </button>
                </>
              )}
            </div>

            <div className="text-[12px] text-[#5a5a5a] mt-[6px]">
              Viser {filteredIndicators.length} av {indicators.length} indikatorer
            </div>
          </div>

          {/* Indicator categories list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {CATEGORIES.filter(cat => categorizedIndicators[cat]).map(category => (
              <div key={category} className="border-b border-[#e8e8e8]">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-[16px] py-[10px] flex items-center justify-between hover:bg-[#fafafa] transition-colors"
                >
                  <div className="text-[13px] font-medium text-[#303030]">
                    {category}
                  </div>
                  {expandedCategories.includes(category) ? (
                    <ChevronUp className="w-[16px] h-[16px] text-[#5a5a5a]" />
                  ) : (
                    <ChevronDown className="w-[16px] h-[16px] text-[#5a5a5a]" />
                  )}
                </button>

                {expandedCategories.includes(category) && (
                  <div className="px-[16px] pb-[12px] space-y-[4px]">
                    {categorizedIndicators[category].map(indicator => {
                      const isSelected = selectedIndicators.includes(indicator.id);

                      return (
                        <label
                          key={indicator.id}
                          className={`flex items-center gap-[10px] cursor-pointer rounded-[6px] px-[8px] py-[6px] transition-all ${
                            isSelected ? 'bg-[#f5f8f3]' : 'hover:bg-[#fafafa]'
                          }`}
                        >
                          <input
                            type={isMultiSelect ? 'checkbox' : 'radio'}
                            name={isMultiSelect ? undefined : 'indicator'}
                            checked={isSelected}
                            onChange={() => onIndicatorToggle(indicator.id)}
                            className="w-[16px] h-[16px] rounded border-[#c8c8c8] text-[#3d5a4a] focus:ring-[#3d5a4a] accent-[#3d5a4a] shrink-0"
                          />
                          <span className={`text-[13px] ${isSelected ? 'text-[#303030] font-medium' : 'text-[#303030]'} flex-1`}>
                            {indicator.name}
                          </span>
                          {!isGeoLevelAvailable(indicator.minGeoLevel, geoLevel) && (
                            <span className="shrink-0">
                              <span className="block w-[8px] h-[8px] rounded-full bg-[#d32f2f]" />
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Additional collapsed categories */}
            {CATEGORIES.filter(cat => !categorizedIndicators[cat]).map(category => (
              <div key={category} className="border-b border-[#e8e8e8]">
                <button
                  className="w-full px-[16px] py-[10px] flex items-center justify-between hover:bg-[#fafafa] transition-colors"
                >
                  <div className="text-[13px] font-medium text-[#999]">
                    {category}
                  </div>
                  <ChevronDown className="w-[16px] h-[16px] text-[#c8c8c8]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - Indikatorbeskrivelse */}
        <div className="flex-[3] overflow-y-auto">
          <div className="px-[18px] py-[14px]">
            <div className="text-[11px] font-semibold text-[#999] tracking-[0.06em] uppercase mb-[10px]">
              Indikatorbeskrivelse
            </div>
            {selectedIndicatorObjs.length > 0 ? (
              <div className="space-y-[8px]">
                {selectedIndicatorObjs.map((ind) => {
                  const isExpanded = expandedDescriptions[ind.id] !== false; // default expanded
                  return (
                    <div key={ind.id} className="border border-[#e4e8e4] rounded-[8px] overflow-hidden">
                      {/* Collapsible header */}
                      <button
                        onClick={() => toggleDescription(ind.id)}
                        className="w-full px-[14px] py-[10px] flex items-center justify-between bg-[#f8f9f8] hover:bg-[#f0f2f0] transition-colors"
                      >
                        <div className="font-['Epilogue',sans-serif] font-bold text-[13px] text-[#2d2d2d]">
                          {ind.name}
                        </div>
                        <ChevronDown
                          className={`w-[14px] h-[14px] text-[#999] transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                        />
                      </button>

                      {/* Collapsible content */}
                      {isExpanded && (
                        <div className="px-[14px] py-[12px] border-t border-[#e4e8e4]">
                          <p className="text-[12px] text-[#606060] leading-[19px] mb-[14px]">
                            {ind.description}
                          </p>

                          {/* Data source box */}
                          <div className="bg-[#f8f9f8] rounded-[6px] border border-[#eaeaea] px-[10px] py-[8px] mb-[12px]">
                            <div className="text-[9px] font-semibold text-[#aaa] tracking-[0.08em] uppercase mb-[4px]">Datakilde</div>
                            <div className="flex items-center gap-[6px]">
                              <div className="w-[14px] h-[14px] bg-[#e0e7e0] rounded-[3px] flex items-center justify-center shrink-0">
                                <span className="text-[7px] font-bold text-[#3d5a4a]">≡</span>
                              </div>
                              <span className="text-[11px] text-[#555]">Statistisk Sentralbyrå (SSB)</span>
                            </div>
                          </div>

                          {/* Structured metadata */}
                          <div className="space-y-[6px] mb-[12px]">
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10px] text-[#aaa]">Dato:</span>
                              <span className="text-[11px] font-medium text-[#555]">31.12.2023</span>
                            </div>
                            {ind.unit && (
                              <div className="flex items-center gap-[6px]">
                                <span className="text-[10px] text-[#aaa]">Enhet:</span>
                                <span className="text-[11px] font-medium text-[#555]">{ind.unit}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10px] text-[#aaa]">Geografisk nivå:</span>
                              <span className="text-[11px] font-medium text-[#555]">{GEO_LEVEL_LABELS[ind.minGeoLevel]}</span>
                            </div>
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10px] text-[#aaa]">Dataleverandør:</span>
                              <span className="text-[11px] font-medium text-[#555]">Geodata AS</span>
                            </div>
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10px] text-[#aaa]">Undertrykking:</span>
                              <span className="text-[11px] font-medium text-[#555]">Ukjent</span>
                            </div>
                          </div>

                          {/* Sub-options as badges */}
                          {ind.subOptions && ind.subOptions.length > 0 && (
                            <div className="mb-[12px]">
                              <div className="text-[10px] text-[#aaa] mb-[6px]">Underkategorier:</div>
                              <div className="flex flex-wrap gap-[5px]">
                                {ind.subOptions.map(opt => (
                                  <span key={opt.id} className="px-[7px] py-[2px] bg-[#f2f4f2] border border-[#e4e8e4] rounded-[5px] text-[10px] text-[#606060]">
                                    {opt.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* More info link */}
                          <div className="text-[11px] text-[#3d5a4a] hover:underline cursor-pointer">
                            Mer opplysninger om statistikken →
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-[40px]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#f2f4f2] flex items-center justify-center mb-[10px]">
                  <Search className="w-[16px] h-[16px] text-[#c0c8c0]" />
                </div>
                <div className="text-[12px] font-medium text-[#999] mb-[4px]">Indikatorbeskrivelse</div>
                <div className="text-[11px] text-[#bbb] leading-[16px]">
                  Velg en indikator fra listen for å se beskrivelse og detaljer
                </div>
              </div>
            )}

            {/* Geo-unavailable indicators notice */}
            {geoUnavailableIndicators.length > 0 && (
              <div className="mt-[16px] pt-[12px] border-t border-[#e8e8e8]">
                <div className="text-[11px] text-[#5a5a5a] leading-[18px] space-y-[4px]">
                  {geoUnavailableIndicators.map(ind => (
                      <div key={ind.id} className="flex items-center gap-[8px]">
                        <span className="w-[8px] h-[8px] rounded-full bg-[#d32f2f] shrink-0" />
                        <span>{ind.name} — ikke tilgjengelig for valgt geografisk nivå</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
