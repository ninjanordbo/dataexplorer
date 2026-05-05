import { BarChart3, Map, FileText, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface SideMenuProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigateHome?: () => void;
}

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', active: false },
  { icon: Map, label: 'Datautforsker', active: true },
  { icon: FileText, label: 'Rapporter', active: false },
  { icon: Settings, label: 'Innstillinger', active: false },
];

export function SideMenu({ collapsed, onToggle, onNavigateHome }: SideMenuProps) {
  return (
    <div
      className={`bg-[#2d2d2d] h-screen sticky top-0 flex flex-col items-center transition-all duration-300 ${
        collapsed ? 'w-[0px] overflow-hidden' : 'w-[80px]'
      }`}
    >
      {/* Logo */}
      <div className="w-full flex justify-center py-[16px]">
        <button
          onClick={onNavigateHome}
          className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center hover:ring-2 hover:ring-white/30 transition-all"
          title="Indikatorbibliotek"
        >
          <span className="text-[#2d2d2d] text-[24px] font-thin">N</span>
        </button>
      </div>

      {/* User name */}
      <div className="text-white text-[13px] mb-[24px]">Nina</div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-[8px] flex-1">
        {menuItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-[48px] h-[48px] rounded-[8px] flex items-center justify-center transition-all ${
              active
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            title={label}
          >
            <Icon className="w-[20px] h-[20px]" />
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-[8px] pb-[20px]">
        <button
          className="w-[48px] h-[48px] rounded-[8px] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          title="Logg ut"
        >
          <LogOut className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -translate-y-1/2 -right-[14px] w-[28px] h-[28px] bg-[#2d2d2d] border border-[#2d2d2d] rounded-full flex items-center justify-center text-white hover:bg-[#3a3a3a] transition-colors shadow-md z-20"
      >
        {collapsed ? <ChevronRight className="w-[14px] h-[14px]" /> : <ChevronLeft className="w-[14px] h-[14px]" />}
      </button>
    </div>
  );
}
