interface HeaderProps {
  title: string;
  lastUpdated: string;
  onOpenSettings: () => void;
}

export function Header({ title, lastUpdated, onOpenSettings }: HeaderProps) {
  return (
    <header className="fixed top-0 max-w-[520px] w-full z-50 bg-primary-container text-on-primary pt-safe shadow-[0_2px_8px_rgba(3,34,77,0.12)]">
      <div className="h-16 px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center flex-shrink-0 text-on-primary">
            <span className="material-symbols-outlined text-[22px]">park</span>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-headline-md text-headline-md tracking-tight text-on-primary truncate">
              {title}
            </h1>
            <span className="font-caption text-caption text-primary-fixed-dim truncate">
              마지막 갱신 {lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs flex-shrink-0">
          <button
            type="button"
            aria-label="설정"
            onClick={onOpenSettings}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-on-primary/10 transition-colors text-on-primary"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover ml-1 ring-2 ring-on-primary/20"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WN-VvXdJtv2MWNMkjfkQ_Qun0yeHfIUwmo1vzVE57mp_Ef90Hi2MFKqDyPSzfkN-eIe2_rSu4Pu8Hc3U2xprG3wC8pMpM4FhRsY3UDDUJ32Q3wP3jsBZ2ytWUM6JUmoqqGoKMBSAovjCjHb3XEKW6MOFRqZB-gY0mwZfBUt8sDOvV-CpEAtscD451xrUL6q4kuWmrtv0GoC9LjaKdq_rENVhKCyt9y1Z0xWp-JZ_Z1kphuplCkwZJgSUrH"
          />
        </div>
      </div>
    </header>
  );
}
