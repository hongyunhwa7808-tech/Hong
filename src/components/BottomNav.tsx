export type TabType = 'home' | 'add-entry' | 'history' | 'assets' | 'budgets';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as TabType, label: '홈', icon: 'home' },
    { id: 'add-entry' as TabType, label: '입력', icon: 'edit_square' },
    { id: 'history' as TabType, label: '내역', icon: 'receipt_long' },
    { id: 'assets' as TabType, label: '자산', icon: 'account_balance_wallet' },
    { id: 'budgets' as TabType, label: '계획', icon: 'trending_up' },
  ];

  return (
    <nav
      className="fixed bottom-0 max-w-[520px] w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(20,27,43,0.06)]"
      data-active-classes="text-secondary font-semibold"
    >
      <div className="flex justify-around items-center h-16 px-space-xs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-12 transition-colors ${
                isActive
                  ? 'text-secondary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[21px] ${isActive ? 'font-bold' : ''}`}>
                {tab.icon}
              </span>
              <span className="font-caption text-caption mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
