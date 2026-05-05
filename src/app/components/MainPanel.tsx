import { useMemo } from 'react';
import {
  VisualizationType, ChartType, FordelingSubType, DisplayMode, Indicator, GeoLevel,
  generateChartData, generateKeyFigure, regions, CHART_COLORS, GEO_LEVEL_LABELS, REGION_POSITIONS,
} from './DataExplorer';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import rangeringMapImage from '../../assets/rangering-map.png';
import rangeringGraphSvg from '../../assets/rangering-graph.svg';

interface MainPanelProps {
  visualizationType: VisualizationType;
  chartType: ChartType;
  fordelingSubType: FordelingSubType;
  selectedIndicators: Indicator[];
  selectedRegions: string[];
  areIndicatorsCompatible: boolean;
  areIndicatorsGeoCompatible: boolean;
  onVisualizationChange: (type: VisualizationType) => void;
  onChartTypeChange: (type: ChartType) => void;
  onFordelingSubTypeChange: (type: FordelingSubType) => void;
  menuExpanded: boolean;
  onToggleMenu: () => void;
  geoLevel: GeoLevel;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'white',
  border: '1px solid #e8e8e8',
  borderRadius: '8px',
  fontSize: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const PIE_COLORS = ['#3d5a4a', '#89a975', '#a5bd8f', '#c0d1a9', '#5e7652', '#6b8f5b', '#2d4a3a'];

export function MainPanel({
  visualizationType,
  chartType,
  fordelingSubType,
  selectedIndicators,
  selectedRegions,
  areIndicatorsCompatible,
  areIndicatorsGeoCompatible,
  onVisualizationChange,
  onChartTypeChange,
  onFordelingSubTypeChange,
  menuExpanded,
  onToggleMenu,
  geoLevel,
  isFullscreen,
  onToggleFullscreen,
  displayMode,
  onDisplayModeChange,
}: MainPanelProps) {

  const activeIndicator = selectedIndicators[0];

  const chartData = useMemo(() => {
    if (!activeIndicator) return [];
    return generateChartData(activeIndicator.id, selectedRegions);
  }, [activeIndicator, selectedRegions]);

  const regionNames = useMemo(() => {
    return selectedRegions.map(id => regions.find(r => r.id === id)?.name || id);
  }, [selectedRegions]);

  const geoLevelLabel = GEO_LEVEL_LABELS[geoLevel].toLowerCase();

  const selectedRegionObjects = useMemo(() => {
    return selectedRegions.map(id => regions.find(r => r.id === id)).filter(Boolean);
  }, [selectedRegions]);

  const getTitle = () => {
    const regionName = selectedRegionObjects[0]?.name || 'Agder';
    if (chartType === 'nokkeltall') {
      return `Nøkkeltall for ${regionName} ${geoLevelLabel}`;
    }
    if (selectedIndicators.length > 0) {
      return `${selectedIndicators[0].name} i ${regionName} ${geoLevelLabel}`;
    }
    return 'Datautforsker';
  };

  const renderChart = () => {
    if (!activeIndicator) return null;
    const unit = activeIndicator.unit || '';

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="name" tick={{ fill: '#5a5a5a', fontSize: 12 }} axisLine={{ stroke: '#e8e8e8' }} />
            <YAxis tick={{ fill: '#5a5a5a', fontSize: 12 }} axisLine={{ stroke: '#e8e8e8' }}
              label={{ value: unit ? `${activeIndicator.name} (${unit})` : activeIndicator.name, angle: -90, position: 'insideLeft', style: { fill: '#5a5a5a', fontSize: 11 }, offset: -5 }}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {regionNames.map((name, i) => (
              <Line key={name} type="monotone" dataKey={name} stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2} dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            ))}
            {regionNames.length > 1 && <Legend formatter={(value) => <span style={{ color: '#5a5a5a', fontSize: '12px' }}>{value}</span>} />}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="name" tick={{ fill: '#5a5a5a', fontSize: 12 }} axisLine={{ stroke: '#e8e8e8' }} />
            <YAxis tick={{ fill: '#5a5a5a', fontSize: 12 }} axisLine={{ stroke: '#e8e8e8' }}
              label={{ value: unit ? `${activeIndicator.name} (${unit})` : activeIndicator.name, angle: -90, position: 'insideLeft', style: { fill: '#5a5a5a', fontSize: 11 }, offset: -5 }}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {regionNames.map((name, i) => (
              <Bar key={name} dataKey={name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
            {regionNames.length > 1 && <Legend formatter={(value) => <span style={{ color: '#5a5a5a', fontSize: '12px' }}>{value}</span>} />}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      const pieData = chartData.map((d, i) => ({
        name: d.name,
        value: typeof d[regionNames[0]] === 'number' ? d[regionNames[0]] as number : 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={true}
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              outerRadius={isFullscreen ? 180 : 130} innerRadius={isFullscreen ? 60 : 40}
              fill="#8884d8" dataKey="value" paddingAngle={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36}
              formatter={(value) => <span style={{ color: '#5a5a5a', fontSize: '12px' }}>{value}</span>}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'grid') {
      // Map data point names to icons for grid cards
      const GRID_ICONS: Record<string, typeof Users> = {
        'Par uten barn': Users, 'Par med barn': Baby, 'Enslige forsørgere': Smile,
        'Aleneboende': Home, 'Andre familietyper': Users,
        '0-5 år': Baby, '6-12 år': Baby, '13-17 år': Users, '18-29 år': Users,
        '30-49 år': Briefcase, '50-66 år': Briefcase, '67-79 år': Users, '80+ år': Users,
      };

      return (
        <div className="grid grid-cols-4 gap-[16px] h-full overflow-auto py-[8px]">
          {chartData.map((item, index) => {
            const val = typeof item[regionNames[0]] === 'number' ? item[regionNames[0]] : 0;
            const Icon = GRID_ICONS[item.name] || Users;
            return (
              <div key={index}
                className="bg-white rounded-[12px] border border-[#e8e8e8] p-[24px] hover:shadow-md hover:border-[#89a975] transition-all cursor-default flex flex-col items-center justify-center gap-[10px]"
              >
                <div className="w-[48px] h-[48px] bg-[#dce9d3] rounded-full flex items-center justify-center">
                  <Icon className="w-[22px] h-[22px] text-[#3d5a4a]" />
                </div>
                <div className="text-[26px] font-semibold text-[#303030] leading-[30px]" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                  {typeof val === 'number' ? val.toLocaleString('nb-NO') : '—'}
                  {unit && <span className="text-[13px] text-[#5a5a5a] font-normal ml-[3px]">{unit}</span>}
                </div>
                <div className="text-[12px] text-[#5a5a5a] text-center leading-[16px]">{item.name}</div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const NOKKELTALL_COLORS = ['#3d5a4a', '#6E448E', '#2D6A8A', '#B8860B', '#89a975', '#59377A', '#3A7CA5', '#D4A017'];

  const renderNokkeltall = () => {
    const primaryRegion = selectedRegions[0] || 'agder';

    // Generate a mock trend for each indicator
    const getTrend = (id: string): { value: number; positive: boolean } => {
      const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const val = ((seed % 120) - 30) / 10;
      return { value: Math.abs(val), positive: val >= 0 };
    };

    return (
      <div className="grid grid-cols-4 gap-[16px]">
        {selectedIndicators.map((indicator, index) => {
          const value = generateKeyFigure(indicator.id, primaryRegion);
          const trend = getTrend(indicator.id);
          const accentColor = NOKKELTALL_COLORS[index % NOKKELTALL_COLORS.length];

          return (
            <div key={indicator.id}
              className="bg-white rounded-[8px] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-default flex"
            >
              {/* Colored left accent bar */}
              <div className="w-[5px] shrink-0" style={{ backgroundColor: accentColor }} />
              {/* Card content */}
              <div className="flex-1 p-[20px] flex flex-col justify-between gap-[8px]">
                <div className="text-[13px] text-[#5a5a5a] leading-[18px]">
                  {indicator.name}
                  {indicator.unit && <span className="text-[#999]"> ({indicator.unit})</span>}
                </div>
                <div className="text-[32px] font-semibold text-[#303030] leading-[38px]" style={{ fontFamily: 'Epilogue, sans-serif' }}>
                  {value.toLocaleString('nb-NO')}
                </div>
                <div className={`flex items-center gap-[4px] text-[12px] ${trend.positive ? 'text-[#3d5a4a]' : 'text-[#c0392b]'}`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    {trend.positive ? (
                      <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
                    ) : (
                      <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
                    )}
                  </svg>
                  <span>{trend.value.toFixed(1)}%</span>
                  <span className="text-[#999] ml-[4px]">siste år</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const CHOROPLETH_COLORS = ['#D5C9DD', '#BAA5C9', '#A082B7', '#885FA6', '#6E448E', '#59377A', '#43285C'];

  const renderRangeringKart = () => {
    if (!activeIndicator) return null;

    // Generate choropleth legend ranges from indicator data
    const rangesMap: Record<string, [number, number]> = {
      'familietyper': [5, 35], 'aldersfordeling': [500, 8000], 'alder-gjennomsnitt': [35, 45],
      'flyttinger': [40, 200], 'aleneboende': [100, 400], 'innvandrere': [30, 150],
      'barn': [80, 250], 'barn-enslige-foreldre': [10, 60], 'barneflyttinger': [3, 15],
      'landareal-ssb-api': [400, 16000], 'utdanningsniva': [15, 50],
      'sysselsetting': [60, 80], 'medianinntekt': [350, 550],
    };
    const [lo, hi] = rangesMap[activeIndicator.id] || [10, 100];
    const steps = CHOROPLETH_COLORS.length;
    const stepSize = (hi - lo) / steps;
    const legendRanges = CHOROPLETH_COLORS.map((color, i) => ({
      color,
      label: `${Math.round(lo + stepSize * i)} - ${Math.round(lo + stepSize * (i + 1))}`,
    }));

    return (
      <div className="h-full flex">
        {/* Full-width map area */}
        <div className="flex-1 relative rounded-[12px] overflow-hidden border border-[#e8e8e8] bg-[#f8f8f8]">
          <img src={rangeringMapImage} alt="Fordeling kart" className="w-full h-full object-cover" />

          {/* Floating choropleth legend - top right */}
          <div className="absolute top-[16px] right-[16px] bg-white/95 backdrop-blur-sm rounded-[10px] shadow-lg p-[16px] z-20 min-w-[150px]">
            <div className="text-[12px] font-medium text-[#303030] mb-[2px] leading-[16px]">
              {activeIndicator.name}
              {activeIndicator.unit && <span className="block text-[11px] text-[#5a5a5a] font-normal">({activeIndicator.unit})</span>}
            </div>
            <div className="flex items-center gap-[6px] mt-[8px] mb-[10px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect width="14" height="14" rx="2" fill="#e8e8e8" />
                <line x1="2" y1="12" x2="12" y2="2" stroke="#999" strokeWidth="1" />
                <line x1="5" y1="12" x2="12" y2="5" stroke="#999" strokeWidth="1" />
                <line x1="8" y1="12" x2="12" y2="8" stroke="#999" strokeWidth="1" />
              </svg>
              <span className="text-[11px] text-[#5a5a5a]">Mangler data</span>
            </div>
            <div className="space-y-[3px]">
              {legendRanges.map((range, i) => (
                <div key={i} className="flex items-center gap-[8px]">
                  <div className="w-[18px] h-[12px] rounded-[2px]" style={{ backgroundColor: range.color }} />
                  <span className="text-[11px] text-[#5a5a5a]">{range.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region markers with data values */}
          {selectedRegionObjects.map((region, i) => {
            if (!region) return null;
            const pos = REGION_POSITIONS[region.id] || { top: '50%', left: '50%' };
            const value = generateKeyFigure(activeIndicator.id, region.id);
            return (
              <div key={region.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-[8px] shadow-md px-[10px] py-[5px] whitespace-nowrap border border-[#e0e0e0]">
                  <div className="text-[13px] font-medium text-[#303030]">
                    {value.toLocaleString('nb-NO')} {activeIndicator.unit || ''}
                  </div>
                  <div className="text-[11px] text-[#5a5a5a]">{region.name}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right sidebar - only when menu is closed */}
        {!menuExpanded && (
          <div className="w-[260px] shrink-0 border-l border-[#e8e8e8] p-[24px] flex flex-col gap-[12px]">
            <div className="text-[14px] font-medium text-[#303030]">
              {activeIndicator.name}
            </div>
            {selectedRegionObjects.map((region, i) => {
              if (!region) return null;
              const value = generateKeyFigure(activeIndicator.id, region.id);
              return (
                <div key={region.id} className="flex items-center gap-[10px] py-[8px] border-b border-[#f0f0f0]">
                  <div className="w-[10px] h-[10px] rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <div>
                    <div className="text-[14px] font-medium text-[#303030]">{region.name}</div>
                    <div className="text-[13px] text-[#5a5a5a]">
                      {value.toLocaleString('nb-NO')} {activeIndicator.unit || ''}
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedRegions.length < 2 && (
              <div className="text-[13px] text-[#999] leading-[20px] mt-[4px]">
                Legg til flere omrader for a sammenligne regioner pa kartet
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRangeringSoyle = () => {
    return (
      <div className="h-full flex items-center">
        <img src={rangeringGraphSvg} alt="Fordeling søylediagram" className="w-full" />
      </div>
    );
  };

  const renderRangeringKartSoyle = () => {
    if (!activeIndicator) return null;

    return (
      <div className="h-full flex gap-[16px]">
        {/* Left: Map */}
        <div className="flex-1 relative rounded-[12px] overflow-hidden border border-[#e8e8e8] bg-[#f8f8f8]">
          <img src={rangeringMapImage} alt="Fordeling kart" className="w-full h-full object-cover" />
          {selectedRegionObjects.map((region, i) => {
            if (!region) return null;
            const pos = REGION_POSITIONS[region.id] || { top: '50%', left: '50%' };
            const value = generateKeyFigure(activeIndicator.id, region.id);
            return (
              <div key={region.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-[8px] shadow-md px-[10px] py-[5px] whitespace-nowrap border border-[#e0e0e0]"
                  style={{ borderLeft: `3px solid ${CHART_COLORS[i % CHART_COLORS.length]}` }}
                >
                  <div className="text-[13px] font-medium text-[#303030]">
                    {value.toLocaleString('nb-NO')} {activeIndicator.unit || ''}
                  </div>
                  <div className="text-[11px] text-[#5a5a5a]">{region.name}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Bar chart */}
        <div className="flex-1 flex items-center justify-center">
          <img src={rangeringGraphSvg} alt="Fordeling søylediagram" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  };

  const renderFordeling = () => {
    if (fordelingSubType === 'kart') return renderRangeringKart();
    if (fordelingSubType === 'kart_soyle') return renderRangeringKartSoyle();
    return renderRangeringSoyle();
  };

  const panelClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-white flex flex-col'
    : 'bg-white rounded-[12px] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-[480px] shrink-0';

  return (
    <div className={panelClasses}>
      {/* Fullscreen header with minimize button */}
      {isFullscreen && (
        <div className="flex items-center justify-between px-[32px] py-[12px] border-b border-[#e8e8e8] shrink-0">
          <div className="flex items-center gap-[8px]">
            <div className="w-[3px] h-[20px] bg-[#89B56B] rounded-full" />
            <span className="font-['Epilogue',sans-serif] font-medium text-[18px] text-[#303030]">Datautforsker</span>
          </div>
          <button
            onClick={onToggleFullscreen}
            className="w-[34px] h-[34px] bg-[#3d5a4a] rounded-[6px] hover:bg-[#2d4a3a] transition-colors flex items-center justify-center"
            title="Lukk fullskjerm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      )}

      {/* Title row with controls on the right */}
      <div className="flex items-center justify-between px-[24px] py-[10px] border-b border-[#e8e8e8]">
        {/* Dynamic title left */}
        <div className="flex items-center gap-[8px] shrink-0">
          <div className="w-[3px] h-[16px] bg-[#89B56B] rounded-full" />
          <span className="font-['Epilogue',sans-serif] font-normal text-[15px] text-[#303030]">
            {getTitle()}
          </span>
        </div>

        {/* Controls right - hidden in fullscreen */}
        {!isFullscreen && (
          <div className="flex items-center gap-[6px]">
            {/* Visualization type pill buttons */}
            {(['visning', 'fordeling'] as VisualizationType[]).map(type => (
              <button key={type}
                onClick={() => onVisualizationChange(type)}
                className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-all ${
                  visualizationType === type
                    ? 'bg-[#3d5a4a] text-white shadow-sm'
                    : 'bg-transparent text-[#5a5a5a] hover:text-[#3d5a4a]'
                }`}
              >
                {type === 'fordeling' ? 'Underområder' : 'Hovedområde'}
              </button>
            ))}

            {/* Separator + fixed-width sub-type icon area + separator */}
            <div className="w-[1px] h-[20px] bg-[#d8d8d8] mx-[2px]" />

            {/* Fixed-width container for sub-type icons */}
            <div className="w-[200px] flex items-center gap-[6px]">
              {visualizationType === 'fordeling' && (
                <>
                  {([
                    { type: 'kart' as FordelingSubType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M1 4L5.5 2L10.5 4L15 2V12L10.5 14L5.5 12L1 14V4Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                        <path d="M5.5 2V12" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M10.5 4V14" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    )},
                    { type: 'soyle' as FordelingSubType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="10" width="3" height="4" rx="0.5" fill="currentColor" />
                        <rect x="6.5" y="6" width="3" height="8" rx="0.5" fill="currentColor" />
                        <rect x="11" y="2" width="3" height="12" rx="0.5" fill="currentColor" />
                      </svg>
                    )},
                    { type: 'kart_soyle' as FordelingSubType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M1 3L4 2L7 3L10 2V9L7 10L4 9L1 10V3Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                        <path d="M4 2V9" stroke="currentColor" strokeWidth="1" />
                        <path d="M7 3V10" stroke="currentColor" strokeWidth="1" />
                        <rect x="11" y="10" width="1.5" height="4" rx="0.3" fill="currentColor" />
                        <rect x="13" y="7" width="1.5" height="7" rx="0.3" fill="currentColor" />
                      </svg>
                    )},
                  ]).map(({ type, icon }) => (
                    <button key={type}
                      onClick={() => onFordelingSubTypeChange(type)}
                      className={`p-[6px] rounded-[6px] transition-all ${
                        fordelingSubType === type
                          ? 'text-[#3d5a4a] bg-[#3d5a4a]/10'
                          : 'text-[#999] hover:text-[#3d5a4a]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </>
              )}

              {visualizationType === 'visning' && (
                <>
                  {([
                    { type: 'bar' as ChartType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="10" width="3" height="4" rx="0.5" fill="currentColor" />
                        <rect x="6.5" y="6" width="3" height="8" rx="0.5" fill="currentColor" />
                        <rect x="11" y="2" width="3" height="12" rx="0.5" fill="currentColor" />
                      </svg>
                    )},
                    { type: 'line' as ChartType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M2 12L6 8L9 11L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )},
                    { type: 'pie' as ChartType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 8L8 2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 8L14 8" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )},
                    { type: 'nokkeltall' as ChartType, icon: (
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                        <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
                        <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
                        <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
                      </svg>
                    )},
                  ]).map(({ type, icon }) => (
                    <button key={type}
                      onClick={() => onChartTypeChange(type)}
                      className={`p-[6px] rounded-[6px] transition-all ${
                        chartType === type
                          ? 'text-[#3d5a4a] bg-[#3d5a4a]/10'
                          : 'text-[#999] hover:text-[#3d5a4a]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Separator before Andel/Prosent */}
            <div className="w-[1px] h-[20px] bg-[#d8d8d8] mx-[2px]" />

            {/* Andel / Prosent toggle */}
            <div className="flex items-center bg-[#f0f0f0] rounded-full p-[2px]">
              <button
                onClick={() => onDisplayModeChange('antall')}
                className={`px-[12px] py-[4px] rounded-full text-[12px] font-medium transition-all ${
                  displayMode === 'antall'
                    ? 'bg-white text-[#303030] shadow-sm'
                    : 'text-[#5a5a5a] hover:text-[#303030]'
                }`}
              >
                Antall
              </button>
              <button
                onClick={() => onDisplayModeChange('andel')}
                className={`px-[12px] py-[4px] rounded-full text-[12px] font-medium transition-all ${
                  displayMode === 'andel'
                    ? 'bg-white text-[#303030] shadow-sm'
                    : 'text-[#5a5a5a] hover:text-[#303030]'
                }`}
              >
                Prosent
              </button>
            </div>

            {/* Separator before Export/Lagre */}
            <div className="w-[1px] h-[20px] bg-[#d8d8d8] mx-[2px]" />

            {/* Export and Save icon buttons - matching expand button style */}
            <button className="w-[34px] h-[34px] bg-[#3d5a4a] rounded-[6px] hover:bg-[#2d4a3a] transition-colors flex items-center justify-center" title="Last ned">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button className="w-[34px] h-[34px] bg-[#3d5a4a] rounded-[6px] hover:bg-[#2d4a3a] transition-colors flex items-center justify-center" title="Lagre">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div className={`p-[32px] pb-[40px] overflow-y-auto ${isFullscreen ? 'flex-1' : 'h-[420px]'}`}>
        {!areIndicatorsCompatible ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-[500px]">
              <div className="w-[64px] h-[64px] bg-[#ffeaea] rounded-full flex items-center justify-center mx-auto mb-[16px]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d14343" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className="text-[18px] font-medium text-[#303030] mb-[12px]">
                {visualizationType === 'fordeling'
                  ? `«${selectedIndicators[0]?.name || 'Indikatoren'}» støtter ikke underområder`
                  : `«${selectedIndicators[0]?.name || 'Indikatoren'}» støtter ikke denne visningen`
                }
              </div>
              <div className="text-[14px] text-[#5a5a5a] leading-[21px]">
                {visualizationType === 'fordeling'
                  ? 'Denne indikatoren er ikke tilgjengelig for underområder. Velg en annen indikator i indikatormenyen, eller bytt til hovedområde.'
                  : 'Velg en annen indikator i indikatormenyen, eller bytt visualiseringstype.'
                }
              </div>
            </div>
          </div>
        ) : !areIndicatorsGeoCompatible ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-[500px]">
              <div className="w-[64px] h-[64px] bg-[#fff3e0] rounded-full flex items-center justify-center mx-auto mb-[16px]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e67e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="text-[18px] font-medium text-[#303030] mb-[12px]">
                For detaljert geografisk nivå
              </div>
              <div className="text-[14px] text-[#5a5a5a] leading-[21px]">
                «{selectedIndicators[0]?.name || 'Indikatoren'}» er ikke tilgjengelig på {GEO_LEVEL_LABELS[geoLevel].toLowerCase()}-nivå.
                Velg et høyere geografisk nivå i kartpanelet (f.eks. kommune eller fylke).
              </div>
            </div>
          </div>
        ) : (
          <div className={(chartType === 'nokkeltall' || chartType === 'grid') && visualizationType === 'visning' ? '' : 'h-full'}>
            {visualizationType === 'fordeling' && renderFordeling()}
            {visualizationType === 'visning' && chartType === 'nokkeltall' && renderNokkeltall()}
            {visualizationType === 'visning' && chartType !== 'nokkeltall' && renderChart()}
          </div>
        )}
      </div>
    </div>
  );
}
