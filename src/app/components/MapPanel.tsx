import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, MapPin, ChevronDown, X, Search } from 'lucide-react';
import { GeoLevel, GEO_LEVEL_LABELS, regions, CHART_COLORS, REGION_POSITIONS } from './DataExplorer';
import mapImage from '../../assets/0047a920000ade2a14e66274df03e1e15b303e9c.png';

interface MapPanelProps {
  selectedRegions: string[];
  geoLevel: GeoLevel;
  onGeoLevelChange: (level: GeoLevel) => void;
  onSetPrimaryRegion: (regionId: string) => void;
  onAddComparisonRegion: (regionId: string) => void;
  onRemoveComparisonRegion: (regionId: string) => void;
}

type PickerTarget = 'primary' | 'comparison';

export function MapPanel({
  selectedRegions,
  geoLevel,
  onGeoLevelChange,
  onSetPrimaryRegion,
  onAddComparisonRegion,
  onRemoveComparisonRegion,
}: MapPanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const regionsAtLevel = useMemo(() => {
    return regions.filter(r => r.level === geoLevel);
  }, [geoLevel]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return regionsAtLevel;
    const q = searchQuery.toLowerCase();
    return regionsAtLevel.filter(r => r.name.toLowerCase().includes(q));
  }, [regionsAtLevel, searchQuery]);

  const selectedRegionObjects = useMemo(() => {
    return selectedRegions.map(id => regions.find(r => r.id === id)).filter(Boolean);
  }, [selectedRegions]);

  const primaryRegion = selectedRegionObjects[0];
  const comparisonRegions = selectedRegionObjects.slice(1);
  const canAddMore = comparisonRegions.length < 5;

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setPickerOpen(true);
    setSearchQuery('');
  };

  const handleRegionSelect = (regionId: string) => {
    if (pickerTarget === 'primary') {
      onSetPrimaryRegion(regionId);
      setPickerOpen(false);
      setSearchQuery('');
    } else {
      // For comparison, toggle behavior
      if (selectedRegions.includes(regionId) && selectedRegions[0] !== regionId) {
        onRemoveComparisonRegion(regionId);
      } else if (!selectedRegions.includes(regionId)) {
        onAddComparisonRegion(regionId);
      }
    }
  };

  return (
    <div className="bg-white rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex-[2] flex flex-col min-w-[320px] max-w-[480px] overflow-hidden">
      {/* Header */}
      <div className="px-[24px] border-b border-[#e8e8e8] flex items-center justify-between shrink-0 h-[50px]">
        <div className="font-['Epilogue',sans-serif] font-normal text-[14px] text-[#5a5a5a]">
          Kart
        </div>
      </div>

      {/* Map + controls - scrollable */}
      <div className="p-[16px] flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="relative rounded-[8px] overflow-hidden border border-[#e8e8e8] min-h-[200px] shrink-0" style={{ height: '240px' }}>
          <img
            src={mapImage}
            alt="Kart over Norge"
            className="w-full h-full object-cover"
          />

          {/* Region markers on map */}
          {selectedRegionObjects.map((region, i) => {
            if (!region) return null;
            const pos = REGION_POSITIONS[region.id] || { top: '50%', left: '50%' };
            return (
              <div
                key={region.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: pos.top, left: pos.left }}
              >
                <div
                  className="w-[24px] h-[24px] rounded-full border-[2px] border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  title={region.name}
                >
                  <MapPin className="w-[12px] h-[12px] text-white" />
                </div>
              </div>
            );
          })}

          {/* Zoom controls */}
          <div className="absolute top-[12px] right-[12px] flex flex-col gap-[4px]">
            <button className="w-[32px] h-[32px] bg-white border border-[#c8c8c8] rounded-[6px] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors shadow-md">
              <Plus className="w-[16px] h-[16px] text-[#303030]" />
            </button>
            <button className="w-[32px] h-[32px] bg-white border border-[#c8c8c8] rounded-[6px] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors shadow-md">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8H12" stroke="#303030" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Hovedområde (primary region) ── */}
        <div className="mt-[16px]" ref={pickerRef}>
          <div className="text-[12px] text-[#5a5a5a] mb-[6px] font-medium">Hovedområde</div>

          {/* Primary region - click to change, no X button */}
          <button
            onClick={() => openPicker('primary')}
            className={`flex items-center gap-[8px] px-[10px] py-[8px] rounded-[8px] border w-full transition-colors ${
              pickerOpen && pickerTarget === 'primary'
                ? 'border-[#3d5a4a] bg-[#f5f8f3]'
                : 'border-[#e8e8e8] bg-[#fafafa] hover:border-[#c0c0c0]'
            }`}
          >
            {primaryRegion && (
              <>
                <div
                  className="w-[10px] h-[10px] rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[0] }}
                />
                <Search className="w-[13px] h-[13px] text-[#999] shrink-0" />
                <span className="text-[13px] text-[#303030] flex-1 text-left truncate">{primaryRegion.name}</span>
                <span className="text-[11px] text-[#bbb] shrink-0">{GEO_LEVEL_LABELS[primaryRegion.level as GeoLevel]}</span>
              </>
            )}
            <ChevronDown className={`w-[13px] h-[13px] shrink-0 text-[#999] transition-transform ${pickerOpen && pickerTarget === 'primary' ? 'rotate-180' : ''}`} />
          </button>

          {/* Picker dropdown — shown for primary */}
          {pickerOpen && pickerTarget === 'primary' && (
            <RegionPicker
              geoLevel={geoLevel}
              onGeoLevelChange={onGeoLevelChange}
              filteredRegions={filteredRegions}
              selectedRegions={selectedRegions}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={handleRegionSelect}
              mode="single"
            />
          )}

          {/* ── Sammenligningsområde ── */}
          <div className="mt-[16px] pt-[16px] border-t border-[#e8e8e8]">
            <div className="text-[12px] text-[#5a5a5a] mb-[6px] font-medium">Sammenligningsområde</div>

            <div className="flex flex-col gap-[6px]">
              {/* Existing comparison regions */}
              {comparisonRegions.map((region, i) => {
                if (!region) return null;
                const colorIndex = i + 1; // offset: 0=primary, 1+=comparisons
                return (
                  <div
                    key={region.id}
                    className="flex items-center gap-[8px] px-[10px] py-[7px] rounded-[6px] border border-[#e8e8e8] bg-[#fafafa]"
                  >
                    <div
                      className="w-[10px] h-[10px] rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[colorIndex % CHART_COLORS.length] }}
                    />
                    <span className="text-[13px] text-[#303030] flex-1 truncate">{region.name}</span>
                    <span className="text-[11px] text-[#bbb] shrink-0">{GEO_LEVEL_LABELS[region.level as GeoLevel]}</span>
                    <button
                      onClick={() => onRemoveComparisonRegion(region.id)}
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[#999] hover:text-[#303030] hover:bg-[#eee] transition-colors shrink-0"
                      title="Fjern"
                    >
                      <X className="w-[12px] h-[12px]" />
                    </button>
                  </div>
                );
              })}

              {/* Add comparison area button */}
              {canAddMore && (
                <button
                  onClick={() => openPicker('comparison')}
                  className={`flex items-center gap-[6px] px-[10px] py-[7px] rounded-[6px] border text-[13px] transition-colors w-full ${
                    pickerOpen && pickerTarget === 'comparison'
                      ? 'border-[#3d5a4a] text-[#3d5a4a] bg-[#f5f8f3]'
                      : 'border-dashed border-[#c8c8c8] text-[#5a5a5a] hover:border-[#3d5a4a] hover:text-[#3d5a4a] bg-white'
                  }`}
                >
                  <Plus className="w-[14px] h-[14px] shrink-0" />
                  <span>Legg til sammenligningsområde</span>
                  <ChevronDown className={`w-[13px] h-[13px] shrink-0 ml-auto text-[#5a5a5a] transition-transform ${pickerOpen && pickerTarget === 'comparison' ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Max reached message */}
              {!canAddMore && (
                <div className="text-[11px] text-[#999] px-[10px] py-[4px]">
                  Maks 5 sammenligningsområder
                </div>
              )}
            </div>

            {/* Picker dropdown — shown for comparison */}
            {pickerOpen && pickerTarget === 'comparison' && (
              <RegionPicker
                geoLevel={geoLevel}
                onGeoLevelChange={onGeoLevelChange}
                filteredRegions={filteredRegions}
                selectedRegions={selectedRegions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={handleRegionSelect}
                mode="multi"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Region Picker Dropdown ── */

interface RegionPickerProps {
  geoLevel: GeoLevel;
  onGeoLevelChange: (level: GeoLevel) => void;
  filteredRegions: typeof regions;
  selectedRegions: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (regionId: string) => void;
  mode: 'single' | 'multi';
}

function RegionPicker({
  geoLevel,
  onGeoLevelChange,
  filteredRegions,
  selectedRegions,
  searchQuery,
  onSearchChange,
  onSelect,
  mode,
}: RegionPickerProps) {
  return (
    <div className="mt-[4px] bg-white border border-[#c8c8c8] rounded-[8px] shadow-lg overflow-hidden">
      {/* Search input */}
      <div className="px-[10px] py-[8px] border-b border-[#f0f0f0]">
        <div className="flex items-center gap-[6px] px-[8px] py-[5px] rounded-[6px] border border-[#e8e8e8] bg-[#fafafa]">
          <Search className="w-[13px] h-[13px] text-[#999] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Søk område"
            className="flex-1 text-[13px] text-[#303030] bg-transparent outline-none placeholder:text-[#bbb]"
            autoFocus
          />
        </div>
      </div>

      {/* Geo level pills */}
      <div className="px-[10px] py-[8px] border-b border-[#f0f0f0] flex flex-wrap gap-[4px]">
        {(['hele_landet', 'fylke', 'kommune', 'sone', 'levekaarssone'] as GeoLevel[]).map(level => (
          <button
            key={level}
            onClick={() => onGeoLevelChange(level)}
            className={`px-[8px] py-[3px] rounded-full text-[11px] font-medium transition-colors ${
              geoLevel === level
                ? 'bg-[#3d5a4a] text-white'
                : 'bg-[#f0f0f0] text-[#5a5a5a] hover:bg-[#e4e4e4]'
            }`}
          >
            {GEO_LEVEL_LABELS[level]}
          </button>
        ))}
      </div>

      {/* Region list */}
      <div className="max-h-[200px] overflow-y-auto">
        {filteredRegions.length === 0 ? (
          <div className="px-[14px] py-[12px] text-[13px] text-[#999] text-center">
            Ingen områder funnet
          </div>
        ) : (
          filteredRegions.map(region => {
            const isSelected = selectedRegions.includes(region.id);
            const isPrimary = selectedRegions[0] === region.id;
            return (
              <button
                key={region.id}
                onClick={() => onSelect(region.id)}
                className={`w-full px-[14px] py-[8px] text-left text-[13px] flex items-center gap-[8px] transition-colors ${
                  isSelected ? 'bg-[#f5f8f3]' : 'hover:bg-[#fafafa]'
                } ${mode === 'multi' && isPrimary ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={mode === 'multi' && isPrimary}
              >
                {mode === 'multi' && (
                  <div className={`w-[14px] h-[14px] rounded-[3px] border-[2px] flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-[#3d5a4a] bg-[#3d5a4a]' : 'border-[#c8c8c8]'
                  }`}>
                    {isSelected && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                )}
                {mode === 'single' && isSelected && (
                  <div className="w-[6px] h-[6px] rounded-full bg-[#3d5a4a] shrink-0" />
                )}
                {mode === 'single' && !isSelected && (
                  <div className="w-[6px] h-[6px] shrink-0" />
                )}
                <span className={`flex-1 ${isSelected ? 'text-[#3d5a4a] font-medium' : 'text-[#303030]'}`}>
                  {region.name}
                </span>
                {region.parent && (
                  <span className="text-[11px] text-[#bbb]">
                    {regions.find(r => r.id === region.parent)?.name}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
